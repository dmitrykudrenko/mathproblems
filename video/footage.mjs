// Film footage for a beat (beats.mjs `show.clip`): a few seconds of a trailer, cropped to the vertical frame,
// played and then held on its last frame (slow push-in, darkened) while our own picture is drawn on top.
// Only the pictures are used: never the trailer's sound, which is what Content ID matches first.
// Source files live in video/footage/ (git-ignored: they are not ours). Frames are cut once with ffmpeg into
// out/footage/<file>-<at>-<len>-<x>/ and read back synchronously, so draw() stays a plain function of time.
//   clip: { src: 'trailer.mp4', at: 12.4, len: 2.5, x: .5, label: 'pedestals' }
//   cuts: [[a, b], …] instead of at/len joins several pieces of the trailer (len must be their total).
//   held: true continues an earlier beat's clip already frozen on its last frame.
//   at: the trailer timecode in seconds; len: how long it plays; x: the crop centre across the wide frame (0–1).
import { Image } from '@napi-rs/canvas';
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { W, H, F, clamp, prog, easeOut, text } from './lib.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));
const FPS = 30;
const cut = new Map();     // clip key → list of frame files (or null: no source yet)
const img = new Map();     // frame file → decoded Image (the last few only)

// the picture inside the trailer's own black bars (films are often 2.39:1 inside 16:9), found once per file
const boxes = new Map();
function box(src) {
  if (!boxes.has(src)) {
    const r = spawnSync('ffmpeg', ['-hide_banner', '-ss', '30', '-t', '20', '-i', src, '-vf', 'cropdetect=limit=24:round=2', '-f', 'null', '-'], { encoding: 'utf8' });
    const all = [...r.stderr.matchAll(/crop=(\d+:\d+:\d+:\d+)/g)].map(m => m[1]);
    const n = new Map(); all.forEach(k => n.set(k, (n.get(k) || 0) + 1));
    boxes.set(src, [...n].sort((a, b) => b[1] - a[1])[0]?.[0] || 'iw:ih:0:0');
  }
  return boxes.get(src);
}

function frames(c) {
  const cuts = c.cuts || [[c.at, c.at + c.len]];
  const src = path.join(dir, 'footage', c.src);
  if (!fs.existsSync(src)) return null;
  const bx = box(src), key = `${c.src}-${cuts.flat().join('_')}-${c.x ?? .5}-${bx}`;
  if (cut.has(key)) return cut.get(key);
  const out = path.join(dir, 'out', 'footage', key.replace(/[^\w.-]/g, '_'));
  if (!fs.existsSync(path.join(out, 'done'))) {
    fs.rmSync(out, { recursive: true, force: true });
    fs.mkdirSync(out, { recursive: true });
    const x = c.x ?? .5;
    // one or more pieces of the trailer, joined back to back
    const pick = cuts.map(([a, b]) => `between(t,${a},${b})`).join('+');
    const r = spawnSync('ffmpeg', ['-loglevel', 'error', '-ss', String(Math.max(0, cuts[0][0] - 1)), '-i', src, '-an', '-copyts',
      '-vf', `select='${pick}',setpts=N/${FPS}/TB,fps=${FPS},crop=${bx},scale=-2:${H}:flags=lanczos,crop=${W}:${H}:(iw-${W})*${x}:0`,
      '-q:v', '2', '-t', String(cuts.reduce((d, [a, b]) => d + b - a, 0)), path.join(out, '%04d.jpg')]);
    if (r.status) throw new Error(`ffmpeg: ${r.stderr}`);
    fs.writeFileSync(path.join(out, 'done'), '');
  }
  const list = fs.readdirSync(out).filter(f => f.endsWith('.jpg')).sort().map(f => path.join(out, f));
  cut.set(key, list);
  return list;
}

function load(file) {
  if (!img.has(file)) {
    if (img.size > 8) img.delete(img.keys().next().value);
    const i = new Image(); i.src = fs.readFileSync(file); img.set(file, i);
  }
  return img.get(file);
}

// Draws the clip over the whole frame for a beat that starts at t0; a is the beat's alpha.
// `dim` (0–1): how dark the held frame gets, so text and pictures on top stay readable.
export function clip(ctx, c, t0, t, a, C) {
  const list = frames(c), local = t - t0 + (c.held ? c.len + 1 : 0), held = prog(local, c.len - .2, .6);
  ctx.save(); ctx.globalAlpha = a;
  if (list && list.length) {
    const k = Math.min(list.length - 1, Math.max(0, Math.floor(local * FPS)));
    const zoom = 1 + .06 * clamp((local - c.len) / 6);      // slow push-in while held
    ctx.translate(W / 2, H / 2); ctx.scale(zoom, zoom); ctx.translate(-W / 2, -H / 2);
    ctx.drawImage(load(list[k]), 0, 0, W, H);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  } else {
    // no footage yet: a dark slot that says which shot goes here, so drafts still read
    ctx.fillStyle = '#1A120B'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 4; ctx.setLineDash([18, 14]);
    ctx.strokeRect(60, 600, W - 120, 700);
    ctx.setLineDash([]);
    text(ctx, `TRAILER ${c.at}s · ${c.label || ''}`, W / 2, 960, { font: `600 34px ${F.mono}`, color: 'rgba(255,255,255,.55)', align: 'center', maxW: 860, lh: 46, alpha: 1 - held });
  }
  // shade: always a little at top and bottom for the brand line and captions, more once the frame is held
  const dim = (c.dim ?? .62) * easeOut(held);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, 'rgba(10,6,3,.78)'); g.addColorStop(.3, `rgba(10,6,3,${.25 + dim * .7})`);
  g.addColorStop(.7, `rgba(10,6,3,${.25 + dim * .7})`); g.addColorStop(1, 'rgba(10,6,3,.85)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.restore();
  text(ctx, 'MATHPARADOXES.COM', 80, 250, { font: `600 26px ${F.mono}`, color: C.muted, alpha: a });
}

// how far into the beat the held part (the picture on top) starts
export const heldAt = c => c.len;
