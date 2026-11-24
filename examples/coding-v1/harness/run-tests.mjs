// Runs the hidden *.test.ts files next to this script, each in its own child process, and prints one summary
// line tagged with the grader's nonce. The nonce leaves the environment before any test file starts.
import { run } from 'node:test';
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const nonce = process.env.GAUNTLET_NONCE ?? '';
delete process.env.GAUNTLET_NONCE;
const here = dirname(fileURLToPath(import.meta.url));
const files = readdirSync(here)
  .filter((name) => name.endsWith('.test.ts'))
  .sort()
  .map((name) => join(here, name));
let tests = 0;
let passed = 0;
// Only the declared tests count: a file-level event (a file that crashed or exited early) is not a test.
for await (const event of run({ files, isolation: 'process', concurrency: 1 })) {
  if (event.type !== 'test:pass' && event.type !== 'test:fail') continue;
  const data = event.data;
  if (data.nesting !== 0 || data.details?.type !== 'test' || files.includes(data.name)) continue;
  tests++;
  if (event.type === 'test:pass' && !data.skip && !data.todo) passed++;
}
process.stdout.write('\nGAUNTLET-RESULT ' + nonce + ' ' + JSON.stringify({ tests, passed }) + '\n');
process.exitCode = 0;
