import { callClaude } from '../utils/anthropic-client.js';
import { updatePhaseData } from '../utils/supabase-server.js';
import { logAgent, logError, logMetrics } from '../utils/logger.js';
import { PROMPTS } from '../../prompts/system-prompts.js';

const AGENT_NAME = 'finer-validator';
const EUTILS_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

/**
 * Quick PubMed count search to assess novelty with real data
 */
async function getPubMedNoveltyCount(picot) {
  try {
    // Build a focused search from PICOT components
    const terms = [];
    if (picot.P) terms.push(`(${picot.P})`);
    if (picot.I) terms.push(`(${picot.I})`);
    if (picot.O) terms.push(`(${picot.O})`);
    // For SPIDER/ECLIPSE frameworks
    if (picot.S && !picot.I) terms.push(`(${picot.S})`);
    if (picot.PI) terms.push(`(${picot.PI})`);

    if (terms.length === 0) return null;

    const query = terms.join(' AND ');
    const url = `${EUTILS_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=0&retmode=json`;

    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) return null;

    const data = await response.json();
    const count = parseInt(data.esearchresult.count, 10);

    logAgent(AGENT_NAME, 'info', `PubMed novelty check: "${query.slice(0, 80)}" → ${count} results`);

    return { count, query };
  } catch (err) {
    logAgent(AGENT_NAME, 'warn', `PubMed novelty check failed: ${err.message}`);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  Object.entries(CORS_HEADERS).forEach(([key, val]) => res.setHeader(key, val));

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { projectId, researchQuestion, picot } = req.body || {};

  if (!researchQuestion || !picot) {
    return res.status(400).json({ success: false, error: 'Missing researchQuestion or picot' });
  }

  try {
    logAgent(AGENT_NAME, 'info', 'Starting FINER validation with PubMed novelty check', { projectId });

    // ── Step 1: Real PubMed novelty check ──
    const noveltyData = await getPubMedNoveltyCount(picot);
    let pubmedContext = '';
    if (noveltyData) {
      pubmedContext = `\n\nDATOS REALES DE PUBMED PARA EVALUACION DE NOVEDAD:
- Busqueda: "${noveltyData.query}"
- Resultados encontrados: ${noveltyData.count}
- Interpretacion: ${
        noveltyData.count > 500
          ? 'Tema MUY estudiado (>500 resultados). Novedad debe ser baja a menos que haya un angulo completamente nuevo.'
          : noveltyData.count > 100
          ? 'Tema moderadamente estudiado (100-500). Evalua si hay brechas especificas no cubiertas.'
          : noveltyData.count > 20
          ? 'Tema con evidencia limitada (20-100). Hay espacio para contribuciones nuevas.'
          : noveltyData.count > 5
          ? 'Tema poco estudiado (<20). Alta probabilidad de novedad.'
          : 'Tema casi sin investigacion (<5). Novedad muy alta, pero evalua factibilidad.'
      }
IMPORTANTE: Usa estos datos REALES para calibrar el score de Novedad. No inventes numeros.`;
    }

    // ── Step 2: Call Claude with real context ──
    const userPrompt = `Pregunta de investigacion:\n"${researchQuestion}"\n\nEstructuracion PICOT:\n${JSON.stringify(picot, null, 2)}${pubmedContext}\n\nEvalua esta investigacion con los 5 criterios FINER. El score de Novedad DEBE reflejar los datos reales de PubMed proporcionados arriba.`;

    const result = await callClaude(PROMPTS.FINER_VALIDATOR, userPrompt);

    logMetrics(AGENT_NAME, result);

    let data;
    try {
      const cleaned = result.text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      data = JSON.parse(cleaned);
    } catch (parseErr) {
      logError(AGENT_NAME, parseErr, { rawText: result.text.slice(0, 500) });
      return res.status(500).json({
        success: false,
        error: 'Failed to parse Claude response as JSON',
        rawText: result.text,
      });
    }

    // ── Inject real PubMed data into response ──
    if (noveltyData && data.finerScores && data.finerScores.novel) {
      data.finerScores.novel.pubmedCount = noveltyData.count;
      data.finerScores.novel.pubmedQuery = noveltyData.query;
      data.finerScores.novel.note =
        (data.finerScores.novel.note || '') +
        ` [Validado contra ${noveltyData.count} resultados reales en PubMed]`;
    }
    data.pubmedNovelty = noveltyData;

    if (projectId) {
      try {
        await updatePhaseData(projectId, 'finer_results', data.finerScores);
        logAgent(AGENT_NAME, 'info', 'Saved to Supabase', { projectId });
      } catch (dbErr) {
        logError(AGENT_NAME, dbErr, { context: 'supabase_save' });
      }
    }

    return res.status(200).json({
      success: true,
      data,
      metrics: {
        duration: result.duration,
        tokensUsed: result.tokensUsed,
        pubmedNoveltyCheck: noveltyData ? true : false,
      },
    });
  } catch (err) {
    logError(AGENT_NAME, err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
