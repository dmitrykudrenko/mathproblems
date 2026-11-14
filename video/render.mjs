// node render.mjs <scene> [uk|en|all] [--frames t1,t2,...]
// Fits the scene to its narration clips, renders 1080x1920 frames with @napi-rs/canvas,
// synthesises the sound track from the scene's cues, and mixes voice + sound + video
// with ffmpeg into out/<scene>-<lang>.mp4.
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { soundtrack } from './sound.mjs';
import { clips } from './voice.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));
GlobalFonts.registerFromPath(`${dir}/fonts/Unbounded.ttf`, 'Unbounded');
GlobalFonts.registerFromPath(`${dir}/fonts/Onest.ttf`, 'Onest');
GlobalFonts.registerFromPath(`${dir}/fonts/JetBrainsMono.ttf`, 'JetBrains Mono');

const [name = 'birthday', which = 'all'] = process.argv.slice(2);
const fi = process.argv.indexOf('--frames');
const scene = await import(`./${name}.mjs`);
const { W, H } = scene;
const FPS = 30;
const langs = which === 'all' ? ['uk', 'en'] : [which];
fs.mkdirSync(`${dir}/out`, { recursive: true });

const canvas = createCanvas(W, H), ctx = canvas.getContext('2d');

for (const lang of langs) {
  const voice = await clips(dir, name, lang, scene.VOICE[lang]);
  const S = scene.setTimeline(voice.map(v => v.dur));
  const DURATION = scene.DURATION;
  console.log(`${lang}: ${DURATION}s, voice: ${[...new Set(voice.map(v => v.source))].join(' + ')}`);
  if (fi > 0) {                              // stills for review
    for (const t of process.argv[fi + 1].split(',').map(Number)) {
      scene.draw(ctx, t, lang);
      fs.writeFileSync(`${dir}/out/${name}-${lang}-${t}.png`, canvas.toBuffer('image/png'));
    }
    continue;
  }
  const wav = `${dir}/out/${name}-${lang}.wav`;
  fs.writeFileSync(wav, soundtrack(scene.cues(lang), DURATION));
  const out = `${dir}/out/${name}-${lang}.mp4`;
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error',
    '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-',
    '-i', wav, ...voice.flatMap(v => ['-i', v.file]),
    '-filter_complex', mix(voice, S.voice), '-map', '0:v', '-map', '[a]',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium',
    '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const frames = Math.round(DURATION * FPS);
  for (let f = 0; f < frames; f++) {
    scene.draw(ctx, f / FPS, lang);
    const buf = Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await new Promise((res, rej) => ff.on('close', c => (c ? rej(new Error(`ffmpeg ${c}`)) : res())));
  fs.unlinkSync(wav);
  console.log(out);
}

// sound track ducked under the voice; each clip placed at its start time
function mix(voice, starts) {
  const parts = ['[1:a]volume=0.5[m]'];
  voice.forEach((_, i) => {
    const ms = Math.round(starts[i] * 1000);
    parts.push(`[${i + 2}:a]aresample=48000,aformat=channel_layouts=stereo,adelay=${ms}|${ms},volume=1.0[v${i}]`);
  });
  parts.push(`[m]${voice.map((_, i) => `[v${i}]`).join('')}amix=inputs=${voice.length + 1}:normalize=0:duration=first,alimiter=limit=0.8[a]`);
  return parts.join(';');
}
