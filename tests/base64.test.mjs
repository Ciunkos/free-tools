/* Base64: UTF-8 round trips, URL-safe and padding options, MIME wrapping, forgiving input, precise errors, files. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { encodeText, decodeB64, bytesToText, bytesToB64, sniff, dataUri } from '../tools/base64/b64.mjs';

const dec = (s) => bytesToText(decodeB64(s).bytes);

test('UTF-8 text round trips, Polish letters and emoji included', () => {
  for (const t of ['', 'a', 'Hello, world!', 'Zażółć gęślą jaźń', 'Kot 🐈‍⬛ i 🇵🇱', '日本語', 'x'.repeat(100000)]) assert.equal(dec(encodeText(t)), t);
  assert.equal(encodeText('Zażółć'), 'WmHFvMOzxYLEhw==');
  assert.equal(encodeText('hello'), 'aGVsbG8=');
});

test('URL-safe, no padding and MIME wrap options', () => {
  const t = '???>>>';
  assert.equal(encodeText(t), 'Pz8/Pj4+');
  assert.equal(encodeText(t, { url: true }), 'Pz8_Pj4-');
  assert.equal(encodeText('hello', { pad: false }), 'aGVsbG8');
  const wrapped = encodeText('x'.repeat(100), { wrap: 76 });
  assert.deepEqual(wrapped.split('\r\n').map((l) => l.length), [76, 60]);
  assert.equal(dec(wrapped), 'x'.repeat(100));
});

test('decoding forgives whitespace, missing padding, URL-safe input and a data: URI', () => {
  assert.equal(dec('aGVs\n bG8'), 'hello');
  assert.equal(dec('aGVsbG8'), 'hello');
  assert.equal(dec('Pz8_Pj4-'), '???>>>');
  const d = decodeB64('data:text/plain;charset=utf-8;base64,aGVsbG8=');
  assert.equal(d.mime, 'text/plain');
  assert.equal(bytesToText(d.bytes), 'hello');
});

test('errors say what and where', () => {
  assert.throws(() => decodeB64('aGV$bG8='), /“\$” at character 4/);
  assert.throws(() => decodeB64('aGVsb'), /4n\+1/);
  assert.throws(() => decodeB64('aG=VsbG8'), /middle/);
  assert.throws(() => decodeB64('a+b_'), /mixes/);
});

test('binary is not mistaken for text, and common files are recognised', () => {
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13]);
  assert.equal(bytesToText(png), null);
  assert.deepEqual(sniff(png), { mime: 'image/png', ext: 'png' });
  assert.equal(sniff(new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d])).ext, 'pdf');
  assert.equal(dataUri(png), 'data:image/png;base64,' + bytesToB64(png));
  assert.equal(bytesToText(new Uint8Array([0xc3, 0x28])), null);
});
