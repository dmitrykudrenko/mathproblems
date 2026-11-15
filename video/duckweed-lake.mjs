// Duckweed lake short, 9:16, ~45 s. Ends with the question, never the answer:
// the hint (duckweed multiplies, it doesn't add) is the page's own first hint, and the lake
// grows only up to day 27, as the page's hero does before the visitor answers, so the
// half-covered day is never shown. VOICE holds the narration; setTimeline(durations) fits the
// scenes to the spoken lines, draw(ctx, t, lang) paints one frame, cues() lists the sounds.

import {
  W, H, F, ROW, clamp, prog, easeOut, easeInOut, back, life, rng, text, rrect,
  background, kicker, optionsGrid, countdown, endCard, optionCues, countdownCues, endCues,
} from './lib.mjs';

export { W, H };
export let DURATION = 45;

const C = {
  paper: '#EDEFF5', surface: '#FFFFFF', ink: '#141A30', muted: '#586079',
  line: '#D3D8E5', day: '#2A3DD1', hit: '#DB9500', water: '#F7F9FC',
  tint: '#EAF0D8', tintSoft: '#ECEFE6', accent: '#DB9500',
};

const T = {
  uk: {
    kicker: 'ЗАДАЧА ПРО РЯСКУ В ОЗЕРІ',
    hook: 'Одна крихітна рослина може вкрити ціле озеро.',
    question: 'Ряска щодня подвоюється, і одна рослина вкриває озеро за 30 днів. За скільки днів упораються дві рослини?',
    lakeA: '1 рослина · 30 днів', lakeB: '2 рослини · ? днів',
    pause: 'Зупиніть відео і вгадайте',
    hintKicker: 'ПІДКАЗКА',
    hint: 'Ряска не додає площу, а множиться.',
    day: 'день', plants: n => ukPl(n, 'рослина', 'рослини', 'рослин'),
    hintSub: 'Удвічі більше рослин — не удвічі швидше.',
    comment: 'Ваша відповідь — у коментарях',
    play: 'Гра, графіки і п’ять пояснень:',
    url: 'mathparadoxes.com/uk/duckweed-lake',
    sep: ' ',
  },
  en: {
    kicker: 'THE DUCKWEED LAKE PUZZLE',
    hook: 'One tiny plant can cover an entire lake.',
    question: 'Duckweed doubles every day, and one plant covers a lake in 30 days. How long do two plants take?',
    lakeA: '1 plant · 30 days', lakeB: '2 plants · ? days',
    pause: 'Pause and make your guess',
    hintKicker: 'HINT',
    hint: "Duckweed doesn't add area, it multiplies.",
    day: 'day', plants: n => (n === 1 ? 'plant' : 'plants'),
    hintSub: "Twice the plants isn't twice as fast.",
    comment: 'Drop your answer in the comments',
    play: 'A game, charts and five explanations:',
    url: 'mathparadoxes.com/duckweed-lake',
    sep: ',',
  },
};

function ukPl(n, one, few, many) {
  const a = n % 10, b = n % 100;
  if (a === 1 && b !== 11) return one;
  if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return few;
  return many;
}
const fmt = (n, sep) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, sep);

// Numbers in words so the system voices read them right; a recorded voice can say anything.
export const VOICE = {
  uk: [
    'Одна крихітна рослина може вкрити ціле озеро.',
    'Ряска щодня подвоюється, і одна рослина вкриває озеро за тридцять днів. За скільки днів упораються дві рослини?',
    "За кілька днів? Близько п'ятнадцяти? Помітно менше тридцяти? Чи майже тридцять?",
    'Зупиніть відео і вгадайте.',
    'Підказка: ряска не додає площу, а множиться. Одна, дві, чотири, вісім, шістнадцять…',
    'Тож удвічі більше рослин зовсім не означає удвічі швидше.',
    'То за скільки днів? Напишіть відповідь у коментарях, а перевірити себе можна на сайті — посилання на екрані.',
  ],
  en: [
    'One tiny plant can cover an entire lake.',
    'Duckweed doubles every day, and one plant covers a lake in thirty days. How long do two plants take?',
    'A few days? About fifteen? Well under thirty? Or almost thirty?',
    'Pause the video and make your guess.',
    "Here's a hint: duckweed doesn't add area, it multiplies. One, two, four, eight, sixteen…",
    "So twice the plants doesn't mean twice as fast.",
    'So how many days? Drop your answer in the comments, and check it on the site. The link is on screen.',
  ],
};

// Branded sting before the first scene (intro.mjs); the tint is the problem's own colour.
export const INTRO = {
  tint: '#C5DB6E',
  uk: { title: 'Задача про ряску в озері' },
  en: { title: 'The duckweed lake puzzle' },
};

// round-1 zones of the page, in its order («about half of 30» said as «about 15» to fit a card)
const OPTIONS = {
  uk: ['Кілька днів', 'Близько 15', 'Помітно менше 30', 'Майже 30'],
  en: ['A few days', 'About 15', 'Well under 30', 'Almost 30'],
};

const LAST_DAY = 27;            // the page's hero stops here before an answer: day 29 (half) is never shown
const A = 2 ** 30;              // the lake holds 2^30 plants (page model)
const cover = d => Math.min(1, 2 ** d / A);

// Timeline (seconds), built around the spoken lines: d[i] is the length of VOICE line i.
let S;
export function setTimeline(d) {
  S = { voice: [0.3] };
  S.drop = 0.3 + d[0] * 0.55;                                     // the plant lands as the hook ends
  S.question = 0.3 + d[0] + 0.5;
  S.voice[1] = S.question + 0.1;
  S.drop2 = S.voice[1] + d[1] * 0.62;                             // two plants as «дві рослини» is said
  S.options = S.voice[1] + d[1] + 0.4;
  S.voice[2] = S.options + 0.2;
  S.optAt = [0, 1, 2, 3].map(i => S.voice[2] + i * d[2] / 4);
  S.pause = S.voice[2] + d[2] + 0.3;
  S.voice[3] = S.pause;
  S.count = S.pause + d[3] + 0.2;
  S.countEnd = S.count + 4;                                        // four silent seconds to think
  S.hint = S.countEnd + 1;
  S.voice[4] = S.hint + 0.2;
  S.grow = S.voice[4] + d[4] * 0.42;                              // day 0 as «one, two, four…» begins
  S.slow = Math.max(0.42, d[4] * 0.5 / 4.5);                      // days 0–4 at the pace of the counting
  S.fast = 0.26;
  S.growEnd = S.grow + 4 * S.slow + (LAST_DAY - 4) * S.fast;
  S.voice[5] = Math.max(S.voice[4] + d[4] + 0.4, S.growEnd - d[5] * 0.6);
  S.hintSub = S.voice[5] + 0.2;
  S.end = Math.max(S.voice[5] + d[5] + 0.6, S.growEnd + 1.6);
  S.voice[6] = S.end + 0.3;
  DURATION = Math.ceil(S.voice[6] + d[6] + 2.5);
  return S;
}
setTimeline([2.6, 7, 6, 2, 7, 3.5, 7]);

const dayAt = t => {
  const x = t - S.grow;
  if (x <= 0) return 0;
  if (x < 4 * S.slow) return x / S.slow;
  return Math.min(LAST_DAY, 4 + (x - 4 * S.slow) / S.fast);
};

// ---- the lake: cells inside a wobbly shoreline (as on the page), filled outward from a seed
const SHORE = th => 1 + 0.045 * Math.sin(3 * th + 0.6) + 0.03 * Math.cos(5 * th);
const CELL = 0.044;
const CELLS = (() => {
  const r = rng(7), cells = [];
  for (let y = -1.1; y <= 1.1; y += CELL * 0.866) {
    const row = Math.round(y / (CELL * 0.866));
    for (let x = -1.1; x <= 1.1; x += CELL) {
      const px = x + (row % 2 ? CELL / 2 : 0) + (r() - .5) * CELL * .35, py = y + (r() - .5) * CELL * .35;
      if (Math.hypot(px, py) < 0.93 * SHORE(Math.atan2(py, px))) cells.push({ x: px, y: py, n: r() });
    }
  }
  const seed = [-0.2, 0.12];
  return cells.map(c => ({ c, s: Math.hypot(c.x - seed[0], c.y - seed[1]) + c.n * 0.22 }))
    .sort((a, b) => a.s - b.s).map(o => o.c);
})();

function shore(ctx, cx, cy, R) {
  ctx.beginPath();
  for (let i = 0; i <= 120; i++) {
    const th = i / 120 * 2 * Math.PI, q = R * SHORE(th) / 1.08;
    const x = cx + q * Math.cos(th), y = cy + q * Math.sin(th);
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.closePath();
}

function lakeBody(ctx, cx, cy, R, a) {
  ctx.save(); ctx.globalAlpha = a;
  ctx.shadowColor = 'rgba(20,26,48,.08)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 10;
  shore(ctx, cx, cy, R); ctx.fillStyle = C.surface; ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = C.line; ctx.lineWidth = 4; ctx.stroke();
  // a few quiet ripples on the water
  ctx.strokeStyle = C.line; ctx.lineWidth = 3; ctx.lineCap = 'round';
  [[.35, -.45, .16], [.45, .38, .12], [-.5, -.15, .1]].forEach(([x, y, w]) => {
    ctx.beginPath(); ctx.moveTo(cx + (x - w) * R, cy + y * R);
    ctx.quadraticCurveTo(cx + x * R, cy + (y - .04) * R, cx + (x + w) * R, cy + y * R); ctx.stroke();
  });
  ctx.restore();
}

// one floating plant with a ripple that spreads when it lands
function plant(ctx, x, y, t, t0, a, r = 13) {
  const p = prog(t, t0, .45);
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  const rb = easeOut(prog(t, t0 + .3, 1.2));
  if (rb > 0 && rb < 1) {
    ctx.globalAlpha = a * (1 - rb) * .6; ctx.strokeStyle = C.hit; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(x, y, r + 70 * rb, 0, 7); ctx.stroke();
  }
  ctx.globalAlpha = a * clamp(p * 3);
  const yy = y - 120 * (1 - easeInOut(clamp(p * 1.4)));
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, yy, r * back(p), 0, 7); ctx.fill();
  ctx.restore();
}

// duckweed cover: old growth in ink, the last day's growth in amber (the page's colours)
function duckweed(ctx, cx, cy, R, day, a) {
  const sc = R / 1.08, cr = CELL * sc * 0.6, N = CELLS.length;
  const cnt = cover(day) * N, full = Math.floor(cnt), prev = Math.floor(cover(day - 1) * N);
  ctx.save(); ctx.globalAlpha = a;
  for (let i = 0; i < Math.min(full, N); i++) {
    const c = CELLS[i];
    ctx.fillStyle = i >= prev ? C.hit : C.ink;
    ctx.beginPath(); ctx.arc(cx + c.x * sc, cy + c.y * sc, cr, 0, 7); ctx.fill();
  }
  if (full < N) {   // the partly grown cell: a speck whose area matches the fraction, never invisible
    const c = CELLS[full];
    ctx.fillStyle = full >= prev ? C.hit : C.ink;
    ctx.beginPath(); ctx.arc(cx + c.x * sc, cy + c.y * sc, Math.max(6, cr * Math.sqrt(cnt - full)), 0, 7); ctx.fill();
  }
  ctx.restore();
}

// ---- frame
export function draw(ctx, t, lang) {
  const L = T[lang];
  background(ctx, C, t);

  // A: hook, one big lake, one plant lands
  const aHook = life(t, 0, S.question + .2);
  kicker(ctx, C, L.kicker, life(t, .2, S.hint));
  text(ctx, L.hook, 80, ROW.title, { font: `800 72px ${F.display}`, maxW: 920, lh: 90, alpha: aHook, dy: 30 * (1 - easeOut(prog(t, 0, .6))) });

  // the lake moves from the middle (hook) to the left half (question), a second lake joins it
  const m = easeInOut(prog(t, S.question, .8));
  const aLakes = 1 - easeInOut(prog(t, S.options - .4, .5));
  const lx = 540 + (300 - 540) * m, ly = 1080 + (1170 - 1080) * m, lr = 340 + (215 - 340) * m;
  if (aLakes > 0) {
    lakeBody(ctx, lx, ly, lr, aLakes * easeOut(prog(t, .2, .6)));
    plant(ctx, lx - .2 * lr, ly + .1 * lr, t, S.drop, aLakes);
    const a2 = aLakes * easeOut(prog(t, S.question + .5, .6));
    if (a2 > 0) {
      const rx = 780, ry = 1170, rr = 215;
      lakeBody(ctx, rx, ry, rr, a2);
      plant(ctx, rx - .25 * rr, ry + .05 * rr, t, S.drop2, a2);
      plant(ctx, rx + .02 * rr, ry - .02 * rr, t, S.drop2 + .25, a2);
      text(ctx, L.lakeA, 300, 1445, { font: `600 30px ${F.mono}`, color: C.muted, align: 'center', alpha: a2 });
      text(ctx, L.lakeB, 780, 1445, { font: `600 30px ${F.mono}`, color: C.ink, align: 'center', alpha: aLakes * easeOut(prog(t, S.drop2, .5)) });
    }
  }

  // B, C: question stays while the options and the countdown run
  const aQ = life(t, S.question, S.hint);
  text(ctx, L.question, 80, ROW.question, { font: `700 52px ${F.display}`, maxW: 920, lh: 70, alpha: aQ, dy: 24 * (1 - easeOut(prog(t, S.question, .6))) });

  optionsGrid(ctx, C, OPTIONS[lang], S.optAt, t, 1 - easeInOut(prog(t, S.hint - .5, .5)), { y0: 820, h: 220 });
  countdown(ctx, C, L.pause, t, S.count, S.countEnd, life(t, S.pause, S.hint));

  // D: hint, the lake doubling day by day from one plant, up to day 27 only
  const aH = life(t, S.hint, S.end);
  if (aH > 0) {
    kicker(ctx, C, L.hintKicker, aH);
    text(ctx, L.hint, 80, ROW.title, { font: `800 64px ${F.display}`, maxW: 920, lh: 82, alpha: aH, dy: 24 * (1 - easeOut(prog(t, S.hint, .6))) });
    const cx = 540, cy = 1010, R = 290;
    lakeBody(ctx, cx, cy, R, aH);
    const day = dayAt(t);
    if (t >= S.grow) duckweed(ctx, cx, cy, R, day, aH);
    const dd = Math.floor(day + 1e-9), n = 2 ** dd;
    const aN = aH * easeOut(prog(t, S.grow, .4));
    text(ctx, String(dd), 250, 1390, { font: `800 76px ${F.display}`, align: 'center', alpha: aN });
    text(ctx, L.day, 250, 1438, { font: `600 30px ${F.mono}`, align: 'center', color: C.muted, alpha: aN });
    text(ctx, fmt(n, L.sep), 680, 1390, { font: `800 ${n >= 1e7 ? 58 : 76}px ${F.display}`, align: 'center', color: C.day, alpha: aN });
    text(ctx, L.plants(n), 680, 1438, { font: `600 30px ${F.mono}`, align: 'center', color: C.muted, alpha: aN });
    text(ctx, L.hintSub, W / 2, 1520, { font: `700 40px ${F.body}`, align: 'center', alpha: life(t, S.hintSub, S.end) });
  }

  endCard(ctx, C, L, OPTIONS[lang], t, S.end);
}

// ---- sound cues: [time, kind, param]
export function cues() {
  const c = [[0.05, 'whoosh'], [S.drop + .3, 'pluck', 0], [S.question, 'whoosh'], [S.drop2 + .3, 'pluck', 1], [S.drop2 + .55, 'pluck', 2]];
  c.push(...optionCues(S.optAt), ...countdownCues(S.count, S.countEnd));
  c.push([S.hint, 'whoosh']);
  for (let k = 0; k <= LAST_DAY; k++) c.push([S.grow + (k <= 4 ? k * S.slow : 4 * S.slow + (k - 4) * S.fast), 'tick', k]);
  c.push(...endCues(S.end, 4));
  return c;
}
