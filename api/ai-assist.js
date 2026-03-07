import { callClaude } from './utils/anthropic-client.js';
import { logAgent, logError } from './utils/logger.js';

const AGENT_NAME = 'ai-assist';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

const SYSTEM_PROMPT = `Eres Galatea AI Assist, un asistente experto en redaccion cientifica y metodologia de investigacion clinica. Tu rol es mejorar, completar o editar documentos de investigacion segun las instrucciones del usuario.

REGLAS:
- Responde SIEMPRE en espanol
- Devuelve UNICAMENTE el texto del documento mejorado/modificado, sin explicaciones adicionales
- Mantén el formato y estructura del documento original a menos que se pida cambiar
- Usa lenguaje academico formal apropiado para publicaciones cientificas
- Incluye referencias en formato Vancouver cuando sea apropiado
- No inventes datos estadisticos especificos; usa rangos plausibles con citas a la literatura
- Si el usuario pide completar una seccion, genera contenido sustantivo y detallado
- Si el usuario pide mejorar redaccion, mantén el contenido pero mejora claridad, cohesion y precision
- NO incluyas marcadores como [TODO], [INSERTAR], etc. — genera contenido completo`;

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  Object.entries(CORS_HEADERS).forEach(([key, val]) => res.setHeader(key, val));

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { text, instruction, context } = req.body || {};

  if (!instruction) {
    return res.status(400).json({ success: false, error: 'Missing instruction' });
  }

  try {
    logAgent(AGENT_NAME, 'info', 'AI Assist request', {
      instructionLen: instruction.length,
      textLen: (text || '').length,
    });

    const userPrompt = `DOCUMENTO ACTUAL:
---
${text || '(Documento vacio)'}
---

CONTEXTO DEL PROYECTO: ${context || 'Investigacion clinica'}

INSTRUCCION DEL USUARIO: ${instruction}

Devuelve el documento completo modificado segun la instruccion. Solo el texto, sin explicaciones.`;

    const result = await callClaude(SYSTEM_PROMPT, userPrompt, {
      max_tokens: 8192,
      temperature: 0.4,
    });

    logAgent(AGENT_NAME, 'info', 'AI Assist complete', {
      duration: result.duration,
      tokensUsed: result.tokensUsed,
    });

    return res.status(200).json({
      success: true,
      text: result.text,
      metrics: {
        duration: result.duration,
        tokensUsed: result.tokensUsed,
      },
    });
  } catch (err) {
    logError(AGENT_NAME, err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
