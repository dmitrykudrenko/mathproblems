// Shared pieces of every short: easing, text, the option cards, the guess countdown,
// the end card and the background. A scene keeps only its own story and signature object.
// Colours come from the scene's own palette C (the page's :root): paper, surface, ink,
// muted, line, tint, accent (kickers, countdown ring), plus whatever the scene needs.

export const W = 1080, H = 1920;
export const F = { display: 'Unbounded', body: 'Onest', mono: 'JetBrains Mono' };

// Layout rows shared by all scenes (px from the top; Shorts/Reels cover above 230 and below 1540)
export const ROW = { brand: 250, kicker: 340, title: 470, question: 430 };

// ---- timing
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const prog = (t, a, d) => clamp((t - a) / d);
export const easeOut = x => 1 - (1 - x) ** 3;
export const easeInOut = x => (x < .5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
export const back = x => { const c = 1.7; return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2; };
// visible from a to b with fade in/out
export const life = (t, a, b, f = .35) => Math.min(easeOut(prog(t, a, f)), 1 - easeInOut(prog(t, b - f, f)));
// slide up while fading in
export const rise = (t, a, px = 24) => px * (1 - easeOut(prog(t, a, .6)));

// deterministic random numbers for anything a scene scatters
export function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1103515245 + 12345) >>> 0) / 2 ** 32);
}

// ---- drawing
export function wrap(ctx, text, maxW) {
  const lines = [];
  let cur = '';
  for (const w of text.split(' ')) {
    const test = cur ? cur + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; } else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

export function text(ctx, s, x, y, { font, color = '#141A30', align = 'left', alpha = 1, maxW = 0, lh = 0, dy = 0 }) {
  if (alpha <= 0) return 0;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  const lines = maxW ? wrap(ctx, s, maxW) : [s];
  lines.forEach((l, i) => ctx.fillText(l, x, y + dy + i * lh));
  ctx.restore();
  return lines.length;
}

export function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

// largest font size (≤ max) at which s fits in maxW on at most `lines` lines
function fitSize(ctx, s, weightFamily, max, maxW, lines = 1) {
  for (let px = max; px > 16; px -= 2) {
    ctx.font = `${weightFamily.replace('{}', px)}`;
    if (wrap(ctx, s, maxW).length <= lines && wrap(ctx, s, maxW).every(l => ctx.measureText(l).width <= maxW)) return px;
  }
  return 16;
}

// the problem's own colour over the whole frame, fading to paper; brand line on top
export function background(ctx, C, t) {
  ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, C.tint); g.addColorStop(.55, C.tintSoft || C.paper); g.addColorStop(1, C.paper);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  text(ctx, 'MATHPARADOXES.COM', 80, ROW.brand, { font: `600 26px ${F.mono}`, color: C.muted, alpha: easeOut(prog(t, .1, .5)) });
}

export const kicker = (ctx, C, s, alpha) =>
  text(ctx, s, 80, ROW.kicker, { font: `600 30px ${F.mono}`, color: C.accent, alpha });

// One answer card with a thin-framed Latin label (as on the site). The value can be a number
// or a short phrase: the font shrinks to fit two lines.
export function optionBox(ctx, C, label, value, x, y, w, h, scale, alpha, big = true) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x + w / 2, y + h / 2); ctx.scale(scale, scale); ctx.translate(-w / 2, -h / 2);
  ctx.shadowColor = 'rgba(20,26,48,.08)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 8;
  ctx.fillStyle = C.surface; rrect(ctx, 0, 0, w, h, big ? 28 : 20); ctx.fill();
  ctx.shadowColor = 'transparent';
  const pad = big ? 28 : 16, ls = big ? 54 : 34;
  ctx.strokeStyle = C.muted; ctx.lineWidth = 2.5;
  rrect(ctx, pad, pad, ls, ls, 8); ctx.stroke();
  text(ctx, label, pad + ls / 2, pad + ls * .72, { font: `600 ${big ? 30 : 20}px ${F.mono}`, color: C.muted, align: 'center' });
  const numeric = /^[\d\s.,%/:½⅓⅔¼¾−-]+$/.test(value);
  const family = numeric ? `800 {}px ${F.display}` : `700 {}px ${F.display}`;
  const maxW = w - 2 * pad, top = pad + ls + 8;
  const px = fitSize(ctx, value, family, numeric ? (big ? 128 : 54) : (big ? 52 : 26), maxW, numeric ? 1 : 2);
  ctx.font = family.replace('{}', px);
  const lines = wrap(ctx, value, maxW), lh = px * 1.12;
  const cy = numeric ? (big ? h / 2 + 48 : h - 30) : top + (h - top - pad) / 2 - (lines.length - 1) * lh / 2 + px * .36;
  lines.forEach((l, i) => text(ctx, l, w / 2, cy + i * lh, { font: family.replace('{}', px), color: C.ink, align: 'center' }));
  ctx.restore();
}

// 2×2 grid of answer cards popping in at their own times
export function optionsGrid(ctx, C, options, at, t, a, { y0 = 780, h = 260 } = {}) {
  const w = 410, gap = 30, x0 = (W - 2 * w - gap) / 2;
  options.forEach((v, i) => {
    const p = prog(t, at[i], .5);
    if (p <= 0) return;
    optionBox(ctx, C, 'ABCD'[i], v, x0 + (i % 2) * (w + gap), y0 + Math.floor(i / 2) * (h + gap), w, h, .4 + .6 * back(p), a * clamp(p * 3));
  });
}

// «pause and guess» with a 4-step countdown ring; ends on «?»
export function countdown(ctx, C, label, t, start, end, a, { y = 1385 } = {}) {
  if (a <= 0) return;
  const cx = W / 2, cy = y + 105, r = 60;
  text(ctx, label, cx, y, { font: `700 48px ${F.body}`, align: 'center', color: C.ink, alpha: a });
  const p = prog(t, start, end - start);
  const n = Math.max(1, 4 - Math.floor(p * 4));
  ctx.save(); ctx.globalAlpha = a;
  ctx.strokeStyle = C.line; ctx.lineWidth = 12;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke();
  ctx.strokeStyle = C.accent; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * (1 - p)); ctx.stroke();
  ctx.restore();
  if (p < 1) text(ctx, String(n), cx, cy + 26, { font: `800 76px ${F.display}`, align: 'center', color: C.ink, alpha: a * (1 - .3 * ((p * 4) % 1)) });
  else text(ctx, '?', cx, cy + 26, { font: `800 76px ${F.display}`, color: C.accent, align: 'center', alpha: a });
}

// End card: the question again, the options in a row, «answer in the comments», the page link.
// L needs kicker, question, comment, play, url.
export function endCard(ctx, C, L, options, t, start) {
  const aE = easeOut(prog(t, start, .6));
  if (aE <= 0) return;
  kicker(ctx, C, L.kicker, aE);
  const qLines = text(ctx, L.question, 80, ROW.question, { font: `700 54px ${F.display}`, maxW: 900, lh: 72, alpha: aE });
  const yCards = Math.max(860, ROW.question + qLines * 72 + 60);
  const n = options.length, gap = 26, w = Math.min(200, (W - 160 - (n - 1) * gap) / n), h = 170, x0 = (W - n * w - (n - 1) * gap) / 2;
  options.forEach((v, i) => {
    const p = prog(t, start + .3 + i * .12, .4);
    optionBox(ctx, C, 'ABCD'[i], v, x0 + i * (w + gap), yCards, w, h, .6 + .4 * back(p), clamp(p * 3), false);
  });
  text(ctx, L.comment, W / 2, 1150, { font: `700 46px ${F.body}`, align: 'center', color: C.ink, alpha: easeOut(prog(t, start + 1.2, .5)) });
  const pu = easeOut(prog(t, start + 2.2, .5));
  text(ctx, L.play, W / 2, 1320, { font: `500 40px ${F.body}`, color: C.muted, align: 'center', alpha: pu });
  if (pu > 0) {
    ctx.save(); ctx.globalAlpha = pu;
    let px = 44;                         // long slugs shrink so the pill stays inside x 80–1000
    for (; px > 24; px -= 2) { ctx.font = `600 ${px}px ${F.mono}`; if (ctx.measureText(L.url).width + 70 <= W - 160) break; }
    const tw = ctx.measureText(L.url).width + 70;
    ctx.fillStyle = C.ink; rrect(ctx, (W - tw) / 2, 1360, tw, 96, 48); ctx.fill();
    ctx.restore();
    text(ctx, L.url, W / 2, 1408 + px * .34, { font: `600 ${px}px ${F.mono}`, color: C.paper, align: 'center', alpha: pu });
  }
}

// sound cues shared by the standard sections
export const optionCues = at => at.map((t, i) => [t, 'pop', i]);
export const countdownCues = (start, end) => [...[0, 1, 2, 3].map(k => [start + k * (end - start) / 4, 'beep', 0]), [end, 'beep', 1]];
export const endCues = (start, n) => [[start, 'whoosh'], ...Array.from({ length: n }, (_, i) => [start + .3 + i * .12, 'pop', i])];
