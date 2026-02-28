import { callClaude } from '../utils/anthropic-client.js';
import { updatePhaseData } from '../utils/supabase-server.js';
import { logAgent, logError, logMetrics } from '../utils/logger.js';
import { PROMPTS } from '../../prompts/system-prompts.js';

const AGENT_NAME = 'picot-builder';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // Set CORS headers
  Object.entries(CORS_HEADERS).forEach(([key, val]) => res.setHeader(key, val));

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { projectId, researchQuestion } = req.body || {};

  if (!researchQuestion) {
    return res.status(400).json({ success: false, error: 'Missing researchQuestion' });
  }

  try {
    logAgent(AGENT_NAME, 'info', 'Starting PICOT analysis', { projectId });

    const userPrompt = `Pregunta de investigacion:\n"${researchQuestion}"\n\nAnaliza esta pregunta y genera el PICOT estructurado.`;

    const result = await callClaude(PROMPTS.PICOT_BUILDER, userPrompt);

    logMetrics(AGENT_NAME, result);

    // Parse JSON from Claude response (clean markdown if present)
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

    // Save to Supabase if projectId provided
    if (projectId) {
      try {
        await updatePhaseData(projectId, 'picot', data.picot);
        await updatePhaseData(projectId, 'framework', data.framework);
        await updatePhaseData(projectId, 'study_type', {
          type: data.studyType,
          design_locked: data.designLocked,
          justification: data.justification,
        });
        logAgent(AGENT_NAME, 'info', 'Saved to Supabase', { projectId });
      } catch (dbErr) {
        logError(AGENT_NAME, dbErr, { context: 'supabase_save' });
        // Don't fail the request — data is still returned
      }
    }

    return res.status(200).json({
      success: true,
      data,
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
