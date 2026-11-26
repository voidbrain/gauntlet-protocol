// S+V grader for image-generation-v1 (F-021-T04; docs/decisions/image-generation.md, Question 2).
// S: structural checks first: the bytes decode as an 8-bit PNG, the size is the task's, the image is not blank or
// uniform, and the task's simple pixel facts hold (a colour covers at least a fraction of the image). An image that fails
// here is never sent to the judge.
// V: the pinned local vision judge (judge.json: gemma4:12b by digest, temperature 0, no thinking) answers the task's
// fixed yes/no checklist as JSON through Ollama's loopback API. Only the questions are sent; the expected answers stay
// here. The answer is parsed deterministically (exact ids, "yes" or "no") and compared with the expectations: the verdict
// is a pure function of the image and the judge's answer. The last judge request sends keep_alive 0 so the judge unloads
// (memory plan, step 4).
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { crc32, inflateSync } from 'node:zlib';
import { loopback } from './comfy.mjs';

const here = dirname(fileURLToPath(import.meta.url));
export const judgeSpec = JSON.parse(readFileSync(join(here, 'judge.json'), 'utf8'));
const sha256 = (data) => createHash('sha256').update(data).digest('hex');
const maxPixels = 4096 * 4096;
const minLumaDeviation = 4;

// Decodes a non-interlaced 8-bit PNG (grey, grey+alpha, RGB or RGBA) to RGB; alpha is ignored. Throws on anything else.
export function decodePng(bytes) {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (!Buffer.isBuffer(bytes) || bytes.length < 8 || signature.some((byte, i) => bytes[i] !== byte))
    throw Error('not a PNG');
  let at = 8,
    header = null;
  const data = [];
  for (;;) {
    if (at + 12 > bytes.length) throw Error('PNG is truncated');
    const length = bytes.readUInt32BE(at);
    const type = bytes.toString('latin1', at + 4, at + 8);
    if (at + 12 + length > bytes.length) throw Error('PNG is truncated');
    if (crc32(bytes.subarray(at + 4, at + 8 + length)) !== bytes.readUInt32BE(at + 8 + length))
      throw Error('PNG chunk ' + type + ' fails its CRC');
    const body = bytes.subarray(at + 8, at + 8 + length);
    if (type === 'IHDR') header = body;
    else if (type === 'IDAT') data.push(body);
    else if (type === 'IEND') break;
    at += 12 + length;
  }
  if (!header || header.length !== 13) throw Error('PNG has no IHDR');
  const width = header.readUInt32BE(0),
    height = header.readUInt32BE(4);
  const [depth, colourType, , , interlace] = header.subarray(8);
  const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[colourType];
  if (depth !== 8 || !channels || interlace !== 0)
    throw Error('unsupported PNG: bit depth ' + depth + ', colour type ' + colourType + ', interlace ' + interlace);
  if (!width || !height || width * height > maxPixels) throw Error('PNG size out of range');
  const stride = width * channels;
  let raw;
  try {
    raw = inflateSync(Buffer.concat(data), { maxOutputLength: height * (stride + 1) });
  } catch {
    throw Error('PNG image data does not inflate');
  }
  if (raw.length !== height * (stride + 1)) throw Error('PNG image data has the wrong length');
  const pixels = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    if (filter > 4) throw Error('PNG row filter ' + filter + ' is invalid');
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? pixels[y * stride + x - channels] : 0;
      const b = y ? pixels[(y - 1) * stride + x] : 0;
      const c = y && x >= channels ? pixels[(y - 1) * stride + x - channels] : 0;
      const p = a + b - c,
        pa = Math.abs(p - a),
        pb = Math.abs(p - b),
        pc = Math.abs(p - c);
      const predicted = [0, a, b, (a + b) >> 1, pa <= pb && pa <= pc ? a : pb <= pc ? b : c][filter];
      pixels[y * stride + x] = (raw[y * (stride + 1) + 1 + x] + predicted) & 255;
    }
  }
  const rgb = new Uint8Array(width * height * 3);
  for (let i = 0; i < width * height; i++)
    if (channels >= 3) rgb.set(pixels.subarray(i * channels, i * channels + 3), i * 3);
    else rgb.fill(pixels[i * channels], i * 3, i * 3 + 3);
  return { width, height, rgb };
}

// Hue in degrees, saturation and value in 0..1.
function hsv(r, g, b) {
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    delta = max - min;
  let hue = 0;
  if (delta)
    hue =
      max === r
        ? 60 * (((g - b) / delta + 6) % 6)
        : max === g
          ? 60 * ((b - r) / delta + 2)
          : 60 * ((r - g) / delta + 4);
  return [hue, max ? delta / max : 0, max / 255];
}
function matches(fact, [hue, saturation, value]) {
  if (fact.hue) {
    const [from, to] = fact.hue;
    if (from <= to ? hue < from || hue > to : hue < from && hue > to) return false;
  }
  return (
    saturation >= (fact.minSaturation ?? 0) &&
    saturation <= (fact.maxSaturation ?? 1) &&
    value >= (fact.minValue ?? 0) &&
    value <= (fact.maxValue ?? 1)
  );
}

// The structural gate. Every check is named; `passed` is true only when all pass.
export function structural(bytes, task) {
  let image;
  try {
    image = decodePng(bytes);
  } catch (error) {
    return { passed: false, checks: [{ name: 'png', passed: false, detail: error.message }] };
  }
  const checks = [{ name: 'png', passed: true }];
  const { width, height, rgb } = image;
  checks.push({
    name: 'size',
    passed: width === task.width && height === task.height,
    detail: width + 'x' + height + ', expected ' + task.width + 'x' + task.height,
  });
  const count = width * height;
  let sum = 0,
    squares = 0;
  const matched = task.pixels.map(() => 0);
  for (let i = 0; i < count; i++) {
    const r = rgb[i * 3],
      g = rgb[i * 3 + 1],
      b = rgb[i * 3 + 2];
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    sum += luma;
    squares += luma * luma;
    if (task.pixels.length) {
      const colour = hsv(r, g, b);
      task.pixels.forEach((fact, k) => {
        if (matches(fact, colour)) matched[k]++;
      });
    }
  }
  const deviation = Math.sqrt(Math.max(0, squares / count - (sum / count) ** 2));
  checks.push({
    name: 'not-uniform',
    passed: deviation >= minLumaDeviation,
    detail: 'luma standard deviation ' + deviation.toFixed(2),
  });
  task.pixels.forEach((fact, k) =>
    checks.push({
      name: 'pixels:' + fact.name,
      passed: matched[k] / count >= fact.minFraction,
      detail: ((100 * matched[k]) / count).toFixed(2) + '% of pixels, at least ' + 100 * fact.minFraction + '%',
    }),
  );
  return { passed: checks.every((check) => check.passed), checks };
}

// The fixed judge prompt: the questions only, never the expected answers.
export function judgePrompt(task) {
  return [
    'You are checking one image against a fixed checklist. Look only at the image.',
    'Answer every question with "yes" or "no".',
    '',
    'Questions:',
    ...task.checklist.map((item) => '- ' + item.id + ': ' + item.question),
    '',
    'Reply with only a JSON object that maps each question id to "yes" or "no".',
  ].join('\n');
}

export function judgeRequest(task, bytes, { last }) {
  const ids = task.checklist.map((item) => item.id);
  return {
    model: judgeSpec.model,
    messages: [{ role: 'user', content: judgePrompt(task), images: [Buffer.from(bytes).toString('base64')] }],
    format: {
      type: 'object',
      properties: Object.fromEntries(ids.map((id) => [id, { type: 'string', enum: ['yes', 'no'] }])),
      required: ids,
      additionalProperties: false,
    },
    stream: false,
    think: judgeSpec.think,
    options: judgeSpec.options,
    keep_alive: last ? 0 : judgeSpec.keepAlive,
  };
}

// Deterministic parse: one JSON object (optionally inside a single ```json fence) with exactly the checklist ids, each
// "yes" or "no" after trimming and lower-casing. Anything else is a judge error, not a verdict on the image.
export function parseAnswers(task, content) {
  const text = String(content)
    .trim()
    .replace(/^```(?:json)?\s*\n([\s\S]*?)\n?```$/, '$1')
    .trim();
  let value;
  try {
    value = JSON.parse(text);
  } catch {
    throw Error('Judge answer is not JSON: ' + JSON.stringify(text.slice(0, 200)));
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('Judge answer is not a JSON object');
  const ids = task.checklist.map((item) => item.id);
  const keys = Object.keys(value);
  if (keys.length !== ids.length || !ids.every((id) => keys.includes(id)))
    throw Error('Judge answer has ids ' + keys.join(', ') + ', expected ' + ids.join(', '));
  const answers = {};
  for (const id of ids) {
    const answer = typeof value[id] === 'string' ? value[id].trim().toLowerCase() : null;
    if (answer !== 'yes' && answer !== 'no') throw Error('Judge answer for ' + id + ' is not yes or no');
    answers[id] = answer;
  }
  return answers;
}

// Pure verdict: structural gate, then every answer must equal its expectation.
export function verdict(task, structuralResult, answers) {
  const checks = structuralResult.checks.length + task.checklist.length;
  if (!structuralResult.passed) return { status: 'failed', checks, mismatches: [] };
  const mismatches = task.checklist.filter((item) => answers[item.id] !== item.expect).map((item) => item.id);
  return { status: mismatches.length ? 'failed' : 'passed', checks, mismatches };
}

async function post(base, path, body, timeoutMs) {
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
    if (['ECONNREFUSED', 'ECONNRESET'].includes(error?.cause?.code))
      throw Error('Ollama is not running at ' + base.href);
    throw Error('Ollama request ' + path + ' failed: ' + (error?.cause?.message ?? error?.message));
  }
  const text = await response.text();
  if (!response.ok) throw Error('Ollama ' + path + ' returned ' + response.status + ': ' + text.slice(0, 200));
  return JSON.parse(text);
}

export function judgeClient(endpoint, { timeoutMs = 300000 } = {}) {
  const base = loopback(endpoint, 'Ollama endpoint');
  return {
    // The judge must be installed with exactly the pinned digest.
    async identity() {
      const tags = await post(base, '/api/tags', undefined, 30000);
      const entry = (tags?.models ?? []).find((model) => model.name === judgeSpec.model);
      if (!entry || entry.digest !== judgeSpec.digest)
        throw Error(
          'Judge ' +
            judgeSpec.model +
            ' must be installed with digest ' +
            judgeSpec.digest +
            ', found ' +
            (entry ? entry.digest : 'none'),
        );
      const version = await post(base, '/api/version', undefined, 30000);
      return { model: judgeSpec.model, digest: judgeSpec.digest, ollama: String(version?.version ?? 'unknown') };
    },
    async ask(task, bytes, { last }) {
      const started = Date.now();
      const response = await post(base, '/api/chat', judgeRequest(task, bytes, { last }), timeoutMs);
      if (response?.done_reason === 'length') throw Error('Judge answer was cut off at the output limit');
      const content = String(response?.message?.content ?? '');
      return { answers: parseAnswers(task, content), raw: content, durationMs: Date.now() - started };
    },
    async unload() {
      await post(base, '/api/generate', { model: judgeSpec.model, keep_alive: 0 }, 30000);
    },
  };
}

// Grades items ({task, bytes}) in order: structural checks for all, then the judge for those that pass, the last judge
// request unloading it. A judge failure on one image is an `error` for that image; the judge is unloaded afterwards.
export async function gradeImages(items, { endpoint, timeoutMs } = {}) {
  const judge = judgeClient(endpoint, { timeoutMs });
  const identity = await judge.identity();
  const gated = items.map(({ task, bytes }) => ({ task, bytes, structural: structural(bytes, task) }));
  const toJudge = gated.filter((item) => item.structural.passed);
  const results = [];
  let failed = false;
  for (const item of gated) {
    const base = { case: item.task.id, imageSha256: sha256(item.bytes), structural: item.structural };
    if (!item.structural.passed) {
      results.push({ ...base, answers: null, ...verdict(item.task, item.structural, null) });
      continue;
    }
    try {
      const asked = await judge.ask(item.task, item.bytes, { last: item === toJudge.at(-1) });
      results.push({
        ...base,
        answers: asked.answers,
        judgeMs: asked.durationMs,
        ...verdict(item.task, item.structural, asked.answers),
      });
    } catch (error) {
      failed = true;
      results.push({
        ...base,
        answers: null,
        status: 'error',
        checks: 0,
        mismatches: [],
        reason: String(error?.message ?? error),
      });
    }
  }
  if (failed) await judge.unload().catch(() => {});
  return { identity, results };
}
