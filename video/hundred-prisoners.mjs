// 100 prisoners short, 9:16, ~55 s. Ends with the question, never the answer: the hint is the
// page's first two (at random each has 1/2 and all together ~0; one shared rule makes the boxes
// fall into loops, so the prisoners of a loop win or lose together), shown on 10 boxes.
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
    hint: 'Навмання шанс кожного — 1/2.',
    alone: 'НАВМАННЯ · КОЖЕН САМ ПО СОБІ',
    allLabel: 'усі 100 навмання:',
    formula: '(1/2)¹⁰⁰ ≈ 7,9·10⁻³¹',
    rule: 'Одне правило для всіх',
    ruleSub: 'Відкрий коробку зі своїм номером, далі — ту, чий номер знайшов.',
    small: '10 КОРОБОК · КОЖЕН ВІДКРИВАЄ 5',
    chainOf: "в'язень №4",
    shortLoop: 'петля з 3: усі знаходять',
    longLoop: 'петля з 7: усі програють',
    hintSub: 'Виграють або програють разом.',
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
    hint: 'At random, each has 1/2.',
    alone: 'AT RANDOM · EACH ON THEIR OWN',
    allLabel: 'all 100 at random:',
    formula: '(1/2)¹⁰⁰ ≈ 7.9·10⁻³¹',
    rule: 'One rule for everyone',
    ruleSub: 'Open the box with your number, then the one whose number you found.',
    small: '10 BOXES · EACH OPENS 5',
    chainOf: 'prisoner #4',
    shortLoop: 'loop of 3: all find theirs',
    longLoop: 'loop of 7: all fail',
    hintSub: 'They win or lose together.',
    comment: 'Drop your answer in the comments',
    play: 'Play it and run 10,000 prisons:',
    url: 'mathparadoxes.com/hundred-prisoners',
  },
};

// Numbers in words so the system voices read them right; a recorded voice can say anything.
export const VOICE = {
  uk: [
    "Сто в'язнів, сто коробок, а в коробках — їхні номери, перемішані.",
    "Кожен відкриває п'ятдесят коробок. Усіх звільнять, лише якщо кожен знайде свій номер. Який шанс у найкращої стратегії?",
    "Майже нуль? До п'ятнадцяти відсотків? Від п'ятнадцяти до сорока п'яти? Чи більше?",
    'Зупиніть відео і вгадайте.',
    'Підказка: навмання шанс кожного — половина, а всіх разом — майже нуль.',
    'Але хай усі шукають за одним правилом: спершу коробка зі своїм номером, далі — та, чий номер знайшов.',
    "Тоді коробки складаються в петлі. У короткій петлі виграють усі, а в довгій усі програють. Разом.",
    'То який шанс? Пишіть у коментарях, а перевірити себе можна на сайті — посилання на екрані.',
  ],
  en: [
    "A hundred prisoners, a hundred boxes, and inside the boxes, the prisoners' numbers, shuffled.",
    'Each may open fifty boxes to find their number. All go free only if every one succeeds. What are the odds with the best strategy?',
    'Almost zero? Up to fifteen percent? Fifteen to forty-five? Or forty-five and more?',
    'Pause the video and make your guess.',
    "Here's a hint: at random, each has a one-in-two chance, and all of them together practically zero.",
    'But let everyone follow one rule: first the box with your own number, then the box whose number you found.',
    'Then the boxes form loops. In a short loop everyone finds their number, in a long one everyone fails. Together.',
    'So what are the odds? Drop your answer in the comments, and check it on the site. The link is on screen.',
  ],
};

// Branded sting before the first scene (intro.mjs); the tint is the problem's own colour.
export const INTRO = {
  tint: '#F2A766',
  uk: { title: "100 в'язнів і 100 коробок" },
  en: { title: 'The 100 prisoners problem' },
};

// the channel-grid cover (cover.mjs): a frame of the short and a hook that asks, never answers
export const COVER = {
  t: 12, crop: [820, 1540],
  uk: { hook: '100 скриньок. *50* спроб. Шанси?' },
  en: { hook: '100 boxes. *50* tries. The odds?' },
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

// The small example: 10 boxes, each prisoner opens 5. Slips form a loop of 3 (4→9→2→4) and a
// loop of 7 (1→5→8→3→10→6→7→1): a loop of 3 fits in 5 boxes, a loop of 7 does not.
const SMALL = { 1: 5, 2: 4, 3: 10, 4: 9, 5: 8, 6: 7, 7: 1, 8: 3, 9: 2, 10: 6 };
const LOOP_S = [4, 9, 2], LOOP_L = [1, 5, 8, 3, 10, 6, 7];
const CHAIN = [4, 9, 2];                       // prisoner #4: box 4 → 9, box 9 → 2, box 2 → 4 (found)

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
  S.formula = S.voice[4] + d[4] * 0.5;
  S.rule = S.voice[4] + d[4] + 0.4;
  S.voice[5] = S.rule;
  S.chain = S.rule + d[5] * 0.4;                                   // prisoner #4 follows the rule
  S.chainStep = Math.max(0.7, d[5] * 0.6 / CHAIN.length);
  S.loops = Math.max(S.voice[5] + d[5] + 0.3, S.chain + CHAIN.length * S.chainStep + 0.6);
  S.voice[6] = S.loops;
  S.loopLabels = Math.max(S.loops + d[6] * 0.35, S.loops + 2.4);
  S.together = S.loops + d[6] * 0.85;
  S.end = S.voice[6] + d[6] + 1.2;
  S.voice[7] = S.end + 0.3;
  DURATION = Math.ceil(S.voice[7] + d[7] + 1.8);
  return S;
}
setTimeline([5, 10, 6, 2, 5, 6, 7, 7]);

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
function tileState(i, t) {
  const k = Math.floor((t - S.tiles) * 2.2 + hash(i, 999) * 3);
  return hash(i, k) < .5 ? 1 : 0;
}

function drawTiles(ctx, t, L, a) {
  if (a <= 0) return;
  text(ctx, L.alone, W / 2, P.y - 34, {
    font: `600 30px ${F.mono}`, align: 'center', color: C.muted, alpha: a * easeOut(prog(t, S.tiles, .4)),
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

// ---- the rule on 10 boxes: a grid in order, prisoner #4's chain, then the boxes regroup into loops
const SB = { w: 150, h: 104, gx: 28, gy: 30, y: 800 };
function gridXY(n) {
  const i = n - 1, x0 = (W - 5 * SB.w - 4 * SB.gx) / 2;
  return [x0 + (i % 5) * (SB.w + SB.gx) + SB.w / 2, SB.y + Math.floor(i / 5) * (SB.h + SB.gy) + SB.h / 2];
}
const RING = [{ loop: LOOP_S, x: 290, y: 1080, r: 135 }, { loop: LOOP_L, x: 735, y: 1080, r: 215 }];
function ringXY(n) {
  for (const g of RING) {
    const k = g.loop.indexOf(n);
    if (k >= 0) { const a = -Math.PI / 2 + k * 2 * Math.PI / g.loop.length; return [g.x + g.r * Math.cos(a), g.y + g.r * Math.sin(a)]; }
  }
}
const chainOpen = n => { const k = CHAIN.indexOf(n); return k < 0 ? Infinity : S.chain + k * S.chainStep; };
const openAt = n => Math.min(chainOpen(n), S.loops + (n % 7) * .07);

function arrow(ctx, x1, y1, x2, y2, color, p, bend = 0) {
  const mx = (x1 + x2) / 2 - (y2 - y1) * bend, my = (y1 + y2) / 2 + (x2 - x1) * bend;
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y1);
  const steps = 24;
  let px = x1, py = y1, qx = x1, qy = y1;
  for (let i = 1; i <= Math.round(steps * p); i++) {
    const u = i / steps;
    qx = px; qy = py;
    px = (1 - u) ** 2 * x1 + 2 * (1 - u) * u * mx + u * u * x2;
    py = (1 - u) ** 2 * y1 + 2 * (1 - u) * u * my + u * u * y2;
    ctx.lineTo(px, py);
  }
  ctx.stroke();
  if (p >= 1) {                                // head
    const ang = Math.atan2(py - qy, px - qx);
    ctx.beginPath(); ctx.moveTo(px, py);
    ctx.lineTo(px - 20 * Math.cos(ang - .45), py - 20 * Math.sin(ang - .45));
    ctx.lineTo(px - 20 * Math.cos(ang + .45), py - 20 * Math.sin(ang + .45)); ctx.closePath(); ctx.fill();
  }
}

// a point on the way from box a's centre to box b's, stopping at the edge of b
function edge(ax, ay, bx, by, w, h) {
  const dx = bx - ax, dy = by - ay, k = Math.min(Math.abs((w / 2 + 6) / (dx || 1e-6)), Math.abs((h / 2 + 6) / (dy || 1e-6)));
  return [bx - dx * k, by - dy * k];
}

function drawSmall(ctx, t, L, a) {
  if (a <= 0) return;
  text(ctx, L.small, W / 2, SB.y - 40, { font: `600 30px ${F.mono}`, align: 'center', color: C.muted, alpha: a });
  const m = easeInOut(prog(t, S.loops + .7, 1.1));                  // all open, then grid → loops
  const pos = n => { const [gx, gy] = gridXY(n), [rx, ry] = ringXY(n); return [gx + (rx - gx) * m, gy + (ry - gy) * m]; };
  const bw = SB.w - 40 * m, bh = SB.h - 24 * m;
  ctx.save(); ctx.globalAlpha = a;
  // prisoner #4's chain as a line under the grid: 4 → 9 → 2 → 4 ✓
  const chainA = 1 - easeInOut(prog(t, S.loops + .4, .4));
  if (chainA > 0) {
    const yC = SB.y + 2 * (SB.h + SB.gy) + 60;
    const steps = CHAIN.filter(n => t >= chainOpen(n) + .2).length;
    const parts = [String(CHAIN[0]), ...CHAIN.slice(0, steps).map(n => String(SMALL[n]))];
    const line = `${L.chainOf}: ${parts.join(' → ')}${steps === CHAIN.length ? ' ✓' : ''}`;
    text(ctx, line, W / 2, yC, { font: `700 44px ${F.mono}`, align: 'center', color: C.accent, alpha: a * chainA * easeOut(prog(t, S.chain, .4)) });
  }
  // loop arrows (ring phase)
  const la = easeOut(prog(t, S.loops + 1.8, .5));
  if (la > 0) {
    RING.forEach((g, gi) => g.loop.forEach((n, k) => {
      const nxt = g.loop[(k + 1) % g.loop.length];
      const [x1, y1] = pos(n), [x2, y2] = pos(nxt);
      const [sx, sy] = edge(x2, y2, x1, y1, bw, bh), [ex, ey] = edge(x1, y1, x2, y2, bw, bh);
      ctx.globalAlpha = a * .9;
      arrow(ctx, sx, sy, ex, ey, gi ? C.loss : C.win, easeOut(prog(t, S.loops + 1.8 + k * .12, .35)), .12);
    }));
  }
  // boxes
  for (let n = 1; n <= 10; n++) {
    const [cx, cy] = pos(n);
    const op = prog(t, openAt(n), .25), shown = op >= .5, sq = op > 0 && op < 1 ? Math.max(.08, Math.abs(1 - 2 * op)) : 1;
    const inShort = LOOP_S.includes(n), found = n === 2 && shown && t < S.loops;
    const ring = m > .5 ? (inShort ? C.win : C.loss) : null;
    ctx.globalAlpha = a;
    ctx.fillStyle = shown ? (found ? C.hitSoft : C.surface) : C.day;
    rrect(ctx, cx - bw / 2, cy - bh * sq / 2, bw, bh * sq, 12); ctx.fill();
    if (shown) { ctx.strokeStyle = ring || (found ? C.hit : C.line); ctx.lineWidth = ring || found ? 4 : 2; rrect(ctx, cx - bw / 2, cy - bh * sq / 2, bw, bh * sq, 12); ctx.stroke(); }
    if (sq > .6) {
      // lid number small at the top, slip number big once open
      text(ctx, String(n), cx - bw / 2 + 14, cy - bh / 2 + 28, { font: `600 22px ${F.mono}`, color: shown ? C.muted : C.dayInk, alpha: a });
      if (shown) text(ctx, String(SMALL[n]), cx, cy + 20, { font: `800 ${Math.round(48 - 8 * m)}px ${F.display}`, align: 'center', color: found ? C.hit : C.ink, alpha: a });
    }
  }
  ctx.restore();
  const al = easeOut(prog(t, S.loopLabels, .5));
  text(ctx, L.shortLoop, RING[0].x, 1400, { font: `700 30px ${F.body}`, align: 'center', color: C.win, alpha: a * al });
  text(ctx, L.longLoop, RING[1].x, 1400, { font: `700 30px ${F.body}`, align: 'center', color: C.loss, alpha: a * al });
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
  // part 1: at random, each 1/2 and all together ~0
  const a1 = life(t, S.hint, S.rule);
  text(ctx, L.hint, 80, ROW.title, { font: `800 64px ${F.display}`, maxW: 920, lh: 80, alpha: a1, dy: 24 * (1 - easeOut(prog(t, S.hint, .6))) });
  drawTiles(ctx, t, L, a1);
  const aF = Math.min(a1, easeOut(prog(t, S.formula, .5)));
  text(ctx, L.allLabel, W / 2, 1440, { font: `600 32px ${F.mono}`, align: 'center', color: C.muted, alpha: aF });
  text(ctx, L.formula, W / 2, 1515, { font: `700 54px ${F.mono}`, align: 'center', color: C.ink, alpha: aF });
  // part 2: one rule for everyone, then the loops
  const a2 = life(t, S.rule, S.end);
  const nRule = text(ctx, L.rule, 80, ROW.title, { font: `800 64px ${F.display}`, maxW: 920, lh: 80, alpha: a2, dy: 24 * (1 - easeOut(prog(t, S.rule, .6))) }) || 1;
  text(ctx, L.ruleSub, 80, ROW.title + nRule * 80 + 4, { font: `600 38px ${F.body}`, maxW: 920, lh: 50, color: C.muted, alpha: a2 });
  drawSmall(ctx, t, L, a2);
  text(ctx, L.hintSub, W / 2, 1490, { font: `700 46px ${F.body}`, maxW: 900, lh: 60, align: 'center', alpha: life(t, S.together, S.end) });

  endCard(ctx, C, { ...L, question: L.endQ }, L.options, t, S.end);
}

// ---- sound cues: [time, kind, param]
export function cues() {
  const c = [[0.05, 'whoosh'], [S.question, 'whoosh']];
  for (let k = 0; k < OPEN; k += 5) c.push([openT(k), 'tick', k / 5]);
  c.push(...optionCues(S.optAt), ...countdownCues(S.count, S.countEnd));
  c.push([S.hint, 'whoosh']);
  for (let k = 0; k < 6; k++) c.push([S.tiles + k * .1, 'tick', k]);
  c.push([S.rule, 'whoosh']);
  CHAIN.forEach((_, k) => c.push([S.chain + k * S.chainStep, 'tick', k * 2]));
  c.push([S.loops, 'whoosh']);
  for (let k = 0; k < 10; k++) c.push([S.loops + 1.8 + k * .12, 'pluck', k]);
  c.push([S.together, 'chime']);
  c.push(...endCues(S.end, 4));
  return c;
}
