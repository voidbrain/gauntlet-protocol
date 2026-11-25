// Asks the profile's local Ollama model for one candidate file. Shared by the coding-v1 and embedded-v1 reference
// runners. The model sees only the prompt it is given (task prompt and starter), never expected values or checks.
// Literal loopback addresses only: no name resolution, no proxy (Node's fetch ignores proxy variables), no redirects.
export async function askCandidate({ profile, budget, started, prompt }) {
  const endpoint = new URL(profile.endpoint);
  if (!['127.0.0.1', '[::1]'].includes(endpoint.hostname))
    throw Error('Model endpoint must be a literal loopback address');
  const call = async (path, body) => {
    const response = await fetch(new URL(path, endpoint), {
      method: body ? 'POST' : 'GET',
      redirect: 'error',
      headers: body ? { 'content-type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(Math.max(1000, budget.timeoutMs - (Date.now() - started) - 20000)),
    });
    if (!response.ok) throw Error('Model endpoint returned ' + response.status);
    return response.json();
  };
  const version = await call('/api/version');
  const tags = await call('/api/tags');
  const model = tags.models?.find((entry) => entry.name === profile.model);
  if (!model || !/^[a-f0-9]{64}$/.test(String(model.digest))) throw Error('Model not installed');
  const maxTokens = Math.min(profile.maxOutputTokens, budget.outputTokens);
  if (maxTokens < 1) throw Error('No output budget left');
  const options = { num_ctx: profile.context, num_predict: maxTokens };
  for (const [key, field] of [
    ['temperature', 'temperature'],
    ['top_p', 'topP'],
    ['top_k', 'topK'],
    ['seed', 'seed'],
  ])
    if (profile[field] !== null) options[key] = profile[field];
  const reply = await call('/api/chat', {
    model: profile.model,
    stream: false,
    keep_alive: 0,
    ...(profile.think === null ? {} : { think: profile.think }),
    options,
    messages: [{ role: 'user', content: prompt }],
  });
  const outputTokens = reply.eval_count;
  if (!Number.isInteger(outputTokens) || outputTokens > maxTokens) throw Error('Unmeasured or excess output tokens');
  const content = String(reply.message?.content ?? '');
  const fenced = /```[^\n]*\n([\s\S]*?)```/.exec(content);
  return {
    candidate: fenced ? fenced[1] : content,
    truncated: reply.done_reason === 'length',
    outputTokens,
    modelDigest: model.digest,
    ollamaVersion: String(version.version),
  };
}
