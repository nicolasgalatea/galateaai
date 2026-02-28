import { callClaude } from '../utils/anthropic-client.js';
import { updatePhaseData } from '../utils/supabase-server.js';
import { logAgent, logError, logMetrics } from '../utils/logger.js';
import { PROMPTS } from '../../prompts/system-prompts.js';

const AGENT_NAME = 'literature-scout';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  Object.entries(CORS_HEADERS).forEach(([key, val]) => res.setHeader(key, val));

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { projectId, picot, framework } = req.body || {};

  if (!picot) {
    return res.status(400).json({ success: false, error: 'Missing picot' });
  }

  try {
    logAgent(AGENT_NAME, 'info', 'Starting literature search strategy', { projectId });

    const userPrompt = `Framework: ${framework || 'PICOS'}\n\nPICOT estructurado:\n${JSON.stringify(picot, null, 2)}\n\nGenera la estrategia de busqueda completa, mapeo de descriptores y criterios de inclusion/exclusion.`;

    const result = await callClaude(PROMPTS.LITERATURE_SCOUT, userPrompt);

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

    if (projectId) {
      try {
        await updatePhaseData(projectId, 'search_strategy', data.searchStrategy);
        await updatePhaseData(projectId, 'descriptor_mapping', data.descriptorMapping);
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
      },
    });
  } catch (err) {
    logError(AGENT_NAME, err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
