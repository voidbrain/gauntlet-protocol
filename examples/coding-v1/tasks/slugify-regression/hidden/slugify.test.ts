import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slugify } from './solution.ts';

test('lower-cases and joins words', () => {
  assert.equal(slugify('Hello World'), 'hello-world');
});
test('collapses runs of other characters', () => {
  assert.equal(slugify('Ready,  set -- go!'), 'ready-set-go');
});
test('removes accents', () => {
  assert.equal(slugify('Caffè già pronto'), 'caffe-gia-pronto');
});
test('trims hyphens and keeps digits', () => {
  assert.equal(slugify('  --Version 2.0--  '), 'version-2-0');
});
test('returns an empty string when nothing remains', () => {
  assert.equal(slugify('!!! ???'), '');
});
