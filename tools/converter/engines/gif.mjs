/* gif.mjs: video → GIF (mediabunny decodes frames at the chosen rate and size, gifenc quantizes each to 256 colours)
   and GIF → MP4/WebM (gifuct-js decodes frames with their timing and disposal, mediabunny encodes them). */
const media = () => import('../vendor/media.js');
const gifLib = () => import('../vendor/gif.js');
const tick = () => new Promise((r) => setTimeout(r, 0));
const abortIf = (signal) => { if (signal?.aborted) throw new DOMException('Canceled', 'AbortError'); };

export async function videoToGif(file, opts, onProgress, signal) {
  const [M, G] = await Promise.all([media(), gifLib()]);
  const input = new M.Input({ source: new M.BlobSource(file), formats: M.ALL_FORMATS });
  const track = await input.getPrimaryVideoTrack();
  if (!track) throw new Error('no-video');
  const duration = await input.computeDuration();
  const fps = Math.min(30, Math.max(1, opts.fps || 12));
  const start = Math.max(0, Math.min(opts.start || 0, duration));
  const end = Math.min(duration, opts.end || duration, start + (opts.maxSeconds || 15));
  const width = Math.max(16, Math.round((opts.width || 480) / 2) * 2);
  const height = Math.max(2, Math.round((width * track.displayHeight) / track.displayWidth / 2) * 2);
  const times = [];
  for (let t = start; t < end - 1e-6; t += 1 / fps) times.push(t);
  if (!times.length) times.push(start);
  const sink = new M.CanvasSink(track, { width, height, fit: 'fill', poolSize: 2 });
  const enc = G.GIFEncoder();
  const delay = Math.round(1000 / fps);
  let i = 0;
  for await (const wc of sink.canvasesAtTimestamps(times)) {
    abortIf(signal);
    if (!wc) continue;
    const ctx = wc.canvas.getContext('2d', { willReadFrequently: true });
    const { data } = ctx.getImageData(0, 0, width, height);
    const palette = G.quantize(data, 256);
    enc.writeFrame(G.applyPalette(data, palette), width, height, { palette, delay });
    onProgress(++i / times.length);
    if (i % 4 === 0) await tick(); // keep the page responsive while quantizing
  }
  enc.finish();
  return { blob: new Blob([enc.bytes()], { type: 'image/gif' }), to: 'gif', notice: end - start < duration - start - 0.05 && !opts.end ? 'gif-limited' : '' };
}

export async function gifToVideo(file, to, opts, onProgress, signal) {
  const [M, G] = await Promise.all([media(), gifLib()]);
  const gif = G.parseGIF(new Uint8Array(await file.arrayBuffer()));
  const frames = G.decompressFrames(gif, true);
  if (!frames.length) throw new Error('no-frames');
  const W = gif.lsd.width, H = gif.lsd.height;
  const OW = W + (W % 2), OH = H + (H % 2); // H.264 wants even sizes
  let target = to, notice = '';
  if (to === 'mp4' && !(await M.canEncodeVideo('avc'))) { target = 'webm'; notice = 'no-h264'; }
  const out = new OffscreenCanvas(OW, OH), octx = out.getContext('2d');
  const comp = new OffscreenCanvas(W, H), cctx = comp.getContext('2d');
  const patch = new OffscreenCanvas(1, 1), pctx = patch.getContext('2d');
  const output = new M.Output({ format: target === 'webm' ? new M.WebMOutputFormat() : new M.Mp4OutputFormat({ fastStart: 'in-memory' }), target: new M.BufferTarget() });
  const source = new M.CanvasSource(out, { codec: target === 'webm' ? 'vp9' : 'avc', bitrate: M.QUALITY_HIGH });
  output.addVideoTrack(source);
  await output.start();
  let t = 0, prev = null;
  for (let i = 0; i < frames.length; i++) {
    abortIf(signal);
    const f = frames[i];
    if (prev && prev.disposalType === 2) cctx.clearRect(prev.dims.left, prev.dims.top, prev.dims.width, prev.dims.height);
    patch.width = f.dims.width; patch.height = f.dims.height;
    pctx.putImageData(new ImageData(f.patch, f.dims.width, f.dims.height), 0, 0);
    cctx.drawImage(patch, f.dims.left, f.dims.top);
    octx.fillStyle = '#fff'; octx.fillRect(0, 0, OW, OH); octx.drawImage(comp, 0, 0);
    const d = (f.delay > 10 ? f.delay : 100) / 1000;
    await source.add(t, d);
    t += d; prev = f;
    onProgress((i + 1) / frames.length);
  }
  await output.finalize();
  return { blob: new Blob([output.target.buffer], { type: target === 'webm' ? 'video/webm' : 'video/mp4' }), to: target, notice };
}
