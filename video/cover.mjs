// node cover.mjs <scene> [uk|en|all]  →  out/<scene>-<lang>-cover.png (1080x1920)
// The cover a viewer sees in the channel grid and the TikTok profile, one series for all shorts:
// ink like the intro sting, the brand lockup, a short hook in big type with its key words in the
// problem's colour, a real frame of the short (its signature object) on a card, and a «?» badge.
// A scene opts in with `export const COVER = { t, crop: [y0, y1], en: { hook }, uk: { hook } }`:
// t is the video time of the frame (intro included), crop the rows of that frame to show, and
// *stars* in the hook mark the coloured words. Hooks ask, never answer, like the short itself.
// Everything sits between 260 and 1660 px down, so TikTok's 3:4 grid crop keeps it whole.
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { clips } from './voice.mjs';
import { withIntro } from './intro.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));
GlobalFonts.registerFromPath(`${dir}/fonts/Unbounded.ttf`, 'Unbounded');
GlobalFonts.registerFromPath(`${dir}/fonts/Onest.ttf`, 'Onest');
GlobalFonts.registerFromPath(`${dir}/fonts/JetBrainsMono.ttf`, 'JetBrains Mono');

const [name = 'birthday', which = 'all'] = process.argv.slice(2);
const mod = await import(`./${name}.mjs`);
if (!mod.COVER) throw new Error(`${name}.mjs has no COVER`);
const scene = withIntro(mod), { W, H } = scene, cfg = mod.COVER, tint = mod.INTRO.tint;
const INK = '#141A30', LIGHT = '#F2F3F7', SIGNAL = '#E86AB0', MUTED = '#9AA3BF';

async function lockup(lang, width) {
  const svg = fs.readFileSync(`${dir}/../brand/lockup-${lang}-dark.svg`, 'utf8');
  const vb = Number(svg.match(/viewBox="0 0 ([\d.]+) 104"/)[1]), h = width * 104 / vb;
  return { img: await loadImage(Buffer.from(svg.replace('<svg ', `<svg width="${width * 2}" height="${h * 2}" `))), w: width, h };
}

// the hook split into pieces, each with its colour (*marked* words in the problem's colour);
// `gap` is false where the piece sticks to the one before («*switch*?»)
function words(hook) {
  const out = []; let on = false, gap = false;
  for (const tok of hook.match(/\*|\s+|[^\s*]+/g)) {
    if (tok === '*') on = !on;
    else if (/^\s/.test(tok)) gap = true;
    else { out.push({ w: tok, on, gap: gap && out.length > 0 }); gap = false; }
  }
  return out;
}
// pieces glued without a gap move to the next line together
function layout(ctx, ws, maxW) {
  const groups = [];
  for (const x of ws) (x.gap || !groups.length ? groups.push([x]) : groups.at(-1).push(x));
  const lines = [[]]; let width = 0;
  for (const g of groups) {
    const s = g.map(x => x.w).join(''), add = ctx.measureText((lines.at(-1).length ? ' ' : '') + s).width;
    if (width + add > maxW && lines.at(-1).length) { lines.push([...g]); width = ctx.measureText(s).width; }
    else { lines.at(-1).push(...g); width += add; }
  }
  return lines;
}

const frame = createCanvas(W, H), fctx = frame.getContext('2d');
const canvas = createCanvas(W, H), ctx = canvas.getContext('2d');
fs.mkdirSync(`${dir}/out`, { recursive: true });

for (const lang of which === 'all' ? ['uk', 'en'] : [which]) {
  const voice = await clips(dir, name, lang, scene.VOICE[lang]);
  scene.setTimeline(voice.map(v => v.dur));
  scene.draw(fctx, cfg.t, lang);

  ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, 1150, 60, W / 2, 1150, 900);
  glow.addColorStop(0, tint + '55'); glow.addColorStop(1, tint + '00');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);

  const L = await lockup(lang, 360);
  ctx.drawImage(L.img, (W - L.w) / 2, 280, L.w, L.h);

  // hook: the largest size that fits in three lines
  const ws = words(cfg[lang].hook);
  let px = 132, lines;
  for (; px > 60; px -= 4) {
    ctx.font = `800 ${px}px Unbounded`;
    lines = layout(ctx, ws, 940);
    if (lines.length <= 3) break;
  }
  // hook, card and name centred as one block between the lockup and 1660 px
  const lh = px * 1.12, [y0, y1] = cfg.crop, cw = 920, r = 36, cx = (W - cw) / 2;
  const textH = lines.length * lh, gap = 70;
  const ch = Math.min((y1 - y0) * cw / W, 1560 - 420 - textH - gap);
  const block = textH + gap + ch + 90;
  let y = 400 + Math.max(0, (1660 - 400 - block) / 2) + px;
  ctx.textBaseline = 'alphabetic';
  for (const line of lines) {
    const piece = (wd, i) => (i && wd.gap ? ' ' : '') + wd.w;
    let x = (W - ctx.measureText(line.map(piece).join('')).width) / 2;
    for (const [i, wd] of line.entries()) {
      const s = piece(wd, i);
      ctx.fillStyle = wd.on ? tint : LIGHT;
      ctx.fillText(s, x, y);
      x += ctx.measureText(s).width;
    }
    y += lh;
  }

  // the card: a real frame of the short
  const top = y - lh + gap - px * 0.12 + 40;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 20;
  ctx.fillStyle = LIGHT; ctx.beginPath(); ctx.roundRect(cx, top, cw, ch, r); ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.beginPath(); ctx.roundRect(cx, top, cw, ch, r); ctx.clip();
  ctx.drawImage(frame, 0, y0, W, ch * W / cw, cx, top, cw, ch);
  ctx.restore();

  // series badge: the «?» of «guess first», in the site's signal colour
  ctx.fillStyle = SIGNAL; ctx.beginPath(); ctx.arc(cx + cw - 20, top + 10, 62, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = '800 76px Unbounded'; ctx.textAlign = 'center';
  ctx.fillText('?', cx + cw - 20, top + 38);

  // the problem's name under the card
  ctx.font = '600 32px JetBrains Mono'; ctx.fillStyle = MUTED;
  ctx.fillText(mod.INTRO[lang].title.toUpperCase(), W / 2, Math.min(top + ch + 80, 1640));
  ctx.textAlign = 'left';

  const out = `${dir}/out/${name}-${lang}-cover.png`;
  fs.writeFileSync(out, canvas.toBuffer('image/png'));
  console.log(out);
}
