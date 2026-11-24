#!/usr/bin/env node
// Stand-in container engine for executor tests: records each call and simulates a slow image pull.
import { appendFileSync } from 'node:fs';

const args = process.argv.slice(2);
if (process.env.FAKE_DOCKER_LOG) appendFileSync(process.env.FAKE_DOCKER_LOG, JSON.stringify(args) + '\n');
const command = args[0];
if (command === 'version') process.stdout.write('29.0.0-fake\n');
else if (command === 'image') process.exit(1);
else if (command === 'pull') await new Promise((resolve) => setTimeout(resolve, 2500));
else if (command === 'run') process.stdout.write('GAUNTLET-RESULTS []\n');
