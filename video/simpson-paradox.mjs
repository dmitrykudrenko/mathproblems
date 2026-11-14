// Simpson's paradox short, 9:16, ~45 s. Ends with the question, never the answer:
// only the overall results (what the page shows before the guess) and the page's own hint
// (did both treatments get the same kind of patients?). The split by stone size stays on the site.

import {
  W, H, F, ROW, clamp, prog, easeOut, easeInOut, back, life, text, rrect,
  background, kicker, optionsGrid, countdown, endCard, optionCues, countdownCues, endCues,
} from './lib.mjs';

export { W, H };
export let DURATION = 45;

const C = {
  paper: '#EDEFF5', surface: '#FFFFFF', ink: '#141A30', muted: '#586079',
  line: '#D3D8E5', day: '#2A3DD1', hit: '#DB9500', cell: '#D9DEEA',
  tint: '#C9EDE5', tintSoft: '#E8F3F2', accent: '#DB9500',
  easy: '#8FD6C6', hard: '#1C6F61',
};

// Overall results only, as on the page before the guess (Charig et al., 1986): 273/350 = 78%, 289/350 = 83%
const N = 350, WIN = [273, 289], PCT = ['78%', '83%'];

const T = {
  uk: {
    kicker: 'ПАРАДОКС СІМПСОНА',
    hook: 'Вам обирати метод лікування каменів у нирках.',
    question: 'Метод A успішно лікує камені в нирках у 78% випадків, метод B у 83%. Який метод ви оберете для себе?',
    names: ['A · відкрита операція', 'B · через прокол'],
    patients: '350 пацієнтів',
    success: 'успішно',
    pause: 'Зупиніть відео і оберіть',
    hintKicker: 'ПІДКАЗКА',
    hint: 'Чи однакових пацієнтів отримали обидва методи?',
    easy: 'легкі випадки', hard: 'важкі випадки',
    hintSub: 'Порівнюйте схожих пацієнтів між собою.',
    options: ['Відкрита операція', 'Через прокол'],
    endOptions: ['78%', '83%'],
    comment: 'Ваша відповідь — у коментарях',
    play: 'Розбивка, симуляція і пояснення:',
    url: 'mathparadoxes.com/uk/simpson-paradox',
  },
  en: {
    kicker: "SIMPSON'S PARADOX",
    hook: 'You have to pick a treatment for kidney stones.',
    question: 'Treatment A succeeds with kidney stones in 78% of cases, treatment B in 83%. Which would you choose for yourself?',
    names: ['A · open surgery', 'B · percutaneous'],
    patients: '350 patients',
    success: 'success',
    pause: 'Pause and make your pick',
    hintKicker: 'HINT',
    hint: 'Did both treatments get the same kind of patients?',
    easy: 'easy cases', hard: 'hard cases',
    hintSub: 'Compare similar patients with each other.',
    options: ['Open surgery', 'Through a puncture'],
    endOptions: ['78%', '83%'],
    comment: 'Drop your answer in the comments',
    play: 'The split, a simulation, the why:',
    url: 'mathparadoxes.com/simpson-paradox',
  },
};

// Numbers in words; «Бе» so the Ukrainian voice reads the Latin B as people say it.
export const VOICE = {
  uk: [
    'Уявіть: вам обирати метод лікування каменів у нирках.',
    'Метод А успішний у сімдесяти восьми відсотках випадків, метод Бе — у вісімдесяти трьох. Який метод ви оберете для себе?',
    'Відкрита операція, метод А? Чи операція через прокол, метод Бе?',
    'Зупиніть відео і оберіть.',
    'Підказка: спитайте себе, чи однакових пацієнтів отримали обидва методи.',
    'Одні випадки важчі за інші для будь-якого методу. Тож порівнюйте схожих пацієнтів між собою.',
    'То який метод оберете ви? Напишіть у коментарях, а перевірити себе можна на сайті — посилання на екрані.',
  ],
  en: [
    'Picture this: you have to pick a treatment for kidney stones. Three hundred fifty patients got each one.',
    'Treatment A succeeds with kidney stones in seventy-eight percent of cases, treatment B in eighty-three. Which would you choose for yourself?',
    'Open surgery, treatment A? Or surgery through a small puncture, treatment B?',
    'Pause the video and make your pick.',
    "Here's a hint: before trusting those percentages, ask yourself whether both treatments got the same kind of patients.",
    'Some cases are harder for any treatment. So compare similar patients with each other.',
    'So which one would you choose? Drop your answer in the comments, and check it on the site. The link is on screen.',
  ],
};

export const INTRO = {
  tint: '#5FD6BE',
  uk: { title: 'Парадокс Сімпсона' },
  en: { title: "Simpson's paradox" },
};

// Timeline (seconds), built around the spoken lines: d[i] is the length of VOICE line i.
let S;
export function setTimeline(d) {
  S = { voice: [0.3] };
  S.dots = 0.6;                                                    // patients appear during the hook
  S.question = 0.3 + d[0] + 0.5;
  S.voice[1] = S.question + 0.1;
  S.fill = S.question + 0.6;                                       // successes fill in while the question is read
  S.fillDur = Math.max(2.5, d[1] * 0.55);
  S.options = S.voice[1] + d[1] + 0.4;
  S.voice[2] = S.options + 0.2;
  S.optAt = [S.voice[2] + 0.1, S.voice[2] + d[2] * 0.5];           // each card as its treatment is said
  S.pause = S.voice[2] + d[2] + 0.3;
  S.voice[3] = S.pause;
  S.count = S.pause + d[3] + 0.2;
  S.countEnd = S.count + 4;                                        // four silent seconds to think
  S.hint = S.countEnd + 1;
  S.voice[4] = S.hint + 0.2;
  S.hDots = S.hint + 0.5;
  S.mix = S.hint + 1.2;                                            // easy/hard mix starts to shift
  S.voice[5] = S.voice[4] + d[4] + 0.4;
  S.hintSub = S.voice[5] + d[5] * 0.4;
  S.end = S.voice[5] + d[5] + 0.8;
  S.voice[6] = S.end + 0.3;
  DURATION = Math.ceil(S.voice[6] + d[6] + 2.5);
  return S;
}
setTimeline([5, 8, 4, 2, 6, 5, 6]);

// ---- patient grids: 350 dots per treatment, 18 per row (19 full rows + 8), filled row by row
const GR = { cols: 18, rows: 20, pitch: 22, r: 7.5, xs: [94, 590], y: 900 };
const gw = GR.cols * GR.pitch;                                     // 396 px
const dotXY = (g, i) => [GR.xs[g] + (i % GR.cols) * GR.pitch + GR.pitch / 2, GR.y + Math.floor(i / GR.cols) * GR.pitch + GR.pitch / 2];

function drawGrids(ctx, t, L, a, y0, mode) {
  if (a <= 0) return;
  const yOff = y0 - GR.y;
  for (let g = 0; g < 2; g++) {
    const x0 = GR.xs[g], cx = x0 + gw / 2;
    text(ctx, L.names[g], cx, y0 - 70, { font: `700 34px ${F.body}`, align: 'center', color: C.ink, alpha: a });
    text(ctx, L.patients, cx, y0 - 26, { font: `600 24px ${F.mono}`, align: 'center', color: C.muted, alpha: a });
    // share of easy cases for the hint: unknown, keeps shifting (out of phase for A and B)
    const ph = mode === 'hint' ? easeOut(prog(t, S.mix, 1.2)) : 0;
    const share = .5 + .32 * Math.sin((t - S.mix) * 1.25 + g * Math.PI) * ph;
    ctx.save(); ctx.globalAlpha = a;
    for (let i = 0; i < N; i++) {
      const [x, y] = dotXY(g, i);
      let col = C.cell, s = 1;
      if (mode === 'fill') {
        const pIn = prog(t, S.dots + i * 0.004 + g * .15, .3);
        if (pIn <= 0) continue;
        s = back(pIn);
        const k = Math.floor(WIN[g] * clamp((t - S.fill) / S.fillDur));
        if (i < k) col = C.day;
      } else {
        const pIn = prog(t, S.hDots + i * 0.003 + g * .12, .3);
        if (pIn <= 0) continue;
        s = back(pIn);
        // row-major order: top rows easy, bottom rows hard, the boundary moves
        const row = Math.floor(i / GR.cols);
        const easyRows = share * GR.rows;
        if (ph > 0) col = row + .5 < easyRows ? C.easy : C.hard;
        if (ph > 0 && ph < 1) col = row + .5 < easyRows ? mixHex(C.cell, C.easy, ph) : mixHex(C.cell, C.hard, ph);
      }
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(x, y + yOff, GR.r * s, 0, 7); ctx.fill();
    }
    ctx.restore();
    if (mode === 'fill') {
      // success counter and the page's bar under each grid
      const pc = prog(t, S.fill, S.fillDur);
      const yb = y0 + GR.rows * GR.pitch + 50;
      const k = Math.floor(WIN[g] * clamp(pc));
      const aC = a * easeOut(prog(t, S.fill, .4));
      text(ctx, `${k} / ${N}`, x0 + 4, yb, { font: `600 28px ${F.mono}`, color: C.muted, alpha: aC });
      text(ctx, pc >= 1 ? PCT[g] : `${Math.round(100 * k / N)}%`, x0 + gw - 4, yb + 2, { font: `800 44px ${F.display}`, align: 'right', color: C.day, alpha: aC });
      ctx.save(); ctx.globalAlpha = aC;
      ctx.fillStyle = C.surface; ctx.strokeStyle = C.line; ctx.lineWidth = 2;
      rrect(ctx, x0, yb + 22, gw, 22, 11); ctx.fill(); ctx.stroke();
      if (k > 0) { ctx.fillStyle = C.day; rrect(ctx, x0, yb + 22, gw * k / N, 22, 11); ctx.fill(); }
      ctx.restore();
    } else {
      text(ctx, '?', cx, y0 + GR.rows * GR.pitch + 90, { font: `800 76px ${F.display}`, align: 'center', color: C.hard, alpha: a * easeOut(prog(t, S.mix + .6, .5)) });
    }
  }
  if (mode === 'hint') {
    // legend between the grids' heads and the dots
    const aL = a * easeOut(prog(t, S.mix, .6)), yl = y0 + GR.rows * GR.pitch + 160;
    ctx.font = `600 30px ${F.body}`;
    const items = [[C.easy, L.easy], [C.hard, L.hard]], gap = 70, sw = 38;
    const widths = items.map(([, lab]) => sw + ctx.measureText(lab).width);
    let x = (W - widths[0] - widths[1] - gap) / 2;
    items.forEach(([col, lab], i) => {
      ctx.save(); ctx.globalAlpha = aL; ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(x + 12, yl - 10, 12, 0, 7); ctx.fill(); ctx.restore();
      text(ctx, lab, x + sw, yl, { font: `600 30px ${F.body}`, color: C.ink, alpha: aL });
      x += widths[i] + gap;
    });
  }
}

function mixHex(a, b, p) {
  const h = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16));
  const [x, y] = [h(a), h(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * p)).join(',')})`;
}

// ---- frame
export function draw(ctx, t, lang) {
  const L = T[lang];
  background(ctx, C, t);

  // A: hook
  kicker(ctx, C, L.kicker, life(t, .2, S.hint));
  text(ctx, L.hook, 80, ROW.title, { font: `800 68px ${F.display}`, maxW: 920, lh: 86, alpha: life(t, 0, S.question + .2), dy: 30 * (1 - easeOut(prog(t, 0, .6))) });

  // B, C: question stays while options and countdown run
  const aQ = life(t, S.question, S.hint);
  text(ctx, L.question, 80, ROW.question, { font: `700 52px ${F.display}`, maxW: 920, lh: 70, alpha: aQ, dy: 24 * (1 - easeOut(prog(t, S.question, .6))) });

  drawGrids(ctx, t, L, 1 - easeInOut(prog(t, S.options - .4, .5)), GR.y, 'fill');

  optionsGrid(ctx, C, L.options, S.optAt, t, 1 - easeInOut(prog(t, S.hint - .5, .5)), { y0: 900, h: 300 });
  countdown(ctx, C, L.pause, t, S.count, S.countEnd, life(t, S.pause, S.hint));

  // D: hint
  const aH = life(t, S.hint, S.end);
  kicker(ctx, C, L.hintKicker, aH);
  text(ctx, L.hint, 80, ROW.title, { font: `800 64px ${F.display}`, maxW: 920, lh: 82, alpha: aH, dy: 24 * (1 - easeOut(prog(t, S.hint, .6))) });
  drawGrids(ctx, t, L, aH, 820, 'hint');
  text(ctx, L.hintSub, W / 2, 1515, { font: `600 42px ${F.body}`, align: 'center', maxW: 900, alpha: life(t, S.hintSub, S.end) });

  endCard(ctx, C, L, L.endOptions, t, S.end);
}

// ---- sound cues: [time, kind, param]
export function cues() {
  const c = [[0.05, 'whoosh'], [S.question, 'whoosh']];
  for (let k = 0; k < 8; k++) c.push([S.fill + k * S.fillDur / 8, 'tick', k]);
  c.push(...optionCues(S.optAt), ...countdownCues(S.count, S.countEnd));
  c.push([S.hint, 'whoosh'], [S.mix, 'pluck', 0], [S.mix + .6, 'pluck', 1]);
  c.push(...endCues(S.end, 2));
  return c;
}
