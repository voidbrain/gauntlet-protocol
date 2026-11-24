import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dependencyOrder } from './solution.ts';

test('empty input gives an empty order', () => {
  assert.deepEqual(dependencyOrder({}), []);
});
test('dependencies come first', () => {
  assert.deepEqual(dependencyOrder({ build: ['fetch'], fetch: [] }), ['fetch', 'build']);
});
test('ready tasks are taken alphabetically', () => {
  assert.deepEqual(dependencyOrder({ deploy: ['test', 'lint'], lint: [], test: ['compile'], compile: [] }), [
    'compile',
    'lint',
    'test',
    'deploy',
  ]);
});
test('a dependency that is not a key is still a task', () => {
  assert.deepEqual(dependencyOrder({ pack: ['icons'] }), ['icons', 'pack']);
});
test('a cycle throws', () => {
  assert.throws(() => dependencyOrder({ a: ['b'], b: ['c'], c: ['a'] }), /cycle/);
});
