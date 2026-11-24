/* White screen client: full screen (with an iPhone fallback), idle-hiding controls, shades, wake lock, keyboard,
   PNG downloads of any size and the click-to-load video. No dependencies; events go through window.__zdarzenie (app.mjs). */
import { solidPng, fileName, checkSize, MAX_SIDE } from './png.mjs';

const $ = (s, el = document) => el.querySelector(s);
const track = (name, props) => { try { window.__zdarzenie && window.__zdarzenie(name, props); } catch { /* analytics never breaks the tool */ } };
const stage = $('#stage');
const fsBtn = $('#fs-btn');
const toast = $('#stage-toast');
const touch = matchMedia('(pointer: coarse)').matches;

/* ---------- Full screen ---------- */
const nativeFs = !!(stage.requestFullscreen || stage.webkitRequestFullscreen);
const fsElement = () => document.fullscreenElement || document.webkitFullscreenElement || null;
const isFs = () => fsElement() === stage || stage.classList.contains('is-pseudo');
let enteredAt = 0;

async function enter(how) {
  if (isFs()) return;
  enteredAt = Date.now();
  try {
    if (stage.requestFullscreen) await stage.requestFullscreen({ navigationUI: 'hide' });
    else if (stage.webkitRequestFullscreen) stage.webkitRequestFullscreen();
    else pseudo(true, true);
  } catch { pseudo(true, false); }
  track('fullscreen_entered', { how, mode: nativeFs ? 'native' : 'pseudo', tint: stage.dataset.tint });
}
async function exit() {
  if (stage.classList.contains('is-pseudo')) { pseudo(false); return; }
  try { if (document.exitFullscreen) await document.exitFullscreen(); else if (document.webkitExitFullscreen) document.webkitExitFullscreen(); } catch { /* already out */ }
}
const toggle = (how) => (isFs() ? exit() : enter(how));

/* iPhone: no element full screen in Safari. Cover the viewport, lock scrolling, and tell people once about Add to Home Screen. */
function pseudo(on, noApi = false) {
  stage.classList.toggle('is-pseudo', on);
  document.documentElement.classList.toggle('lock', on);
  if (on) {
    scrollTo(0, 0);
    /* No Fullscreen API at all (iPhone): explain Add to Home Screen once. Refused by the browser (in-app browsers, policies): just how to exit. */
    let seen = !noApi;
    if (noApi) try { seen = localStorage.getItem('ws_ios_tip') === '1'; localStorage.setItem('ws_ios_tip', '1'); } catch { /* private mode */ }
    show(seen ? (touch ? toast.dataset.touch : toast.dataset.desk) : toast.dataset.ios, seen ? 3000 : 7000);
  }
  changed();
}

function changed() {
  const on = isFs();
  stage.classList.toggle('is-fs', on && !stage.classList.contains('is-pseudo'));
  fsBtn.querySelector('.fs-label').textContent = on ? fsBtn.dataset.labelExit : fsBtn.dataset.labelEnter;
  if (on) { wake(true); if (!stage.classList.contains('is-pseudo')) show(touch ? toast.dataset.touch : toast.dataset.desk, 2600); activity(true); }
  else { wake(false); hideToast(); activity(); }
}
document.addEventListener('fullscreenchange', changed);
document.addEventListener('webkitfullscreenchange', changed);

/* ---------- Toast ---------- */
let toastTimer;
function show(text, ms) { toast.textContent = text; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(hideToast, ms); }
function hideToast() { toast.classList.remove('show'); }

/* ---------- Idle: controls and cursor fade out, the surface stays pure colour ---------- */
let idleTimer;
const idleAfter = () => (isFs() ? 1600 : 3200);
function activity(fromFs) {
  stage.classList.remove('is-idle');
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    /* Keyboard users keep the controls while focus is inside them. */
    if (stage.contains(document.activeElement) && document.activeElement !== stage && document.activeElement.matches(':focus-visible')) return activity();
    stage.classList.add('is-idle');
  }, fromFs === true ? 1800 : idleAfter());
}
let lastMove = 0;
stage.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse' && e.timeStamp - lastMove > 60) { lastMove = e.timeStamp; activity(); } });
stage.addEventListener('focusin', () => activity());
activity();

/* Click or tap on the surface: when idle on touch, the first tap only brings the controls back. Outside full screen it enters. */
stage.addEventListener('click', (e) => {
  if (e.target.closest('.dock, .stage-top, .stage-more')) return;
  const wasIdle = stage.classList.contains('is-idle');
  activity();
  if (e.detail > 1) return;
  if (isFs()) return;
  if (touch && wasIdle) return;
  enter('surface');
});
stage.addEventListener('dblclick', (e) => {
  if (e.target.closest('.dock, .stage-top, .stage-more')) return;
  if (isFs() && Date.now() - enteredAt > 600) exit(); else if (!isFs()) enter('dblclick');
});
fsBtn.addEventListener('click', () => toggle('button'));
for (const a of document.querySelectorAll('[data-fs-jump]')) a.addEventListener('click', (e) => { e.preventDefault(); enter('steps'); });

/* ---------- Keyboard ---------- */
document.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey || (e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable]'))) return;
  if (e.key === 'f' || e.key === 'F') { e.preventDefault(); toggle('key'); }
  else if (e.key === 'Escape' && stage.classList.contains('is-pseudo')) pseudo(false);
  else if (/^[1-4]$/.test(e.key) && (isFs() || stage.getBoundingClientRect().bottom > innerHeight / 2)) { setTint(TINTS[+e.key - 1], 'key'); activity(); }
});

/* ---------- Shades ---------- */
const tintBtns = [...stage.querySelectorAll('.tint')];
const TINTS = tintBtns.map((b) => b.dataset.tint);
function setTint(id, how) {
  if (!TINTS.includes(id)) id = 'white';
  stage.dataset.tint = id;
  for (const b of tintBtns) b.setAttribute('aria-checked', String(b.dataset.tint === id));
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = getComputedStyle(stage).getPropertyValue('--tint').trim() || '#ffffff';
  try { history.replaceState(history.state, '', id === 'white' ? location.pathname + location.search : '#' + id); } catch { /* sandboxed */ }
  if (how) track('tint_changed', { tint: id, how });
}
tintBtns.forEach((b, i) => {
  b.addEventListener('click', () => setTint(b.dataset.tint, 'click'));
  b.addEventListener('keydown', (e) => {
    const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!d) return;
    e.preventDefault(); const n = tintBtns[(i + d + tintBtns.length) % tintBtns.length]; n.focus(); setTint(n.dataset.tint, 'key');
  });
});
tintBtns.forEach((b) => (b.tabIndex = b.getAttribute('aria-checked') === 'true' ? 0 : -1));
const roving = () => tintBtns.forEach((b) => (b.tabIndex = b.getAttribute('aria-checked') === 'true' ? 0 : -1));
new MutationObserver(roving).observe(stage, { attributes: true, attributeFilter: ['data-tint'] });
const fromHash = location.hash.slice(1);
if (TINTS.includes(fromHash) && fromHash !== 'white') setTint(fromHash);

/* ---------- Wake lock: keep the screen on while it is a white light ---------- */
let lock = null;
async function wake(on) {
  try {
    if (on && 'wakeLock' in navigator && !lock) { lock = await navigator.wakeLock.request('screen'); lock.addEventListener('release', () => { lock = null; }); }
    else if (!on && lock) { await lock.release(); lock = null; }
  } catch { lock = null; }
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && isFs()) wake(true); });

/* ---------- Download a white PNG ---------- */
const form = $('#dl');
if (form) {
  const w = $('#dl-w'), h = $('#dl-h'), name = $('#dl-name'), note = $('#dl-note'), prev = $('#dl-preview span'), btn = $('#dl-btn');
  const size = () => [Number(w.value), Number(h.value)];
  const valid = ([x, y]) => { try { checkSize(x, y); return true; } catch { return false; } };
  function sync() {
    const [x, y] = size(), ok = valid([x, y]);
    w.setAttribute('aria-invalid', String(!(Number.isInteger(x) && x >= 1 && x <= MAX_SIDE)));
    h.setAttribute('aria-invalid', String(!(Number.isInteger(y) && y >= 1 && y <= MAX_SIDE)));
    if (ok) { name.textContent = fileName(x, y); const k = 88 / Math.max(x, y); prev.style.width = Math.max(6, x * k) + 'px'; prev.style.height = Math.max(6, y * k) + 'px'; note.textContent = ''; note.classList.remove('err'); }
    btn.disabled = !ok;
  }
  form.addEventListener('change', (e) => {
    if (e.target.name === 'size') { w.value = e.target.dataset.w; h.value = e.target.dataset.h; }
    sync();
  });
  for (const i of [w, h]) i.addEventListener('input', () => { for (const r of form.querySelectorAll('input[name=size]')) r.checked = r.dataset.w === w.value && r.dataset.h === h.value; sync(); });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const [x, y] = size();
    if (!valid([x, y])) { note.textContent = note.dataset.err; note.classList.add('err'); return; }
    btn.disabled = true;
    try {
      const bytes = await solidPng(x, y);
      const url = URL.createObjectURL(new Blob([bytes], { type: 'image/png' }));
      const a = Object.assign(document.createElement('a'), { href: url, download: fileName(x, y) });
      document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      note.textContent = `${note.dataset.made}: ${fileName(x, y)} (${(bytes.length / 1024).toFixed(bytes.length < 10240 ? 1 : 0)} KB)`;
      track('image_downloaded', { size: x + 'x' + y, how: 'generated', preset: form.querySelector('input[name=size]:checked')?.value || 'custom' });
    } catch (err) { note.textContent = String(err.message || err); note.classList.add('err'); }
    btn.disabled = false;
  });
  sync();
}

/* ---------- Video: a facade until play, then a privacy-enhanced YouTube frame that loops ---------- */
const box = $('#video-box');
if (box) {
  const opts = [...document.querySelectorAll('.video-opt')];
  const poster = $('#video-play');
  const len = $('#video-len');
  function play() {
    const id = box.dataset.yt;
    const f = document.createElement('iframe');
    f.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&loop=1&playlist=${encodeURIComponent(id)}&rel=0&playsinline=1`;
    f.title = opts.find((o) => o.dataset.yt === id)?.dataset.name || 'White screen video';
    f.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
    f.allowFullscreen = true;
    f.referrerPolicy = 'strict-origin-when-cross-origin';
    box.replaceChildren(f);
    track('video_played', { video: id });
  }
  poster.addEventListener('click', play);
  opts.forEach((o) => o.addEventListener('click', () => {
    opts.forEach((x) => x.setAttribute('aria-checked', String(x === o)));
    const playing = !!box.querySelector('iframe');
    box.dataset.yt = o.dataset.yt;
    if (playing) play();
    else { len.textContent = o.dataset.len; poster.setAttribute('aria-label', poster.getAttribute('aria-label').replace(/:.*/, ': ' + o.dataset.name)); }
  }));
}
