// Reference runner for the coding-v1 pack, registered as `coding-reference`:
//   node examples/coding-v1/runner.mjs {report} {configuration} {budget} {case}
// It asks the profile's local Ollama model for the candidate file (prompt and starter only; the model never sees
// expected values), then grades it with grade.mjs, running the candidate in one throwaway container per case
// (container-executor.mjs). Grading is out of process: expected values stay on the host with the grader.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gradeCandidate, readTask, taskHash } from './grade.mjs';
import { containerExecutor, stopAll } from './container-executor.mjs';
import { askCandidate } from './ollama-candidate.mjs';

const [out, configurationFile, budgetFile, caseFile] = process.argv.slice(2);
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
  const graded = await gradeCandidate({ taskDir, candidate, execute: containerExecutor(), timeoutMs });
  status = graded.status;
  checks = graded.tests;
}
writeFileSync(
  out,
  JSON.stringify({
    schemaVersion: 1,
    layer: 'coding',
    caseHash: hash(current),
    fixtureHash: taskHash(taskDir),
    configurationHash: hash(profile),
    modelDigest: asked.modelDigest,
    runtimeIdentity: 'ollama-' + asked.ollamaVersion + '+coding-reference-v1',
    sourceStable: true,
    complete: true,
    outputTokens,
    results: [{ id: current.id, status, checks }],
  }),
);
