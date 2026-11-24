/* app.mjs: PostHog with the pinned SDK from ciunkos.com/vendor (SRI), traffic through our own proxy, data-track events.
   No inline code in HTML (CSP). Copied from ~/business-tools/public/a/app.mjs; app = free-tools, page = tool id. */
const WERSJA = new URL(import.meta.url).searchParams.get('v') || 'dev';
let ph = null;
(function initPostHog() {
  const tag = document.querySelector('script[data-posthog-config]');
  let cfg = null;
  try { cfg = JSON.parse(tag.getAttribute('data-posthog-config') || 'null'); } catch (e) { /* brak konfiguracji */ }
  if (!cfg || !cfg.projectToken || !cfg.host || !cfg.sdk) return;
  /* Bez automatów (Playwright i Selenium ustawiają navigator.webdriver) i z oznaczeniem właściciela:
     ?i=1 zapisuje w tej przeglądarce znacznik ph_internal, ?i=0 go usuwa; zdarzenia dostają internal: true. */
  if (navigator.webdriver) return;
  /* Opt-out z ciunkos.com/privacy (wspólny localStorage domeny): bez PostHoga w ogóle. Tylko odczyt. */
  try { if (localStorage.getItem('ph_optout') === '1') return; } catch (e) { /* prywatne okno */ }
  let phWewn = false;
  try {
    const phI = new URLSearchParams(location.search).get('i');
    if (phI === '1') localStorage.setItem('ph_internal', '1'); else if (phI === '0') localStorage.removeItem('ph_internal');
    phWewn = localStorage.getItem('ph_internal') === '1';
    if (phI === '1' || phI === '0') { const u = new URL(location.href); u.searchParams.delete('i'); history.replaceState(history.state, '', u.pathname + u.search + u.hash); }
  } catch (e) { /* prywatne okno */ }
  const p = window.posthog = window.posthog || [];
  if (p.__SV) return;
  p._i = [];
  ['capture', 'identify', 'register', 'on'].forEach((m) => { p[m] = function () { p.push([m].concat([].slice.call(arguments))); }; });
  p.init = function (token, opts) {
    const s = document.createElement('script'); s.async = true; s.crossOrigin = 'anonymous'; s.integrity = cfg.sdk.integrity; s.src = cfg.sdk.src;
    const dodaj = () => document.head.appendChild(s);
    if (document.readyState === 'complete') setTimeout(dodaj, 800); else addEventListener('load', () => setTimeout(dodaj, 800), { once: true });
    p._i.push([token, opts]);
  };
  p.__SV = 1;
  const host = new URL(cfg.host, location.origin).href.replace(/\/$/, '');
  p.init(cfg.projectToken, {
    api_host: host, ui_host: cfg.ui || 'https://eu.posthog.com', defaults: '2026-05-30',
    respect_dnt: true,
    persistence: 'localStorage', capture_pageview: false, capture_pageleave: true,
    autocapture: { dom_event_allowlist: ['click'], element_allowlist: ['a', 'button', 'summary'] },
    disable_surveys: true, disable_external_dependency_loading: true,
    /* Stan formularzy siedzi w # i w pamięci przeglądarki: URL-e bez query i hasha, bez nagrań sesji. */
    disable_session_recording: true,
    before_send: (ev) => { try { const p = ev && ev.properties; if (p) for (const k of ['$current_url', '$referrer', '$prev_pageview_pathname']) if (typeof p[k] === 'string' && p[k].startsWith(location.origin)) p[k] = p[k].replace(/[?#].*$/, ''); } catch (e) { /* cisza */ } return ev; },
    capture_exceptions: true, capture_performance: { web_vitals: true },
    loaded: (x) => { try { if (phWewn) x.register({ internal: true }); else x.unregister('internal'); x.register({ app: 'free-tools', tool: document.documentElement.dataset.page, wersja: WERSJA, page: document.documentElement.dataset.page, lang: document.documentElement.lang, mobile: matchMedia('(pointer: coarse)').matches }); x.capture('$pageview'); } catch (e) { /* telemetria nie może zepsuć strony */ } }
  });
  ph = p;
})();
export function zdarzenie(nazwa, props) {
  try { const p = window.posthog; if (ph && p && p.capture) p.capture(nazwa, props || {}); } catch (e) { /* cisza */ }
}
window.__zdarzenie = zdarzenie;
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-track]');
  if (!el) return;
  const props = {};
  for (const [k, v] of Object.entries(el.dataset)) if (k !== 'track') props[k] = v;
  zdarzenie(el.dataset.track, props);
});
