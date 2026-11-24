/* Character counter: graphemes, words, sentences, X weight, SMS segments, limits and top words. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stats, xWeight, sms, topWords, LIMITS, limitValue } from '../tools/character-counter/count.mjs';

test('empty text is all zeros', () => {
  const s = stats('');
  for (const k of ['chars', 'noSpaces', 'words', 'sentences', 'paragraphs', 'lines', 'bytes']) assert.equal(s[k], 0, k);
});

test('characters are what a person sees: emoji, flags, families and combining marks count once', () => {
  assert.equal(stats('👍').chars, 1);
  assert.equal(stats('🇵🇱').chars, 1);
  assert.equal(stats('👨‍👩‍👧‍👦').chars, 1);
  assert.equal(stats('ą').chars, 1); // ą typed as a + combining ogonek
  const s = stats('Zażółć gęślą jaźń 👍');
  assert.equal(s.chars, 19);
  assert.equal(s.noSpaces, 16);
  assert.equal(s.utf16, 20);
  assert.equal(s.bytes, 31); // 9 two-byte letters (18) + a four-byte emoji (4) + 9 one-byte characters (9)
});

test('words, sentences, paragraphs and lines', () => {
  const t = 'Hello world. How are you?\n\nSecond paragraph, it’s here!\nLast line';
  const s = stats(t);
  assert.equal(s.words, 11);
  assert.equal(s.sentences, 4);
  assert.equal(s.paragraphs, 2);
  assert.equal(s.lines, 4);
  assert.equal(stats('Ala ma kota, a kot ma Alę.', 'pl').words, 7);
});

test('standard pages and reading time', () => {
  const s = stats('x'.repeat(3600));
  assert.equal(s.pages, 2);
  assert.equal(stats(Array(238).fill('word').join(' ')).readingSeconds, 60);
});

test('X weight: Latin 1, CJK 2, emoji 2, every link 23', () => {
  assert.equal(xWeight('hello'), 5);
  assert.equal(xWeight('日本'), 4);
  assert.equal(xWeight('👍🏽'), 2);
  assert.equal(xWeight('🇵🇱'), 2); // flags are regional indicators, not Extended_Pictographic
  assert.equal(xWeight('1️⃣'), 2);
  assert.equal(xWeight('see https://example.com/a/very/long/path?x=1 now'), 4 + 23 + 4);
  assert.equal(xWeight('zażółć'), 6);
});

test('SMS: GSM-7 160 / 153, extension characters cost 2, anything else switches to UCS-2 70 / 67', () => {
  assert.deepEqual(sms('a'.repeat(160)), { encoding: 'GSM-7', units: 160, segments: 1, perSegment: 160, nonGsm: [] });
  assert.equal(sms('a'.repeat(161)).segments, 2);
  assert.equal(sms('€').units, 2);
  const pl = sms('Zażółć');
  assert.equal(pl.encoding, 'UCS-2');
  assert.deepEqual(pl.nonGsm, ['ż', 'ó', 'ł', 'ć']);
  assert.equal(sms('ą'.repeat(70)).segments, 1);
  assert.equal(sms('ą'.repeat(71)).segments, 2);
  assert.equal(sms('').segments, 0);
});

test('limits have counters and top words skip stop words', () => {
  const t = 'Clean the screen, clean the screen again, and clean it once more.';
  const s = stats(t);
  for (const l of LIMITS) assert.ok(Number.isFinite(limitValue(l, s, t)), l.id);
  assert.deepEqual(topWords(t, 2), [['clean', 3], ['screen', 2]]);
  assert.deepEqual(topWords('Kot i kot oraz Kot.', 1, 'pl'), [['kot', 3]]);
});
