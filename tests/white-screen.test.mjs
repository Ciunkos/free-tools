/* White screen: the PNG encoder produces valid, exactly-white files of the asked size. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inflateSync } from 'node:zlib';
import { solidPng, crc32, PRESETS, fileName, MAX_SIDE } from '../tools/white-screen/png.mjs';

function parse(png) {
  const b = Buffer.from(png);
  assert.deepEqual([...b.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], 'PNG signature');
  const chunks = [];
  for (let o = 8; o < b.length;) {
    const len = b.readUInt32BE(o), type = b.toString('latin1', o + 4, o + 8), data = b.subarray(o + 8, o + 8 + len);
    const crc = b.readUInt32BE(o + 8 + len);
    assert.equal(crc, (crc32(b.subarray(o + 4, o + 8 + len)) ^ 0xffffffff) >>> 0, type + ' CRC');
    chunks.push({ type, data });
    o += 12 + len;
  }
  return chunks;
}

test('a 1920×1080 PNG is valid, sRGB, and every pixel is #FFFFFF', async () => {
  const chunks = parse(await solidPng(1920, 1080));
  assert.deepEqual(chunks.map((c) => c.type), ['IHDR', 'sRGB', 'IDAT', 'IEND']);
  const ihdr = chunks[0].data;
  assert.equal(ihdr.readUInt32BE(0), 1920);
  assert.equal(ihdr.readUInt32BE(4), 1080);
  assert.deepEqual([...ihdr.subarray(8)], [8, 2, 0, 0, 0]);
  const raw = inflateSync(chunks[2].data);
  assert.equal(raw.length, 1080 * (1 + 1920 * 3));
  for (let y = 0; y < 1080; y++) {
    const row = raw.subarray(y * 5761, (y + 1) * 5761);
    assert.equal(row[0], 0, 'filter None');
    assert.ok(row.subarray(1).every((v) => v === 255), 'row ' + y + ' is white');
  }
});

test('other colours and odd sizes work', async () => {
  const raw = inflateSync(parse(await solidPng(3, 2, [255, 244, 229]))[2].data);
  assert.deepEqual([...raw], [0, 255, 244, 229, 255, 244, 229, 255, 244, 229, 0, 255, 244, 229, 255, 244, 229, 255, 244, 229]);
});

test('an 8K file stays small (solid colour compresses to almost nothing)', async () => {
  const png = await solidPng(7680, 4320);
  assert.ok(png.length < 200_000, 'size ' + png.length);
});

test('bad sizes are refused', async () => {
  for (const [w, h] of [[0, 10], [10, -1], [1.5, 10], [MAX_SIDE + 1, 10], [NaN, 1]]) await assert.rejects(solidPng(w, h), RangeError);
});

test('presets are unique, within limits, and file names say the size', () => {
  const ids = new Set(PRESETS.map((p) => p.id));
  assert.equal(ids.size, PRESETS.length);
  for (const p of PRESETS) assert.ok(p.w <= MAX_SIDE && p.h <= MAX_SIDE && p.w > 0 && p.h > 0, p.id);
  assert.equal(fileName(3840, 2160), 'white-3840x2160.png');
  assert.ok(PRESETS.some((p) => p.prebuilt));
});
