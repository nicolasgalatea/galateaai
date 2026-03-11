import { logAgent, logError } from '../_utils/logger.js';

const AGENT_NAME = 'redcap-proxy';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || 'https://galatea-v2-prod.vercel.app',
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

  const { redcap_url, token, ...params } = req.body || {};

  if (!redcap_url || !token) {
    return res.status(400).json({ success: false, error: 'Missing redcap_url or token' });
  }

  // Validate URL format
  try {
    const parsed = new URL(redcap_url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return res.status(400).json({ success: false, error: 'Invalid REDCap URL protocol' });
    }
  } catch {
    return res.status(400).json({ success: false, error: 'Invalid REDCap URL' });
  }

  // Build x-www-form-urlencoded body for REDCap API
  const formParams = new URLSearchParams();
  formParams.append('token', token);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      if (typeof value === 'object') {
        formParams.append(key, JSON.stringify(value));
      } else {
        formParams.append(key, String(value));
      }
    }
  }

  try {
    logAgent(AGENT_NAME, 'info', 'Proxying REDCap request', {
      content: params.content,
      action: params.action || 'export',
    });

    const start = Date.now();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    const response = await fetch(redcap_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formParams.toString(),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const duration = Date.now() - start;
    const text = await response.text();

    if (!response.ok) {
      logAgent(AGENT_NAME, 'error', 'REDCap API error', { status: response.status, body: text.slice(0, 500) });
      return res.status(response.status).json({ success: false, error: text || 'REDCap API error' });
    }

    // Try to parse as JSON, otherwise return raw text
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    logAgent(AGENT_NAME, 'info', 'REDCap request complete', { duration });

    return res.status(200).json({ success: true, data });
  } catch (err) {
    logError(AGENT_NAME, err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
