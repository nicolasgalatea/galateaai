import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Sanitize unescaped control characters inside JSON string values.
 * Walks char-by-char; when inside a quoted string, replaces control chars
 * (code < 0x20) with their escaped equivalents.
 */
function sanitizeControlChars(text) {
  let result = '';
  let inString = false;
  let escape = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (escape) { result += ch; escape = false; continue; }
    if (ch === '\\' && inString) { result += ch; escape = true; continue; }
    if (ch === '"') { inString = !inString; result += ch; continue; }
    if (inString) {
      const code = ch.charCodeAt(0);
      if (code < 0x20) {
        if (code === 0x0A) result += '\\n';
        else if (code === 0x0D) result += '\\r';
        else if (code === 0x09) result += '\\t';
        else result += '\\u' + code.toString(16).padStart(4, '0');
        continue;
      }
    }
    result += ch;
  }
  return result;
}

/**
 * Parse JSON from Claude response:
 * 1. Strip markdown fences
 * 2. Sanitize control characters inside strings
 * 3. Try JSON.parse; on failure try repairTruncatedJSON then re-parse
 */
export function parseClaudeJSON(text) {
  let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  cleaned = sanitizeControlChars(cleaned);
  try {
    return JSON.parse(cleaned);
  } catch (firstErr) {
    // Try repairing truncated JSON
    try {
      const repaired = repairTruncatedJSON(cleaned);
      const sanitized = sanitizeControlChars(repaired);
      return JSON.parse(sanitized);
    } catch {
      throw new Error(`Failed to parse Claude JSON: ${firstErr.message}`);
    }
  }
}

/**
 * Attempt to repair truncated JSON by closing open strings, arrays, and objects
 */
function repairTruncatedJSON(text) {
  // Strip markdown fences if present
  let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  try {
    JSON.parse(cleaned);
    return text; // Already valid
  } catch (e) {
    // Try to close truncated JSON
    let inString = false;
    let escape = false;
    const stack = [];
    for (let i = 0; i < cleaned.length; i++) {
      const ch = cleaned[i];
      if (escape) { escape = false; continue; }
      if (ch === '\\' && inString) { escape = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (ch === '{' || ch === '[') stack.push(ch);
      if (ch === '}' || ch === ']') stack.pop();
    }
    // Close open string
    if (inString) cleaned += '"';
    // Close open structures
    while (stack.length > 0) {
      const open = stack.pop();
      cleaned += open === '{' ? '}' : ']';
    }
    return cleaned;
  }
}

/**
 * Call Claude API with structured system/user prompts
 * @param {string} systemPrompt - System prompt for the agent
 * @param {string} userPrompt - User message content
 * @param {object} options - Optional overrides (model, temperature, max_tokens)
 * @returns {{ text: string, duration: number, tokensUsed: { input: number, output: number } }}
 */
export async function callClaude(systemPrompt, userPrompt, options = {}) {
  const model = options.model || 'claude-haiku-4-5-20251001';
  const temperature = options.temperature ?? 0.3;
  const max_tokens = options.max_tokens || 4096;

  const start = Date.now();
  let response;

  const timeoutMs = options.timeout || 50000; // Must fit within Vercel's 60s maxDuration
  const maxAttempts = 2; // Only 1 retry to stay within Vercel time limit
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        response = await client.messages.create({
          model,
          max_tokens,
          temperature,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }, { signal: controller.signal });
      } finally {
        clearTimeout(timer);
      }
      break;
    } catch (err) {
      const isAbort = err.name === 'AbortError' || /abort/i.test(err.message);
      const isRetryable = err.status === 529 || err.status === 429;
      if (isRetryable && attempt < maxAttempts - 1) {
        const backoff = 2000;
        console.warn(`[anthropic-client] Retry ${attempt + 1}: ${err.message}. Waiting ${backoff}ms`);
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }
      if (isAbort) {
        throw new Error('Claude API timeout after ' + timeoutMs + 'ms');
      }
      throw err;
    }
  }

  const duration = Date.now() - start;
  let text = response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n');

  // If response was truncated, try to close any open JSON
  if (response.stop_reason === 'max_tokens') {
    console.warn(`[anthropic-client] Response truncated (max_tokens=${max_tokens}). Attempting JSON repair.`);
    text = repairTruncatedJSON(text);
  }

  return {
    text,
    duration,
    tokensUsed: {
      input: response.usage.input_tokens,
      output: response.usage.output_tokens,
    },
  };
}
