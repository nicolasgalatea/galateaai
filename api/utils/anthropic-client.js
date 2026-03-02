import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      response = await client.messages.create({
        model,
        max_tokens,
        temperature,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      });
      break;
    } catch (err) {
      if ((err.status === 529 || err.status === 429) && attempt === 0) {
        await new Promise((r) => setTimeout(r, 1500));
        continue;
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
