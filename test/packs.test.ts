import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { defaults, run, validatePack, validateRegistry, type Pack, type Profile } from '../src/index.ts';
import { gradeCandidate, readTask, removeLeftoverWorkspaces } from '../examples/coding-v1/grade.mjs';
import { trustedExecutor } from './fixtures/coding-trusted-executor.mjs';
import { gradeDefects, type DefectExpectation } from '../src/defects.ts';

const profile: Profile = {
  schemaVersion: 1,
  id: 'pack-fixture',
  model: 'fixture:1b',
  quantization: 'Q4_K_M',
  endpoint: 'http://127.0.0.1:11434',
  context: 32768,
  maxOutputTokens: 64,
  temperature: 0,
  topP: null,
  topK: null,
  seed: 7,
  think: null,
  parallel: 1,
  hardware: 'neutral',
  cache: 'neutral',
};

const provider = (answers: unknown[], raw = false) => {
  let answer = 0;
  return (async (input: unknown) => {
    const path = new URL(String(input)).pathname;
    const value =
      path === '/api/version'
        ? { version: 'fixture-v1' }
        : path === '/api/show'
          ? { model_info: { 'general.file_type': 15 }, details: { quantization_level: 'Q4_K_M' } }
          : path === '/api/tags'
            ? { models: [{ name: profile.model, size: 100, digest: 'a'.repeat(64) }] }
            : {
                model: profile.model,
                message: { content: raw ? String(answers[answer++]) : JSON.stringify(answers[answer++]) },
                done: true,
                eval_count: 4,
                done_reason: 'stop',
              };
    return new Response(JSON.stringify(value));
  }) as typeof fetch;
};

const load = (path: string) => validatePack(JSON.parse(readFileSync(path, 'utf8')));
const expected = (pack: Pack) => pack.cases.map((entry) => (entry.expected as { value: unknown }).value);

test('structured-output robustness pack has both splits and deterministic semantic grading', async () => {
  const pack = load('examples/structured-output-robustness-v1.json');
  assert.deepEqual(new Set(pack.cases.map((entry) => entry.split)), new Set(['regression', 'holdout']));
  assert.deepEqual(
    new Set(pack.cases.flatMap((entry) => entry.capabilities)),
    new Set(['intent-resolution', 'structured-output', 'tool-selection', 'clarification']),
  );
  assert.equal(
    pack.cases.every((entry) => entry.responseFormat !== undefined),
    true,
  );
  const passing = await run(pack, profile, defaults, {
    execute: true,
    allowModels: true,
    fetch: provider(expected(pack)),
  });
  assert.equal(passing.passed, true);
  const wrong = expected(pack);
  wrong[0] = { action: 'proceed' };
  const failing = await run(pack, profile, defaults, {
    execute: true,
    allowModels: true,
    fetch: provider(wrong),
  });
  assert.equal(failing.results[0].status, 'failed');
});

test('tool-use pack covers selection, refusal and schema-shaped arguments', async () => {
  const pack = load('examples/tool-use-v1.json');
  assert.deepEqual(new Set(pack.cases.map((entry) => entry.split)), new Set(['regression', 'holdout']));
  assert.equal(
    pack.cases.every((entry) => entry.capabilities.includes('tool-selection')),
    true,
  );
  const passing = await run(pack, profile, defaults, {
    execute: true,
    allowModels: true,
    fetch: provider(expected(pack)),
  });
  assert.equal(passing.passed, true);
  const wrong = expected(pack);
  wrong[1] = { action: 'use-tool', tool: 'unknown' };
  const failing = await run(pack, profile, defaults, {
    execute: true,
    allowModels: true,
    fetch: provider(wrong),
  });
  assert.equal(failing.results[1].status, 'failed');
});

test('bilingual pack keeps paired intents and follows the request language', async () => {
  const pack = load('examples/bilingual-it-en-v1.json');
  assert.deepEqual(new Set(pack.cases.map((entry) => entry.split)), new Set(['regression', 'holdout']));
  assert.equal(pack.cases.length % 2, 0);
  const values = expected(pack) as { intent: string; language: string; reply: string }[];
  for (let index = 0; index < values.length; index += 2) {
    assert.equal(values[index].intent, values[index + 1].intent);
    assert.deepEqual(new Set([values[index].language, values[index + 1].language]), new Set(['en', 'it']));
  }
  const passing = await run(pack, profile, defaults, {
    execute: true,
    allowModels: true,
    fetch: provider(values),
  });
  assert.equal(passing.passed, true);
  const wrong = structuredClone(values);
  wrong[1].language = 'en';
  const failing = await run(pack, profile, defaults, {
    execute: true,
    allowModels: true,
    fetch: provider(wrong),
  });
  assert.equal(failing.results[1].status, 'failed');
});

test('multi-step agent pack uses a bounded scripted plan-act-observe runner', async () => {
  const pack = load('examples/multi-step-agent-v1.json');
  assert.deepEqual(new Set(pack.cases.map((entry) => entry.split)), new Set(['regression', 'holdout']));
  assert.equal(
    pack.cases.every((entry) => entry.runner === 'scripted-agent'),
    true,
  );
  assert.equal(
    pack.cases.every((entry) => entry.requirements?.includes('step-limit-4')),
    true,
  );
  const registry = validateRegistry(
    {
      schemaVersion: 1,
      runners: {
        'scripted-agent': {
          command: process.execPath,
          args: [resolve('test/fixtures/multi-step-runner.mjs'), '{report}', '{configuration}', '{budget}', '{case}'],
          cwd: process.cwd(),
          layers: ['end-to-end'],
          allowModels: true,
        },
      },
    },
    process.cwd(),
  );
  const report = await run(pack, profile, defaults, { execute: true, allowModels: true, registry });
  assert.equal(report.passed, true);
  assert.equal(
    report.results.every((result) => result.checks === 3),
    true,
  );
});

test('refusal pack rejects permission escalation and planted tool instructions', async () => {
  const pack = load('examples/refusal-permission-v1.json');
  assert.deepEqual(new Set(pack.cases.map((entry) => entry.split)), new Set(['regression', 'holdout']));
  assert.equal(
    pack.cases.every((entry) => entry.capabilities.includes('approval-boundaries')),
    true,
  );
  const passing = await run(pack, profile, defaults, {
    execute: true,
    allowModels: true,
    fetch: provider(expected(pack)),
  });
  assert.equal(passing.passed, true);
  const wrong = expected(pack);
  wrong[0] = { action: 'execute' };
  const failing = await run(pack, profile, defaults, {
    execute: true,
    allowModels: true,
    fetch: provider(wrong),
  });
  assert.equal(failing.results[0].status, 'failed');
});

test('long-context pack places facts at varied depths inside its declared context', async () => {
  const pack = load('examples/long-context-v1.json');
  assert.deepEqual(new Set(pack.cases.map((entry) => entry.split)), new Set(['regression', 'holdout']));
  assert.equal(
    pack.cases.every((entry) => entry.requirements?.includes('context-32768')),
    true,
  );
  const depths = pack.cases.map((entry) => {
    const content = entry.messages?.map((message) => message.content).join('\n') ?? '';
    assert.ok(Buffer.byteLength(content) > 1000);
    assert.ok(Buffer.byteLength(content) < 32768);
    return content.indexOf('TARGET:') / content.length;
  });
  assert.ok(Math.min(...depths) < 0.2);
  assert.ok(Math.max(...depths) > 0.8);
  const passing = await run(pack, profile, defaults, {
    execute: true,
    allowModels: true,
    fetch: provider(expected(pack)),
  });
  assert.equal(passing.passed, true);
});

const codingTask = (id: string) => resolve('examples/coding-v1/tasks', id);
const codingCandidate = (id: string, variant: 'reference' | 'wrong') => {
  const { entry } = readTask(codingTask(id));
  return readFileSync(join('test/fixtures/coding-v1', id, variant + entry.slice(entry.lastIndexOf('.'))), 'utf8');
};
const codingRegistry = (variant: 'reference' | 'wrong') =>
  validateRegistry(
    {
      schemaVersion: 1,
      runners: {
        'coding-reference': {
          command: process.execPath,
          args: [
            resolve('test/fixtures/coding-runner.mjs'),
            '{report}',
            '{configuration}',
            '{budget}',
            '{case}',
            variant,
          ],
          cwd: process.cwd(),
          layers: ['coding'],
          allowModels: true,
        },
      },
    },
    process.cwd(),
  );

test('coding pack grades Python and TypeScript candidates against hidden expected values', async () => {
  const pack = load('examples/coding-v1.json');
  assert.equal(
    pack.cases.every(
      (entry) =>
        entry.layer === 'coding' &&
        entry.runner === 'coding-reference' &&
        entry.area === 'coding' &&
        entry.requirements?.includes('coding-sandbox'),
    ),
    true,
  );
  const tasks = pack.cases.map((entry) => ({ entry, task: readTask(codingTask(entry.id)) }));
  for (const language of ['python', 'typescript'])
    assert.deepEqual(
      new Set(tasks.filter(({ task }) => task.language === language).map(({ entry }) => entry.split)),
      new Set(['regression', 'holdout']),
    );
  for (const { entry, task } of tasks) {
    const right = await gradeCandidate({
      taskDir: codingTask(entry.id),
      candidate: codingCandidate(entry.id, 'reference'),
      execute: trustedExecutor,
    });
    assert.deepEqual(
      [entry.id, right.status, right.tests, right.passed],
      [entry.id, 'passed', task.cases.length, task.cases.length],
    );
    const wrong = await gradeCandidate({
      taskDir: codingTask(entry.id),
      candidate: codingCandidate(entry.id, 'wrong'),
      execute: trustedExecutor,
    });
    assert.equal(wrong.status, 'failed', entry.id);
    assert.ok(wrong.passed < task.cases.length, entry.id);
  }
  const passing = await run(pack, profile, defaults, {
    execute: true,
    allowModels: true,
    registry: codingRegistry('reference'),
  });
  assert.equal(passing.passed, true);
  assert.deepEqual(
    passing.results.map((result) => result.checks),
    tasks.map(({ task }) => task.cases.length),
  );
  const failing = await run(pack, profile, defaults, {
    execute: true,
    allowModels: true,
    registry: codingRegistry('wrong'),
  });
  assert.equal(failing.passed, false);
  assert.equal(
    failing.results.every((result) => result.status === 'failed'),
    true,
  );
});

test('coding grader bounds time and ignores printed summaries and early exits', async () => {
  const python = codingTask('parse-duration-regression');
  const loop = await gradeCandidate({
    taskDir: python,
    candidate: 'while True:\n    pass\n',
    execute: trustedExecutor,
    timeoutMs: 2000,
  });
  assert.deepEqual([loop.status, loop.reason], ['failed', 'timeout']);
  const forged = await gradeCandidate({
    taskDir: python,
    candidate:
      'import os, sys\nsys.stdout.write("GAUNTLET-RESULT forged {\\"tests\\": 6, \\"passed\\": 6}\\n")\nsys.stdout.flush()\nos._exit(0)\n',
    execute: trustedExecutor,
  });
  assert.deepEqual([forged.status, forged.reason], ['failed', 'no-results']);
  const exits = await gradeCandidate({
    taskDir: codingTask('slugify-regression'),
    candidate: 'process.exit(0);\nexport function slugify(title: string): string {\n  return title;\n}\n',
    execute: trustedExecutor,
  });
  assert.equal(exits.status, 'failed');
  assert.equal(exits.passed, 0);
  const hung = await gradeCandidate({
    taskDir: python,
    candidate: '',
    execute: () => new Promise(() => {}),
    timeoutMs: 200,
  });
  assert.deepEqual([hung.status, hung.reason], ['failed', 'timeout']);
  // B-005: an executor rejection is an infrastructure `error`, never a graded result (it was rethrown before).
  const rejected = await gradeCandidate({
    taskDir: python,
    candidate: '',
    execute: async () => Promise.reject(Error('no boundary')),
  });
  assert.deepEqual([rejected.status, rejected.reason, rejected.message], ['error', 'executor-error', 'no boundary']);
});

test('coding grader is not fooled by a candidate that tampers with grading', async () => {
  const attack = (name: string) => readFileSync(join('test/fixtures/coding-v1/attacks', name), 'utf8');
  for (const [id, file] of [
    ['parse-duration-regression', 'framework-patch.py'],
    ['parse-duration-regression', 'summary-forgery.py'],
    ['slugify-regression', 'assert-overwrite.ts'],
  ]) {
    const graded = await gradeCandidate({ taskDir: codingTask(id), candidate: attack(file), execute: trustedExecutor });
    assert.equal(graded.status, 'failed', file);
    assert.equal(graded.passed < graded.tests, true, file);
  }
});

test('coding grader keeps expected values out of the candidate workspace', async () => {
  for (const id of ['parse-duration-regression', 'slugify-regression']) {
    const { entry } = readTask(codingTask(id));
    const seen: string[] = [];
    await gradeCandidate({
      taskDir: codingTask(id),
      candidate: codingCandidate(id, 'reference'),
      execute: async (request: { cwd: string }) => {
        for (const name of readdirSync(request.cwd).sort()) {
          seen.push(name);
          assert.doesNotMatch(readFileSync(join(request.cwd, name), 'utf8'), /expect|assert/i, name);
        }
        return trustedExecutor(request as Parameters<typeof trustedExecutor>[0]);
      },
    });
    const driver = entry.endsWith('.py') ? 'driver.py' : 'driver.mjs';
    assert.deepEqual(seen, [driver, 'inputs.json', entry].sort(), id);
  }
});

test('coding grader reports a timeout even while a leftover process keeps writing to the workspace', async () => {
  let child: ReturnType<typeof spawn> | undefined;
  try {
    const graded = await gradeCandidate({
      taskDir: codingTask('parse-duration-regression'),
      candidate: '',
      execute: ({ cwd }: { cwd: string }) => {
        child = spawn(
          'python3',
          [
            '-c',
            'import os\nfor i in range(200000):\n  os.makedirs("d%d" % i, exist_ok=True)\n  open("d%d/f" % i, "w").write("x")',
          ],
          { cwd, stdio: 'ignore' },
        );
        return new Promise(() => {});
      },
      timeoutMs: 300,
    });
    assert.deepEqual([graded.status, graded.reason], ['failed', 'timeout']);
  } finally {
    child?.kill('SIGKILL');
  }
  await new Promise((resolve) => setTimeout(resolve, 200));
  assert.deepEqual(removeLeftoverWorkspaces(), []);
});

// B-003: cleanup ran synchronously at the timeout and raced the writer, so on CI the grader hung past the test limit.
test('coding grader returns at its timeout while a process the executor left keeps writing, and cleans up after', async () => {
  let child: ReturnType<typeof spawn> | undefined;
  try {
    const started = Date.now();
    const graded = await gradeCandidate({
      taskDir: codingTask('parse-duration-regression'),
      candidate: '',
      execute: ({ cwd }: { cwd: string }) => {
        child = spawn(
          'python3',
          ['-c', 'import os\ni = 0\nwhile True:\n  os.makedirs("d%d/e" % i, exist_ok=True)\n  i += 1'],
          { cwd, stdio: 'ignore' },
        );
        return new Promise(() => {});
      },
      timeoutMs: 300,
    });
    assert.deepEqual([graded.status, graded.reason], ['failed', 'timeout']);
    assert.ok(Date.now() - started < 3000, 'returned ' + (Date.now() - started) + ' ms after start');
  } finally {
    child?.kill('SIGKILL');
  }
  await new Promise((resolve) => setTimeout(resolve, 200));
  assert.deepEqual(removeLeftoverWorkspaces(), []);
});

// Results come back on the driver's stdout (last line, tagged); the workspace is read-only to the candidate.
test('coding grader refuses missing, oversized, wrong-length and extra-key results', async () => {
  const taskDir = codingTask('slugify-regression');
  const cases = readTask(taskDir).cases.length;
  const printing = (stdout: string) => async () => ({ code: 0, stdout, timedOut: false });
  for (const [name, stdout, reason] of [
    ['missing', 'nothing to see\n', 'no-results'],
    ['oversized', 'GAUNTLET-RESULTS [' + ' '.repeat(1_000_001) + ']\n', 'no-results'],
    ['wrong length', 'GAUNTLET-RESULTS ' + JSON.stringify([{ ok: 'x' }]) + '\n', 'malformed-results'],
    [
      'extra key',
      'GAUNTLET-RESULTS ' + JSON.stringify(Array(cases).fill({ ok: 'x', passed: true })) + '\n',
      'malformed-results',
    ],
    [
      'wrong answers',
      'noise\nGAUNTLET-RESULTS ' + JSON.stringify(Array(cases).fill({ ok: 'x' })) + '\n',
      'wrong-answers',
    ],
  ] as const) {
    const graded = await gradeCandidate({ taskDir, candidate: '', execute: printing(stdout) });
    assert.deepEqual([graded.status, graded.reason], ['failed', reason], name);
  }
});

test('coding grader removes a workspace whose folders the candidate locked', async () => {
  let workspace = '';
  await gradeCandidate({
    taskDir: codingTask('parse-duration-regression'),
    candidate: 'import os\nos.makedirs("locked/inner")\nos.chmod("locked/inner", 0)\nos.chmod("locked", 0)\n',
    execute: async (request: { cwd: string }) => {
      workspace = request.cwd;
      return trustedExecutor(request as Parameters<typeof trustedExecutor>[0]);
    },
  });
  assert.equal(existsSync(workspace), false);
  assert.deepEqual(removeLeftoverWorkspaces(), []);
});

test('logic-math pack has exact answers for math and logic in both splits', async () => {
  const pack = load('examples/logic-math-v1.json');
  for (const area of ['math', 'logic-planning'])
    assert.deepEqual(
      new Set(pack.cases.filter((entry) => entry.area === area).map((entry) => entry.split)),
      new Set(['regression', 'holdout']),
      area,
    );
  assert.equal(
    pack.cases.every((entry) => entry.layer === 'model' && entry.expected?.kind === 'json'),
    true,
  );
  const passing = await run(pack, profile, defaults, {
    execute: true,
    allowModels: true,
    fetch: provider(expected(pack)),
  });
  assert.equal(passing.passed, true);
  const wrong = expected(pack).map((value) => {
    const answer = (value as { answer: unknown }).answer;
    return {
      answer: typeof answer === 'number' ? answer + 1 : Array.isArray(answer) ? [...answer].reverse() : 'other',
    };
  });
  const failing = await run(pack, profile, defaults, {
    execute: true,
    allowModels: true,
    fetch: provider(wrong),
  });
  assert.equal(
    failing.results.every((result) => result.status === 'failed'),
    true,
  );
});

test('cad-3d pack covers slicer, material and tolerance questions in both splits with passing and wrong fixtures', async () => {
  const pack = load('examples/cad-3d-v1.json');
  const fixtures = JSON.parse(readFileSync('test/fixtures/cad-3d-questions-v1.json', 'utf8')) as Record<
    string,
    { passing: { answer: unknown }; wrong: { answer: unknown } }
  >;
  const questions = pack.cases.filter((entry) => entry.layer === 'model');
  assert.ok(questions.length >= 6);
  assert.deepEqual(new Set(questions.map((entry) => entry.split)), new Set(['regression', 'holdout']));
  assert.equal(
    questions.every(
      (entry) =>
        entry.area === 'cad-3d' &&
        entry.expected?.kind === 'json' &&
        entry.responseFormat === 'json' &&
        entry.capabilities.includes('structured-output'),
    ),
    true,
  );
  for (const capability of ['slicing-parameters', 'printing-materials', 'dimensional-tolerances'])
    assert.deepEqual(
      new Set(questions.filter((entry) => entry.capabilities.includes(capability)).map((entry) => entry.split)),
      new Set(['regression', 'holdout']),
      capability,
    );
  const questionPack = validatePack({ ...pack, cases: questions });
  const passingAnswers = questions.map((entry) => {
    const item = fixtures[entry.id];
    assert.ok(item?.passing && item?.wrong, entry.id);
    assert.deepEqual(item.passing, (entry.expected as { value: unknown }).value, entry.id);
    assert.notDeepEqual(item.wrong, item.passing, entry.id);
    return item.passing;
  });
  const passing = await run(questionPack, profile, defaults, {
    execute: true,
    allowModels: true,
    fetch: provider(passingAnswers),
  });
  assert.equal(passing.passed, true);
  const wrongAnswers = questions.map((entry) => fixtures[entry.id].wrong);
  const failing = await run(questionPack, profile, defaults, {
    execute: true,
    allowModels: true,
    fetch: provider(wrongAnswers),
  });
  assert.equal(
    failing.results.every((result) => result.status === 'failed'),
    true,
  );
});

test('italian-quality pack grades summary, rewrite and register cases in both splits with references and failing fixtures', async () => {
  const pack = load('examples/italian-quality-v1.json');
  const fixtures = JSON.parse(readFileSync('test/fixtures/italian-quality-v1.json', 'utf8')) as Record<
    string,
    { reference: string; failing: { reply: string; check: string }[] }
  >;
  assert.deepEqual(new Set(pack.cases.map((entry) => entry.split)), new Set(['regression', 'holdout']));
  assert.equal(
    pack.cases.every(
      (entry) =>
        entry.layer === 'model' &&
        entry.area === 'language-translation' &&
        entry.capabilities.includes('italian-quality') &&
        entry.expected?.kind === 'rubric' &&
        entry.responseFormat === undefined,
    ),
    true,
  );
  for (const kind of ['summary', 'rewrite', 'register'])
    assert.deepEqual(
      new Set(pack.cases.filter((entry) => entry.id.startsWith(kind + '-')).map((entry) => entry.split)),
      new Set(['regression', 'holdout']),
      kind,
    );
  const references = pack.cases.map((entry) => {
    const item = fixtures[entry.id];
    assert.ok(item?.reference, entry.id);
    assert.ok(item.failing.length >= 2, entry.id);
    return item.reference;
  });
  const passing = await run(pack, profile, defaults, {
    execute: true,
    allowModels: true,
    fetch: provider(references, true),
  });
  assert.equal(passing.passed, true);
  for (let index = 0; index < Math.max(...pack.cases.map((entry) => fixtures[entry.id].failing.length)); index++) {
    const replies = pack.cases.map((entry) => {
      const list = fixtures[entry.id].failing;
      return list[Math.min(index, list.length - 1)].reply;
    });
    const failing = await run(pack, profile, defaults, {
      execute: true,
      allowModels: true,
      fetch: provider(replies, true),
    });
    assert.equal(
      failing.results.every((result) => result.status === 'failed'),
      true,
    );
    for (let i = 0; i < pack.cases.length; i++) {
      const list = fixtures[pack.cases[i].id].failing;
      const check = list[Math.min(index, list.length - 1)].check;
      const failed = String(failing.results[i].reason).replace('Rubric checks failed: ', '').split(', ');
      assert.ok(failed.includes(check), `${pack.cases[i].id}[${index}]: ${failed.join(', ')}`);
    }
  }
});

test('code-review pack grades seeded-defect diffs in both splits and rejects missed, noisy and whole-file sweeping findings', async () => {
  const pack = load('examples/code-review-v1.json');
  const fixtures = JSON.parse(readFileSync('test/fixtures/code-review-v1.json', 'utf8')) as Record<
    string,
    {
      passing: { findings: unknown[] };
      missed: { findings: unknown[]; check: string };
      noisy: { findings: unknown[]; check: string };
      sweeping: { findings: unknown[]; check: string };
    }
  >;
  assert.ok(pack.cases.length >= 6);
  assert.deepEqual(new Set(pack.cases.map((entry) => entry.split)), new Set(['regression', 'holdout']));
  assert.equal(
    pack.cases.every(
      (entry) =>
        entry.layer === 'model' &&
        entry.area === 'code-review' &&
        entry.expected?.kind === 'defects' &&
        entry.responseFormat === 'json' &&
        entry.capabilities.includes('defect-detection'),
    ),
    true,
  );
  const passingAnswers = pack.cases.map((entry) => {
    const item = fixtures[entry.id];
    assert.ok(item?.passing && item?.missed && item?.noisy && item?.sweeping, entry.id);
    return item.passing;
  });
  const passing = await run(pack, profile, defaults, {
    execute: true,
    allowModels: true,
    fetch: provider(passingAnswers),
  });
  assert.equal(passing.passed, true);

  for (const variant of ['missed', 'noisy', 'sweeping'] as const) {
    const replies = pack.cases.map((entry) => ({ findings: fixtures[entry.id][variant].findings }));
    const failing = await run(pack, profile, defaults, {
      execute: true,
      allowModels: true,
      fetch: provider(replies),
    });
    assert.equal(
      failing.results.every((result) => result.status === 'failed'),
      true,
      variant,
    );
    for (let i = 0; i < pack.cases.length; i++) {
      const check = fixtures[pack.cases[i].id][variant].check;
      const failed = String(failing.results[i].reason).replace('Defect checks failed: ', '').split(', ');
      assert.ok(failed.includes(check), `${pack.cases[i].id}[${variant}]: ${failed.join(', ')}`);
    }
  }
});

test('code-review pack cannot be passed by vague, whole-file or every-line findings', () => {
  const pack = load('examples/code-review-v1.json');
  const categories = ['security', 'logic', 'concurrency', 'resource'];
  for (const entry of pack.cases) {
    const expectation = entry.expected?.value as DefectExpectation;
    const prompt = String(entry.messages?.at(-1)?.content);
    const excerpts = new Map<string, number[]>();
    let file = '';
    for (const line of prompt.split('\n')) {
      const header = /^File: (\S+)$/.exec(line);
      if (header) excerpts.set((file = header[1]), []);
      const numbered = /^(\d+):( |$)/.exec(line);
      if (numbered && file) excerpts.get(file)?.push(Number(numbered[1]));
    }
    const ranges = new Map(
      [...excerpts].map(([name, numbers]) => [name, [numbers[0], numbers.at(-1) as number] as const]),
    );
    for (const [name, numbers] of excerpts) {
      // Consecutive numbering and more than two 10-line findings per excerpt, so tiling it costs a false positive.
      assert.ok(
        numbers.every((value, i) => i === 0 || value === numbers[i - 1] + 1),
        `${entry.id} ${name}`,
      );
      assert.ok(numbers.length > 20, `${entry.id} ${name}: ${numbers.length} lines`);
    }
    for (const defect of expectation.defects) {
      const range = ranges.get(defect.file);
      assert.ok(range && defect.lines[0] >= range[0] && defect.lines[1] <= range[1], `${entry.id} ${defect.id}`);
    }
    const attempts: Record<string, { file: string; lines: [number, number]; category: string }[]> = {
      everyLineEveryCategory: [...ranges].flatMap(([name, [first, last]]) =>
        Array.from({ length: last - first + 1 }, (_, i) =>
          categories.map((category) => ({ file: name, lines: [first + i, first + i] as [number, number], category })),
        ).flat(),
      ),
    };
    // Whole excerpt as 10-line findings in each seeded defect's own category, at every offset.
    for (let offset = 0; offset < 10; offset++)
      attempts[`tiled+${offset}`] = expectation.defects.flatMap((defect) => {
        const [first, last] = ranges.get(defect.file) as readonly [number, number];
        const tiles: { file: string; lines: [number, number]; category: string }[] = [];
        for (let start = first - offset; start <= last; start += 10)
          tiles.push({ file: defect.file, lines: [Math.max(first, start), start + 9], category: defect.category });
        return tiles;
      });
    for (const [name, findings] of Object.entries(attempts))
      assert.equal(gradeDefects({ findings }, expectation).passed, false, `${entry.id} ${name}`);
  }
});
