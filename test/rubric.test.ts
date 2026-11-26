import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  catalog,
  defaults,
  gradeRubric,
  run,
  validatePack,
  type Pack,
  type Profile,
  type Rubric,
} from '../src/index.ts';

const profile: Profile = {
  schemaVersion: 1,
  id: 'rubric-fixture',
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

const provider = (answers: string[]) => {
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
                message: { content: answers[answer++] },
                done: true,
                eval_count: 4,
                done_reason: 'stop',
              };
    return new Response(JSON.stringify(value));
  }) as typeof fetch;
};

const rubric: Rubric = {
  language: 'it',
  minWords: 12,
  maxWords: 40,
  required: [['biblioteca'], ['sabato', 'sabati']],
  forbidden: ['library'],
  register: 'formal',
};
const good =
  'Gentile cliente, la informiamo che la biblioteca resterà chiusa sabato per lavori di manutenzione. Ci scusiamo per il disagio.';

test('rubric grading is deterministic and names each failed check', () => {
  assert.deepEqual(gradeRubric(good, rubric), { passed: true, failures: [] });
  assert.deepEqual(gradeRubric(good, rubric), gradeRubric(good, rubric));
  assert.deepEqual(
    gradeRubric('Dear customer, the library will be closed on Saturday for maintenance work. We apologise.', rubric)
      .failures,
    ['language', 'required:1', 'required:2', 'forbidden:library'],
  );
  assert.deepEqual(gradeRubric('Ciao, sabato tu trovi chiusa la biblioteca e il bar.', rubric).failures, [
    'min-words',
    'register',
  ]);
  assert.deepEqual(gradeRubric((good + ' ').repeat(3), rubric).failures, ['max-words']);
  assert.deepEqual(
    gradeRubric('Ehi, sabato la biblioteca è chiusa, ci vediamo lunedì se vuoi.', { register: 'informal' }),
    {
      passed: true,
      failures: [],
    },
  );
  assert.deepEqual(gradeRubric(good, { register: 'informal' }).failures, ['register']);
  assert.deepEqual(
    gradeRubric("L'ufficio è chiuso il sabato mattina.", { required: [['sabato mattina']] }).failures,
    [],
  );
  assert.deepEqual(gradeRubric('Il sabatomattina è libero.', { required: [['sabato']] }).failures, ['required:1']);
});

const pack = (expected: unknown, extra: Record<string, unknown> = {}): unknown => ({
  schemaVersion: 1,
  id: 'rubric-contract',
  version: '1.0.0',
  cases: [
    {
      id: 'notice-regression',
      layer: 'model',
      split: 'regression',
      capabilities: ['italian-quality'],
      critical: true,
      expected,
      expensive: false,
      area: 'language-translation',
      messages: [{ role: 'user', content: 'Scrivi un avviso formale di chiusura della biblioteca sabato.' }],
      ...extra,
    },
  ],
});

test('packs accept a rubric expectation and reject malformed rubrics', () => {
  const valid = validatePack(pack({ kind: 'rubric', value: rubric }));
  assert.equal(catalog([valid])[0].grader, 'rubric-v1');
  for (const bad of [
    { kind: 'rubric', value: {} },
    { kind: 'rubric', value: { language: 'fr' } },
    { kind: 'rubric', value: { minWords: -1 } },
    { kind: 'rubric', value: { minWords: 10, maxWords: 5 } },
    { kind: 'rubric', value: { required: [[]] } },
    { kind: 'rubric', value: { forbidden: [''] } },
    { kind: 'rubric', value: { register: 'casual' } },
    { kind: 'rubric', value: { register: 'formal', extra: true } },
    { kind: 'rubric', value: 'italian' },
  ])
    assert.throws(() => validatePack(pack(bad)), JSON.stringify(bad));
  assert.throws(() => validatePack(pack({ kind: 'rubric', value: rubric }, { responseFormat: 'json' })));
});

test('a run grades free text by rubric and keeps the reply out of the report', async () => {
  const contract = validatePack(pack({ kind: 'rubric', value: rubric })) as Pack;
  const passing = await run(contract, profile, defaults, {
    execute: true,
    allowModels: true,
    fetch: provider([good]),
  });
  assert.equal(passing.passed, true);
  const english = 'Dear customer, the library will be closed on Saturday for maintenance work. We apologise.';
  const failing = await run(contract, profile, defaults, {
    execute: true,
    allowModels: true,
    fetch: provider([english]),
  });
  assert.equal(failing.results[0].status, 'failed');
  assert.match(String(failing.results[0].reason), /language/);
  assert.equal(JSON.stringify(failing).includes('Dear customer'), false);
});
