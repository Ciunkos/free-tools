/* images.mjs: icons (SVG + PNG) and OG cards (1200×630 JPG) for the hub and every live tool, rendered with Playwright's
   Chromium from inline HTML. Run after changing names or designs: npm run images. Output is committed. */
import { chromium } from '@playwright/test';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { TOOLS, LIVE, HUB_NAME, LANGS, iconSvg } from '../src/meta.mjs';

mkdirSync('public/free-tools/icons', { recursive: true });
mkdirSync('public/free-tools/og', { recursive: true });

const HUB_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#111316"/><rect x="12" y="12" width="18" height="18" rx="5" fill="#fff"/><rect x="34" y="12" width="18" height="18" rx="5" fill="#d7f34b"/><rect x="12" y="34" width="18" height="18" rx="5" fill="#8fb0ff"/><rect x="34" y="34" width="18" height="18" rx="5" fill="#fff" opacity=".55"/></svg>`;
const ICONS = { hub: HUB_ICON, ...Object.fromEntries(LIVE.map((id) => [id, iconSvg(id, 64)])) };
for (const [id, svg] of Object.entries(ICONS)) writeFileSync(`public/free-tools/icons/${id}.svg`, svg + '\n');

const face = 'data:image/webp;base64,' + readFileSync('public/free-tools/przemo-160.webp').toString('base64');
const COPY = {
  hub: { en: ['Free tools', 'Small, fast, private tools for everyday jobs. Each one solves a problem I had myself.'], pl: ['Darmowe narzędzia', 'Małe, szybkie, prywatne narzędzia do codziennych spraw. Każde rozwiązuje mój własny problem.'] },
  'white-screen': { en: ['White screen', 'A totally white page, full screen in one click. See every speck while you clean.'], pl: ['Biały ekran', 'Cały ekran na biało jednym kliknięciem. Zobacz każdy pyłek, gdy czyścisz ekran.'] },
  'jwt-decoder': { en: ['JWT decoder', 'Read and verify a token without sending it anywhere.'], pl: ['Dekoder JWT', 'Odczytaj i sprawdź token, nie wysyłając go nigdzie.'] },
  'character-counter': { en: ['Character counter', 'Characters, words and limits as you type.'], pl: ['Licznik znaków', 'Znaki ze spacjami i bez, słowa i limity na bieżąco.'] },
  base64: { en: ['Base64', 'Encode and decode both ways as you type. Text and files.'], pl: ['Base64', 'Koduj i dekoduj w obie strony na bieżąco. Tekst i pliki.'] }
};
const art = {
  'white-screen': `<div class="mon"><div class="scr"><span class="dust d1"></span><span class="dust d2"></span><span class="dust d3"></span><span class="swipe"></span></div><div class="neck"></div><div class="foot"></div></div>`,
  hub: `<div class="tiles">${['white-screen', 'jwt-decoder', 'character-counter', 'base64'].map((id) => `<i>${iconSvg(id, 180)}</i>`).join('')}</div>`,
  'jwt-decoder': `<div class="card mono"><b style="color:#ff6b9a">eyJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ</b>.<b style="color:#b197fc">eyJzdWIiOiJ1c2VyXzhmM2EyYyIsImV4cCI6MTc5NTUxMDAwMH0</b>.<b style="color:#38d9c0">kX9…Q2w</b><div class="ok">✓ Signature verified · RS256</div></div>`,
  'character-counter': `<div class="card"><div class="big">1 800</div><div class="lbl">characters</div><div class="bars"><i style="width:64%"></i><i style="width:92%;background:#ca8a04"></i><i style="width:100%;background:#dc2626"></i></div></div>`,
  base64: `<div class="card two"><div>Zażółć 🦊</div><div class="arr">→</div><div class="mono">WmHFvMOzxYLEhyDwn6aK</div></div>`
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
.tiles{display:grid;grid-template-columns:180px 180px;gap:24px}.tiles i{display:block;width:180px;height:180px}.tiles svg{display:block;border-radius:40px}.card{width:470px;padding:32px;border-radius:24px;background:#1b1e22;border:1px solid #2c3036;font-size:26px;line-height:1.45;color:#ecebe7}.mono{font-family:'SF Mono',Menlo,monospace;word-break:break-all}.card.mono{font-size:24px}.ok{margin-top:22px;font:700 24px -apple-system,sans-serif;color:#4ade80}.big{font:800 120px/1 -apple-system,sans-serif;letter-spacing:-.04em}.lbl{color:#9b9a94;font-size:28px;margin:8px 0 26px}.bars i{display:block;height:14px;border-radius:9px;background:#15803d;margin-top:14px}.two{display:flex;flex-direction:column;gap:14px;font-size:34px}.two .arr{color:#9b9a94}.two .mono{color:#ff9f6b;font-size:30px}
</style></head><body><div class="l"><div class="k">ciunkos.com / <b>${lang === 'pl' ? 'darmowe narzędzia' : 'free tools'}</b></div><h1>${COPY[id][lang][0]}</h1><p>${COPY[id][lang][1]}</p><div class="by"><img src="${face}">Przemysław Zalewski</div></div><div class="r">${lang === 'pl' ? art[id].replace('>characters<', '>znaków<').replace('Signature verified', 'Podpis zgodny') : art[id]}</div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });
for (const [id, svg] of Object.entries(ICONS)) for (const size of id === 'hub' ? [180] : [180, 192, 512]) {
  /* Full-bleed square: iOS and Android round the corners themselves. */
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<style>*{margin:0}svg{display:block}</style>${svg.replace(/width="\d+" height="\d+"/, `width="${size}" height="${size}"`).replace(/ rx="\d+"/, ' rx="0"')}`);
  await page.screenshot({ path: `public/free-tools/icons/${id}-${size}.png` });
}
await page.setViewportSize({ width: 1200, height: 630 });
for (const id of ['hub', ...LIVE]) for (const lang of LANGS) {
  await page.setContent(og(id, lang));
  await page.screenshot({ path: `public/free-tools/og/${id}-${lang}.jpg`, type: 'jpeg', quality: 88 });
}
await browser.close();
console.log('icons and OG cards written for', ['hub', ...LIVE].join(', '), TOOLS && HUB_NAME ? '' : '');
