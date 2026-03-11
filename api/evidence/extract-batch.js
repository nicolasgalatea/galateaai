import { callClaude } from '../utils/anthropic-client.js';
import { logAgent, logError } from '../utils/logger.js';
import { ExtractionSchema } from '../utils/extraction-schema.js';
import { PROMPTS } from '../../prompts/system-prompts.js';

const AGENT_NAME = 'batch-extractor';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || 'https://galatea-v2-prod.vercel.app',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

/**
 * Extract data from a single article (same logic as extract-data.js but inline)
 */
async function extractSingle(article, picot) {
  const text = article.fullText || article.abstract || article.title || '';
  const userPrompt = `Extrae los datos estructurados del siguiente articulo para una revision sistematica.

PICOT: ${JSON.stringify(picot || {})}

ARTICULO:
- Titulo: ${article.title || 'N/A'}
- Autores: ${(article.authors || []).join(', ') || 'N/A'}
- Ano: ${article.year || 'N/A'}
- PMID: ${article.pmid || 'N/A'}

TEXTO:
${text.slice(0, 6000)}

Responde SOLO con JSON valido con la estructura: { population, intervention, comparator, outcomes[], studyDesign, riskOfBias, funding, conflicts, limitations }`;

  const result = await callClaude(
    PROMPTS.DATA_EXTRACTOR,
    userPrompt,
    { temperature: 0.1, max_tokens: 1500 }
  );

  const cleaned = result.text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  const parsed = JSON.parse(cleaned);
  const validation = ExtractionSchema.safeParse(parsed);

  return {
    pmid: article.pmid || '',
    title: article.title || '',
    extraction: validation.success ? validation.data : parsed,
    valid: validation.success,
  };
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  Object.entries(CORS_HEADERS).forEach(([key, val]) => res.setHeader(key, val));

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { articles, picot } = req.body || {};

  if (!Array.isArray(articles) || articles.length === 0) {
    return res.status(400).json({ success: false, error: 'Missing articles array' });
  }

  // Limit batch size to 4 articles per call (Vercel 55s limit)
  const batch = articles.slice(0, 4);

  try {
    logAgent(AGENT_NAME, 'info', 'Batch extraction starting', { count: batch.length });
    const start = Date.now();

    const results = [];
    for (const article of batch) {
      try {
        const result = await extractSingle(article, picot);
        results.push(result);
      } catch (err) {
        logAgent(AGENT_NAME, 'warn', `Failed to extract: ${(article.pmid || article.title || '').slice(0, 50)}: ${err.message}`);
        results.push({
          pmid: article.pmid || '',
          title: article.title || '',
          extraction: null,
          valid: false,
          error: err.message,
        });
      }
    }

    const duration = Date.now() - start;
    const validCount = results.filter(function(r) { return r.valid; }).length;
    logAgent(AGENT_NAME, 'info', 'Batch complete', { total: results.length, valid: validCount, duration });

    return res.status(200).json({
      success: true,
      data: {
        results,
        processed: results.length,
        remaining: articles.length - batch.length,
      },
      metrics: { duration },
    });
  } catch (err) {
    logError(AGENT_NAME, err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
