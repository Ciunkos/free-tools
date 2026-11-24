/* Free tools: a Cloudflare Worker on ciunkos.com paths /free-tools* (EN) and /darmowe-narzedzia* (PL).
   Static pages from public/<path>.html, assets under /free-tools/a/, sitemap and llms.txt at /free-tools/sitemap.xml
   and /free-tools/llms.txt. No API beyond health: every tool runs in the browser and nothing the user does leaves it
   (except anonymous analytics without any tool input). Pattern: ~/business-tools/_worker.js. */
import { STRONY, APEX, ASSETY, API, HUB, LANGS, innyLang } from './src/meta.mjs';
import { WERSJA, ROZMIARY } from './src/wersja.mjs';
import { POSTHOG_SDK } from './src/shared/posthog-sdk.mjs'; // copy from ciunkos.com/src/utils (check-posthog-copies.mjs)

const OGONKI = /(?:[)\]}>.,;:!?'"„”»…]|%29|%5D|%7D|%3E|%2E|%2C|%3B|%3A|%21|%3F|%27|%22)+\/?$/i;

function phConfigJson(env) {
  return JSON.stringify({ projectToken: env.POSTHOG_PROJECT_TOKEN || '', sdk: POSTHOG_SDK, host: env.POSTHOG_PROJECT_TOKEN ? ASSETY + '/ph' : '', ui: (env.POSTHOG_HOST || 'https://eu.i.posthog.com').replace('.i.posthog.com', '.posthog.com') }).replace(/</g, '\\u003c');
}
class SetPostHogConfig { constructor(env) { this.value = phConfigJson(env); } element(el) { el.setAttribute('data-posthog-config', this.value); } }

/* No inline scripts (CSP without hashes); inline styles stay. No frames: every file, the video too, comes from this site. */
const CSP = ["default-src 'self'", "script-src 'self'", "connect-src 'self'", "style-src 'self' 'unsafe-inline'", "img-src 'self' data: blob: https://ciunkos.com", "font-src 'self'", "media-src 'self'", "frame-src 'none'", "manifest-src 'self'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'", "object-src 'none'"].join('; ');

const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });

const TYPY = { webmanifest: 'application/manifest+json', xml: 'application/xml; charset=utf-8', txt: 'text/plain; charset=utf-8' };

function naglowki(res, sciezka, { wersjonowany = false, html = false, testHost = false, twin = null, lang = null, cache = null } = {}) {
  const h = new Headers(res.headers);
  h.set('X-Content-Type-Options', 'nosniff');
  h.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  /* Fullscreen and wake lock are used by the tools themselves; nothing else. */
  h.set('Permissions-Policy', 'microphone=(), camera=(), geolocation=(), payment=(), fullscreen=(self), screen-wake-lock=(self)');
  h.set('Strict-Transport-Security', 'max-age=31536000');
  if (testHost) h.set('X-Robots-Tag', 'noindex, nofollow');
  const ext = (sciezka.match(/\.([a-z0-9]+)$/i) || [])[1];
  if (html) {
    h.set('Content-Type', 'text/html; charset=utf-8');
    h.set('Cache-Control', cache || 'public, max-age=300');
    h.set('Content-Security-Policy', CSP);
    if (twin && lang) h.set('Link', `<https://${APEX}${twin}>; rel="alternate"; hreflang="${innyLang(lang)}"`);
    h.delete('ETag');
  } else if (/^(webp|png|jpg|svg|ico|woff2?|mp4)$/i.test(ext)) h.set('Cache-Control', wersjonowany ? 'public, max-age=31536000, immutable' : 'public, max-age=604800');
  else if (/^(js|mjs|css)$/i.test(ext)) h.set('Cache-Control', wersjonowany ? 'public, max-age=31536000, immutable' : 'no-cache');
  else if (TYPY[ext]) { h.set('Cache-Control', 'public, max-age=3600'); h.set('Content-Type', TYPY[ext]); }
  return new Response(res.body, { status: res.status, headers: h });
}

/* Byte ranges for video. Safari (iPhone above all) plays MP4 only from a server that answers Range with 206.
   The assets binding returns the whole file, so the Worker streams just the asked slice, without buffering it. */
const RANGE = /^bytes=(\d*)-(\d*)$/;
function zakres(res, request, znany) {
  const r = (request.headers.get('Range') || '').trim().match(RANGE);
  const total = Number(res.headers.get('Content-Length')) || znany;
  if (res.status !== 200 || !r || !res.body || !Number.isFinite(total) || total <= 0 || (!r[1] && !r[2])) return res;
  let start = r[1] ? Number(r[1]) : Math.max(0, total - Number(r[2]));
  let end = r[1] && r[2] ? Math.min(Number(r[2]), total - 1) : total - 1;
  if (start >= total || start > end) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${total}`, 'Accept-Ranges': 'bytes' } });
  let pos = 0;
  const want = end - start + 1;
  let sent = 0;
  const { readable, writable } = new TransformStream({
    transform(chunk, ctl) {
      const a = pos, b = pos + chunk.byteLength; pos = b;
      if (b <= start || sent >= want) return;
      const part = chunk.subarray(Math.max(0, start - a), Math.min(chunk.byteLength, start - a + want));
      sent += part.byteLength;
      ctl.enqueue(part);
    }
  });
  res.body.pipeTo(writable).catch(() => {});
  const h = new Headers(res.headers);
  h.set('Content-Range', `bytes ${start}-${end}/${total}`); h.set('Content-Length', String(want)); h.set('Accept-Ranges', 'bytes');
  return new Response(readable, { status: 206, headers: h });
}

function strona404(lang, testHost) {
  const pl = lang === 'pl';
  const h = `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${pl ? 'Nie ma takiej strony' : 'No such page'}</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f6f6f3;color:#111316;font:17px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;text-align:center;padding:16px}a{color:#1f4fd1}</style></head><body><div><h1>${pl ? 'Nie ma takiej strony' : 'No such page'}</h1><p><a href="/${HUB[lang]}">${pl ? 'Wszystkie darmowe narzędzia' : 'All free tools'}</a></p></div></body></html>`;
  return naglowki(new Response(h, { status: 404 }), '/404.html', { html: true, testHost, cache: 'no-store' });
}

export default {
  async fetch(request, env) {
    const wej = new URL(request.url);
    if (wej.hostname === 'www.' + APEX) { wej.hostname = APEX; return Response.redirect(wej.toString(), 301); }
    const testHost = /\.workers\.dev$/.test(wej.hostname) || wej.hostname === 'localhost' || wej.hostname === '127.0.0.1';
    let cel = wej.pathname.replace(OGONKI, '') || wej.pathname;
    if (cel.length > 1 && cel.endsWith('/')) cel = cel.slice(0, -1);
    if (cel !== wej.pathname) { wej.pathname = cel; return Response.redirect(wej.toString(), 301); }
    const p = wej.pathname;

    if (testHost && p === '/robots.txt') return new Response('User-agent: *\nDisallow: /\n', { headers: { 'Content-Type': 'text/plain', 'X-Robots-Tag': 'noindex' } });
    if (testHost && p === '/') return Response.redirect(wej.origin + '/' + HUB.en, 302);

    /* PostHog proxy for events and JSON config only. The SDK itself comes from ciunkos.com/vendor/posthog/<build>/posthog.js. */
    if (p.startsWith(ASSETY + '/ph/')) {
      const sciezka = p.slice(ASSETY.length);
      if (sciezka.endsWith('.js') || !/^\/ph\/(array\/[^/]+\/config|e|i\/v0|s|flags|decide|batch|engage|capture)(\/|$)/.test(sciezka)) return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } });
      const celPh = (env.POSTHOG_HOST || 'https://eu.i.posthog.com') + sciezka.slice(3) + wej.search;
      const h = new Headers(request.headers); h.set('X-Forwarded-For', request.headers.get('CF-Connecting-IP') || ''); h.delete('cookie');
      let odp;
      try { odp = await fetch(celPh, { method: request.method, headers: h, body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body, redirect: 'follow' }); } catch { return new Response('PostHog unavailable', { status: 502, headers: { 'Cache-Control': 'no-store' } }); }
      const wyj = new Response(odp.body, odp); wyj.headers.set('Cache-Control', 'no-store');
      return wyj;
    }

    if (p.startsWith(API + '/')) {
      if (p === API + '/health') return json({ ok: true, version: WERSJA });
      return json({ error: 'no such API' }, 404);
    }

    /* Sitemap and llms.txt sit right under the hub, no extra nesting. */
    if (p === '/' + HUB.en + '/sitemap.xml' || p === '/' + HUB.en + '/llms.txt') {
      const urlA = new URL(wej); urlA.pathname = p.slice(HUB.en.length + 1); urlA.search = '';
      const plik = await env.ASSETS.fetch(new Request(urlA.toString(), request));
      if (plik.status === 404) return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } });
      return naglowki(plik, p, { testHost });
    }

    if (p.startsWith(ASSETY + '/')) {
      const urlA = new URL(wej); urlA.pathname = '/a' + p.slice(ASSETY.length); urlA.search = '';
      const asset = await env.ASSETS.fetch(new Request(urlA.toString(), request));
      if (asset.status === 404) return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } });
      const wyj = naglowki(asset, p, { wersjonowany: wej.searchParams.has('v'), testHost });
      if (!/\.mp4$/i.test(p)) return wyj;
      wyj.headers.set('Accept-Ranges', 'bytes');
      return zakres(wyj, request, ROZMIARY[p.slice(ASSETY.length)]);
    }

    for (const s of STRONY) for (const lang of LANGS) {
      if (p !== '/' + s.path[lang]) continue;
      const urlF = new URL(wej); urlF.pathname = '/' + s.path[lang] + '.html'; urlF.search = '';
      const plik = await env.ASSETS.fetch(new Request(urlF.toString()));
      if (plik.status === 404) return strona404(lang, testHost);
      const rw = new HTMLRewriter().on('script[data-posthog-config]', new SetPostHogConfig(env));
      return naglowki(rw.transform(plik), '/' + s.path[lang] + '.html', { html: true, testHost, twin: '/' + s.path[innyLang(lang)], lang });
    }

    return strona404(p.startsWith('/' + HUB.pl) ? 'pl' : 'en', testHost);
  }
};
