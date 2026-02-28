import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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
  const max_tokens = options.max_tokens || 2000;

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
  const text = response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n');

  return {
    text,
    duration,
    tokensUsed: {
      input: response.usage.input_tokens,
      output: response.usage.output_tokens,
    },
  };
}
