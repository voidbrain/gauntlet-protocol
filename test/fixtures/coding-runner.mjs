// Registered-runner fixture for the coding-v1 pack: instead of asking a model, it grades a committed trusted
// candidate (reference or wrong) with the pack's grader and writes a coding-layer report.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gradeCandidate, readTask, taskHash } from '../../examples/coding-v1/grade.mjs';
import { trustedExecutor } from './coding-trusted-executor.mjs';

const [out, configurationFile, budgetFile, caseFile, variant] = process.argv.slice(2);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const hash = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const configuration = JSON.parse(readFileSync(configurationFile, 'utf8'));
const budget = JSON.parse(readFileSync(budgetFile, 'utf8'));
const current = JSON.parse(readFileSync(caseFile, 'utf8'));
if (!['reference', 'wrong'].includes(variant) || !current.requirements.includes('coding-sandbox')) process.exit(1);
const taskDir = join(root, 'examples/coding-v1/tasks', current.id);
const { entry } = readTask(taskDir);
const candidate = readFileSync(
  join(root, 'test/fixtures/coding-v1', current.id, variant + entry.slice(entry.lastIndexOf('.'))),
  'utf8',
);
const graded = await gradeCandidate({ taskDir, candidate, execute: trustedExecutor });
writeFileSync(
  out,
  JSON.stringify({
    schemaVersion: 1,
    layer: 'coding',
    caseHash: hash(current),
    fixtureHash: taskHash(taskDir),
    configurationHash: hash(configuration),
    modelDigest: 'a'.repeat(64),
    runtimeIdentity: 'coding-fixture-runner-v1',
    sourceStable: true,
    complete: true,
    outputTokens: Math.min(1, budget.outputTokens),
    results: [{ id: current.id, status: graded.status, checks: graded.tests }],
  }),
);
