// @ts-check
/* Every x-to-y page converts its fixture for real in Chrome, on this computer: the download has the right file
   signature, media keeps its duration (ffprobe), and no request leaves the site. Plus the directory flow. */
import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PAIRS, slugOf } from '../tools/converter/pairs.mjs';

const FIX = { mp4: 'clip.mp4', mov: 'clip.mov', webm: 'clip.webm', mkv: 'clip.mkv', video: 'clip.mov', mp3: 'tone.mp3', wav: 'tone.wav', m4a: 'tone.m4a', aac: 'tone.aac', flac: 'tone.flac', ogg: 'tone.ogg', gif: 'anim.gif', heic: 'img.heic', jpg: 'img.jpg', png: 'img.png', webp: 'img.webp', avif: 'img.avif', svg: 'img.svg' };
const SIG = {
  mp3: (b) => b.toString('latin1', 0, 3) === 'ID3' || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0),
  wav: (b) => b.toString('latin1', 0, 4) === 'RIFF' && b.toString('latin1', 8, 12) === 'WAVE',
  m4a: (b) => b.toString('latin1', 4, 8) === 'ftyp', mp4: (b) => b.toString('latin1', 4, 8) === 'ftyp',
  webm: (b) => b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3,
  gif: (b) => b.toString('latin1', 0, 6) === 'GIF89a', png: (b) => b[0] === 0x89 && b.toString('latin1', 1, 4) === 'PNG',
  jpg: (b) => b[0] === 0xff && b[1] === 0xd8, webp: (b) => b.toString('latin1', 8, 12) === 'WEBP'
};
const probe = (buf, ext) => {
  const f = join(mkdtempSync(join(tmpdir(), 'conv-')), 'out.' + ext);
  writeFileSync(f, buf);
  return JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration:stream=codec_type,width,height', '-of', 'json', f], { encoding: 'utf8' }));
};

for (const p of PAIRS) {
  test(`${p.id}: converts in the browser`, async ({ page }) => {
    const external = [];
    page.on('request', (r) => { const u = new URL(r.url()); if (/^https?:$/.test(u.protocol) && u.hostname !== '127.0.0.1') external.push(r.url()); });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/free-tools/' + slugOf(p, 'en'));
    await page.locator('#file').setInputFiles('tests/fixtures/' + FIX[p.from]);
    const job = page.locator('.job').first();
    await expect(job).toHaveAttribute('data-state', 'done', { timeout: 50000 });
    const [dl] = await Promise.all([page.waitForEvent('download'), job.locator('a[download]').click()]);
    const buf = Buffer.concat(await (await dl.createReadStream()).toArray());
    const ext = dl.suggestedFilename().split('.').pop();
    expect(ext).toBe(p.to === 'jpg' ? 'jpg' : p.to);
    expect(SIG[p.to](buf), `${p.id} signature`).toBe(true);
    if (['mp3', 'wav', 'm4a', 'mp4', 'webm', 'gif'].includes(p.to)) {
      const info = probe(buf, ext);
      const d = Number(info.format.duration);
      if (p.from !== 'gif') expect(Math.abs(d - 2), `${p.id} duration ${d}`).toBeLessThan(0.25);
      else expect(d).toBeGreaterThan(1);
      if (['mp3', 'wav', 'm4a'].includes(p.to)) expect(info.streams.every((s) => s.codec_type === 'audio')).toBe(true);
    }
    expect(external).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('directory: any file in, choose the format, URL follows the pair', async ({ page }) => {
  await page.goto('/free-tools/file-converter');
  await page.locator('#file').setInputFiles('tests/fixtures/img.png');
  await expect(page.locator('#pick-target')).toBeVisible();
  await page.locator('#targets [data-to="jpg"]').click();
  await expect(page.locator('.job').first()).toHaveAttribute('data-state', 'done', { timeout: 20000 });
  expect(new URL(page.url()).pathname).toBe('/free-tools/png-to-jpg');
});

test('wrong file for the page still converts, to a target that fits it', async ({ page }) => {
  await page.goto('/free-tools/heic-to-jpg');
  await page.locator('#file').setInputFiles('tests/fixtures/tone.wav');
  await expect(page.locator('.job').first()).toHaveAttribute('data-state', 'done', { timeout: 20000 });
  await expect(page.locator('#to')).toHaveValue('mp3');
  await expect(page.locator('#pill-from')).toHaveText('WAV');
});

test('options re-run: MP3 at 320 kbps is bigger than at 128', async ({ page }) => {
  await page.goto('/free-tools/wav-to-mp3');
  await page.locator('#opts summary').click();
  await page.locator('[name=bitrate]').selectOption('128');
  await page.locator('#file').setInputFiles('tests/fixtures/tone.wav');
  const job = page.locator('.job').first();
  await expect(job).toHaveAttribute('data-state', 'done', { timeout: 20000 });
  const small = await job.locator('.job-status').textContent();
  await page.locator('[name=bitrate]').selectOption('320');
  await expect(job).toHaveAttribute('data-state', 'working');
  await expect(job).toHaveAttribute('data-state', 'done', { timeout: 20000 });
  const big = await job.locator('.job-status').textContent();
  const kb = (s) => Number(s.match(/→ ([\d.]+) KB/)[1]);
  expect(kb(big)).toBeGreaterThan(kb(small) * 2);
});
