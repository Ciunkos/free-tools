/* image.mjs: images through the browser's own decoders and a canvas. HEIC uses the browser when it can (Safari),
   else libheif (wasm, loaded only then). JPG gets a white background, SVG is rendered at a chosen scale. */
const MIME = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };

async function heicBitmap(file) {
  try { return await createImageBitmap(file); } catch { /* not Safari: decode with libheif */ }
  const mod = await import('../vendor/heic.js');
  let lib = mod.default;
  if (typeof lib === 'function') lib = await lib();
  const decoder = new lib.HeifDecoder();
  const images = decoder.decode(new Uint8Array(await file.arrayBuffer()));
  if (!images?.length) throw new Error('heic');
  const img = images[0], width = img.get_width(), height = img.get_height();
  const data = await new Promise((ok, fail) => img.display({ data: new Uint8ClampedArray(width * height * 4), width, height }, (d) => (d ? ok(d) : fail(new Error('heic')))));
  img.free?.();
  return createImageBitmap(new ImageData(data.data, width, height));
}

async function svgBitmap(file, scale) {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode();
    const w = Math.max(1, Math.round((img.naturalWidth || 512) * scale)), h = Math.max(1, Math.round((img.naturalHeight || 512) * scale));
    return createImageBitmap(img, { resizeWidth: w, resizeHeight: h, resizeQuality: 'high' });
  } finally { URL.revokeObjectURL(url); }
}

export async function convertImage(file, from, to, opts, onProgress) {
  onProgress(0.1);
  const bitmap = from === 'heic' ? await heicBitmap(file) : from === 'svg' ? await svgBitmap(file, opts.scale || 2) : await createImageBitmap(file);
  onProgress(0.6);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d');
  if (to === 'jpg') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close?.();
  const blob = await canvas.convertToBlob({ type: MIME[to], quality: to === 'png' ? undefined : opts.quality ?? 0.9 });
  if (blob.type !== MIME[to]) throw new Error('no-encoder:' + to); // e.g. Safari cannot write WebP
  onProgress(1);
  return { blob, to, notice: '', width: canvas.width, height: canvas.height };
}
