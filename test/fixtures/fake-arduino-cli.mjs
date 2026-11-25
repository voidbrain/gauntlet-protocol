#!/usr/bin/env node
// Stand-in arduino-cli for grader tests on machines without the toolchain (CI). It reports the pinned cores, or the
// cores in FAKE_ARDUINO_CORES (JSON), and "compiles" a sketch by failing on an `#error` line or an undeclared
// `lastChange` or the removed `ledcSetup`, and sleeping when the sketch contains FAKE_SLOW. It never reads or runs anything else.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
if (args[0] === 'version') {
  process.stdout.write('arduino-cli  Version: 0.0.0-fake\n');
} else if (args[0] === 'core' && args[1] === 'list') {
  const cores = JSON.parse(process.env.FAKE_ARDUINO_CORES ?? '{"arduino:avr":"1.8.6","esp32:esp32":"3.0.7"}');
  const platforms = Object.entries(cores).map(([id, installed_version]) => ({ id, installed_version }));
  process.stdout.write(JSON.stringify({ platforms }) + '\n');
} else if (args[0] === 'compile') {
  const dir = args.at(-1);
  const source = readdirSync(dir)
    .filter((name) => name.endsWith('.ino'))
    .map((name) => readFileSync(join(dir, name), 'utf8'))
    .join('\n');
  if (source.includes('FAKE_SLOW')) await new Promise((resolve) => setTimeout(resolve, 30000));
  if (/^\s*#error/m.test(source) || /\b(lastChange|ledcSetup)\b/.test(source)) {
    process.stderr.write(`${dir}/sketch.ino:10:3: error: 'lastChange' was not declared in this scope\n`);
    process.stdout.write('Error during build: exit status 1\n');
    process.exit(1);
  }
  process.stdout.write('Sketch uses 924 bytes (2%) of program storage space. Maximum is 32256 bytes.\n');
} else {
  process.stderr.write('fake arduino-cli: unsupported ' + args.join(' ') + '\n');
  process.exit(2);
}
