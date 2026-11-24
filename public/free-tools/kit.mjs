/* kit.mjs: small helpers every free tool shares. Analytics go through window.__zdarzenie from app.mjs. */
export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];
export const track = (name, props) => { try { window.__zdarzenie && window.__zdarzenie(name, props); } catch { /* never breaks a tool */ } };

/** Page strings for the client, from <script type="application/json" id="i18n"> (data, not code, so CSP allows it). */
export const strings = () => { try { return JSON.parse($('#i18n')?.textContent || '{}'); } catch { return {}; } };

let toastEl, toastTimer;
export function toast(text, ms = 1800) {
  if (!toastEl) { toastEl = Object.assign(document.createElement('div'), { className: 'toast', role: 'status' }); toastEl.setAttribute('aria-live', 'polite'); document.body.append(toastEl); }
  toastEl.textContent = text; toastEl.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove('show'), ms);
}

export async function copy(text, done = 'Copied') {
  try { await navigator.clipboard.writeText(text); }
  catch {
    const t = Object.assign(document.createElement('textarea'), { value: text }); t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
    document.body.append(t); t.select(); try { document.execCommand('copy'); } finally { t.remove(); }
  }
  toast(done);
}

export async function paste() { try { return await navigator.clipboard.readText(); } catch { return null; } }

export function download(name, data, type = 'application/octet-stream') {
  const url = URL.createObjectURL(data instanceof Blob ? data : new Blob([data], { type }));
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export const fmt = (n, lang) => new Intl.NumberFormat(lang === 'pl' ? 'pl-PL' : 'en-US').format(n);
export const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
