/* File converter client. One calm surface: drop or choose a file, it converts at once with good defaults, then one big
   Download. Several files queue up. Options re-run the conversion. Everything happens on this computer. */
import { $, $$, track, strings, download } from '../kit.mjs';
import { sniff, kindOf, targetsFor, engineFor, outName, parseTime, defaults, sizeLabel } from './plan.mjs';

const U = strings();
const lang = U.lang || document.documentElement.lang;
const drop = $('#drop'), jobsEl = $('#jobs'), idle = $('#idle'), after = $('#after'), opts = $('#opts'), select = $('#to');
const pageFrom = drop.dataset.from || null;
let to = drop.dataset.to || null;
let from = pageFrom === 'video' ? null : pageFrom; // the real format of the current files, once known
const jobs = [];
let running = false;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const t = (s, vars = {}) => s.replace(/\{(\w+)\}/g, (m, k) => vars[k] ?? m);
const name = (f) => U.names[f] || f.toUpperCase();
const secs = (s) => (s < 60 ? `${Math.max(1, Math.round(s))} s` : `${Math.floor(s / 60)} min ${Math.round(s % 60)} s`);

/* ---------- Target pill ---------- */
function setTargets(fmtKey) {
  const kind = kindOf(fmtKey);
  const list = targetsFor(fmtKey).filter((x) => x !== fmtKey);
  if (!to || !list.includes(to)) to = list[0];
  $('#pill-from').textContent = name(fmtKey);
  select.innerHTML = list.map((x) => `<option value="${x}"${x === to ? ' selected' : ''}>${esc(name(x))}</option>`).join('');
  $('.pill').hidden = false;
  opts.hidden = false;
  showOptions();
  return kind;
}
function showOptions() {
  for (const l of $$('.opts-in label')) {
    const forTo = l.dataset.for.split(' ').includes(to);
    const forFrom = !l.dataset.from || l.dataset.from === from;
    l.hidden = !(forTo && forFrom);
  }
}
function syncUrl() {
  const path = U.pairs[(from || pageFrom) + '>' + to];
  if (path && location.pathname !== path) try { history.replaceState(history.state, '', path); } catch { /* sandboxed */ }
}
select?.addEventListener('change', () => { to = select.value; showOptions(); syncUrl(); track('target_changed', { from, to }); rerun(); });

/* ---------- Options ---------- */
function readOptions() {
  const o = defaults(to), f = opts.querySelector.bind(opts);
  const num = (n) => Number(f(`[name=${n}]`).value);
  if (to === 'mp3' || to === 'm4a') o.bitrate = num('bitrate');
  if (to === 'mp4' || to === 'webm') o.height = num('height');
  if (to === 'gif') { o.width = num('width'); o.fps = num('fps'); }
  if (to === 'jpg' || to === 'webp') o.quality = num('quality');
  if (to === 'png') o.scale = num('scale');
  const s = parseTime(f('[name=start]').value), e = parseTime(f('[name=end]').value);
  if (Number.isFinite(s)) o.start = s;
  if (Number.isFinite(e) && e > (o.start || 0)) { o.end = e; if (to === 'gif') o.maxSeconds = e - (o.start || 0); }
  return o;
}
opts.addEventListener('change', () => rerun());

/* ---------- Jobs ---------- */
function row(job) {
  const li = document.createElement('li');
  li.className = 'job';
  li.innerHTML = `<div class="job-preview" aria-hidden="true"></div><div class="job-main"><p class="job-name">${esc(job.file.name)}</p><p class="job-status" role="status"></p><div class="bar"><i></i></div><p class="job-note"></p></div><div class="job-actions"></div>`;
  jobsEl.append(li);
  return li;
}
function paint(job) {
  const li = job.el, st = li.querySelector('.job-status'), bar = li.querySelector('.bar i'), act = li.querySelector('.job-actions'), note = li.querySelector('.job-note');
  li.dataset.state = job.state;
  bar.style.width = Math.round((job.progress || 0) * 100) + '%';
  note.textContent = job.notice || '';
  if (job.state === 'queued') { st.textContent = U.converting; act.innerHTML = ''; }
  if (job.state === 'working') {
    const p = job.progress || 0, el = (performance.now() - job.started) / 1000;
    st.textContent = p > 0.03 && el > 1.5 ? `${U.converting} ${Math.round(p * 100)}% · ${t(U.left, { t: secs((el * (1 - p)) / p) })}` : job.phase || U.converting;
    if (!act.querySelector('.cancel')) act.innerHTML = `<button type="button" class="link-btn cancel">${esc(U.cancel)}</button>`;
  }
  if (job.state === 'done') {
    st.textContent = `${U.done} · ${t(U.sizes, { a: sizeLabel(job.file.size, lang), b: sizeLabel(job.blob.size, lang) })}`;
    act.innerHTML = `<a class="drop-btn" href="${job.url}" download="${esc(job.outName)}" data-track="file_downloaded" data-to="${job.to}"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 4v11m0 0-5-5m5 5 5-5M4 20h16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>${esc(U.download)}</span></a>`;
    const pv = li.querySelector('.job-preview');
    const k = job.to === 'gif' || ['jpg', 'png', 'webp'].includes(job.to) ? 'img' : ['mp3', 'wav', 'm4a'].includes(job.to) ? 'audio' : 'video';
    pv.innerHTML = k === 'img' ? `<img src="${job.url}" alt="">` : k === 'audio' ? `<audio controls preload="metadata" src="${job.url}"></audio>` : `<video controls muted loop playsinline preload="metadata" src="${job.url}"></video>`;
    pv.querySelector('img, audio, video').setAttribute('aria-label', job.outName);
    pv.removeAttribute('aria-hidden');
  }
  if (job.state === 'error' || job.state === 'canceled') {
    st.textContent = job.state === 'canceled' ? U.canceled : job.error;
    li.querySelector('.job-preview').innerHTML = '';
    act.innerHTML = `<button type="button" class="link-btn retry">${esc(U.retry)}</button>`;
  }
}
jobsEl.addEventListener('click', (e) => {
  const li = e.target.closest('.job'); if (!li) return;
  const job = jobs.find((j) => j.el === li);
  if (e.target.closest('.cancel')) job?.ctrl?.abort();
  if (e.target.closest('.retry')) { job.state = 'queued'; paint(job); pump(); }
});

function errorText(e) {
  const m = String(e?.message || e);
  const [key, arg] = m.split(':');
  if (U.err[key]) return t(U.err[key], { to: name(arg || to || ''), msg: m });
  if (m.startsWith('invalid')) return t(U.err['no-target'], { to: name(to) });
  return t(U.err.generic, { msg: m });
}

async function convert(job) {
  const engine = engineFor(job.fmt, to);
  if (!engine) throw new Error('no-target:' + to);
  const o = readOptions();
  const onProgress = (p) => { job.progress = p; paint(job); };
  if ((engine === 'media' || engine === 'video2gif' || engine === 'gif2video') && !('VideoDecoder' in window && 'AudioEncoder' in window)) throw new Error('no-webcodecs');
  job.phase = U.loading; paint(job);
  const mod = await import(engine === 'image' ? './engines/image.mjs' : engine === 'media' ? './engines/media.mjs' : './engines/gif.mjs');
  job.phase = U.converting; paint(job);
  if (engine === 'image') return mod.convertImage(job.file, job.fmt, to, o, onProgress);
  if (engine === 'video2gif') return mod.videoToGif(job.file, o, onProgress, job.ctrl.signal);
  if (engine === 'gif2video') return mod.gifToVideo(job.file, to, o, onProgress, job.ctrl.signal);
  return mod.convertMedia(job.file, to, o, onProgress, job.ctrl.signal);
}

async function pump() {
  if (running) return;
  running = true;
  for (let job; (job = jobs.find((j) => j.state === 'queued'));) {
    job.state = 'working'; job.progress = 0; job.started = performance.now(); job.ctrl = new AbortController(); job.notice = '';
    if (job.url) { URL.revokeObjectURL(job.url); job.url = null; }
    paint(job);
    const timer = setInterval(() => job.state === 'working' && paint(job), 1000);
    try {
      const r = await convert(job);
      job.blob = r.blob; job.to = r.to; job.outName = outName(job.file.name, r.to); job.url = URL.createObjectURL(r.blob);
      job.notice = r.notice ? t(U.notice[r.notice] || '', { s: String(readOptions().maxSeconds || 15) }) : '';
      job.state = 'done';
      track('file_converted', { from: job.fmt, to: r.to, engine: engineFor(job.fmt, to), ms: Math.round(performance.now() - job.started), mb: Math.round(job.file.size / 1048576) });
    } catch (e) {
      job.state = job.requeue ? 'queued' : e?.name === 'AbortError' || job.ctrl.signal.aborted ? 'canceled' : 'error';
      job.requeue = false;
      job.error = errorText(e);
      if (job.state === 'error') track('conversion_failed', { from: job.fmt, to, reason: String(e?.message || e).slice(0, 60) });
    }
    clearInterval(timer);
    paint(job);
  }
  running = false;
  const done = jobs.filter((j) => j.state === 'done');
  after.hidden = !jobs.length;
  $('#all').hidden = done.length < 2;
}

function rerun() {
  let any = false;
  /* A conversion already running uses the old settings: stop it and run it again with the new ones. */
  for (const j of jobs) if (j.state === 'working') { j.requeue = true; j.ctrl?.abort(); any = true; }
  for (const j of jobs) if (j.state === 'done' || j.state === 'error' || j.state === 'canceled') { j.state = 'queued'; paint(j); any = true; }
  if (any) pump();
}

async function take(files) {
  files = [...files].filter((f) => f.size > 0);
  if (!files.length) return;
  $('#pick-target').hidden = true;
  const entries = [];
  for (const file of files) entries.push({ file, fmt: sniff(new Uint8Array(await file.slice(0, 1024).arrayBuffer()), file.name) });
  const known = entries.filter((e) => e.fmt);
  for (const e of entries.filter((x) => !x.fmt)) { const job = { file: e.file, fmt: null, state: 'error', error: U.err.unsupported, progress: 0 }; job.el = row(job); jobs.push(job); paint(job); }
  if (!known.length) { idle.hidden = true; after.hidden = false; return; }
  from = known[0].fmt;
  setTargets(from);
  /* On the directory page with nothing chosen yet, ask once where to; on pair pages, go straight away. */
  if (!drop.dataset.to && !drop.dataset.chosen) {
    idle.hidden = true;
    $('.pill').hidden = true; // one decision at a time: the buttons below
    opts.hidden = true;
    const box = $('#targets');
    box.innerHTML = targetsFor(from).filter((x) => x !== from).map((x) => `<button type="button" class="drop-btn drop-btn-sm" data-to="${x}">${esc(name(x))}</button>`).join('');
    $('#pick-target').hidden = false;
    box.onclick = (ev) => { const b = ev.target.closest('[data-to]'); if (!b) return; to = b.dataset.to; drop.dataset.chosen = '1'; select.value = to; $('.pill').hidden = false; opts.hidden = false; showOptions(); syncUrl(); $('#pick-target').hidden = true; queue(known); };
    return;
  }
  queue(known);
}
function queue(entries) {
  idle.hidden = true;
  drop.classList.add('has-jobs'); // the result card and the pill now say what happens
  for (const e of entries) { const job = { file: e.file, fmt: e.fmt, state: 'queued', progress: 0 }; job.el = row(job); jobs.push(job); paint(job); }
  after.hidden = false;
  syncUrl();
  pump();
}

$('#file').addEventListener('change', (e) => { take(e.target.files); e.target.value = ''; });
$('#another').addEventListener('click', () => {
  for (const j of jobs) { j.ctrl?.abort(); if (j.url) URL.revokeObjectURL(j.url); }
  jobs.length = 0; jobsEl.innerHTML = ''; after.hidden = true; idle.hidden = false; $('#pick-target').hidden = true; drop.classList.remove('has-jobs');
  $('#file').focus();
});
$('#all').addEventListener('click', () => { for (const j of jobs.filter((x) => x.state === 'done')) download(j.outName, j.blob); });

/* Drop anywhere on the page. */
let depth = 0;
addEventListener('dragenter', (e) => { if ([...(e.dataTransfer?.types || [])].includes('Files')) { depth++; document.body.classList.add('dragging'); } });
addEventListener('dragleave', () => { if (--depth <= 0) { depth = 0; document.body.classList.remove('dragging'); } });
addEventListener('dragover', (e) => { if ([...(e.dataTransfer?.types || [])].includes('Files')) e.preventDefault(); });
addEventListener('drop', (e) => {
  if (!e.dataTransfer?.files?.length) return;
  e.preventDefault(); depth = 0; document.body.classList.remove('dragging');
  take(e.dataTransfer.files);
  scrollTo({ top: 0, behavior: 'smooth' });
});

if (pageFrom && pageFrom !== 'video') setTargets(pageFrom);
else if (pageFrom === 'video') { setTargets('mp4'); $('#pill-from').textContent = name('video'); }
showOptions();
