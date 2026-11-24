/* Base64 client: two live panes. Typing in Text encodes into Base64; typing in Base64 decodes into Text, or into a
   file preview and download when the bytes are not text. Files are read locally. Nothing is sent anywhere. */
import { $, $$, track, strings, copy, paste, download, fmt, debounce } from '../kit.mjs';
import { encodeText, decodeB64, bytesToText, bytesToB64, sniff, dataUri } from './b64.mjs';

const U = strings();
const lang = U.lang || document.documentElement.lang;
const text = $('#b64-text'), code = $('#b64-code'), err = $('#b64-error');
const url = $('#b64-url'), pad = $('#b64-pad'), wrap = $('#b64-wrap');
const bin = $('#b64-bin'), preview = $('#b64-preview');
const n = (x) => fmt(x, lang);
const size = (b) => (b < 1024 ? `${n(b)} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`);
const opts = () => ({ url: url.checked, pad: pad.checked, wrap: wrap.checked ? 76 : 0 });

let file = null; /* { name, bytes } while a file is the source */
let decoded = null; /* bytes of the last binary decode */
let previewUrl = null;
let tracked = {};
const once = (k, props) => { if (!tracked[k]) { tracked[k] = 1; track(k, props); } };

function direction(enc) {
  const d = $('#b64-dir');
  d.classList.toggle('decode', !enc);
  d.setAttribute('aria-label', enc ? U.dirEncode : U.dirDecode);
}
function feet() {
  const tb = new TextEncoder().encode(text.value).length;
  $('#b64-text-foot').textContent = file ? U.encodedFile.replace('{name}', file.name).replace('{size}', size(file.bytes.length)) : `${U.chars.replace('{n}', n([...text.value].length))} · ${U.bytes.replace('{n}', n(tb))}`;
  $('#b64-code-foot').textContent = U.chars.replace('{n}', n(code.value.replace(/\s/g, '').length));
}
function showBinary(bytes, mime) {
  decoded = bytes;
  const t = sniff(bytes);
  $('#b64-bin-text').textContent = U.binary.replace('{size}', size(bytes.length)).replace('{type}', (mime || t.mime));
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  const isImg = /^image\/(png|jpeg|gif|webp)$/.test(mime || t.mime);
  previewUrl = isImg ? URL.createObjectURL(new Blob([bytes], { type: mime || t.mime })) : null;
  preview.hidden = !isImg; if (isImg) preview.src = previewUrl;
  bin.hidden = false;
}

function encode() {
  file = null; bin.hidden = true; err.hidden = true; $('#b64-datauri').hidden = true; text.readOnly = false;
  code.value = encodeText(text.value, opts());
  direction(true); feet();
  if (text.value) once('base64_encoded', {});
}
function decodeNow() {
  file = null; text.readOnly = false; $('#b64-datauri').hidden = true;
  const v = code.value;
  direction(false);
  if (!v.trim()) { text.value = ''; err.hidden = true; bin.hidden = true; feet(); return; }
  try {
    const { bytes, mime } = decodeB64(v);
    const t = bytesToText(bytes);
    err.hidden = true;
    if (t === null) { text.value = ''; showBinary(bytes, mime); }
    else { text.value = t; bin.hidden = true; }
    once('base64_decoded', { binary: t === null });
  } catch (e) {
    err.hidden = false; err.textContent = U.invalid.replace('{why}', e.message);
  }
  feet();
}

text.addEventListener('input', encode);
code.addEventListener('input', debounce(decodeNow, 60));
for (const o of [url, pad, wrap]) o.addEventListener('change', () => { if (file) encodeFile(file); else if (text.value || !code.value) encode(); });

async function encodeFile(f) {
  file = f;
  code.value = bytesToB64(f.bytes, opts());
  text.value = ''; text.readOnly = true; err.hidden = true;
  showBinary(f.bytes, f.type);
  $('#b64-datauri').hidden = false;
  direction(true); feet();
}
async function takeFile(f) {
  if (!f) return;
  if (f.size > 50 * 1048576) { err.hidden = false; err.textContent = U.tooBig; return; }
  await encodeFile({ name: f.name, type: f.type, bytes: new Uint8Array(await f.arrayBuffer()) });
  track('base64_file_encoded', { type: f.type || 'unknown' });
}
$('#b64-file').addEventListener('change', (e) => takeFile(e.target.files[0]));
const box = $('#b64');
box.addEventListener('dragover', (e) => { if ([...e.dataTransfer.types].includes('Files')) { e.preventDefault(); box.classList.add('drag'); } });
box.addEventListener('dragleave', (e) => { if (!box.contains(e.relatedTarget)) box.classList.remove('drag'); });
box.addEventListener('drop', (e) => { if (e.dataTransfer.files.length) { e.preventDefault(); box.classList.remove('drag'); takeFile(e.dataTransfer.files[0]); } });

$('#b64-datauri').addEventListener('click', () => file && copy(dataUri(file.bytes, file.type || undefined), U.copied));
$('#b64-download').addEventListener('click', () => {
  const bytes = file ? file.bytes : decoded; if (!bytes) return;
  const t = sniff(bytes);
  download(file ? file.name : `decoded.${t.ext}`, new Blob([bytes], { type: t.mime }));
});
for (const b of $$('[data-copy]')) b.addEventListener('click', () => copy(b.dataset.copy === 'text' ? text.value : code.value, U.copied));
for (const b of $$('[data-clear]')) b.addEventListener('click', () => { text.value = ''; code.value = ''; file = null; decoded = null; bin.hidden = true; $('#b64-bin-text').textContent = ''; preview.hidden = true; err.hidden = true; text.readOnly = false; $('#b64-datauri').hidden = true; feet(); (b.dataset.clear === 'text' ? text : code).focus(); });
for (const b of $$('[data-paste]')) b.addEventListener('click', async () => {
  const t = await paste(); const el = b.dataset.paste === 'text' ? text : code;
  if (t == null) { el.focus(); return; }
  el.value = t; if (el === text) encode(); else decodeNow();
});
feet();
