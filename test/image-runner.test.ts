// Contract tests for the image-generation reference runner (F-021-T03): runtime B, ComfyUI on loopback, driven with one
// committed API-format workflow. A fake ComfyUI and a fake Ollama stand in; no real model and no download in CI.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createServer, type Server } from 'node:http';
import { existsSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { deflateSync } from 'node:zlib';
import { defaults, run, validatePack, validateProfile, validateRegistry, type Profile } from '../src/index.ts';
import {
  buildPrompt,
  modelDigest,
  models,
  pngSize,
  readImageTask,
  workflow,
} from '../examples/image-generation-v1/comfy.mjs';

const runnerPath = resolve('examples/image-generation-v1/runner.mjs');
const generatePath = resolve('examples/image-generation-v1/generate.mjs');
const tasksDir = resolve('test/fixtures/image-generation-v1/tasks');
const sha256 = (data: Buffer) => createHash('sha256').update(data).digest('hex');
const tempDir = (name: string) => mkdtempSync(join(realpathSync(tmpdir()), name));

// A valid PNG of the given size (solid grey), so the runner's decode check runs on real bytes.
function png(width: number, height: number) {
  const chunk = (type: string, data: Buffer) => {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body));
    return Buffer.concat([length, body, crc]);
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header.set([8, 2, 0, 0, 0], 8);
  const row = Buffer.concat([Buffer.from([0]), Buffer.alloc(width * 3, 128)]);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(Buffer.concat(Array.from({ length: height }, () => row)))),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}
function crc32(data: Buffer) {
  let c = ~0;
  for (const byte of data) {
    c ^= byte;
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return ~c >>> 0;
}

interface FakeOptions {
  missing?: string;
  neverFinish?: boolean;
  executionError?: boolean;
  wrongSize?: boolean;
  redirect?: boolean;
}
async function listen(server: Server) {
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
  return 'http://127.0.0.1:' + (server.address() as { port: number }).port;
}
async function fakeComfy(options: FakeOptions = {}) {
  const calls: { method: string; path: string; body: string }[] = [];
  const prompts = new Map<string, { width: number; height: number; polls: number }>();
  const server = createServer((request, response) => {
    let body = '';
    request.on('data', (part) => (body += part));
    request.on('end', () => {
      const url = new URL(String(request.url), 'http://fake');
      calls.push({ method: String(request.method), path: url.pathname, body });
      const send = (value: unknown, status = 200) => {
        response.writeHead(status, { 'content-type': 'application/json' });
        response.end(JSON.stringify(value));
      };
      if (options.redirect) {
        response.writeHead(302, { location: 'http://192.0.2.1/' });
        return response.end();
      }
      if (url.pathname === '/system_stats')
        return send({ system: { comfyui_version: '0.46.3' }, devices: [{ name: 'mps', type: 'mps' }] });
      const folder = /^\/models\/(\w+)$/.exec(url.pathname)?.[1];
      if (folder)
        return send(
          models.files
            .filter((file: { folder: string }) => file.folder === folder)
            .map((file: { name: string }) => file.name)
            .filter((name: string) => name !== options.missing),
        );
      if (url.pathname === '/prompt' && request.method === 'POST') {
        const graph = JSON.parse(body).prompt;
        const latent = Object.values(graph).find((node: any) => node.class_type === 'EmptyLatentImage') as any;
        const id = 'prompt-' + (prompts.size + 1);
        prompts.set(id, { width: latent.inputs.width, height: latent.inputs.height, polls: 0 });
        return send({ prompt_id: id, number: prompts.size, node_errors: {} });
      }
      const historyId = /^\/history\/(.+)$/.exec(url.pathname)?.[1];
      if (historyId) {
        const entry = prompts.get(historyId);
        if (!entry || options.neverFinish || ++entry.polls < 2) return send({});
        if (options.executionError)
          return send({
            [historyId]: {
              status: {
                status_str: 'error',
                completed: false,
                messages: [['execution_error', { exception_message: 'fixture MPS failure', node_type: 'KSampler' }]],
              },
              outputs: {},
            },
          });
        return send({
          [historyId]: {
            status: { status_str: 'success', completed: true },
            outputs: { '13': { images: [{ filename: historyId + '.png', subfolder: '', type: 'temp' }] } },
          },
        });
      }
      if (url.pathname === '/view') {
        const entry = prompts.get(String(url.searchParams.get('filename')).replace(/\.png$/, ''))!;
        response.writeHead(200, { 'content-type': 'image/png' });
        return response.end(png(entry.width + (options.wrongSize ? 16 : 0), entry.height));
      }
      if (['/free', '/interrupt', '/queue'].includes(url.pathname)) return send({});
      send({ error: 'not found' }, 404);
    });
  });
  return { server, endpoint: await listen(server), calls };
}
async function fakeOllama(loaded: string[]) {
  const calls: { path: string; body: string }[] = [];
  const server = createServer((request, response) => {
    let body = '';
    request.on('data', (part) => (body += part));
    request.on('end', () => {
      calls.push({ path: String(request.url), body });
      if (request.url === '/api/ps') return response.end(JSON.stringify({ models: loaded.map((name) => ({ name })) }));
      if (request.url === '/api/generate') {
        const { model, keep_alive } = JSON.parse(body);
        if (keep_alive === 0) loaded.splice(loaded.indexOf(model), 1);
        return response.end(JSON.stringify({ model, done: true, done_reason: 'unload' }));
      }
      response.writeHead(404).end();
    });
  });
  return { server, endpoint: await listen(server), calls };
}

const profile = (endpoint: string): Profile =>
  validateProfile({
    ...JSON.parse(readFileSync('examples/profiles/qwen-image-2.1-turbo-int8.json', 'utf8')),
    endpoint: endpoint + '/',
  });
const pack = validatePack({
  schemaVersion: 1,
  id: 'image-runner-fixture',
  version: '1.0.0',
  cases: ['grey-square-regression', 'grey-wide-holdout'].map((caseId) => ({
    id: caseId,
    layer: 'model',
    split: caseId.endsWith('holdout') ? 'holdout' : 'regression',
    capabilities: ['image-generation'],
    critical: true,
    expensive: true,
    runner: 'image-generation-reference',
  })),
});
const registry = (out: string, ollama: string, extra: string[] = []) =>
  validateRegistry(
    {
      schemaVersion: 1,
      runners: {
        'image-generation-reference': {
          command: process.execPath,
          args: [
            runnerPath,
            '{report}',
            '{configuration}',
            '{budget}',
            '{case}',
            '--tasks=' + tasksDir,
            '--out=' + out,
            '--ollama=' + ollama,
            '--poll-ms=20',
            ...extra,
          ],
          cwd: process.cwd(),
          layers: ['model'],
          allowModels: true,
        },
      },
    },
    process.cwd(),
  );
// Runs the runner once outside the engine, to read its own report and the message it writes on stderr.
function runOnce(endpoint: string, caseId: string, flags: string[], timeoutMs = 60000) {
  const dir = tempDir('image-runner-direct-');
  const write = (name: string, value: unknown) => {
    writeFileSync(join(dir, name), JSON.stringify(value));
    return join(dir, name);
  };
  const child = spawnSync(
    process.execPath,
    [
      runnerPath,
      join(dir, 'report.json'),
      write('configuration.json', profile(endpoint)),
      write('budget.json', { timeoutMs, outputTokens: 1, maxBytes: 1048576 }),
      write(
        'case.json',
        pack.cases.find((c) => c.id === caseId),
      ),
      '--tasks=' + tasksDir,
      '--poll-ms=20',
      ...flags,
    ],
    { encoding: 'utf8' },
  );
  const report = existsSync(join(dir, 'report.json'))
    ? JSON.parse(readFileSync(join(dir, 'report.json'), 'utf8'))
    : null;
  rmSync(dir, { recursive: true, force: true });
  return { status: child.status, stderr: child.stderr, report };
}

test('the committed workflow is API format with the three pinned loaders, fixed sigmas and no prompt enhancer', () => {
  const nodes = Object.values(workflow) as { class_type: string; inputs: Record<string, unknown> }[];
  const byType = (type: string) => nodes.filter((node) => node.class_type === type);
  assert.deepEqual(
    [
      byType('UNETLoader')[0].inputs.unet_name,
      byType('CLIPLoader')[0].inputs.clip_name,
      byType('CLIPLoader')[0].inputs.type,
      byType('VAELoader')[0].inputs.vae_name,
    ],
    [
      'qwen_image_2.1_turbo_int8_convrot.safetensors',
      'qwen3vl_8b_int8_convrot.safetensors',
      'qwen_image',
      'qwen_image_2.1_vae_bf16.safetensors',
    ],
  );
  assert.equal(byType('CLIPLoader').length, 1, 'no second text model: the prompt enhancer stays out');
  assert.equal(byType('TextGenerate').length, 0);
  assert.equal(byType('ManualSigmas').length, 1);
  assert.equal(byType('PreviewImage').length, 1, 'ComfyUI keeps no copy in its output folder');
  for (const file of models.files) assert.match(file.sha256, /^[0-9a-f]{64}$/);
  assert.match(modelDigest(), /^[0-9a-f]{64}$/);

  const task = readImageTask(tasksDir, 'grey-square-regression');
  const built = buildPrompt(task);
  const node = (type: string) => Object.values(built).find((n: any) => n.class_type === type) as any;
  assert.deepEqual(
    [node('TextEncodeQwenImage21').inputs.prompt, node('RandomNoise').inputs.noise_seed],
    [task.prompt, task.seed],
  );
  assert.deepEqual([node('EmptyLatentImage').inputs.width, node('EmptyLatentImage').inputs.height], [512, 512]);
  assert.equal(task.steps, 8, 'steps follow the workflow sigmas, recorded per result');
  assert.equal((Object.values(workflow) as any[]).find((n) => n.class_type === 'RandomNoise').inputs.noise_seed, 0);
  assert.throws(() => readImageTask(tasksDir, '../escape'), /Invalid image task/);
  assert.throws(() => readImageTask(tasksDir, 'missing-task'), /Invalid image task/);
  assert.deepEqual(pngSize(png(24, 16)), { width: 24, height: 16 });
  assert.equal(pngSize(Buffer.from('not a png')), null);
});

test('the image runner generates through ComfyUI, stores the image outside Git with its record and frees the generator', async () => {
  const comfy = await fakeComfy();
  const ollama = await fakeOllama([]);
  const out = tempDir('image-runner-out-');
  try {
    const report = await run(pack, profile(comfy.endpoint), defaults, {
      execute: true,
      allowModels: true,
      registry: registry(out, ollama.endpoint),
    });
    assert.deepEqual(
      report.results.map((r) => [r.id, r.status]),
      [
        ['grey-square-regression', 'passed'],
        ['grey-wide-holdout', 'passed'],
      ],
    );
    assert.equal(report.passed, true);
    assert.equal(report.modelDigest, modelDigest());
    const submitted = comfy.calls.filter((call) => call.path === '/prompt').map((call) => JSON.parse(call.body).prompt);
    assert.equal(submitted.length, 2);
    for (const caseId of ['grey-square-regression', 'grey-wide-holdout']) {
      const task = readImageTask(tasksDir, caseId);
      assert.ok(
        submitted.some((graph) => JSON.stringify(graph) === JSON.stringify(buildPrompt(task))),
        caseId,
      );
      const files = readdirSync(join(out, caseId));
      const image = files.find((name) => name.endsWith('.png'))!;
      const record = JSON.parse(readFileSync(join(out, caseId, image.replace(/\.png$/, '.json')), 'utf8'));
      const bytes = readFileSync(join(out, caseId, image));
      assert.deepEqual(
        [record.case, record.seed, record.width, record.height, record.steps, record.modelDigest, record.imageSha256],
        [caseId, task.seed, task.width, task.height, 8, modelDigest(), sha256(bytes)],
      );
      assert.equal(record.runtime, 'comfyui-0.46.3');
      assert.equal(record.workflowSha256, sha256(readFileSync('examples/image-generation-v1/workflow.json')));
    }
    // Memory sequence: Ollama checked before each case, the generator freed after it, before any judge.
    assert.equal(ollama.calls.filter((call) => call.path === '/api/ps').length, 2);
    const order = comfy.calls.map((call) => call.path).filter((path) => ['/prompt', '/free'].includes(path));
    assert.deepEqual(order, ['/prompt', '/free', '/prompt', '/free']);
    for (const call of comfy.calls.filter((c) => c.path === '/free'))
      assert.deepEqual(JSON.parse(call.body), { unload_models: true, free_memory: true });
  } finally {
    comfy.server.close();
    ollama.server.close();
    rmSync(out, { recursive: true, force: true });
  }
});

test('the image runner refuses while Ollama holds a model, and unloads idle models only when asked', async () => {
  const comfy = await fakeComfy();
  const loaded = ['gemma4:12b'];
  const ollama = await fakeOllama(loaded);
  const out = tempDir('image-runner-out-');
  try {
    const refused = runOnce(comfy.endpoint, 'grey-square-regression', ['--out=' + out, '--ollama=' + ollama.endpoint]);
    assert.equal(refused.status, 0);
    assert.deepEqual([refused.report.complete, refused.report.results[0].status], [false, 'error']);
    assert.match(refused.stderr, /Ollama has gemma4:12b loaded.*ollama stop gemma4:12b.*--unload-ollama/s);
    assert.equal(comfy.calls.filter((call) => call.path === '/prompt').length, 0);
    assert.equal(ollama.calls.filter((call) => call.path === '/api/generate').length, 0);

    const unloaded = runOnce(comfy.endpoint, 'grey-square-regression', [
      '--out=' + out,
      '--ollama=' + ollama.endpoint,
      '--unload-ollama',
    ]);
    assert.equal(unloaded.report.results[0].status, 'passed', unloaded.stderr);
    const unload = ollama.calls.find((call) => call.path === '/api/generate')!;
    assert.deepEqual(JSON.parse(unload.body), { model: 'gemma4:12b', keep_alive: 0 });
    assert.deepEqual(loaded, []);
  } finally {
    comfy.server.close();
    ollama.server.close();
    rmSync(out, { recursive: true, force: true });
  }
});

test('the image runner reports a stopped ComfyUI, a missing model, a failed or slow generation and a redirect as errors', async () => {
  const ollama = await fakeOllama([]);
  const out = tempDir('image-runner-out-');
  const flags = ['--out=' + out, '--ollama=' + ollama.endpoint];
  try {
    const stopped = await fakeComfy();
    stopped.server.close();
    const down = runOnce(stopped.endpoint, 'grey-square-regression', flags);
    assert.equal(down.report.results[0].status, 'error');
    assert.match(down.stderr, /ComfyUI is not running at http:\/\/127\.0\.0\.1:\d+\/: start Comfy Desktop/);

    const cases: [FakeOptions, RegExp, string[]][] = [
      [
        { missing: 'qwen3vl_8b_int8_convrot.safetensors' },
        /Model missing in ComfyUI: text_encoders\/qwen3vl_8b_int8_convrot\.safetensors.*Pull the models/,
        [],
      ],
      [{ executionError: true }, /ComfyUI generation failed in KSampler: fixture MPS failure/, ['/prompt', '/free']],
      [{ neverFinish: true }, /ComfyUI generation timed out after \d+ ms/, ['/prompt', '/interrupt', '/free']],
      [{ redirect: true }, /redirect/i, []],
    ];
    for (const [options, message, sequence] of cases) {
      const comfy = await fakeComfy(options);
      try {
        const result = runOnce(comfy.endpoint, 'grey-square-regression', flags, options.neverFinish ? 12000 : 60000);
        assert.equal(result.report.results[0].status, 'error', JSON.stringify(options));
        assert.match(result.stderr, message);
        const seen = comfy.calls.map((c) => c.path).filter((p) => ['/prompt', '/interrupt', '/free'].includes(p));
        assert.deepEqual(seen, sequence, JSON.stringify(options));
      } finally {
        comfy.server.close();
      }
    }

    const wrong = await fakeComfy({ wrongSize: true });
    try {
      const result = runOnce(wrong.endpoint, 'grey-square-regression', flags);
      assert.deepEqual([result.report.complete, result.report.results[0].status], [true, 'failed']);
    } finally {
      wrong.server.close();
    }
  } finally {
    ollama.server.close();
    rmSync(out, { recursive: true, force: true });
  }
});

test('the image runner refuses a non-literal-loopback endpoint and an output folder inside the repository', async () => {
  const ollama = await fakeOllama([]);
  const comfy = await fakeComfy();
  try {
    const named = runOnce(comfy.endpoint.replace('127.0.0.1', 'localhost'), 'grey-square-regression', [
      '--out=' + tempDir('image-runner-out-'),
      '--ollama=' + ollama.endpoint,
    ]);
    assert.match(named.stderr, /literal loopback/);
    const inside = runOnce(comfy.endpoint, 'grey-square-regression', [
      '--out=' + resolve('examples'),
      '--ollama=' + ollama.endpoint,
    ]);
    assert.equal(inside.report.results[0].status, 'error');
    assert.match(inside.stderr, /outside the repository/);
    assert.equal(comfy.calls.filter((call) => call.path === '/prompt').length, 0);
  } finally {
    comfy.server.close();
    ollama.server.close();
  }
});

test('the batch generator runs every case and repeat, then frees ComfyUI once, and needs an explicit costly flag', async () => {
  const comfy = await fakeComfy();
  const ollama = await fakeOllama([]);
  const out = tempDir('image-batch-out-');
  const profileFile = join(out, 'profile.json');
  writeFileSync(profileFile, JSON.stringify(profile(comfy.endpoint)));
  const args = [
    generatePath,
    '--profile=' + profileFile,
    '--tasks=' + tasksDir,
    '--cases=grey-square-regression,grey-wide-holdout',
    '--repeat=2',
    '--out=' + join(out, 'images'),
    '--ollama=' + ollama.endpoint,
    '--poll-ms=20',
  ];
  try {
    const unconfirmed = spawnSync(process.execPath, args, { encoding: 'utf8' });
    assert.notEqual(unconfirmed.status, 0);
    assert.match(unconfirmed.stderr, /--confirm-costly/);
    assert.equal(comfy.calls.length, 0);

    const batch = spawnSync(process.execPath, [...args, '--confirm-costly'], { encoding: 'utf8' });
    assert.equal(batch.status, 0, batch.stderr);
    const manifest = JSON.parse(readFileSync(batch.stdout.trim(), 'utf8'));
    assert.equal(manifest.results.length, 4);
    assert.deepEqual(
      manifest.results.map((r: { case: string; iteration: number }) => [r.case, r.iteration]),
      [
        ['grey-square-regression', 1],
        ['grey-square-regression', 2],
        ['grey-wide-holdout', 1],
        ['grey-wide-holdout', 2],
      ],
    );
    for (const result of manifest.results) assert.equal(result.imageSha256, sha256(readFileSync(result.image)));
    const order = comfy.calls.map((call) => call.path).filter((path) => ['/prompt', '/free'].includes(path));
    assert.deepEqual(order, ['/prompt', '/prompt', '/prompt', '/prompt', '/free']);
    assert.equal(ollama.calls.filter((call) => call.path === '/api/ps').length, 1);
  } finally {
    comfy.server.close();
    ollama.server.close();
    rmSync(out, { recursive: true, force: true });
  }
});
