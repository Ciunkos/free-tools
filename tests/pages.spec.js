// @ts-check
/* Every page in both languages on desktop and iPhone: 200, CSP, one JSON-LD graph, axe 0, no horizontal scroll, no console
   errors, the "Przemo says" callout. White screen: the first viewport becomes pure #FFFFFF when idle, full screen enters
   and exits, shades work, the PNG download has the asked size, the video loads only on click. */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = [
  ['/free-tools', 'Free tools', 'CollectionPage'], ['/darmowe-narzedzia', 'Darmowe narzędzia', 'CollectionPage'],
  ['/free-tools/white-screen', 'White screen', 'WebApplication'], ['/darmowe-narzedzia/bialy-ekran', 'Biały ekran', 'WebApplication']
];

for (const [path, h1, type] of PAGES) {
  test(`${path}: renders, CSP, one LD graph, axe 0, no overflow, no console errors`, async ({ page }) => {
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
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
  await expect(page.locator('a.tool-card[href="/free-tools/white-screen"]')).toHaveCount(1);
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
  await page.locator('#fs-btn').click();
  if (isMobile) {
    /* Emulated iPhone still has the Fullscreen API in Chromium; either real or pseudo full screen is fine. */
    await expect(page.locator('#stage')).toHaveClass(/is-fs|is-pseudo/);
  } else {
    await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id)).toBe('stage');
    await expect(page.locator('#fs-btn .fs-label')).toHaveText('Exit full screen');
  }
  await page.mouse.move(10, 10); await page.mouse.move(20, 20);
  await page.locator('#fs-btn').click();
  await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(false);
  await expect(page.locator('#stage')).not.toHaveClass(/is-fs|is-pseudo/);
  await expect(page.locator('#fs-btn .fs-label')).toHaveText('Full screen');
});

test('white screen: the iPhone fallback covers the screen when there is no Fullscreen API', async ({ page }) => {
  await page.addInitScript(() => { Element.prototype.requestFullscreen = undefined; Element.prototype.webkitRequestFullscreen = undefined; });
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

test('white screen: the video frame loads only after pressing play', async ({ page }) => {
  const yt = [];
  page.on('request', (r) => { if (/youtube/.test(r.url())) yt.push(r.url()); });
  await page.route(/youtube-nocookie\.com/, (r) => r.fulfill({ contentType: 'text/html', body: '<html></html>' }));
  await page.goto('/free-tools/white-screen');
  await page.locator('#video').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  expect(yt).toEqual([]);
  await page.locator('.video-opt[data-yt="_2H0gwg1pA8"]').click();
  await page.locator('#video-play').click();
  await expect(page.locator('#video-box iframe')).toHaveAttribute('src', /embed\/_2H0gwg1pA8\?autoplay=1&loop=1&playlist=_2H0gwg1pA8/);
});

test('trailing slash and unknown pages', async ({ request }) => {
  const r = await request.get('/free-tools/white-screen/', { maxRedirects: 0 });
  expect(r.status()).toBe(301);
  expect((await request.get('/free-tools/nope')).status()).toBe(404);
  const sm = await (await request.get('/free-tools/sitemap.xml')).text();
  expect(sm).toContain('<loc>https://ciunkos.com/darmowe-narzedzia/bialy-ekran</loc>');
  expect(sm).toContain('image:loc');
});
