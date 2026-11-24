/* plan.mjs: the converter's decisions, pure and testable. What a file really is (by its bytes, then its name),
   which engine converts it to the chosen format, sensible defaults, output names and time parsing. */
import { FORMATS, TARGETS } from './formats.mjs';
import { PAIRS } from './pairs.mjs';

const txt = (bytes, from, to) => String.fromCharCode(...bytes.subarray(from, to));

/** Format key ('mp4', 'heic', …) from the first bytes (≥ 64 is plenty), falling back to the file name. */
export function sniff(bytes, name = '') {
  const b = bytes, at = (i, ...x) => x.every((v, k) => b[i + k] === v);
  if (at(0, 0x89, 0x50, 0x4e, 0x47)) return 'png';
  if (at(0, 0xff, 0xd8, 0xff)) return 'jpg';
  if (txt(b, 0, 4) === 'GIF8') return 'gif';
  if (txt(b, 0, 4) === 'RIFF') { const t = txt(b, 8, 12); if (t === 'WEBP') return 'webp'; if (t === 'WAVE') return 'wav'; }
  if (txt(b, 4, 8) === 'ftyp') {
    const brand = txt(b, 8, 12);
    if (['heic', 'heix', 'hevc', 'hevx', 'heim', 'heis', 'mif1', 'msf1'].includes(brand)) return /\.avif$/i.test(name) ? 'avif' : 'heic';
    if (brand === 'avif' || brand === 'avis') return 'avif';
    if (brand === 'qt  ') return 'mov';
    if (brand === 'M4A ' || brand === 'M4B ') return 'm4a';
    return /\.mov$/i.test(name) ? 'mov' : /\.m4a$/i.test(name) ? 'm4a' : 'mp4';
  }
  if (at(0, 0x1a, 0x45, 0xdf, 0xa3)) return txt(b, 0, 64).includes('webm') ? 'webm' : 'mkv';
  if (txt(b, 0, 3) === 'ID3') return 'mp3';
  if (b[0] === 0xff && (b[1] & 0xf6) === 0xf0) return 'aac'; // ADTS sync with layer 00
  if (b[0] === 0xff && (b[1] & 0xe0) === 0xe0) return 'mp3'; // MPEG audio frame sync
  if (txt(b, 0, 4) === 'fLaC') return 'flac';
  if (txt(b, 0, 4) === 'OggS') return 'ogg';
  const head = txt(b, 0, Math.min(b.length, 1024));
  if (/<svg[\s>]/i.test(head)) return 'svg';
  const ext = (name.match(/\.([a-z0-9]+)$/i) || [])[1]?.toLowerCase();
  const byExt = { jpeg: 'jpg', jpg: 'jpg', heif: 'heic', heic: 'heic', qt: 'mov', mka: 'mkv', oga: 'ogg', opus: 'ogg', m4v: 'mp4' }[ext] || ext;
  return byExt && FORMATS[byExt] && byExt !== 'video' ? byExt : null;
}

export const kindOf = (fmt) => FORMATS[fmt]?.kind || null;
export const targetsFor = (fmt) => TARGETS[kindOf(fmt)] || [];

/** Which engine turns `from` into `to`: media (mediabunny), video2gif, gif2video, image, or null when it can't. */
export function engineFor(from, to) {
  const k = kindOf(from);
  if (!k || !targetsFor(from).includes(to)) return null;
  if (k === 'image') return 'image';
  if (k === 'gif') return to === 'png' ? 'image' : 'gif2video';
  if (to === 'gif') return 'video2gif';
  return 'media';
}

const DEFAULTS = {
  mp3: { bitrate: 192 }, m4a: { bitrate: 192 }, wav: {}, mp4: { height: 0 }, webm: { height: 0 },
  gif: { width: 480, fps: 12, maxSeconds: 15, start: 0 }, jpg: { quality: 0.9 }, webp: { quality: 0.9 }, png: { scale: 2 }
};
export const defaults = (to) => ({ ...(DEFAULTS[to] || {}) });

export const outName = (name, to) => String(name).replace(/\.[^./\\]+$/, '') + '.' + FORMATS[to].ext;

/** "1:05", "65", "00:01:05.5" → seconds; empty → null; nonsense → NaN. */
export function parseTime(s) {
  const t = String(s ?? '').trim();
  if (!t) return null;
  if (!/^\d+(:\d{1,2}){0,2}(\.\d+)?$/.test(t)) return NaN;
  return t.split(':').reduce((acc, part) => acc * 60 + Number(part), 0);
}

export const pairFor = (from, to) => PAIRS.find((p) => p.from === from && p.to === to) || null;

export function sizeLabel(bytes, lang = 'en') {
  const nf = (n, d) => new Intl.NumberFormat(lang === 'pl' ? 'pl-PL' : 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
  if (bytes < 1024) return nf(bytes, 0) + ' B';
  if (bytes < 1048576) return nf(bytes / 1024, 1) + ' KB';
  return nf(bytes / 1048576, 1) + ' MB';
}
