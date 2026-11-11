import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const [out, configurationFile, budgetFile, caseFile, mode] = process.argv.slice(2);
const hash = (x) => createHash('sha256').update(JSON.stringify(x)).digest('hex');
const configuration = JSON.parse(readFileSync(configurationFile, 'utf8'));
const current = JSON.parse(readFileSync(caseFile, 'utf8'));
const budget = JSON.parse(readFileSync(budgetFile, 'utf8'));
if (budget.outputTokens < 1) process.exit(1);
writeFileSync(
  out,
  JSON.stringify({
    schemaVersion: 1,
    layer: 'model',
    caseHash: mode === 'wrong-case' ? 'f'.repeat(64) : hash(current),
    fixtureHash: hash('same-neutral-fixture'),
    configurationHash: hash(configuration),
    modelDigest: 'a'.repeat(64),
    runtimeIdentity: 'neutral-agent-fixture-1',
    sourceStable: true,
    complete: true,
    outputTokens: 1,
    results: [{ id: 'acceptance', status: 'passed', checks: 1 }],
  }),
);
