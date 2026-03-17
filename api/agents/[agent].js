import { callClaude, parseClaudeJSON } from '../_utils/anthropic-client.js';
import { updatePhaseData as _updatePhaseData } from '../_utils/supabase-server.js';
import { logAgent, logError, logMetrics } from '../_utils/logger.js';
import { PROMPTS } from '../../prompts/system-prompts.js';

// Wrap updatePhaseData to be non-fatal — Supabase write failures should not break agent responses
async function updatePhaseData(projectId, phase, data) {
  try {
    return await _updatePhaseData(projectId, phase, data);
  } catch (err) {
    logAgent('supabase', 'warn', `updatePhaseData failed for ${phase}: ${err.message}`);
    return null;
  }
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || 'https://galatea-v2-prod.vercel.app',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

const EUTILS_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

async function getPubMedNoveltyCount(agentName, picot) {
  try {
    const terms = [];
    if (picot.P) terms.push(`(${picot.P})`);
    if (picot.I) terms.push(`(${picot.I})`);
    if (picot.O) terms.push(`(${picot.O})`);
    if (picot.S && !picot.I) terms.push(`(${picot.S})`);
    if (picot.PI) terms.push(`(${picot.PI})`);
    if (terms.length === 0) return null;
    const query = terms.join(' AND ');
    const url = `${EUTILS_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=0&retmode=json`;
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) return null;
    const data = await response.json();
    const count = parseInt(data.esearchresult.count, 10);
    logAgent(agentName, 'info', `PubMed novelty check: "${query.slice(0, 80)}" → ${count} results`);
    return { count, query };
  } catch (err) {
    logAgent(agentName, 'warn', `PubMed novelty check failed: ${err.message}`);
    return null;
  }
}

// ── Agent handlers ──

const agents = {
  'equator-checker': async (body) => {
    const { projectId, framework, studyType } = body;
    if (!framework) throw { status: 400, message: 'Missing framework' };
    const userPrompt = `Framework: ${framework}\nTipo de estudio: ${studyType || 'No especificado'}\n\nIdentifica las guias EQUATOR aplicables y evalua el cumplimiento inicial.`;
    const result = await callClaude(PROMPTS.EQUATOR_CHECKER, userPrompt);
    const data = parseClaudeJSON(result.text);
    if (projectId) await updatePhaseData(projectId, 'equator_checklist', data.checklist);
    return { data, result };
  },

  'factibilidad-operativa': async (body) => {
    const { projectId, researchQuestion, picot, framework, studyType, finerScores } = body;
    if (!researchQuestion || !picot) throw { status: 400, message: 'Missing researchQuestion or picot' };
    const userPrompt = `Pregunta de investigacion:\n"${researchQuestion}"\n\nEstructuracion PICOT:\n${JSON.stringify(picot, null, 2)}\n\nFramework: ${framework || 'No especificado'}\nTipo de estudio: ${studyType || 'No especificado'}\n\nScores FINER:\n${JSON.stringify(finerScores || {}, null, 2)}\n\nEvalua la factibilidad operativa de este proyecto de investigacion en las 6 dimensiones.`;
    const result = await callClaude(PROMPTS.FACTIBILIDAD_OPERATIVA, userPrompt);
    const data = parseClaudeJSON(result.text);
    if (projectId) await updatePhaseData(projectId, 'feasibility', data);
    return { data, result };
  },

  'finer-validator': async (body) => {
    const { projectId, researchQuestion, picot } = body;
    if (!researchQuestion || !picot) throw { status: 400, message: 'Missing researchQuestion or picot' };
    const noveltyData = await getPubMedNoveltyCount('finer-validator', picot);
    let pubmedContext = '';
    if (noveltyData) {
      pubmedContext = `\n\nDATOS REALES DE PUBMED PARA EVALUACION DE NOVEDAD:\n- Busqueda: "${noveltyData.query}"\n- Resultados encontrados: ${noveltyData.count}\n- Interpretacion: ${noveltyData.count > 500 ? 'Tema MUY estudiado (>500 resultados). Novedad debe ser baja a menos que haya un angulo completamente nuevo.' : noveltyData.count > 100 ? 'Tema moderadamente estudiado (100-500). Evalua si hay brechas especificas no cubiertas.' : noveltyData.count > 20 ? 'Tema con evidencia limitada (20-100). Hay espacio para contribuciones nuevas.' : noveltyData.count > 5 ? 'Tema poco estudiado (<20). Alta probabilidad de novedad.' : 'Tema casi sin investigacion (<5). Novedad muy alta, pero evalua factibilidad.'}\nIMPORTANTE: Usa estos datos REALES para calibrar el score de Novedad. No inventes numeros.`;
    }
    const userPrompt = `Pregunta de investigacion:\n"${researchQuestion}"\n\nEstructuracion PICOT:\n${JSON.stringify(picot, null, 2)}${pubmedContext}\n\nEvalua esta investigacion con los 5 criterios FINER. El score de Novedad DEBE reflejar los datos reales de PubMed proporcionados arriba.`;
    const result = await callClaude(PROMPTS.FINER_VALIDATOR, userPrompt);
    const data = parseClaudeJSON(result.text);
    if (noveltyData && data.finerScores && data.finerScores.novel) {
      data.finerScores.novel.pubmedCount = noveltyData.count;
      data.finerScores.novel.pubmedQuery = noveltyData.query;
      data.finerScores.novel.note = (data.finerScores.novel.note || '') + ` [Validado contra ${noveltyData.count} resultados reales en PubMed]`;
    }
    data.pubmedNovelty = noveltyData;
    if (projectId) await updatePhaseData(projectId, 'finer_results', data.finerScores);
    return { data, result, extra: { pubmedNoveltyCheck: !!noveltyData } };
  },

  'folder-organizer': async (body) => {
    const { projectId, framework, studyType } = body;
    if (!framework) throw { status: 400, message: 'Missing framework' };
    const userPrompt = `Framework: ${framework}\nTipo de estudio: ${studyType || 'No especificado'}\n\nGenera la estructura de carpetas optima para este proyecto de investigacion.`;
    const result = await callClaude(PROMPTS.FOLDER_ORGANIZER, userPrompt);
    const data = parseClaudeJSON(result.text);
    if (projectId) await updatePhaseData(projectId, 'folder_structure', data.folders);
    return { data, result };
  },

  'hypothesis-generator': async (body) => {
    const { projectId, researchQuestion, picot } = body;
    if (!researchQuestion) throw { status: 400, message: 'Missing researchQuestion' };
    const userPrompt = `Pregunta de investigacion:\n"${researchQuestion}"\n\nEstructuracion PICOT:\n${JSON.stringify(picot || {}, null, 2)}\n\nFormula las hipotesis de investigacion (H0 y H1).`;
    const result = await callClaude(PROMPTS.HYPOTHESIS_GENERATOR, userPrompt);
    const data = parseClaudeJSON(result.text);
    if (projectId) await updatePhaseData(projectId, 'hypothesis', data);
    return { data, result };
  },

  'literature-scout': async (body) => {
    const { projectId, picot, framework } = body;
    if (!picot) throw { status: 400, message: 'Missing picot' };
    const userPrompt = `Framework: ${framework || 'PICOS'}\n\nPICOT estructurado:\n${JSON.stringify(picot, null, 2)}\n\nGenera la estrategia de busqueda completa, mapeo de descriptores y criterios de inclusion/exclusion.`;
    const result = await callClaude(PROMPTS.LITERATURE_SCOUT, userPrompt);
    const data = parseClaudeJSON(result.text);
    if (projectId) {
      await updatePhaseData(projectId, 'search_strategy', data.searchStrategy);
      await updatePhaseData(projectId, 'descriptor_mapping', data.descriptorMapping);
    }
    return { data, result };
  },

  'manuscript-writer': async (body) => {
    const { projectId, researchQuestion, picot, framework, studyType, planteamiento, hypothesis, searchStrategy, criteria, extractionTable, stats, equatorChecklist } = body;
    if (!researchQuestion) throw { status: 400, message: 'Missing researchQuestion' };
    const contextData = { pregunta: researchQuestion, framework: framework || '', tipo_estudio: studyType || '', picot: picot || {}, planteamiento: (planteamiento || '').slice(0, 500), hipotesis: hypothesis || {}, criterios: criteria || {}, tabla_extraccion: (extractionTable || []).slice(0, 5).map(r => ({ titulo: (r.title || r.titulo || '').slice(0, 80), resultado: (r.resultado || r.result || '').slice(0, 100) })), estadisticas: stats ? { pooled: stats.pooled, heterogeneity: stats.heterogeneity } : {} };
    const userPrompt = `Datos del proyecto:\n${JSON.stringify(contextData)}\n\nRedacta el manuscrito IMRaD.`;
    const result = await callClaude(PROMPTS.MANUSCRIPT_WRITER, userPrompt, { max_tokens: 4096, timeout: 120000 });
    const data = parseClaudeJSON(result.text);
    if (projectId) await updatePhaseData(projectId, 'manuscript', data.manuscript);
    return { data, result };
  },

  'picot-builder': async (body) => {
    const { projectId, researchQuestion } = body;
    if (!researchQuestion) throw { status: 400, message: 'Missing researchQuestion' };
    const userPrompt = `Pregunta de investigacion:\n"${researchQuestion}"\n\nAnaliza esta pregunta y genera el PICOT estructurado.`;
    const result = await callClaude(PROMPTS.PICOT_BUILDER, userPrompt);
    const data = parseClaudeJSON(result.text);
    if (projectId) {
      await updatePhaseData(projectId, 'picot', data.picot);
      await updatePhaseData(projectId, 'framework', data.framework);
      await updatePhaseData(projectId, 'study_type', { type: data.studyType, design_locked: data.designLocked, justification: data.justification });
    }
    return { data, result };
  },

  'planteamiento-builder': async (body) => {
    const { projectId, researchQuestion } = body;
    if (!researchQuestion) throw { status: 400, message: 'Missing researchQuestion' };
    const userPrompt = `Pregunta de investigacion:\n"${researchQuestion}"\n\nRedacta el planteamiento del problema para esta investigacion.`;
    const result = await callClaude(PROMPTS.PLANTEAMIENTO_BUILDER, userPrompt);
    const data = parseClaudeJSON(result.text);
    if (projectId) await updatePhaseData(projectId, 'planteamiento', data.planteamiento);
    return { data, result };
  },

  'protocol-writer': async (body) => {
    const { projectId, researchQuestion, picot, framework, studyType, planteamiento, hypothesis, searchStrategy, criteria, equatorChecklist } = body;
    if (!researchQuestion) throw { status: 400, message: 'Missing researchQuestion' };
    const contextData = { pregunta: researchQuestion, framework: framework || '', tipo_estudio: studyType || '', picot: picot || {}, planteamiento: (planteamiento || '').slice(0, 500), hipotesis: hypothesis || {}, criterios: criteria || {}, equator: (equatorChecklist || []).slice(0, 5) };
    const userPrompt = `Datos del proyecto:\n${JSON.stringify(contextData)}\n\nRedacta el protocolo de investigacion.`;
    const result = await callClaude(PROMPTS.PROTOCOL_WRITER, userPrompt, { max_tokens: 4096, timeout: 120000 });
    const data = parseClaudeJSON(result.text);
    if (projectId) await updatePhaseData(projectId, 'protocol_draft', data.protocol_draft);
    return { data, result };
  },

  'quality-assessor': async (body) => {
    const { projectId, articles } = body;
    if (!articles || !articles.length) throw { status: 400, message: 'Missing articles' };
    const articleSummaries = articles.slice(0, 10).map(function(a) { return { pmid: a.pmid || '', title: a.title || a.resultado || '', authors: a.authors ? a.authors.join(', ') : (a.autor || ''), year: a.year || a.anio || '', abstract: (a.abstract || '').slice(0, 500) }; });
    const userPrompt = `Articulos a evaluar:\n${JSON.stringify(articleSummaries, null, 2)}\n\nEvalua la calidad metodologica y riesgo de sesgo de cada articulo.`;
    const result = await callClaude(PROMPTS.QUALITY_ASSESSOR, userPrompt);
    const data = parseClaudeJSON(result.text);
    if (projectId) await updatePhaseData(projectId, 'quality_assessments', data.assessments);
    return { data, result };
  },

  'stats-agent': async (body) => {
    const { projectId, extractionTable, picot, studyType } = body;
    if (!extractionTable || !extractionTable.length) throw { status: 400, message: 'Missing extractionTable' };
    const userPrompt = `Tipo de estudio: ${studyType || 'No especificado'}\n\nPICOT:\n${JSON.stringify(picot || {}, null, 2)}\n\nTabla de extraccion (${extractionTable.length} estudios):\n${JSON.stringify(extractionTable, null, 2)}\n\nCalcula las estadisticas pooled, heterogeneidad y estadisticas descriptivas.`;
    const result = await callClaude(PROMPTS.STATS_AGENT, userPrompt);
    const data = parseClaudeJSON(result.text);
    if (projectId) await updatePhaseData(projectId, 'stats', data);
    return { data, result };
  },

  'documentation-builder': async (body) => {
    const { projectId, researchQuestion, picot, framework, studyType, projectType, tenant } = body;
    if (!researchQuestion) throw { status: 400, message: 'Missing researchQuestion' };
    const userPrompt = `Pregunta de investigacion:\n"${researchQuestion}"\n\nPICOT:\n${JSON.stringify(picot || {}, null, 2)}\n\nFramework: ${framework || 'No especificado'}\nTipo de estudio: ${studyType || 'No especificado'}\nTipo de proyecto: ${projectType || 'protocolo'}\nInstitucion (tenant): ${tenant || 'fsfb'}\n\nGenera el paquete de documentacion contextual.`;
    const result = await callClaude(PROMPTS.DOCUMENTATION_BUILDER, userPrompt);
    const data = parseClaudeJSON(result.text);
    if (projectId) await updatePhaseData(projectId, 'documentation_package', data);
    return { data, result };
  },

  'institutional-reviewer': async (body) => {
    const { projectId, researchQuestion, picot, framework, studyType, projectType, documentChecklist, route, tenant } = body;
    if (!researchQuestion) throw { status: 400, message: 'Missing researchQuestion' };
    const userPrompt = `Pregunta de investigacion:\n"${researchQuestion}"\n\nPICOT:\n${JSON.stringify(picot || {}, null, 2)}\n\nFramework: ${framework || 'No especificado'}\nTipo de estudio: ${studyType || 'No especificado'}\nTipo de proyecto: ${projectType || 'protocolo'}\nRuta seleccionada: ${route || 'subdireccion'}\nInstitucion (tenant): ${tenant || 'fsfb'}\nDocumentos preparados: ${JSON.stringify(documentChecklist || [])}\n\nGenera la revision institucional preliminar.`;
    const result = await callClaude(PROMPTS.INSTITUTIONAL_REVIEWER, userPrompt);
    const data = parseClaudeJSON(result.text);
    if (projectId) await updatePhaseData(projectId, 'institutional_review', data);
    return { data, result };
  },
};

// Writer agents use SSE streaming to bypass Vercel's 60s function timeout.
// As long as data is written to the response, Vercel keeps the function alive.
const STREAMING_AGENTS = new Set(['protocol-writer', 'manuscript-writer']);
const CODE_VERSION = '2026-03-12-streaming-v1';

async function handleStreamingAgent(req, res, agentName) {
  Object.entries(CORS_HEADERS).forEach(([key, val]) => res.setHeader(key, val));
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering if present
  res.flushHeaders();

  // Send keepalive every 5s to prevent Vercel from killing the function
  const keepalive = setInterval(() => {
    try { res.write(':keepalive\n\n'); } catch (e) { /* client disconnected */ }
  }, 5000);

  try {
    logAgent(agentName, 'info', `Starting ${agentName} (streaming)`, { projectId: (req.body || {}).projectId });

    if (!process.env.ANTHROPIC_API_KEY) {
      clearInterval(keepalive);
      res.write('data: ' + JSON.stringify({ success: false, error: 'ANTHROPIC_API_KEY not set' }) + '\n\n');
      return res.end();
    }

    const { data, result, extra } = await agents[agentName](req.body || {});
    clearInterval(keepalive);
    logMetrics(agentName, result);

    res.write('data: ' + JSON.stringify({
      success: true,
      data,
      metrics: { duration: result.duration, tokensUsed: result.tokensUsed, ...(extra || {}) },
    }) + '\n\n');
    res.end();
  } catch (err) {
    clearInterval(keepalive);
    logError(agentName, err);
    const errorMsg = err.status ? err.message : (err.message || 'Unknown error');
    res.write('data: ' + JSON.stringify({ success: false, error: errorMsg }) + '\n\n');
    res.end();
  }
}

export default async function handler(req, res) {
  res.setHeader('X-Code-Version', CODE_VERSION);

  if (req.method === 'OPTIONS') {
    Object.entries(CORS_HEADERS).forEach(([key, val]) => res.setHeader(key, val));
    return res.status(200).json({});
  }

  const agentName = req.query.agent;

  if (req.method !== 'POST') {
    Object.entries(CORS_HEADERS).forEach(([key, val]) => res.setHeader(key, val));
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  if (!agents[agentName]) {
    Object.entries(CORS_HEADERS).forEach(([key, val]) => res.setHeader(key, val));
    return res.status(404).json({ success: false, error: `Unknown agent: ${agentName}`, available: Object.keys(agents) });
  }

  // Use streaming for heavy writer agents to bypass Vercel 60s limit
  if (STREAMING_AGENTS.has(agentName)) {
    return handleStreamingAgent(req, res, agentName);
  }

  // Standard JSON response for all other agents
  Object.entries(CORS_HEADERS).forEach(([key, val]) => res.setHeader(key, val));

  try {
    logAgent(agentName, 'info', `Starting ${agentName}`, { projectId: (req.body || {}).projectId });

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ success: false, error: 'Server misconfiguration: ANTHROPIC_API_KEY not set' });
    }

    const { data, result, extra } = await agents[agentName](req.body || {});
    logMetrics(agentName, result);

    return res.status(200).json({
      success: true,
      data,
      metrics: { duration: result.duration, tokensUsed: result.tokensUsed, ...(extra || {}) },
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ success: false, error: err.message });
    }
    logError(agentName, err);
    const errorMsg = err.message || 'Unknown error';
    const detail = errorMsg.includes('JSON')
      ? `${errorMsg} (Claude returned non-JSON response)`
      : errorMsg.includes('Supabase')
      ? `${errorMsg} (Supabase write failed — agent result was still generated)`
      : errorMsg;
    return res.status(500).json({ success: false, error: detail });
  }
}
