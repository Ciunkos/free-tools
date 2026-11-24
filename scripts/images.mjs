/* images.mjs: icons (SVG + PNG) and OG cards (1200×630 JPG) for the hub and every live tool, rendered with Playwright's
   Chromium from inline HTML. Run after changing names or designs: npm run images. Output is committed. */
import { chromium } from '@playwright/test';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { TOOLS, LIVE, HUB_NAME, LANGS } from '../src/meta.mjs';

mkdirSync('public/a/icons', { recursive: true });
mkdirSync('public/a/og', { recursive: true });

const ICONS = {
  'white-screen': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#111316"/><rect x="10" y="13" width="44" height="30" rx="4" fill="#fff"/><path d="M26 51h12M32 43v8" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>`,
  hub: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#111316"/><rect x="12" y="12" width="18" height="18" rx="5" fill="#fff"/><rect x="34" y="12" width="18" height="18" rx="5" fill="#d7f34b"/><rect x="12" y="34" width="18" height="18" rx="5" fill="#8fb0ff"/><rect x="34" y="34" width="18" height="18" rx="5" fill="#fff" opacity=".55"/></svg>`
};
for (const [id, svg] of Object.entries(ICONS)) writeFileSync(`public/a/icons/${id}.svg`, svg + '\n');

const face = 'data:image/webp;base64,' + readFileSync('public/a/przemo-160.webp').toString('base64');
const COPY = {
  hub: { en: ['Free tools', 'Small, fast, private tools for everyday jobs. Each one solves a problem I had myself.'], pl: ['Darmowe narzędzia', 'Małe, szybkie, prywatne narzędzia do codziennych spraw. Każde rozwiązuje mój własny problem.'] },
  'white-screen': { en: ['White screen', 'A totally white page, full screen in one click. See every speck while you clean.'], pl: ['Biały ekran', 'Cały ekran na biało jednym kliknięciem. Zobacz każdy pyłek, gdy czyścisz ekran.'] }
};
const art = {
  'white-screen': `<div class="mon"><div class="scr"><span class="dust d1"></span><span class="dust d2"></span><span class="dust d3"></span><span class="swipe"></span></div><div class="neck"></div><div class="foot"></div></div>`,
  hub: `<div class="tiles"><i style="background:#fff"></i><i style="background:#d7f34b"></i><i style="background:#8fb0ff"></i><i style="background:#2a2d31;border:2px dashed #555"></i></div>`
};
const og = (id, lang) => `<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}body{width:1200px;height:630px;background:#111316;color:#fff;font-family:-apple-system,"SF Pro Display","Segoe UI",Roboto,sans-serif;display:grid;grid-template-columns:600px 600px;overflow:hidden}
.l{padding:72px 0 64px 72px;display:flex;flex-direction:column}.k{font-size:24px;color:#9b9a94;letter-spacing:.02em}.k b{color:#d7f34b;font-weight:700}
h1{font-size:96px;line-height:1;letter-spacing:-.035em;margin:28px 0 24px;font-weight:800}p{font-size:31px;line-height:1.35;color:#cfcdc7;max-width:500px}
.by{margin-top:auto;display:flex;align-items:center;gap:16px;font-size:24px;color:#cfcdc7}.by img{width:56px;height:56px;border-radius:50%}
.r{display:grid;place-items:center;position:relative}
.mon{display:flex;flex-direction:column;align-items:center}.scr{width:470px;height:300px;background:#fff;border:14px solid #24272c;border-radius:18px;position:relative;box-shadow:0 0 120px rgba(255,255,255,.28)}
.dust{position:absolute;border-radius:50%;background:rgba(0,0,0,.28)}.d1{width:6px;height:6px;left:90px;top:70px}.d2{width:4px;height:4px;left:300px;top:180px}.d3{width:5px;height:5px;left:360px;top:60px}
.swipe{position:absolute;left:150px;top:110px;width:180px;height:70px;border-radius:50%;background:radial-gradient(closest-side,rgba(150,160,180,.18),transparent);transform:rotate(-12deg)}
.neck{width:60px;height:56px;background:#24272c}.foot{width:220px;height:14px;border-radius:8px;background:#24272c}
.tiles{display:grid;grid-template-columns:180px 180px;gap:24px}.tiles i{display:block;width:180px;height:180px;border-radius:36px}
</style></head><body><div class="l"><div class="k">ciunkos.com / <b>${lang === 'pl' ? 'darmowe narzędzia' : 'free tools'}</b></div><h1>${COPY[id][lang][0]}</h1><p>${COPY[id][lang][1]}</p><div class="by"><img src="${face}">Przemysław Zalewski</div></div><div class="r">${art[id]}</div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });
for (const [id, svg] of Object.entries(ICONS)) for (const s of id === 'hub' ? [180] : [180, 192, 512]) {
  await page.setViewportSize({ width: s, height: s });
  await page.setContent(`<style>*{margin:0}body{background:#111316}</style>${svg.replace('<svg ', `<svg width="${s}" height="${s}" `).replace(' rx="14"', id === 'hub' || s === 180 ? ' rx="0"' : ' rx="0"')}`);
  await page.screenshot({ path: `public/a/icons/${id}-${s}.png` });
}
await page.setViewportSize({ width: 1200, height: 630 });
for (const id of ['hub', ...LIVE]) for (const lang of LANGS) {
  await page.setContent(og(id, lang));
  await page.screenshot({ path: `public/a/og/${id}-${lang}.jpg`, type: 'jpeg', quality: 88 });
}
await browser.close();
console.log('icons and OG cards written for', ['hub', ...LIVE].join(', '), TOOLS && HUB_NAME ? '' : '');
