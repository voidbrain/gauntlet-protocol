import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  catalog,
  defaults,
  gradeDefects,
  run,
  validateDefects,
  validatePack,
  type DefectExpectation,
  type Pack,
  type Profile,
} from '../src/index.ts';

const profile: Profile = {
  schemaVersion: 1,
  id: 'defects-fixture',
  model: 'fixture:1b',
  quantization: 'Q4_K_M',
  endpoint: 'http://127.0.0.1:11434',
  context: 8192,
  maxOutputTokens: 256,
  temperature: 0,
  topP: null,
  topK: null,
  seed: 7,
  think: null,
  parallel: 1,
  hardware: 'neutral',
  cache: 'neutral',
};

const provider = (answers: unknown[]) => {
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
                message: {
                  content: typeof answers[answer] === 'string' ? answers[answer++] : JSON.stringify(answers[answer++]),
                },
                done: true,
                eval_count: 6,
                done_reason: 'stop',
              };
    return new Response(JSON.stringify(value));
  }) as typeof fetch;
};

const expectation: DefectExpectation = {
  maxFalsePositives: 1,
  defects: [
    { id: 'sql-injection', file: 'src/query.ts', lines: [14, 18], category: 'security' },
    { id: 'off-by-one', file: 'src/page.ts', lines: [30, 34], category: 'logic' },
  ],
};

test('defect grading matches seeded defects by file, line range and category and bounds false positives', () => {
  const exact = {
    findings: [
      { file: 'src/query.ts', line: 16, category: 'security', summary: 'unparameterised SQL query' },
      { file: './src/page.ts', lines: [32, 35], category: 'LOGIC' },
    ],
  };
  assert.deepEqual(gradeDefects(exact, expectation), {
    passed: true,
    found: ['sql-injection', 'off-by-one'],
    missed: [],
    falsePositives: 0,
    failures: [],
  });
  assert.deepEqual(gradeDefects(exact, expectation), gradeDefects(exact, expectation));

  const withinLimit = {
    findings: [...exact.findings, { file: 'src/page.ts', line: 5, category: 'style' }],
  };
  assert.deepEqual(gradeDefects(withinLimit, expectation), {
    passed: true,
    found: ['sql-injection', 'off-by-one'],
    missed: [],
    falsePositives: 1,
    failures: [],
  });

  const duplicateFindingForSameDefect = {
    findings: [
      ...exact.findings,
      { file: 'src/query.ts', line: 15, category: 'security' },
      { file: 'src/page.ts', line: 5, category: 'style' },
    ],
  };
  assert.equal(gradeDefects(duplicateFindingForSameDefect, expectation).passed, true);
  assert.equal(gradeDefects(duplicateFindingForSameDefect, expectation).falsePositives, 1);

  const missedAndNoisy = {
    findings: [
      { file: 'src/query.ts', line: 16, category: 'security' },
      { file: 'src/page.ts', line: 10, category: 'logic' },
      { file: 'src/other.ts', line: 3, category: 'logic' },
    ],
  };
  assert.deepEqual(gradeDefects(missedAndNoisy, expectation), {
    passed: false,
    found: ['sql-injection'],
    missed: ['off-by-one'],
    falsePositives: 2,
    failures: ['missed:off-by-one', 'false-positives:2>1'],
  });

  for (const malformed of [
    null,
    'not an object',
    {},
    { findings: 'not-array' },
    { findings: [{ file: '', line: 1, category: 'logic' }] },
    { findings: [{ file: 'src/a.ts', line: 0, category: 'logic' }] },
    { findings: [{ file: 'src/a.ts', lines: [5, 3], category: 'logic' }] },
    { findings: [{ file: 'src/a.ts', category: 'logic' }] },
    { findings: [{ file: 'src/a.ts', line: 1, category: '' }] },
  ])
    assert.deepEqual(gradeDefects(malformed, expectation).failures, ['malformed-findings']);
});

const pack = (expected: unknown, extra: Record<string, unknown> = {}): unknown => ({
  schemaVersion: 1,
  id: 'defects-contract',
  version: '1.0.0',
  cases: [
    {
      id: 'diff-review-regression',
      layer: 'model',
      split: 'regression',
      capabilities: ['defect-detection'],
      critical: true,
      expensive: false,
      area: 'code-review',
      messages: [{ role: 'user', content: 'Review this diff and return JSON findings.' }],
      expected,
      responseFormat: 'json',
      ...extra,
    },
  ],
});

test('packs accept a defects expectation with JSON responseFormat and reject malformed defect expectations', () => {
  const valid = validatePack(pack({ kind: 'defects', value: expectation }));
  assert.equal(catalog([valid])[0].grader, 'defects-v1');
  assert.equal(
    validateDefects({
      defects: [{ file: 'src/a.ts', lines: [1, 2], category: 'logic' }],
    }).maxFalsePositives,
    0,
  );
  for (const bad of [
    { kind: 'defects', value: null },
    { kind: 'defects', value: {} },
    { kind: 'defects', value: { defects: [] } },
    { kind: 'defects', value: { defects: [{ file: '', lines: [1, 2], category: 'logic' }] } },
    { kind: 'defects', value: { defects: [{ file: '../a.ts', lines: [1, 2], category: 'logic' }] } },
    { kind: 'defects', value: { defects: [{ file: '/abs/a.ts', lines: [1, 2], category: 'logic' }] } },
    { kind: 'defects', value: { defects: [{ file: 'src/a.ts', lines: [0, 2], category: 'logic' }] } },
    { kind: 'defects', value: { defects: [{ file: 'src/a.ts', lines: [5, 2], category: 'logic' }] } },
    { kind: 'defects', value: { defects: [{ file: 'src/a.ts', lines: [1], category: 'logic' }] } },
    { kind: 'defects', value: { defects: [{ file: 'src/a.ts', lines: [1, 2], category: 'bad category!' }] } },
    {
      kind: 'defects',
      value: {
        defects: [
          { id: 'dup', file: 'src/a.ts', lines: [1, 2], category: 'logic' },
          { id: 'dup', file: 'src/b.ts', lines: [1, 2], category: 'logic' },
        ],
      },
    },
    {
      kind: 'defects',
      value: {
        maxFalsePositives: -1,
        defects: [{ file: 'src/a.ts', lines: [1, 2], category: 'logic' }],
      },
    },
    {
      kind: 'defects',
      value: {
        extra: true,
        defects: [{ file: 'src/a.ts', lines: [1, 2], category: 'logic' }],
      },
    },
  ])
    assert.throws(() => validatePack(pack(bad)), JSON.stringify(bad));
});

test('a run grades defect findings deterministically and keeps finding text out of the report', async () => {
  const contract = validatePack(pack({ kind: 'defects', value: expectation })) as Pack;
  const passingAnswer = {
    findings: [
      { file: 'src/query.ts', line: 15, category: 'security', summary: 'secret candidate note' },
      { file: 'src/page.ts', line: 31, category: 'logic' },
    ],
  };
  const passing = await run(contract, profile, defaults, {
    execute: true,
    allowModels: true,
    fetch: provider([passingAnswer]),
  });
  assert.equal(passing.passed, true);

  const missedAnswer = {
    findings: [{ file: 'src/query.ts', line: 15, category: 'security', summary: 'private candidate note' }],
  };
  const failing = await run(contract, profile, defaults, {
    execute: true,
    allowModels: true,
    fetch: provider([missedAnswer]),
  });
  assert.equal(failing.results[0].status, 'failed');
  assert.match(String(failing.results[0].reason), /missed:off-by-one/);
  assert.equal(JSON.stringify(failing).includes('private candidate note'), false);

  const invalidJson = await run(contract, profile, defaults, {
    execute: true,
    allowModels: true,
    fetch: provider(['not valid json']),
  });
  assert.equal(invalidJson.results[0].status, 'failed');
  assert.equal(invalidJson.results[0].reason, 'Invalid structured output');
});
