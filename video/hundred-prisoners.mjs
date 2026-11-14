// 100 prisoners short, 9:16, ~45 s. Ends with the question, never the answer and never the
// loop strategy: the hint is the page's first one (each alone has 1/2; chances multiply only
// when the prisoners succeed independently; what if they won or lost together?).
// VOICE holds the narration; setTimeline(durations) fits the scenes to the spoken lines,
// then draw(ctx, t, lang) paints one frame and cues() lists the sound events.

import {
  W, H, F, ROW, clamp, prog, easeOut, easeInOut, back, life, rng, text, rrect,
  background, kicker, optionsGrid, countdown, endCard, optionCues, countdownCues, endCues,
} from './lib.mjs';

export { W, H };
export let DURATION = 45;

const C = {
  paper: '#EDEFF5', surface: '#FFFFFF', ink: '#141A30', muted: '#586079',
  line: '#D3D8E5', day: '#2A3DD1', dayInk: '#F2F4FF', hit: '#DB9500', hitSoft: '#FFF1CF',
  cell: '#E1E5F0', win: '#157F51', loss: '#BF3E28',
  tint: '#F0E6DC', tintSoft: '#EEEBE9', accent: '#DB9500',
};

const T = {
  uk: {
    kicker: "100 В'ЯЗНІВ І 100 КОРОБОК",
    hook: ["100 в'язнів.", '100 коробок.'],
    endQ: "100 в'язнів, кожен відкриває 50 коробок зі 100. Який шанс у найкращої стратегії?",
    hookSub: "У кожній коробці — номер одного з в'язнів. Усе перемішано.",
    question: "Кожен із 100 в'язнів може відкрити 50 коробок зі 100, щоб знайти свій номер. Усіх звільнять, лише якщо свій номер знайде кожен. Який шанс у найкращої стратегії?",
    seeker: "в'язень №7 · відкрито",
    options: ['Майже 0%', 'До 15%', '15–45%', '45% і більше'],
    pause: 'Зупиніть відео і вгадайте',
    hintKicker: 'ПІДКАЗКА',
    hint: 'Шанс кожного окремо — 1/2.',
    alone: 'НАВМАННЯ · КОЖЕН САМ ПО СОБІ',
    together: 'А ЯКЩО РАЗОМ?',
    allLabel: 'усі 100 навмання:',
    formula: '(1/2)¹⁰⁰ ≈ 7,9·10⁻³¹',
    hintSub: 'А якщо вони виграють або програють разом?',
    comment: 'Ваша відповідь — у коментарях',
    play: 'Гра і 10 000 симуляцій:',
    url: 'mathparadoxes.com/uk/hundred-prisoners',
  },
  en: {
    kicker: 'THE 100 PRISONERS PROBLEM',
    hook: ['100 prisoners.', '100 boxes.'],
    endQ: 'Each of 100 prisoners opens 50 of 100 boxes. What are the odds with the best strategy?',
    hookSub: "Each box holds one prisoner's number. All shuffled.",
    question: 'Each of 100 prisoners may open 50 of 100 boxes to find their number. All go free only if every one succeeds. What are the odds with the best strategy?',
    seeker: 'prisoner #7 · opened',
    options: ['Almost 0%', 'Up to 15%', '15–45%', '45% or more'],
    pause: 'Pause and make your guess',
    hintKicker: 'HINT',
    hint: "Each one's own chance is 1/2.",
    alone: 'AT RANDOM · EACH ON THEIR OWN',
    together: 'WHAT IF TOGETHER?',
    allLabel: 'all 100 at random:',
    formula: '(1/2)¹⁰⁰ ≈ 7.9·10⁻³¹',
    hintSub: 'What if they won or lost together?',
    comment: 'Drop your answer in the comments',
    play: 'Play it and run 10,000 prisons:',
    url: 'mathparadoxes.com/hundred-prisoners',
  },
};

// Numbers in words so the system voices read them right; a recorded voice can say anything.
export const VOICE = {
  uk: [
    "Сто в'язнів і сто коробок, а в коробках — перемішані номери в'язнів.",
    "Кожен відкриває п'ятдесят коробок. Усіх звільнять, лише якщо кожен знайде свій номер. Який шанс у найкращої стратегії?",
    "Майже нуль? До п'ятнадцяти відсотків? Від п'ятнадцяти до сорока п'яти? Чи сорок п'ять і більше?",
    'Зупиніть відео і вгадайте.',
    'Підказка: шанс кожного окремо — одна друга. Навмання успіхи незалежні, і шанси множаться.',
    "Разом це майже нуль. А якщо в'язні вигравали б або програвали всі разом?",
    'То який шанс? Напишіть відповідь у коментарях, а перевірити себе можна на сайті — посилання на екрані.',
  ],
  en: [
    "A hundred prisoners, a hundred boxes, and inside the boxes, the prisoners' numbers, shuffled.",
    'Each may open fifty boxes to find their number. All go free only if every one succeeds. What are the odds with the best strategy?',
    'Almost zero? Up to fifteen percent? Fifteen to forty-five? Or forty-five and more?',
    'Pause the video and make your guess.',
    "Here's a hint: each prisoner's own chance is one half. Searching at random, their results are independent, so the chances multiply.",
    'One half to the power of a hundred is practically zero. But what if a strategy made them win or lose together?',
    'So what are the odds? Drop your answer in the comments, and check it on the site. The link is on screen.',
  ],
};

// Branded sting before the first scene (intro.mjs); the tint is the problem's own colour.
export const INTRO = {
  tint: '#F2A766',
  uk: { title: "100 в'язнів і 100 коробок" },
  en: { title: 'The 100 prisoners problem' },
};

const N = 100, OPEN = 50, ME = 7;

// Slips inside the boxes: a fixed random permutation; prisoner #7 opens 50 boxes at random
const SLIP = (() => {
  const rnd = rng(20261114), a = Array.from({ length: N }, (_, i) => i + 1);
  for (let i = N - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
})();
const OPENED = (() => {
  const rnd = rng(7007), a = Array.from({ length: N }, (_, i) => i);
  for (let i = N - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a.slice(0, OPEN);
})();

// Timeline (seconds), built around the spoken lines: d[i] is the length of VOICE line i.
let S;
export function setTimeline(d) {
  S = { wallIn: 0.5, voice: [0.3] };
  S.hookSub = 0.3 + d[0] * 0.3;
  S.question = 0.3 + d[0] + 0.5;
  S.voice[1] = S.question + 0.1;
  S.open = S.question + 0.8;
  S.openStep = Math.max(0.08, (d[1] - 2.2) / OPEN);
  S.options = S.voice[1] + d[1] + 0.4;
  S.voice[2] = S.options + 0.2;
  S.optAt = [0, 1, 2, 3].map(i => S.voice[2] + i * d[2] / 4);   // each card as it is said
  S.pause = S.voice[2] + d[2] + 0.3;
  S.voice[3] = S.pause;
  S.count = S.pause + d[3] + 0.2;
  S.countEnd = S.count + 4;                                        // four silent seconds to think
  S.hint = S.countEnd + 1;
  S.voice[4] = S.hint + 0.2;
  S.tiles = S.hint + 0.6;
  S.voice[5] = S.voice[4] + d[4] + 0.4;
  S.formula = S.voice[5];
  S.together = S.voice[5] + d[5] * 0.45;
  S.end = Math.max(S.voice[5] + d[5] + 0.6, S.together + 3.5);
  S.voice[6] = S.end + 0.3;
  DURATION = Math.ceil(S.voice[6] + d[6] + 2.5);
  return S;
}
setTimeline([5, 10, 6, 2, 8, 7, 7]);

// ---- the wall of 100 numbered boxes (round 2's boxes, as on the page)
const B = { x: 95, y: 900, w: 80, h: 56, g: 10, gy: 8 };
const boxXY = i => [B.x + (i % 10) * (B.w + B.g), B.y + Math.floor(i / 10) * (B.h + B.gy)];
const openT = k => S.open + k * S.openStep;

function drawWall(ctx, t, a, y0) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  for (let i = 0; i < N; i++) {
    let [x, y] = boxXY(i);
    y += y0 - B.y;
    const p = easeOut(prog(t, S.wallIn + ((i % 10) + Math.floor(i / 10)) * 0.03, .35));
    if (p <= 0) continue;
    const k = OPENED.indexOf(i);
    const op = k >= 0 ? prog(t, openT(k), .2) : 0;
    const mine = op > 0 && SLIP[i] === ME;
    const s = .6 + .4 * p;
    ctx.globalAlpha = a * p;
    // lid flips: squash vertically, then show the slip
    const sq = op > 0 && op < 1 ? Math.abs(1 - 2 * op) : 1;
    const shown = op >= .5;
    const bw = B.w * s, bh = B.h * s * Math.max(.08, sq);
    const cx = x + B.w / 2, cy = y + B.h / 2;
    ctx.fillStyle = shown ? (mine ? C.hitSoft : C.surface) : C.day;
    rrect(ctx, cx - bw / 2, cy - bh / 2, bw, bh, 9); ctx.fill();
    if (shown) {
      ctx.strokeStyle = mine ? C.hit : C.line; ctx.lineWidth = mine ? 3 : 1.5;
      rrect(ctx, cx - bw / 2, cy - bh / 2, bw, bh, 9); ctx.stroke();
    }
    if (sq > .6) {
      const num = shown ? SLIP[i] : i + 1;
      text(ctx, String(num), cx, cy + 11, {
        font: `${shown ? 700 : 600} 30px ${F.mono}`, align: 'center',
        color: shown ? (mine ? C.hit : C.ink) : C.dayInk, alpha: a * p,
      });
    }
  }
  ctx.restore();
}

// ---- hint: 100 prisoners as tiles, each one found (green check) or not (red cross)
const P = { x: 165, y: 640, s: 62, g: 13 };
const hash = (a, b) => { let h = (a * 374761393 + b * 668265263) >>> 0; h = ((h ^ (h >>> 13)) * 1274126177) >>> 0; return ((h ^ (h >>> 16)) >>> 0) / 2 ** 32; };
// irregular run of together-outcomes (no fixed rhythm, no ratio to read off)
const TOGETHER = [1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1];

function tileState(i, t) {
  if (t >= S.together) {
    const k = Math.floor((t - S.together) / .7);
    return TOGETHER[k % TOGETHER.length];
  }
  const k = Math.floor((t - S.tiles) * 2.2 + hash(i, 999) * 3);
  return hash(i, k) < .5 ? 1 : 0;
}

function drawTiles(ctx, t, L, a) {
  if (a <= 0) return;
  const tog = t >= S.together;
  text(ctx, tog ? L.together : L.alone, W / 2, P.y - 34, {
    font: `600 30px ${F.mono}`, align: 'center', color: tog ? C.accent : C.muted,
    alpha: a * easeOut(prog(t, tog ? S.together : S.tiles, .4)),
  });
  ctx.save();
  for (let i = 0; i < N; i++) {
    const x = P.x + (i % 10) * (P.s + P.g), y = P.y + Math.floor(i / 10) * (P.s + P.g);
    const p = prog(t, S.tiles + ((i % 10) + Math.floor(i / 10)) * .025, .35);
    if (p <= 0) continue;
    const st = tileState(i, t), s = back(p);
    const cx = x + P.s / 2, cy = y + P.s / 2, r = P.s / 2 * s;
    ctx.globalAlpha = a;
    ctx.fillStyle = st ? C.win : C.surface;
    rrect(ctx, cx - r, cy - r, 2 * r, 2 * r, 12 * s); ctx.fill();
    if (!st) { ctx.strokeStyle = C.loss; ctx.lineWidth = 3; rrect(ctx, cx - r, cy - r, 2 * r, 2 * r, 12 * s); ctx.stroke(); }
    ctx.strokeStyle = st ? '#FFFFFF' : C.loss; ctx.lineWidth = 6 * s; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    const q = 11 * s;
    if (st) { ctx.moveTo(cx - q, cy); ctx.lineTo(cx - q / 3, cy + q * .7); ctx.lineTo(cx + q, cy - q * .7); }
    else { ctx.moveTo(cx - q * .8, cy - q * .8); ctx.lineTo(cx + q * .8, cy + q * .8); ctx.moveTo(cx + q * .8, cy - q * .8); ctx.lineTo(cx - q * .8, cy + q * .8); }
    ctx.stroke();
  }
  ctx.restore();
}

// ---- frame
export function draw(ctx, t, lang) {
  const L = T[lang];
  background(ctx, C, t);

  // A: hook — the prisoners and the boxes
  const aHook = life(t, 0, S.question + .2);
  kicker(ctx, C, L.kicker, life(t, .2, S.hint));
  L.hook.forEach((s, i) => text(ctx, s, 80, ROW.title + i * 94, { font: `800 76px ${F.display}`, alpha: aHook, dy: 30 * (1 - easeOut(prog(t, 0, .6))) }));
  text(ctx, L.hookSub, 80, 640, { font: `600 44px ${F.body}`, maxW: 900, lh: 58, color: C.muted, alpha: Math.min(aHook, easeOut(prog(t, S.hookSub, .5))) });

  // B, C: question stays while options and countdown run
  const aQ = life(t, S.question, S.hint);
  text(ctx, L.question, 80, ROW.question, { font: `700 46px ${F.display}`, maxW: 920, lh: 60, alpha: aQ, dy: 24 * (1 - easeOut(prog(t, S.question, .6))) });

  // the wall: a little lower under the hook, slides up under the question
  const wy = 820 + 80 * (1 - easeInOut(prog(t, S.question, .7)));
  drawWall(ctx, t, 1 - easeInOut(prog(t, S.options - .4, .5)), wy);
  const opened = OPENED.filter((_, k) => t >= openT(k) + .1).length;
  const aSeek = life(t, S.open, S.options - .2);
  text(ctx, `${L.seeker} ${opened}/${OPEN}`, W - 80, 250, { font: `600 26px ${F.mono}`, color: C.day, align: 'right', alpha: aSeek });

  optionsGrid(ctx, C, L.options, S.optAt, t, 1 - easeInOut(prog(t, S.hint - .5, .5)), { y0: 820, h: 230 });
  countdown(ctx, C, L.pause, t, S.count, S.countEnd, life(t, S.pause, S.hint), { y: 1365 });

  // D: hint
  const aH = life(t, S.hint, S.end);
  kicker(ctx, C, L.hintKicker, aH);
  text(ctx, L.hint, 80, ROW.title, { font: `800 64px ${F.display}`, maxW: 920, lh: 80, alpha: aH, dy: 24 * (1 - easeOut(prog(t, S.hint, .6))) });
  drawTiles(ctx, t, L, aH);
  // the random-search product, then the page's question
  const aF = Math.min(aH, easeOut(prog(t, S.formula, .5))) * (1 - easeInOut(prog(t, S.together - .2, .4)));
  text(ctx, L.allLabel, W / 2, 1440, { font: `600 32px ${F.mono}`, align: 'center', color: C.muted, alpha: aF });
  text(ctx, L.formula, W / 2, 1515, { font: `700 54px ${F.mono}`, align: 'center', color: C.ink, alpha: aF });
  text(ctx, L.hintSub, W / 2, 1450, { font: `700 46px ${F.body}`, maxW: 900, lh: 60, align: 'center', alpha: life(t, S.together, S.end) });

  endCard(ctx, C, { ...L, question: L.endQ }, L.options, t, S.end);
}

// ---- sound cues: [time, kind, param]
export function cues() {
  const c = [[0.05, 'whoosh'], [S.question, 'whoosh']];
  for (let k = 0; k < OPEN; k += 5) c.push([openT(k), 'tick', k / 5]);
  c.push(...optionCues(S.optAt), ...countdownCues(S.count, S.countEnd));
  c.push([S.hint, 'whoosh']);
  for (let k = 0; k < 6; k++) c.push([S.tiles + k * .1, 'tick', k]);
  c.push([S.together, 'chime']);
  for (let k = 1; k < 7; k++) c.push([S.together + k * .7, 'pluck', k]);
  c.push(...endCues(S.end, 4));
  return c;
}
