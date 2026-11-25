// Reference runner for the coding-v1 pack, registered as `coding-reference`:
//   node examples/coding-v1/runner.mjs {report} {configuration} {budget} {case} [--docker=PATH]
// It asks the profile's local Ollama model for the candidate file (prompt and starter only; the model never sees
// expected values), then grades it with grade.mjs, running the candidate in one throwaway container per case
// (container-executor.mjs). Grading is out of process: expected values stay on the host with the grader. A missing
// container engine or image is reported as an `error` result naming the fix, before the model is asked (B-004); an
// executor fault while grading is an `error` too, never a graded result (B-005).
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gradeCandidate, readTask, taskHash } from './grade.mjs';
import { containerExecutor, images, stopAll } from './container-executor.mjs';
import { askCandidate } from './ollama-candidate.mjs';

const [out, configurationFile, budgetFile, caseFile, ...flags] = process.argv.slice(2);
const docker = flags.find((item) => item.startsWith('--docker='))?.slice('--docker='.length) ?? 'docker';
const here = dirname(fileURLToPath(import.meta.url));
const hash = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const started = Date.now();

for (const signal of ['SIGTERM', 'SIGINT'])
  process.on(signal, () => {
    void stopAll().finally(() => process.exit(1));
  });

const profile = JSON.parse(readFileSync(configurationFile, 'utf8'));
const budget = JSON.parse(readFileSync(budgetFile, 'utf8'));
const current = JSON.parse(readFileSync(caseFile, 'utf8'));
if (!/^[a-z0-9-]+$/.test(current.id) || !current.requirements?.includes('coding-sandbox'))
  throw Error('Not a coding-v1 case');
const taskDir = join(here, 'tasks', current.id);
const task = readTask(taskDir);
const starter = readFileSync(join(taskDir, 'starter' + task.entry.slice(task.entry.lastIndexOf('.'))), 'utf8');

const report = (fields) =>
  writeFileSync(
    out,
    JSON.stringify({
      schemaVersion: 1,
      layer: 'coding',
      caseHash: hash(current),
      fixtureHash: taskHash(taskDir),
      configurationHash: hash(profile),
      sourceStable: true,
      ...fields,
    }),
  );
const fail = (message) => {
  process.stderr.write(message + '\n');
  report({ complete: false, results: [{ id: current.id, status: 'error', checks: 0 }] });
  process.exit(0);
};

// Check the toolchain before the model is asked, so a missing engine costs no generation.
const execute = containerExecutor({ docker });
const image = task.language === 'python' ? 'python3' : 'node';
try {
  await execute.prepare([image]);
} catch (error) {
  const message = String(error?.message ?? error);
  fail(
    message.startsWith('container engine')
      ? message
      : 'Coding image unavailable: run `docker pull ' + images[image] + '` while online',
  );
}

const asked = await askCandidate({
  profile,
  budget,
  started,
  prompt:
    task.prompt +
    '\n\nThe current ' +
    task.entry +
    ' is:\n\n```\n' +
    starter +
    '```\n\nReply with the complete ' +
    task.entry +
    ' in one fenced code block.',
});
const { candidate, outputTokens } = asked;

let status;
let checks;
if (asked.truncated) {
  status = 'failed';
  checks = task.cases.length;
} else {
  const timeoutMs = Math.max(1000, Math.min(20000, budget.timeoutMs - (Date.now() - started) - 30000));
  const graded = await gradeCandidate({ taskDir, candidate, execute, timeoutMs });
  if (graded.status === 'error') fail(graded.message);
  status = graded.status;
  checks = graded.tests;
}
report({
  modelDigest: asked.modelDigest,
  runtimeIdentity: 'ollama-' + asked.ollamaVersion + '+coding-reference-v1',
  complete: true,
  outputTokens,
  results: [{ id: current.id, status, checks }],
});
