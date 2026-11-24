/* fixture-webp.mjs: writes a WebP test image with Chromium's encoder (sips and this ffmpeg cannot). node scripts/fixture-webp.mjs in.png out.webp */
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
const [src, out] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage();
const data = await p.evaluate(async (b64) => {
  const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
  const c = Object.assign(document.createElement('canvas'), { width: img.width, height: img.height }); c.getContext('2d').drawImage(img, 0, 0);
  return c.toDataURL('image/webp', 0.9).split(',')[1];
}, readFileSync(src).toString('base64'));
writeFileSync(out, Buffer.from(data, 'base64')); await b.close();
