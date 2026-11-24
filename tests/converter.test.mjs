/* Converter: format detection, engine choice, options, names, and the pair data behind every x-to-y page. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sniff, engineFor, targetsFor, outName, parseTime, defaults, pairFor, sizeLabel } from '../tools/converter/plan.mjs';
import { PAIRS, PAIR, slugOf, GROUPS } from '../tools/converter/pairs.mjs';
import { FORMATS } from '../tools/converter/formats.mjs';

const b = (...x) => Uint8Array.from(x.flatMap((v) => (typeof v === 'string' ? [...v].map((c) => c.charCodeAt(0)) : [v])));
const ftyp = (brand) => b(0, 0, 0, 24, 'ftyp', brand, 0, 0, 0, 0);

test('detects formats from their first bytes, whatever the file is called', () => {
  assert.equal(sniff(b(0x89, 'PNG', 13, 10, 26, 10), 'x.jpg'), 'png');
  assert.equal(sniff(b(0xff, 0xd8, 0xff, 0xe0), 'x'), 'jpg');
  assert.equal(sniff(b('GIF89a'), 'x'), 'gif');
  assert.equal(sniff(b('RIFF', 0, 0, 0, 0, 'WEBPVP8 '), 'x'), 'webp');
  assert.equal(sniff(b('RIFF', 0, 0, 0, 0, 'WAVEfmt '), 'x'), 'wav');
  assert.equal(sniff(ftyp('heic'), 'IMG_0001'), 'heic');
  assert.equal(sniff(ftyp('mif1'), 'x.heic'), 'heic');
  assert.equal(sniff(ftyp('avif'), 'x'), 'avif');
  assert.equal(sniff(ftyp('qt  '), 'x'), 'mov');
  assert.equal(sniff(ftyp('M4A '), 'x'), 'm4a');
  assert.equal(sniff(ftyp('isom'), 'x'), 'mp4');
  assert.equal(sniff(b(0x1a, 0x45, 0xdf, 0xa3, 0, 'B', 0x82, 0x84, 'webm'), 'x'), 'webm');
  assert.equal(sniff(b(0x1a, 0x45, 0xdf, 0xa3, 0, 'B', 0x82, 0x88, 'matroska'), 'x'), 'mkv');
  assert.equal(sniff(b('ID3', 4, 0), 'x'), 'mp3');
  assert.equal(sniff(b(0xff, 0xfb, 0x90), 'x'), 'mp3');
  assert.equal(sniff(b(0xff, 0xf1, 0x50), 'x'), 'aac');
  assert.equal(sniff(b('fLaC'), 'x'), 'flac');
  assert.equal(sniff(b('OggS'), 'x'), 'ogg');
  assert.equal(sniff(b('<?xml version="1.0"?>\n<svg xmlns="http://www.w3.org/2000/svg">'), 'x'), 'svg');
  assert.equal(sniff(b('hello'), 'notes.txt'), null);
  assert.equal(sniff(b(0, 1, 2), 'photo.HEIC'), 'heic');
});

test('every launch pair has an engine, and every kind has targets', () => {
  for (const p of PAIRS) {
    const from = p.from === 'video' ? 'mp4' : p.from;
    assert.ok(engineFor(from, p.to), p.id);
    assert.ok(targetsFor(from).includes(p.to), p.id + ' target offered');
  }
  assert.equal(engineFor('mov', 'gif'), 'video2gif');
  assert.equal(engineFor('gif', 'mp4'), 'gif2video');
  assert.equal(engineFor('gif', 'png'), 'image');
  assert.equal(engineFor('heic', 'jpg'), 'image');
  assert.equal(engineFor('mkv', 'mp3'), 'media');
  assert.equal(engineFor('mp3', 'gif'), null);
  assert.equal(engineFor('png', 'mp3'), null);
});

test('output names, times, defaults and sizes', () => {
  assert.equal(outName('IMG_0001.HEIC', 'jpg'), 'IMG_0001.jpg');
  assert.equal(outName('my.talk.final.mov', 'mp3'), 'my.talk.final.mp3');
  assert.equal(outName('noext', 'gif'), 'noext.gif');
  assert.equal(parseTime('1:05'), 65);
  assert.equal(parseTime('65'), 65);
  assert.equal(parseTime('00:01:05.5'), 65.5);
  assert.equal(parseTime(' '), null);
  assert.ok(Number.isNaN(parseTime('1:xx')));
  assert.equal(defaults('mp3').bitrate, 192);
  assert.deepEqual([defaults('gif').width, defaults('gif').fps, defaults('gif').maxSeconds], [480, 12, 15]);
  assert.equal(sizeLabel(1536, 'en'), '1.5 KB');
  assert.equal(sizeLabel(5 * 1048576, 'pl'), '5,0 MB');
});

test('pairs: unique ids and slugs, both languages, real notes, known groups', () => {
  assert.equal(PAIRS.length, 34);
  const en = new Set(), pl = new Set();
  for (const p of PAIRS) {
    assert.ok(FORMATS[p.from] && FORMATS[p.to], p.id);
    assert.ok(GROUPS[p.group], p.id);
    for (const lang of ['en', 'pl']) assert.ok(p.note[lang].length >= 100, `${p.id} ${lang} note too short`);
    en.add(slugOf(p, 'en')); pl.add(slugOf(p, 'pl'));
  }
  assert.equal(en.size, 34); assert.equal(pl.size, 34);
  assert.equal(slugOf(PAIR['video-to-mp3'], 'pl'), 'wideo-na-mp3');
  assert.equal(pairFor('mov', 'gif').id, 'mov-to-gif');
  assert.equal(pairFor('mp4', 'mp3').id, 'mp4-to-mp3');
  assert.equal(pairFor('flac', 'wav'), null);
});
