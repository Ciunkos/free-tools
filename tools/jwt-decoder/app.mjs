/* JWT decoder client: decode as you type, explain claims, verify the signature. The token never leaves this tab:
   no network calls, no storage, nothing in the URL. */
import { $, $$, track, strings, copy, paste, debounce } from '../kit.mjs';
import { decode, claims, verify, isHmac, SUPPORTED, bytesToB64url } from './jwt.mjs';

const U = strings();
const lang = U.lang || document.documentElement.lang;
const input = $('#jwt-in'), out = $('#jwt-out'), err = $('#jwt-error');
const keyEl = $('#jwt-key'), b64 = $('#jwt-b64');
let current = null;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const tr = (msg) => {
  if (lang !== 'pl') return msg;
  if (U.errors[msg]) return U.errors[msg];
  let m = msg.match(/^A JWT has 3 parts separated by dots; this has (\d+)\.$/);
  if (m) return `JWT ma 3 części oddzielone kropkami; ten ma ${m[1]}.`;
  m = msg.match(/^The (header|payload) is not valid base64url: (.*)\.$/);
  if (m) return `${m[1] === 'header' ? 'Nagłówek' : 'Payload'} nie jest poprawnym Base64url: ${m[2].replace(/invalid character (.*) at position (\d+)/, 'niedozwolony znak $1 na pozycji $2').replace('invalid length', 'zła długość')}.`;
  return msg;
};

/* JSON with light syntax colouring (spans only, text escaped). */
function pretty(obj) {
  return esc(JSON.stringify(obj, null, 2)).replace(/(&quot;(?:[^&]|&(?!quot;))*?&quot;)(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g, (m, str, colon, lit, num) => {
    if (str) return colon ? `<span class="j-key">${str}</span>${colon}` : `<span class="j-str">${str}</span>`;
    if (lit) return `<span class="j-lit">${lit}</span>`;
    return `<span class="j-num">${num}</span>`;
  });
}

const dateFmt = new Intl.DateTimeFormat(lang === 'pl' ? 'pl-PL' : 'en-GB', { dateStyle: 'medium', timeStyle: 'medium' });
function rel(sec) {
  if (Math.abs(sec) < 5) return U.now;
  const a = Math.abs(sec), u = U.units;
  const parts = a >= 86400 ? [[Math.floor(a / 86400), u.d], [Math.floor((a % 86400) / 3600), u.h]] : a >= 3600 ? [[Math.floor(a / 3600), u.h], [Math.floor((a % 3600) / 60), u.m]] : a >= 60 ? [[Math.floor(a / 60), u.m], [a % 60, u.s]] : [[a, u.s]];
  const t = parts.filter(([n], i) => n || i === 0).map(([n, x]) => n + ' ' + x).join(' ');
  return (sec >= 0 ? U.in : U.ago).replace('{t}', t);
}
const fill = (tpl, date, sec) => tpl.replace('{when}', dateFmt.format(date)).replace('{rel}', rel(sec));

function renderStatus(d, c) {
  const now = Math.floor(Date.now() / 1000), p = d.payload || {};
  const el = $('#jwt-status');
  const map = { valid: ['ok', U.valid, fill(U.expiresIn, new Date(p.exp * 1000), p.exp - now)], expired: ['bad', U.expired, fill(U.expiredAgo, new Date(p.exp * 1000), p.exp - now)], 'not-yet-valid': ['warn', U.notYet, typeof p.nbf === 'number' ? fill(U.startsIn, new Date(p.nbf * 1000), p.nbf - now) : ''], 'no-expiry': ['warn', U.noExp, U.never] };
  const [cls, label, text] = map[c.status];
  el.className = 'jwt-status ' + cls;
  el.innerHTML = `<strong>${esc(label)}</strong><span>${esc(text)}</span>`;
  $('#jwt-warn').innerHTML = c.warnings.filter((w) => w !== 'not-yet-valid' || c.status !== 'not-yet-valid').filter((w) => w !== 'no-exp').map((w) => `<li>${esc(U.warn[w] || w)}</li>`).join('');
}

function renderClaims(c) {
  const now = Math.floor(Date.now() / 1000);
  $('#jwt-claims').innerHTML = c.rows.map((r) => {
    let v = typeof r.value === 'string' ? esc(r.value) : `<code>${esc(JSON.stringify(r.value))}</code>`;
    if (r.kind === 'time') v = `<code>${r.value}</code><br><span class="jwt-time">${esc(dateFmt.format(r.date))} · ${esc(rel(r.value - now))}</span>`;
    return `<tr><th scope="row"><code>${esc(r.key)}</code></th><td>${v}</td><td>${esc(U.means[r.key] || '')}</td></tr>`;
  }).join('');
}

function setupVerify(d) {
  const alg = d.header?.alg || '?';
  $('#jwt-alg').textContent = alg;
  const hmac = isHmac(alg);
  $('#jwt-key-label').textContent = hmac ? U.secret : U.publicKey;
  keyEl.placeholder = hmac ? U.secretPh : U.keyPh;
  $('#jwt-b64-wrap').hidden = !hmac;
  if (!SUPPORTED.includes(alg) && String(alg).toLowerCase() !== 'none') { $('#jwt-vres').textContent = U.unsupported; keyEl.disabled = true; }
  else keyEl.disabled = false;
}

let vSeq = 0;
async function runVerify() {
  const res = $('#jwt-vres'), short = $('#jwt-vres-short');
  if (!current || current.errors.length) return;
  const key = keyEl.value;
  if (!key.trim()) { res.textContent = ''; res.className = 'jwt-vres'; short.textContent = ''; return; }
  const seq = ++vSeq;
  const r = await verify(current.token, key, { secretBase64: b64.checked });
  if (seq !== vSeq) return;
  const text = r.ok ? U.ok : r.reason ? `${U.bad}: ${r.reason}` : U.bad;
  res.textContent = text; res.className = 'jwt-vres ' + (r.ok ? 'ok' : 'bad');
  short.textContent = r.ok ? '✓' : '✗'; short.className = 'jwt-vres ' + (r.ok ? 'ok' : 'bad');
  track('jwt_verified', { ok: r.ok, alg: r.alg || '' });
}
const verifySoon = debounce(runVerify, 150);

let tracked = false;
function update() {
  const raw = input.value;
  $('#jwt-note').textContent = '';
  if (!raw.trim()) { out.hidden = true; err.hidden = true; current = null; return; }
  const d = decode(raw);
  current = d;
  if (d.errors.length && !d.header && !d.payload) { out.hidden = true; err.hidden = false; err.textContent = tr(d.errors[0]); return; }
  err.hidden = !d.errors.length; err.textContent = d.errors.map(tr).join(' ');
  out.hidden = false;
  $('#jwt-header').innerHTML = d.header ? pretty(d.header) : '';
  $('#jwt-payload').innerHTML = d.payload ? pretty(d.payload) : '';
  const c = claims(d.header, d.payload);
  renderStatus(d, c);
  renderClaims(c);
  setupVerify(d);
  verifySoon();
  if (!tracked) { tracked = true; track('jwt_decoded', { alg: d.header?.alg || '', status: c.status }); }
}

input.addEventListener('input', debounce(update, 60));
keyEl.addEventListener('input', verifySoon);
b64.addEventListener('change', runVerify);
$('#jwt-clear').addEventListener('click', () => { input.value = ''; keyEl.value = ''; update(); input.focus(); });
$('#jwt-paste').addEventListener('click', async () => { const t = await paste(); if (t != null) { input.value = t; update(); } else input.focus(); });
for (const b of $$('[data-copy]')) b.addEventListener('click', () => current && copy(JSON.stringify(current[b.dataset.copy], null, 2), U.copied));

/* A sample token signed here with a known secret, valid for an hour from now. */
$('#jwt-sample').addEventListener('click', async () => {
  const te = new TextEncoder(), now = Math.floor(Date.now() / 1000);
  const enc = (o) => bytesToB64url(te.encode(JSON.stringify(o)));
  const head = enc({ alg: 'HS256', typ: 'JWT' });
  const body = enc({ iss: 'https://auth.example.com', sub: 'user_8f3a2c', aud: 'api.example.com', name: 'Jan Kowalski', email: 'jan@example.com', roles: ['editor'], iat: now, exp: now + 3600 });
  const k = await crypto.subtle.importKey('raw', te.encode('ciunkos-sample-secret'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = bytesToB64url(new Uint8Array(await crypto.subtle.sign('HMAC', k, te.encode(head + '.' + body))));
  input.value = `${head}.${body}.${sig}`;
  keyEl.value = '';
  update();
  $('#jwt-note').textContent = U.sampleNote;
});

update();
