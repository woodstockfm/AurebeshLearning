import test from 'node:test';
import assert from 'node:assert/strict';

import { tokenizeLatin } from '../src/aurebesh/alphabet.mjs';

test('tokenizer prefers th digraph over t+h', () => {
  assert.deepEqual(tokenizeLatin('th'), ['th']);
});

test('tokenizer handles thesh with longest-match rules', () => {
  assert.deepEqual(tokenizeLatin('thesh'), ['th', 'e', 'sh']);
});

test('tokenizer handles ch as a digraph', () => {
  assert.deepEqual(tokenizeLatin('ch'), ['ch']);
});

test('tokenizer keeps whitespace and prioritizes digraphs throughout strings', () => {
  assert.deepEqual(tokenizeLatin('CH aeon th ng!'), ['ch', ' ', 'ae', 'o', 'n', ' ', 'th', ' ', 'ng', '!']);
});
