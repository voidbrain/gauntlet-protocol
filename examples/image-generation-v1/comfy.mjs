// ComfyUI client for the image-generation reference runner (F-021-T03, runtime B in
// docs/decisions/image-generation.md). One committed API-format workflow (workflow.json: Qwen Image 2.1 Turbo int8,
// the three pinned loaders in models.json, fixed sigmas, no prompt enhancer); a case sets only prompt, seed and size.
// Literal loopback addresses only: no name resolution, no proxy (Node's fetch ignores proxy variables), no redirects,
// no credentials. Generated images are stored outside the repository: the Qwen Research License allows evaluation only.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = realpathSync(resolve(here, '../..'));
const sha256 = (data) => createHash('sha256').update(data).digest('hex');
const workflowBytes = readFileSync(join(here, 'workflow.json'));

export const workflow = JSON.parse(String(workflowBytes));
export const workflowSha256 = sha256(workflowBytes);
export const models = JSON.parse(readFileSync(join(here, 'models.json'), 'utf8'));
export const defaultTasks = join(here, 'tasks');
export const defaultOllama = 'http://127.0.0.1:11434';
const node = (graph, type) => Object.values(graph).find((entry) => entry.class_type === type);
const output = Object.entries(workflow).find(([, entry]) => entry.class_type === 'PreviewImage')[0];
// Steps are the committed sigmas (the Turbo schedule), not a per-case setting; each result records them.
export const steps = node(workflow, 'ManualSigmas').inputs.sigmas.split(',').length - 1;

// The digest of the pinned model set: the three files' names and SHA-256, hash-checked by the owner (F-021-T07).
export function modelDigest() {
  return sha256(JSON.stringify(models.files.map((file) => [file.folder, file.name, file.sha256])));
}

export function readImageTask(dir, id) {
  const file = join(dir, id + '.json');
  if (!/^[a-z0-9-]{1,100}$/.test(id) || !existsSync(file)) throw Error('Invalid image task: ' + id);
  const task = JSON.parse(readFileSync(file, 'utf8'));
  const size = (value) => Number.isSafeInteger(value) && value >= 256 && value <= 2048 && value % 16 === 0;
  if (
    task.schemaVersion !== 1 ||
    typeof task.prompt !== 'string' ||
    !task.prompt.trim() ||
    task.prompt.length > 4000 ||
    !Number.isSafeInteger(task.seed) ||
    task.seed < 0 ||
    !size(task.width) ||
    !size(task.height) ||
    !validChecklist(task.checklist) ||
    !(task.pixels === undefined || validPixels(task.pixels))
  )
    throw Error('Invalid image task: ' + id);
  return {
    id,
    prompt: task.prompt,
    seed: task.seed,
    width: task.width,
    height: task.height,
    steps,
    checklist: task.checklist,
    pixels: task.pixels ?? [],
  };
}

const plain = (value, keys) =>
  value !== null &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  Object.keys(value).every((key) => keys.includes(key));
const fraction = (value) => typeof value === 'number' && value >= 0 && value <= 1;
// The judge's checklist (F-021-T04): one to eight fixed yes/no questions with distinct ids.
function validChecklist(list) {
  return (
    Array.isArray(list) &&
    list.length >= 1 &&
    list.length <= 8 &&
    new Set(list.map((item) => item?.id)).size === list.length &&
    list.every(
      (item) =>
        plain(item, ['id', 'question', 'expect']) &&
        typeof item.id === 'string' &&
        /^[a-z][a-z0-9-]{0,40}$/.test(item.id) &&
        typeof item.question === 'string' &&
        item.question.trim().length > 0 &&
        item.question.length <= 300 &&
        ['yes', 'no'].includes(item.expect),
    )
  );
}
// Simple pixel facts for the structural gate: at least minFraction of the pixels lie in a hue range (degrees, wrapping
// when from > to) and saturation and value bounds (0 to 1).
function validPixels(list) {
  return (
    Array.isArray(list) &&
    list.length <= 8 &&
    list.every(
      (fact) =>
        plain(fact, ['name', 'hue', 'minSaturation', 'maxSaturation', 'minValue', 'maxValue', 'minFraction']) &&
        typeof fact.name === 'string' &&
        /^[a-z][a-z -]{0,40}$/.test(fact.name) &&
        fraction(fact.minFraction) &&
        fact.minFraction > 0 &&
        (fact.hue === undefined ||
          (Array.isArray(fact.hue) &&
            fact.hue.length === 2 &&
            fact.hue.every((degree) => typeof degree === 'number' && degree >= 0 && degree < 360))) &&
        ['minSaturation', 'maxSaturation', 'minValue', 'maxValue'].every(
          (key) => fact[key] === undefined || fraction(fact[key]),
        ),
    )
  );
}

export function buildPrompt(task) {
  const graph = structuredClone(workflow);
  node(graph, 'TextEncodeQwenImage21').inputs.prompt = task.prompt;
  node(graph, 'RandomNoise').inputs.noise_seed = task.seed;
  Object.assign(node(graph, 'EmptyLatentImage').inputs, { width: task.width, height: task.height });
  return graph;
}

export function loopback(text, what) {
  const url = new URL(text);
  if (
    url.protocol !== 'http:' ||
    !['127.0.0.1', '[::1]'].includes(url.hostname) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  )
    throw Error(what + ' must be a literal loopback address (127.0.0.1 or [::1]), not ' + url.origin);
  return url;
}

// The output folder must lie outside this repository, so no generated image can be committed.
export function outsideRepository(dir) {
  mkdirSync(dir, { recursive: true });
  const real = realpathSync(dir);
  if (real === repositoryRoot || real.startsWith(repositoryRoot + sep))
    throw Error('Image output folder must be outside the repository: ' + real);
  return real;
}

async function request(base, path, { body, timeoutMs = 30000, raw = false } = {}) {
  let response;
  try {
    response = await fetch(new URL(path, base), {
      method: body === undefined ? 'GET' : 'POST',
      redirect: 'error',
      headers: body === undefined ? undefined : { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    const cause = error?.cause;
    if (/redirect/i.test(String(cause?.message ?? error?.message)))
      throw Error(base.origin + ' answered with a redirect');
    if (['ECONNREFUSED', 'ECONNRESET', 'EHOSTUNREACH'].includes(cause?.code))
      throw Object.assign(Error('down'), { down: true });
    throw error;
  }
  if (raw) return response;
  const text = await response.text();
  let value = null;
  try {
    value = text ? JSON.parse(text) : null;
  } catch {
    value = null;
  }
  if (!response.ok) throw Object.assign(Error(base.origin + path + ' returned ' + response.status), { value });
  return value;
}

export function comfyClient(endpoint) {
  const base = loopback(endpoint, 'ComfyUI endpoint');
  const call = async (path, options) => {
    try {
      return await request(base, path, options);
    } catch (error) {
      if (error.down)
        throw Error('ComfyUI is not running at ' + base.href + ': start Comfy Desktop (it serves 127.0.0.1:8188)');
      throw error;
    }
  };
  return {
    endpoint: base.href,
    async identity() {
      const stats = await call('/system_stats');
      const version = String(stats?.system?.comfyui_version ?? 'unknown');
      const device = stats?.devices?.[0];
      return { runtime: 'comfyui-' + version, device: device ? String(device.type ?? device.name) : 'unknown' };
    },
    async checkModels() {
      for (const file of models.files) {
        const listed = await call('/models/' + file.folder);
        if (!Array.isArray(listed) || !listed.includes(file.name))
          throw Error(
            'Model missing in ComfyUI: ' +
              file.folder +
              '/' +
              file.name +
              '; fetch it as docs/decisions/image-generation.md, "Pull the models", says, then restart Comfy Desktop',
          );
      }
    },
    // Submits one task and waits for its image. On timeout it interrupts the run and drops it from the queue.
    async generate(task, { timeoutMs, pollMs = 500 }) {
      const started = Date.now();
      let queued;
      try {
        queued = await call('/prompt', { body: { prompt: buildPrompt(task), client_id: 'gauntlet-image-runner' } });
      } catch (error) {
        const reason = error.value?.error?.message;
        if (!reason) throw error;
        const nodes = Object.values(error.value.node_errors ?? {})
          .flatMap((entry) => entry.errors ?? [])
          .map((entry) => entry.details || entry.message);
        throw Error('ComfyUI refused the workflow: ' + [reason, ...nodes].join('; '));
      }
      const promptId = String(queued?.prompt_id ?? '');
      if (!promptId) throw Error('ComfyUI returned no prompt id');
      for (;;) {
        const history = await call('/history/' + encodeURIComponent(promptId));
        const entry = history?.[promptId];
        if (entry?.status?.status_str === 'error') {
          const failure = (entry.status.messages ?? []).find(([kind]) => kind === 'execution_error')?.[1] ?? {};
          throw Error(
            'ComfyUI generation failed in ' +
              String(failure.node_type ?? 'an unknown node') +
              ': ' +
              String(failure.exception_message ?? 'no message').trim(),
          );
        }
        const image = entry?.status?.completed ? entry.outputs?.[output]?.images?.[0] : undefined;
        if (image) {
          const query = new URLSearchParams({
            filename: String(image.filename),
            subfolder: String(image.subfolder ?? ''),
            type: String(image.type ?? 'temp'),
          });
          const response = await call('/view?' + query, { raw: true });
          if (!response.ok) throw Error('ComfyUI /view returned ' + response.status);
          const bytes = Buffer.from(await response.arrayBuffer());
          if (bytes.length > 64 * 1024 * 1024) throw Error('Generated image exceeds 64 MiB');
          return { bytes, promptId, durationMs: Date.now() - started };
        }
        if (entry?.status?.completed) throw Error('ComfyUI finished without an image');
        if (Date.now() - started > timeoutMs) {
          await call('/interrupt', { body: {} }).catch(() => {});
          await call('/queue', { body: { delete: [promptId] } }).catch(() => {});
          throw Error('ComfyUI generation timed out after ' + timeoutMs + ' ms');
        }
        await new Promise((done) => setTimeout(done, pollMs));
      }
    },
    // Unloads every model and frees memory, before the judge or anything else loads (memory plan, step 3).
    async free() {
      await call('/free', { body: { unload_models: true, free_memory: true } });
    },
  };
}

// Memory plan, step 1: no Ollama model may stay resident beside the generator. Refuses unless asked to unload; then
// unloads each through the API (keep_alive 0), never by stopping a process. An Ollama that is not running holds nothing.
export async function checkOllama(endpoint, { unload = false } = {}) {
  const base = loopback(endpoint, 'Ollama endpoint');
  const loaded = async () => {
    try {
      const ps = await request(base, '/api/ps');
      return (ps?.models ?? []).map((entry) => String(entry.name ?? entry.model));
    } catch (error) {
      if (error.down) return [];
      throw error;
    }
  };
  const names = await loaded();
  if (!names.length) return [];
  if (!unload)
    throw Error(
      'Ollama has ' +
        names.join(', ') +
        ' loaded: run ' +
        names.map((name) => '`ollama stop ' + name + '`').join(', ') +
        ', or pass --unload-ollama to unload idle models through the API',
    );
  for (const name of names) await request(base, '/api/generate', { body: { model: name, keep_alive: 0 } });
  const left = await loaded();
  if (left.length) throw Error('Ollama still holds ' + left.join(', ') + ' after unloading');
  return names;
}

// Writes the image and its record (seed, size, steps, model digest, image SHA-256) side by side.
export function store(dir, task, generated, identity, iteration = 1) {
  const imageSha256 = sha256(generated.bytes);
  const folder = join(dir, task.id);
  mkdirSync(folder, { recursive: true });
  const stem = join(
    folder,
    new Date().toISOString().replace(/[:.]/g, '-') + '-' + iteration + '-' + imageSha256.slice(0, 12),
  );
  writeFileSync(stem + '.png', generated.bytes);
  const record = {
    schemaVersion: 1,
    case: task.id,
    iteration,
    prompt: task.prompt,
    seed: task.seed,
    width: task.width,
    height: task.height,
    steps: task.steps,
    modelDigest: modelDigest(),
    models: models.files.map((file) => file.folder + '/' + file.name),
    workflowSha256,
    runtime: identity.runtime,
    device: identity.device,
    promptId: generated.promptId,
    durationMs: generated.durationMs,
    image: stem + '.png',
    imageSha256,
  };
  writeFileSync(stem + '.json', JSON.stringify(record, null, 2) + '\n');
  return record;
}

export function taskFixtureHash(task) {
  return sha256(JSON.stringify({ task, workflowSha256, models: modelDigest() }));
}
