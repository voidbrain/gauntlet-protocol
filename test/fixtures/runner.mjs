import { writeFileSync } from 'node:fs';
const [mode, out] = process.argv.slice(2);
if (mode === 'hang') setInterval(() => {}, 1000);
else if (mode === 'overflow') process.stdout.write('x'.repeat(10000));
else if (mode === 'large-evidence')
  writeFileSync(
    out,
    JSON.stringify({
      schemaVersion: 1,
      layer: 'system',
      sourceStable: true,
      complete: true,
      results: Array.from({ length: 50 }, (_, i) => ({ id: 'check' + i, status: 'passed', checks: 1 })),
    }),
  );
else if (mode === 'malformed') writeFileSync(out, '{}');
else {
  writeFileSync(
    out,
    JSON.stringify({
      schemaVersion: 1,
      layer: 'system',
      sourceStable: true,
      complete: true,
      results: [{ id: 'neutral', status: 'passed', checks: 3 }],
    }),
  );
  if (mode === 'nonzero') process.exitCode = 1;
}
