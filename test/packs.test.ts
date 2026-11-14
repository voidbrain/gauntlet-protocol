import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { defaults, run, validatePack, type Pack, type Profile } from '../src/index.ts';

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
                message: { content: JSON.stringify(answers[answer++]) },
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
  assert.equal(pack.cases.every((entry) => entry.responseFormat !== undefined), true);
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
