/* png.mjs: a solid-colour PNG of any size, without canvas and without dependencies.
   Runs in the browser and in Node (CompressionStream is in both). Rows are streamed into deflate one at a time,
   so an 8K image never holds 100 MB of pixels in memory, and iPhone's 16.7-megapixel canvas limit does not apply. */

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

export function crc32(bytes, crc = 0xffffffff) {
  for (let i = 0; i < bytes.length; i++) crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  return crc;
}

function chunk(type, data) {
  const out = new Uint8Array(12 + data.length);
  const v = new DataView(out.buffer);
  v.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  v.setUint32(8 + data.length, (crc32(out.subarray(4, 8 + data.length)) ^ 0xffffffff) >>> 0);
  return out;
}

/** Largest side we generate. 16384 covers 16K and A3 at 600 dpi; above that viewers struggle anyway. */
export const MAX_SIDE = 16384;

export function checkSize(w, h) {
  if (!Number.isInteger(w) || !Number.isInteger(h) || w < 1 || h < 1) throw new RangeError('Width and height must be whole numbers from 1');
  if (w > MAX_SIDE || h > MAX_SIDE) throw new RangeError('Width and height must be at most ' + MAX_SIDE);
}

/** PNG bytes of a w×h image filled with one sRGB colour [r, g, b]. Truecolour, 8 bits, no alpha, sRGB chunk. */
export async function solidPng(w, h, rgb = [255, 255, 255]) {
  checkSize(w, h);
  const ihdr = new Uint8Array(13);
  const v = new DataView(ihdr.buffer);
  v.setUint32(0, w); v.setUint32(4, h);
  ihdr.set([8, 2, 0, 0, 0], 8); // bit depth 8, colour type 2 (RGB), deflate, adaptive filter, no interlace
  const row = new Uint8Array(1 + w * 3); // filter byte 0 (None) + pixels
  for (let x = 0; x < w; x++) row.set(rgb, 1 + x * 3);

  const cs = new CompressionStream('deflate');
  const writer = cs.writable.getWriter();
  const pump = (async () => { for (let y = 0; y < h; y++) await writer.write(row); await writer.close(); })();
  const parts = [];
  let len = 0;
  const reader = cs.readable.getReader();
  for (;;) { const { value, done } = await reader.read(); if (done) break; parts.push(value); len += value.length; }
  await pump;
  const idat = new Uint8Array(len);
  let o = 0;
  for (const p of parts) { idat.set(p, o); o += p.length; }

  const sig = Uint8Array.of(137, 80, 78, 71, 13, 10, 26, 10);
  const blocks = [sig, chunk('IHDR', ihdr), chunk('sRGB', Uint8Array.of(0)), chunk('IDAT', idat), chunk('IEND', new Uint8Array(0))];
  const out = new Uint8Array(blocks.reduce((s, b) => s + b.length, 0));
  o = 0;
  for (const b of blocks) { out.set(b, o); o += b.length; }
  return out;
}

/** Ready-made sizes. `group` drives the chips on the page; the same list feeds the pre-built files and the tests. */
export const PRESETS = [
  { id: 'hd', w: 1280, h: 720, label: 'HD 720p', group: 'screen' },
  { id: 'fhd', w: 1920, h: 1080, label: 'Full HD 1080p', group: 'screen', prebuilt: true },
  { id: 'qhd', w: 2560, h: 1440, label: 'QHD 1440p', group: 'screen' },
  { id: 'uhd', w: 3840, h: 2160, label: '4K UHD', group: 'screen', prebuilt: true },
  { id: '5k', w: 5120, h: 2880, label: '5K', group: 'screen' },
  { id: '8k', w: 7680, h: 4320, label: '8K', group: 'screen' },
  { id: 'phone', w: 1179, h: 2556, label: { en: 'Phone (portrait)', pl: 'Telefon (pionowo)' }, group: 'device', prebuilt: true },
  { id: 'tablet', w: 2048, h: 2732, label: { en: 'Tablet (portrait)', pl: 'Tablet (pionowo)' }, group: 'device' },
  { id: 'a4', w: 2480, h: 3508, label: { en: 'A4 at 300 dpi', pl: 'A4, 300 dpi' }, group: 'print', prebuilt: true },
  { id: 'letter', w: 2550, h: 3300, label: { en: 'US Letter at 300 dpi', pl: 'US Letter, 300 dpi' }, group: 'print' },
  { id: 'square', w: 1080, h: 1080, label: { en: 'Square post 1080', pl: 'Kwadrat 1080' }, group: 'social' },
  { id: 'portrait', w: 1080, h: 1350, label: { en: 'Portrait post 4:5', pl: 'Post pionowy 4:5' }, group: 'social' },
  { id: 'story', w: 1080, h: 1920, label: { en: 'Story 9:16', pl: 'Relacja 9:16' }, group: 'social' }
];

export const fileName = (w, h, name = 'white') => `${name}-${w}x${h}.png`;
