// @ts-check
/* Every page in both languages on desktop and iPhone: 200, CSP, one JSON-LD graph, axe 0, no horizontal scroll, no console
   errors, the "Przemo says" callout. White screen: the first viewport becomes pure #FFFFFF when idle, full screen enters
   and exits, shades work, the PNG download has the asked size, the video loads only on click. */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = [
  ['/free-tools', 'Free tools', 'CollectionPage'], ['/darmowe-narzedzia', 'Darmowe narzędzia', 'CollectionPage'],
  ['/free-tools/white-screen', 'White screen', 'WebApplication'], ['/darmowe-narzedzia/bialy-ekran', 'Biały ekran', 'WebApplication'],
  ['/free-tools/jwt-decoder', 'JWT decoder', 'WebApplication'], ['/darmowe-narzedzia/dekoder-jwt', 'Dekoder JWT', 'WebApplication'],
  ['/free-tools/character-counter', 'Character counter', 'WebApplication'], ['/darmowe-narzedzia/licznik-znakow', 'Licznik znaków', 'WebApplication'],
  ['/free-tools/base64-encode-decode', 'Base64', 'WebApplication'], ['/darmowe-narzedzia/base64-koduj-dekoduj', 'Base64', 'WebApplication'],
  ['/free-tools/converter', 'File converter', 'WebApplication'], ['/darmowe-narzedzia/konwerter', 'Konwerter plików', 'WebApplication'],
  ['/free-tools/converter/mov-to-gif', 'MOV to GIF converter', 'HowTo'], ['/darmowe-narzedzia/konwerter/heic-na-jpg', 'Konwerter HEIC na JPG', 'HowTo'], ['/free-tools/converter/video-to-mp3', 'Video to MP3 converter', 'HowTo']
];

for (const [path, h1, type] of PAGES) {
  test(`${path}: renders, CSP, one LD graph, axe 0, no overflow, no console errors`, async ({ page }) => {
    const errors = [];
    /* WebKit's own media-control icons log 'Button failed to load' in Playwright's build; not our page. */
    page.on('console', (m) => { if (m.type() === 'error' && !/^Button failed to load, iconName/.test(m.text())) errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(e.message));
    const r = await page.goto(path);
    expect(r.status()).toBe(200);
    expect(r.headers()['content-security-policy']).toContain("script-src 'self'");
    expect(r.headers()['link']).toContain('hreflang');
    await expect(page.locator('h1')).toContainText(h1);
    await expect(page.locator('aside.przemo')).toHaveCount(1);
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(ld.length).toBe(1);
    const graph = JSON.parse(ld[0])['@graph'];
    expect(graph.some((n) => n['@type'] === type)).toBe(true);
    const crumbs = graph.find((n) => n['@type'] === 'BreadcrumbList').itemListElement.map((x) => x.item);
    expect(crumbs[0]).toBe('https://ciunkos.com/');
    expect(crumbs.at(-1)).toBe('https://ciunkos.com' + path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.map((v) => v.id + ': ' + v.nodes.map((n) => n.target).join(', '))).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('hub links every live tool and never links a tool that is not live', async ({ page }) => {
  await page.goto('/free-tools');
  for (const slug of ['white-screen', 'jwt-decoder', 'character-counter', 'base64-encode-decode', 'converter']) await expect(page.locator(`a.tool-card[href="/free-tools/${slug}"]`)).toHaveCount(1);
  await expect(page.locator('.tool-card.is-soon a, a.tool-card.is-soon')).toHaveCount(0);
});

test('white screen: the first viewport is pure #FFFFFF once the controls fade', async ({ page }) => {
  await page.goto('/free-tools/white-screen');
  await expect(page.locator('#stage')).toHaveClass(/is-idle/, { timeout: 8000 });
  await page.waitForTimeout(900); // fade-out transition
  const png = await page.screenshot();
  const nonWhite = await page.evaluate(async (b64) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = Object.assign(document.createElement('canvas'), { width: img.width, height: img.height });
    const x = c.getContext('2d'); x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height).data; let n = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i] !== 255 || d[i + 1] !== 255 || d[i + 2] !== 255) n++;
    return n;
  }, png.toString('base64'));
  expect(nonWhite).toBe(0);
});

test('white screen: the button enters full screen and the button or Esc leaves it', async ({ page, isMobile }) => {
  await page.goto('/free-tools/white-screen');
  test.skip(isMobile, 'the iPhone project (WebKit) has no element full screen; the iPhone tests cover its video and covering modes');
  await page.locator('#fs-btn').click();
  await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id)).toBe('stage');
  await expect(page.locator('#fs-btn .fs-label')).toHaveText('Exit full screen');
  await page.mouse.move(10, 10); await page.mouse.move(20, 20);
  await page.locator('#fs-btn').click();
  await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(false);
  await expect(page.locator('#stage')).not.toHaveClass(/is-fs|is-pseudo/);
  await expect(page.locator('#fs-btn .fs-label')).toHaveText('Full screen');
});

test('white screen: the iPhone fallback covers the screen when there is no Fullscreen API', async ({ page }) => {
  await page.addInitScript(() => { Element.prototype.requestFullscreen = undefined; Element.prototype.webkitRequestFullscreen = undefined; HTMLVideoElement.prototype.webkitEnterFullscreen = undefined; });
  await page.goto('/free-tools/white-screen');
  await page.locator('#fs-btn').click();
  await expect(page.locator('#stage')).toHaveClass(/is-pseudo/);
  await expect(page.locator('html')).toHaveClass(/lock/);
  await expect(page.locator('#stage-toast')).toContainText('Add to Home Screen');
  await page.locator('#fs-btn').click();
  await expect(page.locator('#stage')).not.toHaveClass(/is-pseudo/);
});

test('white screen: a refused full screen falls back without the iPhone tip, and stray key events do not throw', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the iPhone project runs WebKit without element full screen, where the iPhone tip is the right message');
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => { Element.prototype.requestFullscreen = () => Promise.reject(new TypeError('not granted')); });
  await page.goto('/free-tools/white-screen');
  await page.locator('#fs-btn').click();
  await expect(page.locator('#stage')).toHaveClass(/is-pseudo/);
  await expect(page.locator('#stage-toast')).not.toContainText('Home Screen');
  await page.evaluate(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })));
  await expect(page.locator('#stage')).not.toHaveClass(/is-pseudo/);
  expect(errors).toEqual([]);
});

test('white screen: shades change the surface and the URL hash, and the hash restores them', async ({ page }) => {
  await page.goto('/free-tools/white-screen');
  await page.locator('.tint[data-tint="warm"]').click();
  await expect(page.locator('#stage')).toHaveAttribute('data-tint', 'warm');
  expect(page.url()).toContain('#warm');
  await expect.poll(() => page.locator('#stage').evaluate((e) => getComputedStyle(e).backgroundColor)).toBe('rgb(255, 243, 224)');
  await page.goto('/free-tools/white-screen#cool'); await page.reload();
  await expect(page.locator('#stage')).toHaveAttribute('data-tint', 'cool');
});

test('white screen: download gives a PNG of the chosen size', async ({ page, isMobile }) => {
  test.skip(isMobile, 'downloads are checked on desktop');
  await page.goto('/free-tools/white-screen');
  await page.locator('label.chip:has(input[value="uhd"])').click();
  await expect(page.locator('#dl-name')).toHaveText('white-3840x2160.png');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.locator('#dl-btn').click()]);
  expect(dl.suggestedFilename()).toBe('white-3840x2160.png');
  const buf = await (await dl.createReadStream()).toArray().then((c) => Buffer.concat(c));
  expect(buf.readUInt32BE(16)).toBe(3840);
  expect(buf.readUInt32BE(20)).toBe(2160);
  await page.locator('#dl-w').fill('99999');
  await expect(page.locator('#dl-btn')).toBeDisabled();
});

test('white screen: our own video, no external frames, streams with range requests and downloads', async ({ page, request }) => {
  const external = [];
  page.on('request', (r) => { const u = new URL(r.url()); if (/^https?:$/.test(u.protocol) && !['127.0.0.1', 'localhost'].includes(u.hostname)) external.push(r.url()); });
  await page.goto('/free-tools/white-screen');
  expect(await page.content()).not.toMatch(/youtube|<iframe/i);
  const src = await page.locator('#ws-video').getAttribute('src');
  expect(src).toBe('/free-tools/video/white-screen-10-hours-1080p.mp4');
  const r = await request.get(src, { headers: { Range: 'bytes=0-1023' } });
  expect(r.status()).toBe(206);
  expect(r.headers()['content-type']).toBe('video/mp4');
  expect((await r.body()).length).toBe(1024);
  expect(r.headers()['content-range']).toMatch(/^bytes 0-1023\/\d+$/);
  const total = Number(r.headers()['content-range'].split('/')[1]);
  const tail = await request.get(src, { headers: { Range: 'bytes=-100' } });
  expect(tail.status()).toBe(206);
  expect(tail.headers()['content-range']).toBe(`bytes ${total - 100}-${total - 1}/${total}`);
  expect((await tail.body()).length).toBe(100);
  expect((await request.get(src, { headers: { Range: `bytes=${total}-` } })).status()).toBe(416);
  for (const id of ['1080p', '4k']) await expect(page.locator(`a[download][data-size="${id}"]`)).toHaveAttribute('href', `/free-tools/video/white-screen-10-hours-${id}.mp4`);
  const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent())['@graph'];
  const v = ld.find((n) => n['@type'] === 'VideoObject');
  expect(v.contentUrl).toBe('https://ciunkos.com/free-tools/video/white-screen-10-hours-1080p.mp4');
  expect(v.duration).toBe('PT10H');
  expect(external.filter((u) => !/\/vendor\/posthog\//.test(u))).toEqual([]);
});

test('white screen: with no element full screen (iPhone), pure white opens the video full screen', async ({ page }) => {
  await page.addInitScript(() => {
    Element.prototype.requestFullscreen = undefined; Element.prototype.webkitRequestFullscreen = undefined;
    window.__videoFs = 0; HTMLVideoElement.prototype.webkitEnterFullscreen = function () { window.__videoFs++; };
    HTMLMediaElement.prototype.play = function () { return Promise.resolve(); };
  });
  await page.goto('/free-tools/white-screen');
  await expect(page.locator('#ws-video')).toHaveAttribute('preload', 'metadata');
  await page.locator('#fs-btn').click();
  expect(await page.evaluate(() => window.__videoFs)).toBe(1);
  await expect(page.locator('#stage')).not.toHaveClass(/is-pseudo/);
  /* Other shades cannot come from the white video, so they use the covering mode. */
  await page.locator('.tint[data-tint="warm"]').click();
  await page.locator('#fs-btn').click();
  await expect(page.locator('#stage')).toHaveClass(/is-pseudo/);
  expect(await page.evaluate(() => window.__videoFs)).toBe(1);
});

test('trailing slash and unknown pages', async ({ request }) => {
  const r = await request.get('/free-tools/white-screen/', { maxRedirects: 0 });
  expect(r.status()).toBe(301);
  expect((await request.get('/free-tools/nope')).status()).toBe(404);
  const sm = await (await request.get('/free-tools/sitemap.xml')).text();
  expect(sm).toContain('<loc>https://ciunkos.com/darmowe-narzedzia/bialy-ekran</loc>');
  expect(sm).toContain('image:loc');
});

/* ---------- JWT decoder ---------- */
test('JWT: the sample decodes, shows a valid status, and verifies with its secret but not another', async ({ page }) => {
  const requests = [];
  page.on('request', (r) => requests.push(r.url()));
  await page.goto('/free-tools/jwt-decoder');
  await page.locator('#jwt-sample').click();
  await expect(page.locator('#jwt-status')).toContainText('Valid');
  await expect(page.locator('#jwt-header')).toContainText('"HS256"');
  await expect(page.locator('#jwt-payload')).toContainText('Jan Kowalski');
  await expect(page.locator('#jwt-claims')).toContainText('expires');
  await page.locator('#jwt-verify summary').click();
  await page.locator('#jwt-key').fill('ciunkos-sample-secret');
  await expect(page.locator('#jwt-vres')).toHaveText('Signature verified');
  await page.locator('#jwt-key').fill('wrong');
  await expect(page.locator('#jwt-vres')).toContainText('does not match');
  expect(requests.filter((u) => /jwt|eyJ/.test(new URL(u).search + new URL(u).hash))).toEqual([]);
  expect(page.url()).not.toContain('eyJ');
});

test('JWT: expired tokens, Bearer prefix, broken input and Polish messages', async ({ page }) => {
  const b = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const expired = `${b({ alg: 'none' })}.${b({ sub: 'x', exp: 1000 })}.`;
  await page.goto('/darmowe-narzedzia/dekoder-jwt');
  await page.locator('#jwt-in').fill('Bearer ' + expired);
  await expect(page.locator('#jwt-status')).toContainText('Wygasł');
  await expect(page.locator('#jwt-warn')).toContainText('none');
  await page.locator('#jwt-in').fill('abc.def');
  await expect(page.locator('#jwt-error')).toHaveText('JWT ma 3 części oddzielone kropkami; ten ma 2.');
  await expect(page.locator('#jwt-out')).toBeHidden();
});

/* ---------- Character counter ---------- */
test('Counter: graphemes, words, limits and SMS update as you type', async ({ page }) => {
  await page.goto('/free-tools/character-counter');
  await page.locator('#cc-in').fill('Zażółć gęślą jaźń 👍🇵🇱');
  await expect(page.locator('#cc-chars')).toHaveText('20');
  await expect(page.locator('#cc-words')).toHaveText('3');
  await expect(page.locator('#cc-limits li[data-id="x"] .lim-n b')).toHaveText('22');
  await expect(page.locator('#cc-sms')).toContainText('UCS-2');
  await expect(page.locator('#cc-sms-note')).toContainText('ż');
  await page.locator('#cc-in').fill('a'.repeat(300));
  await expect(page.locator('#cc-limits li[data-id="x"]')).toHaveClass(/over/);
  await expect(page.locator('#cc-pages')).toHaveText('0.17');
});

test('Counter: text is kept only when asked, and cleared when unticked', async ({ page }) => {
  await page.goto('/darmowe-narzedzia/licznik-znakow');
  await page.locator('#cc-in').fill('Ala ma kota.');
  await page.reload();
  await expect(page.locator('#cc-in')).toHaveValue('');
  await page.locator('#cc-in').fill('Ala ma kota.');
  await page.locator('#cc-remember').check();
  await page.reload();
  await expect(page.locator('#cc-in')).toHaveValue('Ala ma kota.');
  await expect(page.locator('#cc-pages')).toHaveText('0,01');
  await page.locator('#cc-remember').uncheck();
  await page.reload();
  await expect(page.locator('#cc-in')).toHaveValue('');
});

/* ---------- Base64 ---------- */
test('Base64: encodes and decodes both ways, keeps Polish letters and emoji, options apply', async ({ page }) => {
  await page.goto('/free-tools/base64-encode-decode');
  await page.locator('#b64-text').fill('Zażółć 🦊');
  await expect(page.locator('#b64-code')).toHaveValue(Buffer.from('Zażółć 🦊').toString('base64'));
  await page.locator('#b64-url').check();
  await page.locator('#b64-pad').uncheck();
  await expect(page.locator('#b64-code')).toHaveValue(Buffer.from('Zażółć 🦊').toString('base64url'));
  await page.locator('#b64-code').fill('aGVsbG8gxbzDs8WCdw');
  await expect(page.locator('#b64-text')).toHaveValue('hello żółw');
  await expect(page.locator('#b64-dir')).toHaveClass(/decode/);
  await page.locator('#b64-code').fill('aGV$');
  await expect(page.locator('#b64-error')).toContainText('“$” at character 4');
});

test('Base64: a file encodes locally, binary decodes offer a preview and a download', async ({ page, isMobile }) => {
  test.skip(isMobile, 'file pickers and downloads are checked on desktop');
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
  await page.goto('/free-tools/base64-encode-decode');
  await page.locator('#b64-file').setInputFiles({ name: 'dot.png', mimeType: 'image/png', buffer: png });
  await expect(page.locator('#b64-code')).toHaveValue(png.toString('base64'));
  await expect(page.locator('#b64-preview')).toBeVisible();
  await expect(page.locator('#b64-datauri')).toBeVisible();
  await page.locator('[data-clear="code"]').click();
  await page.locator('#b64-code').fill(png.toString('base64'));
  await expect(page.locator('#b64-bin-text')).toContainText('image/png');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.locator('#b64-download').click()]);
  expect(dl.suggestedFilename()).toBe('decoded.png');
});

test('static files revalidate with 304 on reload instead of disappearing', async ({ request }) => {
  const first = await request.get('/free-tools/app.css');
  expect(first.status()).toBe(200);
  const etag = first.headers()['etag'], lm = first.headers()['last-modified'];
  const again = await request.get('/free-tools/app.css', { headers: { ...(etag ? { 'If-None-Match': etag } : {}), ...(lm ? { 'If-Modified-Since': lm } : {}), 'Cache-Control': 'max-age=0' } });
  expect([200, 304]).toContain(again.status());
});
