/* videos.mjs: our own 10-hour pure white MP4s (1080p and 4K), made with ffmpeg when missing. Called by build.mjs.
   One frame per second and one keyframe every 10 minutes, so 10 hours weigh about 3 MB (1080p) and 9 MB (4K).
   Exact white: frames are set to Y 235, U 128, V 128 (video white, shown as RGB 255) and tagged BT.709 limited range
   with setparams. Tagging on the output instead makes ffmpeg convert BT.601 to BT.709 and nudges chroma to 127
   (RGB 253). ensureVideos() decodes a frame of each new file and refuses anything that is not pure white. */
import { existsSync, mkdirSync, renameSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

export const SECONDS = 36000;
export const VIDEOS = [
  { id: '1080p', w: 1920, h: 1080, file: 'white-screen-10-hours-1080p.mp4' },
  { id: '4k', w: 3840, h: 2160, file: 'white-screen-10-hours-4k.mp4' }
];
export const DIR = 'public/free-tools/video';

const run = (args) => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { maxBuffer: 1 << 28 });

export function ensureVideos({ log = console.log } = {}) {
  mkdirSync(DIR, { recursive: true });
  for (const v of VIDEOS) {
    const out = `${DIR}/${v.file}`;
    if (existsSync(out)) continue;
    try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }); } catch { throw new Error(`${out} is missing and ffmpeg is not installed (brew install ffmpeg)`); }
    log(`video: encoding ${v.file} (a few minutes)`);
    const tmp = out + '.tmp.mp4';
    run(['-f', 'lavfi', '-i', `color=c=white:s=${v.w}x${v.h}:r=1:d=${SECONDS},format=yuv420p,lutyuv=y=235:u=128:v=128,setparams=range=tv:colorspace=bt709:color_primaries=bt709:color_trc=bt709`,
      '-c:v', 'libx264', '-preset', 'veryslow', '-tune', 'stillimage', '-crf', '18', '-profile:v', 'high', '-g', '600',
      '-metadata', 'title=White screen, 10 hours (ciunkos.com/free-tools)', '-metadata', 'copyright=CC0 1.0, Przemysław Zalewski',
      '-movflags', '+faststart', tmp]);
    const rgb = run(['-ss', String(SECONDS / 2), '-i', tmp, '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']);
    if (rgb.length !== v.w * v.h * 3 || !rgb.every((b) => b === 255)) throw new Error(`${v.file}: decoded frame is not pure white`);
    renameSync(tmp, out);
    log(`video: ${v.file} ${(statSync(out).size / 1048576).toFixed(1)} MB, pure white`);
  }
  return VIDEOS.map((v) => ({ ...v, bytes: statSync(`${DIR}/${v.file}`).size }));
}
