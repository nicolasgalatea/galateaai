import { callClaude } from '../utils/anthropic-client.js';
import { logAgent, logError } from '../utils/logger.js';
import { ExtractionSchema } from '../utils/extraction-schema.js';
import { PROMPTS } from '../../prompts/system-prompts.js';

const AGENT_NAME = 'data-extractor';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || 'https://galatea-v2-prod.vercel.app',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

/**
 * Extract structured data from article text using Claude + Zod validation
 */
async function extractFromText(text, articleMeta, picot) {
  const userPrompt = `Extrae los datos estructurados del siguiente articulo para una revision sistematica.

CONTEXTO DEL PROYECTO (PICOT):
${JSON.stringify(picot || {}, null, 2)}

METADATOS DEL ARTICULO:
- Titulo: ${articleMeta.title || 'N/A'}
- Autores: ${(articleMeta.authors || []).join(', ') || 'N/A'}
- Ano: ${articleMeta.year || 'N/A'}
- Journal: ${articleMeta.journal || 'N/A'}
- PMID: ${articleMeta.pmid || 'N/A'}

TEXTO DEL ARTICULO (abstract o texto completo):
${(text || '').slice(0, 8000)}

Extrae la informacion en formato JSON con esta estructura exacta:
{
  "population": { "description": "", "sampleSize": null, "ageRange": "", "country": "" },
  "intervention": { "name": "", "dose": "", "duration": "", "route": "" },
  "comparator": { "name": "", "dose": "", "duration": "" },
  "outcomes": [{ "name": "", "type": "primary|secondary|safety|other", "measure": "", "effectSize": "", "ci95": "", "pValue": "" }],
  "studyDesign": "",
  "riskOfBias": { "selection": "low|unclear|high", "performance": "low|unclear|high", "detection": "low|unclear|high", "attrition": "low|unclear|high", "reporting": "low|unclear|high", "overall": "low|unclear|high" },
  "funding": "",
  "conflicts": "",
  "limitations": ""
}

Si un campo no esta disponible en el texto, usa valores por defecto vacios o null. Responde SOLO con JSON valido.`;

  const result = await callClaude(
    PROMPTS.DATA_EXTRACTOR,
    userPrompt,
    { temperature: 0.1, max_tokens: 2000 }
  );

  const cleaned = result.text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  const parsed = JSON.parse(cleaned);

  // Validate with Zod
  const validation = ExtractionSchema.safeParse(parsed);

  if (validation.success) {
    return { extraction: validation.data, valid: true, metrics: result };
  }

  // Retry once with Zod errors in prompt
  logAgent(AGENT_NAME, 'warn', 'First extraction failed Zod validation, retrying with error context');
  const errorDetails = validation.error.issues.map(function(i) {
    return `- ${i.path.join('.')}: ${i.message}`;
  }).join('\n');

  const retryPrompt = `Tu respuesta anterior tuvo errores de validacion. Corrige estos problemas y responde de nuevo:

ERRORES:
${errorDetails}

RESPUESTA ANTERIOR:
${cleaned}

Corrige los errores y responde SOLO con JSON valido.`;

  const retryResult = await callClaude(
    PROMPTS.DATA_EXTRACTOR,
    retryPrompt,
    { temperature: 0.1, max_tokens: 2000 }
  );

  const retryCleaned = retryResult.text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  const retryParsed = JSON.parse(retryCleaned);
  const retryValidation = ExtractionSchema.safeParse(retryParsed);

  return {
    extraction: retryValidation.success ? retryValidation.data : retryParsed,
    valid: retryValidation.success,
    errors: retryValidation.success ? null : retryValidation.error.issues,
    metrics: retryResult,
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

  const { text, articleMeta, picot } = req.body || {};

  if (!text && !articleMeta) {
    return res.status(400).json({ success: false, error: 'Missing text or articleMeta' });
  }

  try {
    const articleText = text || (articleMeta && articleMeta.abstract) || '';
    logAgent(AGENT_NAME, 'info', 'Extracting data', { pmid: (articleMeta || {}).pmid, textLength: articleText.length });
    const start = Date.now();

    const result = await extractFromText(articleText, articleMeta || {}, picot);

    const duration = Date.now() - start;
    logAgent(AGENT_NAME, 'info', 'Extraction complete', { valid: result.valid, duration });

    return res.status(200).json({
      success: true,
      data: {
        extraction: result.extraction,
        valid: result.valid,
        errors: result.errors || null,
      },
      metrics: { duration },
    });
  } catch (err) {
    logError(AGENT_NAME, err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
