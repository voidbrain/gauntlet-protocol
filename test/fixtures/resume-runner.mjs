import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';

const [caseFile, report, log] = process.argv.slice(2);
const testCase = JSON.parse(readFileSync(caseFile, 'utf8'));
appendFileSync(log, testCase.id + '\n');
if (testCase.id === 'second') await delay(750);
writeFileSync(
  report,
  JSON.stringify({
    schemaVersion: 1,
    layer: 'system',
    sourceStable: true,
    complete: true,
    results: [{ id: testCase.id, status: 'passed', checks: 1 }],
  }),
);
