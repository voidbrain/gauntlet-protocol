// Contract tests for the image-generation-v1 grader (F-021-T04): structural checks first, then a fixed yes/no checklist
// answered by the pinned local vision judge. The committed fixture images are drawn by code
// (test/fixtures/image-generation-v1/draw.mjs); a fake Ollama answers as a correct judge would, from answers.json.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { mkdtempSync, readFileSync, realpathSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { crc32, deflateSync } from 'node:zlib';
import { readImageTask } from '../examples/image-generation-v1/comfy.mjs';
import {
  decodePng,
  gradeImages,
  judgeClient,
  judgeSpec,
  parseAnswers,
  structural,
  verdict,
} from '../examples/image-generation-v1/grade.mjs';

const tasksDir = resolve('examples/image-generation-v1/tasks');
const imagesDir = resolve('test/fixtures/image-generation-v1/images');
const judgePath = resolve('examples/image-generation-v1/judge.mjs');
const answers = JSON.parse(readFileSync('test/fixtures/image-generation-v1/answers.json', 'utf8')) as Record<
  string,
  Record<'pass' | 'fail', Record<string, string>>
>;
const caseIds = Object.keys(answers);
const image = (name: string) => readFileSync(join(imagesDir, name + '.png'));
const sha256 = (data: Buffer) => createHash('sha256').update(data).digest('hex');

// Encodes RGB rows with the given PNG filter per row, so the decoder's unfiltering is tested on every filter type.
function encode(width: number, height: number, rgb: Uint8Array, filters: number[], colourType = 2) {
  const channels = colourType === 6 ? 4 : 3;
  const stride = width * channels;
  const pixels = Buffer.alloc(height * stride);
  for (let i = 0; i < width * height; i++) {
    pixels.set(rgb.subarray(i * 3, i * 3 + 3), i * channels);
    if (channels === 4) pixels[i * 4 + 3] = 255;
  }
  const paeth = (a: number, b: number, c: number) => {
    const p = a + b - c,
      pa = Math.abs(p - a),
      pb = Math.abs(p - b),
      pc = Math.abs(p - c);
    return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
  };
  const raw = Buffer.alloc(height * (stride + 1));
  for (let y = 0; y < height; y++) {
    const filter = filters[y % filters.length];
    raw[y * (stride + 1)] = filter;
    for (let x = 0; x < stride; x++) {
      const at = (yy: number, xx: number) => (yy < 0 || xx < 0 ? 0 : pixels[yy * stride + xx]);
      const value = at(y, x),
        a = at(y, x - channels),
        b = at(y - 1, x),
        c = at(y - 1, x - channels);
      const predicted = [0, a, b, (a + b) >> 1, paeth(a, b, c)][filter];
      raw[y * (stride + 1) + 1 + x] = (value - predicted) & 255;
    }
  }
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
  header.set([8, colourType, 0, 0, 0], 8);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

interface JudgeOptions {
  digest?: string;
  reply?: (body: { messages: { images: string[] }[] }) => unknown;
  loaded?: string[];
}
// A fake Ollama that answers each committed fixture image as a correct judge would.
async function fakeJudge(options: JudgeOptions = {}) {
  const byImage = new Map<string, Record<string, string>>();
  for (const id of caseIds)
    for (const kind of ['pass', 'fail'] as const)
      byImage.set(image(id + '.' + kind).toString('base64'), answers[id][kind]);
  const calls: { path: string; body: string }[] = [];
  const server = createServer((request, response) => {
    let body = '';
    request.on('data', (part) => (body += part));
    request.on('end', () => {
      calls.push({ path: String(request.url), body });
      const send = (value: unknown) => response.end(JSON.stringify(value));
      if (request.url === '/api/version') return send({ version: '0.40.16' });
      if (request.url === '/api/ps') return send({ models: (options.loaded ?? []).map((name) => ({ name })) });
      if (request.url === '/api/tags')
        return send({
          models: [
            { name: 'qwen3-coder:30b', digest: 'b'.repeat(64) },
            { name: judgeSpec.model, digest: options.digest ?? judgeSpec.digest },
          ],
        });
      if (request.url === '/api/generate') return send({ done: true, done_reason: 'unload' });
      if (request.url === '/api/chat') {
        const parsed = JSON.parse(body);
        const reply = options.reply
          ? options.reply(parsed)
          : JSON.stringify(byImage.get(parsed.messages[0].images[0]) ?? {});
        return send({ model: judgeSpec.model, message: { role: 'assistant', content: reply }, done_reason: 'stop' });
      }
      response.writeHead(404).end();
    });
  });
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
  return { server, endpoint: 'http://127.0.0.1:' + (server.address() as { port: number }).port, calls };
}

test('the PNG decoder reads every filter type and RGBA, and rejects damaged or unsupported files', () => {
  const rgb = new Uint8Array(5 * 5 * 3).map((_, i) => (i * 37) % 256);
  for (const colourType of [2, 6]) {
    const decoded = decodePng(encode(5, 5, rgb, [0, 1, 2, 3, 4], colourType));
    assert.deepEqual([decoded.width, decoded.height], [5, 5]);
    assert.deepEqual([...decoded.rgb], [...rgb], 'colour type ' + colourType);
  }
  const good = encode(5, 5, rgb, [0]);
  const damaged = Buffer.from(good);
  damaged[damaged.length - 20] ^= 0xff;
  assert.throws(() => decodePng(damaged), /PNG/);
  assert.throws(() => decodePng(Buffer.from('not a png at all, just text')), /not a PNG/);
  const sixteen = Buffer.from(good);
  sixteen[24] = 16;
  assert.throws(() => decodePng(sixteen), /PNG/);
});

test('structural checks pass every committed fixture image and fail a blank, a wrong size, a non-PNG and a missing colour', () => {
  for (const id of caseIds) {
    const task = readImageTask(tasksDir, id);
    for (const kind of ['pass', 'fail']) {
      const result = structural(image(id + '.' + kind), task);
      assert.equal(result.passed, true, id + '.' + kind + ': ' + JSON.stringify(result.checks));
    }
  }
  const task = readImageTask(tasksDir, 'red-cube-regression');
  const failed = (bytes: Buffer, check: RegExp) => {
    const result = structural(bytes, task);
    assert.equal(result.passed, false);
    assert.ok(
      result.checks.some((entry: { name: string; passed: boolean }) => !entry.passed && check.test(entry.name)),
      JSON.stringify(result.checks),
    );
  };
  failed(image('blank'), /not-uniform/);
  failed(image('yellow-balls-holdout.pass'), /size/);
  failed(Buffer.from('plain text'), /png/);
  failed(image('blue-circles-holdout.pass'), /pixels:red/);
});

test('the checklist answer is parsed deterministically: exact ids, yes or no, nothing else', () => {
  const task = readImageTask(tasksDir, 'blue-circles-holdout');
  const expected = { 'two-circles': 'yes', 'blue-circles': 'yes', square: 'no' };
  assert.deepEqual(parseAnswers(task, JSON.stringify(expected)), expected);
  assert.deepEqual(
    parseAnswers(task, '```json\n{"two-circles": " Yes", "blue-circles": "YES", "square": "no"}\n```'),
    expected,
  );
  for (const bad of [
    'yes, two circles',
    '{"two-circles": "yes", "blue-circles": "yes"}',
    '{"two-circles": "yes", "blue-circles": "yes", "square": "no", "extra": "no"}',
    '{"two-circles": "maybe", "blue-circles": "yes", "square": "no"}',
    '{"two-circles": true, "blue-circles": "yes", "square": "no"}',
    '["yes", "yes", "no"]',
  ])
    assert.throws(() => parseAnswers(task, bad), /Judge answer/, bad);
  const pass = verdict(task, { passed: true, checks: [{ name: 'png', passed: true }] }, expected);
  assert.deepEqual([pass.status, pass.checks, pass.mismatches], ['passed', 4, []]);
  const fail = verdict(task, { passed: true, checks: [{ name: 'png', passed: true }] }, { ...expected, square: 'yes' });
  assert.deepEqual([fail.status, fail.mismatches], ['failed', ['square']]);
  assert.equal(verdict(task, { passed: false, checks: [{ name: 'png', passed: false }] }, null).status, 'failed');
});

test('the judge passes every committed pass fixture and fails every fail fixture, at temperature 0, unloading on the last request', async () => {
  const judge = await fakeJudge();
  try {
    const items = caseIds.flatMap((id) =>
      ['pass', 'fail'].map((kind) => ({ task: readImageTask(tasksDir, id), bytes: image(id + '.' + kind) })),
    );
    items.push({ task: readImageTask(tasksDir, 'checkerboard-regression'), bytes: image('blank') });
    const { identity, results } = await gradeImages(items, { endpoint: judge.endpoint });
    assert.deepEqual(identity, { model: 'gemma4:12b', digest: judgeSpec.digest, ollama: '0.40.16' });
    assert.deepEqual(
      results.map((r: { case: string; status: string }) => r.status),
      [...caseIds.flatMap(() => ['passed', 'failed']), 'failed'],
    );
    for (const [i, result] of results.entries()) {
      assert.equal(result.imageSha256, sha256(items[i].bytes));
      if (i < results.length - 1) assert.equal(result.structural.passed, true);
    }
    const blank = results.at(-1)!;
    assert.deepEqual([blank.structural.passed, blank.answers], [false, null], 'no judge call for a blank image');

    const chats = judge.calls.filter((call) => call.path === '/api/chat').map((call) => JSON.parse(call.body));
    assert.equal(chats.length, caseIds.length * 2);
    for (const [i, chat] of chats.entries()) {
      assert.equal(chat.model, 'gemma4:12b');
      assert.equal(chat.stream, false);
      assert.equal(chat.think, false);
      assert.equal(chat.options.temperature, 0);
      assert.deepEqual(Object.keys(chat.format.properties).sort(), Object.keys(answers[caseIds[i >> 1]].pass).sort());
      assert.equal(chat.messages[0].images[0], items[i].bytes.toString('base64'));
      assert.doesNotMatch(JSON.stringify(chat), /"expect"/, 'expectations are never sent to the judge');
      assert.equal(chat.keep_alive === 0, i === chats.length - 1, 'only the last request unloads the judge');
    }
  } finally {
    judge.server.close();
  }
});

test('the judge is refused unless pinned by digest on a literal loopback address, and an unparseable answer is an error', async () => {
  const task = readImageTask(tasksDir, 'red-cube-regression');
  const bytes = image('red-cube-regression.pass');
  const wrong = await fakeJudge({ digest: 'c'.repeat(64) });
  try {
    await assert.rejects(judgeClient(wrong.endpoint).identity(), /gemma4:12b.*digest/);
    assert.equal(wrong.calls.filter((call) => call.path === '/api/chat').length, 0);
  } finally {
    wrong.server.close();
  }
  assert.throws(() => judgeClient('http://localhost:11434'), /literal loopback/);
  const rambling = await fakeJudge({ reply: () => 'The cube is red.' });
  try {
    const { results } = await gradeImages([{ task, bytes }], { endpoint: rambling.endpoint });
    assert.equal(results[0].status, 'error');
    assert.match(String((results[0] as { reason?: string }).reason), /Judge answer/);
    const last = rambling.calls.filter((call) => ['/api/chat', '/api/generate'].includes(call.path)).at(-1)!;
    assert.equal(JSON.parse(last.body).keep_alive, 0, 'the judge is unloaded after an error too');
  } finally {
    rambling.server.close();
  }
});

test('the judge command grades images by case, needs an explicit costly flag and refuses while Ollama holds a model', async () => {
  const run = (args: string[]) =>
    new Promise<{ status: number | null; stdout: string; stderr: string }>((done) => {
      const child = spawn(process.execPath, [judgePath, ...args]);
      let stdout = '',
        stderr = '';
      child.stdout.on('data', (part) => (stdout += part));
      child.stderr.on('data', (part) => (stderr += part));
      child.on('close', (status) => done({ status, stdout, stderr }));
    });
  const dir = mkdtempSync(join(realpathSync(tmpdir()), 'image-judge-'));
  const judge = await fakeJudge();
  const busy = await fakeJudge({ loaded: ['qwen3-coder:30b'] });
  try {
    const images = [
      'red-cube-regression=' + join(imagesDir, 'red-cube-regression.pass.png'),
      'open-sign-regression=' + join(imagesDir, 'open-sign-regression.fail.png'),
    ];
    const unconfirmed = await run(['--ollama=' + judge.endpoint, ...images]);
    assert.notEqual(unconfirmed.status, 0);
    assert.match(unconfirmed.stderr, /--confirm-costly/);
    assert.equal(judge.calls.length, 0);

    const refused = await run(['--confirm-costly', '--ollama=' + busy.endpoint, ...images]);
    assert.notEqual(refused.status, 0);
    assert.match(refused.stderr, /Ollama has qwen3-coder:30b loaded/);
    assert.equal(busy.calls.filter((call) => call.path === '/api/chat').length, 0);

    const out = join(dir, 'verdicts.json');
    const graded = await run(['--confirm-costly', '--ollama=' + judge.endpoint, '--out=' + out, ...images]);
    assert.equal(graded.status, 0, graded.stderr);
    const report = JSON.parse(readFileSync(out, 'utf8'));
    assert.equal(report.judge.digest, judgeSpec.digest);
    assert.deepEqual(
      report.results.map((r: { case: string; status: string }) => [r.case, r.status]),
      [
        ['red-cube-regression', 'passed'],
        ['open-sign-regression', 'failed'],
      ],
    );
    assert.deepEqual(report.results[1].mismatches, ['reads-open']);

    const unknown = await run(['--confirm-costly', '--ollama=' + judge.endpoint, 'no-such-case=' + join(dir, 'x.png')]);
    assert.notEqual(unknown.status, 0);
    assert.match(unknown.stderr, /Invalid image task/);
  } finally {
    judge.server.close();
    busy.server.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
