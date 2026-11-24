/* b64.mjs: Base64 both ways, UTF-8 safe (Polish letters, emoji), standard or URL-safe, with or without padding,
   optionally wrapped at 76 characters (MIME). Decoding is forgiving about whitespace, URL-safe characters, missing
   padding and a data: URI prefix, and precise about real errors. Bytes that are not UTF-8 come back as a file. */

const te = new TextEncoder();
const td = new TextDecoder('utf-8', { fatal: true });

export function bytesToB64(bytes, { url = false, pad = true, wrap = 0 } = {}) {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  let s = btoa(bin);
  if (url) s = s.replace(/\+/g, '-').replace(/\//g, '_');
  if (!pad) s = s.replace(/=+$/, '');
  if (wrap > 0) s = s.match(new RegExp(`.{1,${wrap}}`, 'g'))?.join('\r\n') ?? '';
  return s;
}
export const encodeText = (text, opts) => bytesToB64(te.encode(String(text ?? '')), opts);

/** Decode to bytes. Returns { bytes, mime } or throws SyntaxError with a position a person can find. */
export function decodeB64(input) {
  let s = String(input ?? '');
  let mime = null;
  const data = s.match(/^\s*data:([^;,]*)(?:;[^,]*)?;base64,/i);
  if (data) { mime = data[1] || 'application/octet-stream'; s = s.slice(data[0].length); }
  s = s.replace(/[\s]+/g, '');
  const urlSafe = /[-_]/.test(s);
  if (urlSafe && /[+/]/.test(s)) throw new SyntaxError('mixes standard (+ /) and URL-safe (- _) characters');
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  const firstPad = s.indexOf('=');
  if (firstPad >= 0 && /[^=]/.test(s.slice(firstPad))) throw new SyntaxError(`“=” padding in the middle, at character ${firstPad + 1}`);
  const body = s.replace(/=+$/, '');
  const bad = body.search(/[^A-Za-z0-9+/]/);
  if (bad >= 0) throw new SyntaxError(`“${body[bad]}” at character ${bad + 1} is not Base64`);
  if (body.length % 4 === 1) throw new SyntaxError('one character too many or too few (length cannot be 4n+1)');
  const bin = atob(body + '='.repeat((4 - (body.length % 4)) % 4));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { bytes, mime, urlSafe };
}

/** UTF-8 text, or null when the bytes are not text (then the page offers a download). Control bytes also mean binary. */
export function bytesToText(bytes) {
  let t;
  try { t = td.decode(bytes); } catch { return null; }
  return /[\u0000-\u0008\u000E-\u001F]/.test(t) ? null : t;
}

/** Recognise common file types by their first bytes. */
export function sniff(bytes) {
  const b = bytes, h = (...x) => x.every((v, i) => b[i] === v);
  if (h(0x89, 0x50, 0x4e, 0x47)) return { mime: 'image/png', ext: 'png' };
  if (h(0xff, 0xd8, 0xff)) return { mime: 'image/jpeg', ext: 'jpg' };
  if (h(0x47, 0x49, 0x46, 0x38)) return { mime: 'image/gif', ext: 'gif' };
  if (h(0x52, 0x49, 0x46, 0x46) && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return { mime: 'image/webp', ext: 'webp' };
  if (h(0x25, 0x50, 0x44, 0x46)) return { mime: 'application/pdf', ext: 'pdf' };
  if (h(0x50, 0x4b, 0x03, 0x04)) return { mime: 'application/zip', ext: 'zip' };
  if (h(0x1f, 0x8b)) return { mime: 'application/gzip', ext: 'gz' };
  return { mime: 'application/octet-stream', ext: 'bin' };
}

export const dataUri = (bytes, mime) => `data:${mime || sniff(bytes).mime};base64,${bytesToB64(bytes)}`;
