/**
 * Structured JSON logging for serverless agents
 */

export function logAgent(name, level, message, metadata = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    agent: name,
    level,
    message,
    ...metadata,
  };
  console.log(JSON.stringify(entry));
}

export function logError(name, error, context = {}) {
  logAgent(name, 'error', error.message || String(error), {
    stack: error.stack,
    ...context,
  });
}

export function logMetrics(name, metrics) {
  logAgent(name, 'info', 'metrics', {
    duration_ms: metrics.duration,
    tokens_input: metrics.tokensUsed?.input,
    tokens_output: metrics.tokensUsed?.output,
  });
}
