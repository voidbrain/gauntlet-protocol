import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { defaults, run, validatePack, type Pack, type Profile } from '../src/index.ts';

const profile: Profile = {
  schemaVersion: 1,
  id: 'bilingual-fixture',
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

const provider = (content: string) =>
  (async (input: unknown) => {
    const path = new URL(String(input)).pathname;
    const value =
      path === '/api/version'
        ? { version: 'fixture-v1' }
        : path === '/api/show'
          ? { model_info: { 'general.file_type': 15 }, details: { quantization_level: 'Q4_K_M' } }
          : path === '/api/tags'
            ? { models: [{ name: profile.model, size: 100, digest: 'a'.repeat(64) }] }
            : { model: profile.model, message: { content }, done: true, eval_count: 4, done_reason: 'stop' };
    return new Response(JSON.stringify(value));
  }) as typeof fetch;

const pack = validatePack(JSON.parse(readFileSync('examples/bilingual-it-en-v1.json', 'utf8')));
const status = async (caseId: string, reply: Record<string, unknown>): Promise<string> => {
  const one: Pack = { ...pack, cases: pack.cases.filter((entry) => entry.id === caseId) };
  const report = await run(one, profile, defaults, {
    execute: true,
    allowModels: true,
    fetch: provider(JSON.stringify(reply)),
  });
  return report.results[0].status;
};

const en = (intent: string, reply: string) => ({ intent, language: 'en', reply });
const it = (intent: string, reply: string) => ({ intent, language: 'it', reply });

// Each case: correct paraphrases pass; wrong meaning, wrong language, negation, wrong intent or language field fail.
const cases: Record<string, { pass: Record<string, unknown>[]; fail: Record<string, unknown>[] }> = {
  'summarize-en-regression': {
    pass: [
      en('summarize', 'The meeting moved to Tuesday.'),
      en('summarize', 'The meeting was rescheduled to Tuesday.'),
      en('summarize', 'The neutral meeting has been moved from Monday to Tuesday.'),
    ],
    fail: [
      en('summarize', 'The meeting moved to Monday.'),
      en('summarize', 'The meeting was moved from Tuesday to Monday.'),
      en('summarize', 'The meeting was not moved to Tuesday.'),
      en('summarize', "The meeting wasn't moved to Tuesday."),
      en('summarize', 'The meeting moved.'),
      en('summarize', 'La riunione è stata spostata a martedì.'),
      en('clarify', 'The meeting moved to Tuesday.'),
      it('summarize', 'The meeting moved to Tuesday.'),
    ],
  },
  'summarize-it-regression': {
    pass: [
      it('summarize', 'La riunione è stata spostata a martedì.'),
      it('summarize', 'La riunione neutrale è stata spostata da lunedì a martedì.'),
      it('summarize', "L'incontro è stato posticipato a martedì."),
    ],
    fail: [
      it('summarize', 'La riunione è stata spostata a lunedì.'),
      it('summarize', 'La riunione non è stata spostata a martedì.'),
      it('summarize', 'La riunione è stata spostata.'),
      it('summarize', 'The meeting moved to Tuesday.'),
      it('clarify', 'La riunione è stata spostata a martedì.'),
      en('summarize', 'La riunione è stata spostata a martedì.'),
    ],
  },
  'clarify-en-holdout': {
    pass: [
      en('clarify', 'Which file should I open?'),
      en('clarify', 'Which file do you mean?'),
      en('clarify', 'What file do you want me to open?'),
    ],
    fail: [
      en('clarify', 'I will open the file.'),
      en('clarify', 'Which file should I open'),
      en('clarify', 'Are you sure?'),
      en('clarify', 'Quale file devo aprire?'),
      en('summarize', 'Which file should I open?'),
      it('clarify', 'Which file should I open?'),
    ],
  },
  'clarify-it-holdout': {
    pass: [
      it('clarify', 'Quale file devo aprire?'),
      it('clarify', 'Quale file intendi?'),
      it('clarify', 'Di quale documento stai parlando?'),
    ],
    fail: [
      it('clarify', 'Aprirò il file.'),
      it('clarify', 'Quale file devo aprire'),
      it('clarify', 'Sei sicuro?'),
      it('clarify', 'Which file should I open?'),
      it('summarize', 'Quale file devo aprire?'),
      en('clarify', 'Quale file devo aprire?'),
    ],
  },
};

for (const [caseId, { pass, fail }] of Object.entries(cases))
  test('bilingual-it-en grades ' + caseId + ' by meaning, not wording', async () => {
    for (const reply of pass) assert.equal(await status(caseId, reply), 'passed', JSON.stringify(reply));
    for (const reply of fail) assert.equal(await status(caseId, reply), 'failed', JSON.stringify(reply));
  });

test('bilingual-it-en refuses extra keys and a non-text reply', async () => {
  for (const reply of [
    { intent: 'clarify', language: 'en', reply: 'Which file should I open?', note: 'x' },
    { intent: 'clarify', language: 'en', reply: ['Which file should I open?'] },
    { intent: 'clarify', language: 'en' },
  ])
    assert.equal(await status('clarify-en-holdout', reply), 'failed', JSON.stringify(reply));
});
