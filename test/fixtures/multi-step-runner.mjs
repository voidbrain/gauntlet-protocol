import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const [out, configurationFile, budgetFile, caseFile] = process.argv.slice(2);
const hash = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const configuration = JSON.parse(readFileSync(configurationFile, 'utf8'));
const budget = JSON.parse(readFileSync(budgetFile, 'utf8'));
const current = JSON.parse(readFileSync(caseFile, 'utf8'));
if (!current.requirements.includes('scripted-environment') || !current.requirements.includes('step-limit-4'))
  process.exit(1);
const sequence = ['plan', 'act', 'observe'];
writeFileSync(
  out,
  JSON.stringify({
    schemaVersion: 1,
    layer: 'end-to-end',
    caseHash: hash(current),
    fixtureHash: hash({ case: current.id, sequence, stepLimit: 4 }),
    configurationHash: hash(configuration),
    modelDigest: 'a'.repeat(64),
    runtimeIdentity: 'scripted-agent-fixture-v1',
    sourceStable: true,
    complete: true,
    outputTokens: Math.min(1, budget.outputTokens),
    results: [{ id: current.id, status: 'passed', checks: sequence.length }],
  }),
);
