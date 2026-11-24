/* media.mjs: audio and video conversions with mediabunny (WebCodecs). Copies streams when the codec already fits
   (MOV with H.264 → MP4 in seconds), re-encodes otherwise. MP3 encoding loads its own encoder only when needed. */
const lib = () => import('../vendor/media.js');

const MIME = { mp3: 'audio/mpeg', wav: 'audio/wav', m4a: 'audio/mp4', mp4: 'video/mp4', webm: 'video/webm' };
const AUDIO_ONLY = new Set(['mp3', 'wav', 'm4a']);

export async function webCodecsReady() {
  return typeof window !== 'undefined' && 'AudioEncoder' in window && 'VideoDecoder' in window;
}

/** Duration in seconds of a media file (for the progress estimate and GIF limits). */
export async function probe(file) {
  const M = await lib();
  const input = new M.Input({ source: new M.BlobSource(file), formats: M.ALL_FORMATS });
  const [duration, video, audio] = await Promise.all([input.computeDuration(), input.getPrimaryVideoTrack(), input.getPrimaryAudioTrack()]);
  return { duration, hasVideo: !!video, hasAudio: !!audio, width: video?.displayWidth || 0, height: video?.displayHeight || 0 };
}

export async function convertMedia(file, to, opts, onProgress, signal) {
  const M = await lib();
  let target = to, notice = '';
  if (to === 'mp3' && !(await M.canEncodeAudio('mp3'))) (await import('../vendor/mp3.js')).registerMp3Encoder();
  if (to === 'mp4' && !(await M.canEncodeVideo('avc'))) { target = 'webm'; notice = 'no-h264'; }
  const input = new M.Input({ source: new M.BlobSource(file), formats: M.ALL_FORMATS });
  const format = { mp3: () => new M.Mp3OutputFormat(), wav: () => new M.WavOutputFormat(), m4a: () => new M.Mp4OutputFormat({ fastStart: 'in-memory' }), mp4: () => new M.Mp4OutputFormat({ fastStart: 'in-memory' }), webm: () => new M.WebMOutputFormat() }[target]();
  const output = new M.Output({ format, target: new M.BufferTarget() });
  const audioOnly = AUDIO_ONLY.has(target);
  if (audioOnly && !(await input.getPrimaryAudioTrack())) throw new Error('no-audio');
  const video = audioOnly ? { discard: true } : { codec: target === 'webm' ? 'vp9' : 'avc', bitrate: M.QUALITY_HIGH, ...(opts.height ? { height: opts.height, fit: 'contain' } : {}) };
  const audio = { codec: { mp3: 'mp3', wav: 'pcm-s16', m4a: 'aac', mp4: 'aac', webm: 'opus' }[target], ...(target === 'mp3' || target === 'm4a' ? { bitrate: (opts.bitrate || 192) * 1000 } : {}) };
  const trim = opts.start || opts.end ? { start: opts.start || 0, ...(opts.end ? { end: opts.end } : {}) } : undefined;
  const conv = await M.Conversion.init({ input, output, video, audio, ...(trim ? { trim } : {}) });
  if (!conv.isValid) throw new Error('invalid:' + conv.discardedTracks.map((d) => d.reason).join(','));
  conv.onProgress = (p) => onProgress(p);
  const stop = () => conv.cancel();
  signal?.addEventListener('abort', stop, { once: true });
  try { await conv.execute(); } finally { signal?.removeEventListener('abort', stop); }
  if (signal?.aborted) throw new DOMException('Canceled', 'AbortError');
  return { blob: new Blob([output.target.buffer], { type: MIME[target] }), to: target, notice };
}
