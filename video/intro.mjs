// Branded sting, 0.75 s, before every short: the three-doors mark, the site name and the
// problem's title in its own colour on ink, then the ink panel lifts off the first scene.
// It opens already drawn (LEAD skips the draw-on), because the first frame is what a viewer
// sees while deciding to scroll on, and what Shorts/TikTok take as the default cover.
// A scene opts in with `export const INTRO = { tint, uk: { title }, en: { title } }`.
import { loadImage, Path2D } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const brand = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'brand');
const SCALE = 1.1;                        // viewBox units → pixels; same mark size in both languages
// rasterise each lockup at its final size (an SVG without width/height loads tiny and blurs)
async function lockup(lang) {
  const svg = fs.readFileSync(`${brand}/lockup-${lang}-dark.svg`, 'utf8');
  const vb = Number(svg.match(/viewBox="0 0 ([\d.]+) 104"/)[1]);
  const sized = svg.replace('<svg ', `<svg width="${vb * SCALE * 2}" height="${104 * SCALE * 2}" `);
  return { img: await loadImage(Buffer.from(sized)), vb };
}
const LOCKUP = { uk: await lockup('uk'), en: await lockup('en') };

export const T0 = 0.75; const WIPE = 0.32;             // main scene starts at T0, under the lifting panel
const LEAD = 0.95;                        // sting time at frame 0: everything is drawn by then
const INK = '#141A30', LIGHT = '#F2F3F7', SIGNAL = '#E86AB0';
const MARK_W = 130;                       // the mark's share of the lockup, in viewBox units

const DOORS = [
  new Path2D('M3 84V31A14 14 0 0 1 31 31V84'),
  new Path2D('M43 84V31A14 14 0 0 1 71 31V84'),
  new Path2D('M83 84V31A14 14 0 0 1 111 31V84'),
];
const DOOR_LEN = 53 * 2 + Math.PI * 14;

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const prog = (t, a, d) => clamp((t - a) / d);
const easeOut = x => 1 - (1 - x) ** 3;
const easeIn = x => x ** 3;

function wrap(ctx, text, maxW) {
  const out = []; let cur = '';
  for (const w of text.split(' ')) {
    const s = cur ? cur + ' ' + w : w;
    if (ctx.measureText(s).width > maxW && cur) { out.push(cur); cur = w; } else cur = s;
  }
  return cur ? [...out, cur] : out;
}

function drawIntro(ctx, time, lang, cfg, W, H) {
  const lift = easeIn(prog(time, T0, WIPE)) * H, t = time + LEAD;
  ctx.save();
  ctx.translate(0, -lift);
  ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H);

  const { img, vb } = LOCKUP[lang], s = SCALE, w = vb * s, x0 = (W - w) / 2, y0 = 760;
  ctx.save();
  ctx.translate(x0, y0); ctx.scale(s, s);
  // doors draw on, one after another
  ctx.lineWidth = 6; ctx.lineCap = 'butt'; ctx.strokeStyle = LIGHT;
  DOORS.forEach((d, i) => {
    const p = easeOut(prog(t, 0.04 + i * 0.09, 0.32));
    if (p <= 0) return;
    ctx.setLineDash([DOOR_LEN * p, DOOR_LEN]);
    ctx.strokeStyle = i === 2 ? SIGNAL : LIGHT;
    ctx.stroke(d);
  });
  ctx.setLineDash([]);
  const base = easeOut(prog(t, 0.02, 0.3));
  ctx.beginPath(); ctx.moveTo(0, 87); ctx.lineTo(114 * base, 87); ctx.strokeStyle = LIGHT; ctx.stroke();
  // the third door is taken
  const fill = easeOut(prog(t, 0.4, 0.18));
  if (fill > 0) {
    ctx.save(); ctx.globalAlpha = fill; ctx.fillStyle = SIGNAL;
    ctx.translate(97, 84); ctx.scale(1, fill); ctx.translate(-97, -84);
    ctx.fill(DOORS[2]); ctx.restore();
  }
  ctx.restore();

  // site name slides out from behind the mark
  const r = easeOut(prog(t, 0.36, 0.42));
  if (r > 0) {
    ctx.save();
    ctx.beginPath(); ctx.rect(x0 + (MARK_W - 4) * s, y0 - 20, (vb - MARK_W) * s * r + 8, 104 * s + 40); ctx.clip();
    ctx.drawImage(img, x0 - (1 - r) * 60, y0, w, 104 * s);
    ctx.restore();
  }

  // the problem: its own title in its own colour
  const a = easeOut(prog(t, 0.62, 0.3));
  if (a > 0) {
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = cfg.tint;
    ctx.fillRect(W / 2 - 60 * a, 960, 120 * a, 6);
    ctx.font = '800 58px Unbounded'; ctx.textAlign = 'center';
    // 760 px: TikTok's like/comment buttons cover the right edge of the frame
    wrap(ctx, cfg[lang].title, 760).forEach((l, i) => ctx.fillText(l, W / 2, 1070 + i * 74 + 16 * (1 - a)));
    ctx.restore();
  }
  ctx.restore();
}

// Wraps a scene module so its timeline, sound cues and voice start after the sting.
export function withIntro(scene) {
  const cfg = scene.INTRO, { W, H } = scene;
  return {
    W, H, VOICE: scene.VOICE,
    get DURATION() { return scene.DURATION + T0; },
    setTimeline(d) {
      const S = scene.setTimeline(d);
      return { ...S, voice: S.voice.map(v => v + T0) };
    },
    draw(ctx, t, lang) {
      if (t >= T0) scene.draw(ctx, t - T0, lang);
      if (t < T0 + WIPE) drawIntro(ctx, t, lang, cfg, W, H);
    },
    cues(lang) {
      return [
        [0, 'chime'],
        [T0 - 0.05, 'whoosh'],
        ...scene.cues(lang).map(([t, k, p]) => [t + T0, k, p]),
      ];
    },
  };
}
