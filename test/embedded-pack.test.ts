// The embedded-v1 pack end to end (F-016-T04): the registered reference runner asks a stand-in local model for each
// case, grades sketches with the compile grader (a stand-in arduino-cli passed as a registered argument) and Pi
// solutions with the static grader, and reports coding-layer evidence under the `embedded` area.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import {
  areas,
  catalog,
  catalogMarkdown,
  defaults,
  run,
  validatePack,
  validateRegistry,
  type Profile,
} from '../src/index.ts';

const pack = validatePack(JSON.parse(readFileSync('examples/embedded-v1.json', 'utf8')));
const sketchDir = (id: string) => join('examples/embedded-v1/tasks', id);
const piDir = (id: string) => join('examples/embedded-v1/pi-tasks', id);
const isSketch = (id: string) => existsSync(sketchDir(id));
const fakeCli = resolve('test/fixtures/fake-arduino-cli.mjs');

const profile = (endpoint: string): Profile => ({
  schemaVersion: 1,
  id: 'embedded-runner-fixture',
  model: 'fixture:1b',
  quantization: 'Q4_K_M',
  endpoint,
  context: 8192,
  maxOutputTokens: 1024,
  temperature: 0,
  topP: null,
  topK: null,
  seed: 7,
  think: null,
  parallel: 1,
  hardware: 'neutral',
  cache: 'neutral',
});

const registry = (cli: string) =>
  validateRegistry(
    {
      schemaVersion: 1,
      runners: {
        'embedded-reference': {
          command: process.execPath,
          args: [
            resolve('examples/embedded-v1/runner.mjs'),
            '{report}',
            '{configuration}',
            '{budget}',
            '{case}',
            '--arduino-cli=' + cli,
          ],
          cwd: process.cwd(),
          layers: ['coding'],
          allowModels: true,
        },
      },
    },
    process.cwd(),
  );

// A local stand-in for Ollama that answers each chat with the committed fixture for the task named in the prompt.
async function fakeModel(variant: 'reference' | 'wrong', requests: string[]) {
  const server = createServer((request, response) => {
    let body = '';
    request.on('data', (chunk) => (body += chunk));
    request.on('end', () => {
      const send = (value: unknown) => response.end(JSON.stringify(value));
      if (request.url === '/api/version') return send({ version: 'fixture-v1' });
      if (request.url === '/api/tags') return send({ models: [{ name: 'fixture:1b', digest: 'b'.repeat(64) }] });
      requests.push(body);
      const prompt = (JSON.parse(body).messages as { content: string }[]).map((m) => m.content).join('\n');
      const id = pack.cases
        .map((c) => c.id)
        .find((caseId) => {
          const file = join(isSketch(caseId) ? sketchDir(caseId) : piDir(caseId), 'task.json');
          return prompt.includes(JSON.parse(readFileSync(file, 'utf8')).prompt);
        });
      const code = readFileSync(
        isSketch(String(id))
          ? join('test/fixtures/embedded-v1', String(id), variant + '.ino')
          : join('test/fixtures/embedded-v1-pi', String(id), variant + '.py'),
        'utf8',
      );
      send({
        model: 'fixture:1b',
        message: { role: 'assistant', content: 'Here it is.\n\n```cpp\n' + code + '```\n' },
        done: true,
        done_reason: 'stop',
        eval_count: 40,
      });
    });
  });
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
  const address = server.address() as { port: number };
  return { server, endpoint: 'http://127.0.0.1:' + address.port };
}

test('embedded pack: sketch and Pi cases in both splits under the embedded area', () => {
  assert.ok((areas as readonly string[]).includes('embedded'));
  assert.equal(
    pack.cases.every((c) => c.layer === 'coding' && c.runner === 'embedded-reference' && c.area === 'embedded'),
    true,
  );
  for (const kind of [true, false])
    assert.deepEqual(
      new Set(pack.cases.filter((c) => isSketch(c.id) === kind).map((c) => c.split)),
      new Set(['regression', 'holdout']),
    );
  for (const c of pack.cases) {
    assert.ok(isSketch(c.id) || existsSync(piDir(c.id)), c.id);
    assert.deepEqual(c.requirements, isSketch(c.id) ? ['arduino-cli'] : ['python3'], c.id);
    assert.equal(c.expensive, isSketch(c.id), c.id);
  }
  assert.match(catalogMarkdown(catalog([pack])), /embedded: 8 mapped cases/);
});

test('embedded reference runner asks the model, grades every case and reports per case', async () => {
  const limits = { ...defaults, caseMs: 120000, suiteMs: 600000 };
  for (const [variant, expected] of [
    ['reference', true],
    ['wrong', false],
  ] as const) {
    const requests: string[] = [];
    const { server, endpoint } = await fakeModel(variant, requests);
    try {
      const report = await run(pack, profile(endpoint), limits, {
        execute: true,
        allowModels: true,
        allowExpensive: true,
        registry: registry(fakeCli),
      });
      assert.equal(report.passed, expected, variant);
      assert.deepEqual(
        report.results.map((result) => result.status),
        pack.cases.map(() => (expected ? 'passed' : 'failed')),
        variant,
      );
      assert.equal(requests.length, pack.cases.length);
      for (const body of requests) assert.doesNotMatch(body, /"requires"|"forbids"|pattern/);
    } finally {
      server.close();
    }
  }
});

test('embedded runner reports a missing arduino-cli as an error without asking the model', async () => {
  const requests: string[] = [];
  const { server, endpoint } = await fakeModel('reference', requests);
  try {
    const sketches = validatePack({ ...pack, cases: pack.cases.filter((c) => isSketch(c.id)) });
    const report = await run(sketches, profile(endpoint), defaults, {
      execute: true,
      allowModels: true,
      allowExpensive: true,
      registry: registry('/nonexistent/arduino-cli'),
    });
    assert.equal(report.passed, false);
    assert.deepEqual(
      report.results.map((result) => result.status),
      sketches.cases.map((_, index) => (index === 0 ? 'error' : 'not-run')),
    );
    assert.equal(requests.length, 0);
  } finally {
    server.close();
  }
});
