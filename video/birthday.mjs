// Birthday paradox short, 9:16, ~40 s. Ends with the question, never the answer:
// the hint (count pairs) is the one the page itself gives.
// VOICE holds the narration; setTimeline(durations) fits the scenes to the spoken lines,
// then draw(ctx, t, lang) paints one frame and cues() lists the sound events.

import {
  W, H, F, ROW, clamp, prog, easeOut, easeInOut, back, life, rise, rng, text, rrect,
  background, kicker, optionsGrid, countdown, endCard, optionCues, countdownCues, endCues,
} from './lib.mjs';

export { W, H };
export let DURATION = 40;

const C = {
  paper: '#EDEFF5', surface: '#FFFFFF', ink: '#141A30', muted: '#586079',
  line: '#D3D8E5', day: '#2A3DD1', hit: '#DB9500', cell: '#E1E5F0',
  tint: '#E6F8D8', tintSoft: '#EEF5EA', accent: '#DB9500',
};

const T = {
  uk: {
    kicker: 'ПАРАДОКС ДНІВ НАРОДЖЕННЯ',
    year: 'У році 365 днів.',
    question: 'Скільки людей має зібратися в кімнаті, щоб двоє з них, імовірно, народилися в один день?',
    room: 'у кімнаті',
    pause: 'Зупиніть відео і вгадайте',
    hintKicker: 'ПІДКАЗКА',
    hint: 'Рахуйте не людей, а пари.',
    people: 'людей', pairs: 'пар',
    hintSub: 'Кожна пара — ще один шанс на збіг.',
    comment: 'Ваша відповідь — у коментарях',
    play: 'Гра і 10 000 кімнат:',
    url: 'mathparadoxes.com/uk/birthday',
    months: 'СЛБКТЧЛСВЖЛГ',
  },
  en: {
    kicker: 'THE BIRTHDAY PARADOX',
    year: 'A year has 365 days.',
    question: 'How many people must be in a room before two of them probably share a birthday?',
    room: 'in the room',
    pause: 'Pause and make your guess',
    hintKicker: 'HINT',
    hint: 'Count pairs, not people.',
    people: 'people', pairs: 'pairs',
    hintSub: 'Every pair is one more chance of a match.',
    comment: 'Drop your answer in the comments',
    play: 'Play it and run 10,000 rooms:',
    url: 'mathparadoxes.com/birthday',
    months: 'JFMAMJJASOND',
  },
};

// Numbers in words so the system voices read them right; a recorded voice can say anything.
export const VOICE = {
  uk: [
    "У році триста шістдесят п'ять днів.",
    'Скільки людей має зібратися в кімнаті, щоб двоє з них, імовірно, народилися в один день?',
    "Двадцять три? П'ятдесят сім? Сто вісімдесят три? Чи двісті п'ятдесят три?",
    'Зупиніть відео і вгадайте.',
    'Підказка: рахуйте не людей, а пари. Кожен новий гість утворює пару з усіма, хто вже в кімнаті.',
    "Десять людей — це вже сорок п'ять пар. І кожна пара — ще один шанс на збіг.",
    'То скільки людей треба? Напишіть відповідь у коментарях, а перевірити себе можна на сайті — посилання на екрані.',
  ],
  en: [
    'A year has three hundred sixty-five days.',
    'How many people must be in a room before two of them probably share a birthday?',
    'Twenty-three? Fifty-seven? A hundred eighty-three? Or two hundred fifty-three?',
    'Pause the video and make your guess.',
    "Here's a hint: count pairs, not people. Every newcomer makes a pair with everyone already in the room.",
    'Ten people already make forty-five pairs. And every pair is one more chance of a match.',
    'So how many people does it take? Drop your answer in the comments, and check it on the site. The link is on screen.',
  ],
};

// Branded sting before the first scene (intro.mjs); the tint is the problem's own colour.
export const INTRO = {
  tint: '#B8EB8F',
  uk: { title: 'Парадокс днів народження' },
  en: { title: 'The birthday paradox' },
};

const OPTIONS = ['23', '57', '183', '253'];
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const N_PEOPLE = 7, N_NODES = 10;

// Timeline (seconds), built around the spoken lines: d[i] is the length of VOICE line i.
let S;
export function setTimeline(d) {
  S = { gridIn: 0.4, voice: [0.3] };
  S.question = 0.3 + d[0] + 0.5;
  S.voice[1] = S.question + 0.1;
  S.people = S.question + 0.9;
  S.peopleStep = Math.max(0.45, (d[1] - 1) / N_PEOPLE);
  S.options = S.voice[1] + d[1] + 0.4;
  S.voice[2] = S.options + 0.2;
  S.optAt = [0, 1, 2, 3].map(i => S.voice[2] + i * d[2] / 4);   // each card as its number is said
  S.pause = S.voice[2] + d[2] + 0.3;
  S.voice[3] = S.pause;
  S.count = S.pause + d[3] + 0.2;
  S.countEnd = S.count + 4;                                        // four silent seconds to think
  S.hint = S.countEnd + 1;
  S.voice[4] = S.hint + 0.2;
  S.nodes = S.hint + 0.6;
  S.nodeStep = 0.75;
  S.voice[5] = Math.max(S.voice[4] + d[4] + 0.4, S.nodes + (N_NODES - 1) * S.nodeStep + 1.2);
  S.hintSub = S.voice[5] + d[5] * 0.45;
  S.end = S.voice[5] + d[5] + 0.6;
  S.voice[6] = S.end + 0.3;
  DURATION = Math.ceil(S.voice[6] + d[6] + 2.5);
  return S;
}
setTimeline([2.6, 6, 5, 2, 7, 6, 6]);

// Seven distinct days for the people who walk in (fixed seed, no match on screen)
const DAYS = (() => {
  const rnd = rng(20261114);
  const set = new Set();
  while (set.size < N_PEOPLE) set.add(Math.floor(rnd() * 365));
  return [...set];
})();

// ---- calendar: 12 month columns, days down
const G = { x: 98, y: 800, cw: 66, ch: 20, gx: 6, gy: 4 };
function cellXY(day) {
  let m = 0, d = day;
  while (d >= MONTH_DAYS[m]) d -= MONTH_DAYS[m++];
  return [G.x + m * (G.cw + G.gx), G.y + d * (G.ch + G.gy), m, d];
}

function drawCalendar(ctx, t, L, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  for (let m = 0; m < 12; m++)
    text(ctx, L.months[m], G.x + m * (G.cw + G.gx) + G.cw / 2, G.y - 22,
      { font: `600 26px ${F.mono}`, color: C.muted, align: 'center', alpha: easeOut(prog(t, S.gridIn + m * .05, .4)) });
  for (let day = 0; day < 365; day++) {
    const [x, y, m, d] = cellXY(day);
    const p = easeOut(prog(t, S.gridIn + (m * 31 + d) * 0.0045, .3));
    if (p <= 0) continue;
    ctx.fillStyle = C.cell;
    const s = .6 + .4 * p;
    ctx.globalAlpha = a * p;
    rrect(ctx, x + G.cw * (1 - s) / 2, y + G.ch * (1 - s) / 2, G.cw * s, G.ch * s, 5); ctx.fill();
  }
  // people landing on their days
  DAYS.forEach((day, i) => {
    const t0 = S.people + i * S.peopleStep;
    const p = prog(t, t0, .35);
    if (p <= 0) return;
    const [x, y] = cellXY(day);
    const cx = x + G.cw / 2, cy = y + G.ch / 2;
    // ring burst
    const rb = easeOut(prog(t, t0, .6));
    ctx.globalAlpha = a * (1 - rb) * .5;
    ctx.strokeStyle = C.day; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(cx, cy, 14 + 50 * rb, 0, 7); ctx.stroke();
    // filled cell
    ctx.globalAlpha = a;
    ctx.fillStyle = C.day;
    const s = back(p);
    rrect(ctx, cx - G.cw / 2 * s, cy - G.ch / 2 * s, G.cw * s, G.ch * s, 5); ctx.fill();
  });
  ctx.restore();
}

// ---- pairs hint: people on a circle, every newcomer joins everyone already there
const CIR = { x: W / 2, y: 930, r: 270 };
const nodeXY = k => {
  const ang = -Math.PI / 2 + k * 2 * Math.PI / N_NODES;
  return [CIR.x + CIR.r * Math.cos(ang), CIR.y + CIR.r * Math.sin(ang)];
};
const lineT = (k, j) => S.nodes + k * S.nodeStep + .25 + j * .06;

function pairsDone(t) {
  let n = 0;
  for (let k = 1; k < N_NODES; k++) for (let j = 0; j < k; j++) if (t >= lineT(k, j) + .3) n++;
  return n;
}

function drawPairs(ctx, t, L, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  for (let k = 1; k < N_NODES; k++) for (let j = 0; j < k; j++) {
    const p = easeOut(prog(t, lineT(k, j), .3));
    if (p <= 0) continue;
    const [x1, y1] = nodeXY(k), [x2, y2] = nodeXY(j);
    const fresh = 1 - prog(t, lineT(k, j) + .3, .8);
    ctx.strokeStyle = fresh > 0 ? C.hit : C.day;
    ctx.globalAlpha = a * (fresh > 0 ? .5 + .5 * fresh : .28);
    ctx.lineWidth = fresh > 0 ? 4 : 3;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 + (x2 - x1) * p, y1 + (y2 - y1) * p); ctx.stroke();
  }
  ctx.globalAlpha = a;
  for (let k = 0; k < N_NODES; k++) {
    const p = prog(t, S.nodes + k * S.nodeStep, .4);
    if (p <= 0) continue;
    const [x, y] = nodeXY(k), s = back(p);
    ctx.fillStyle = C.surface; ctx.beginPath(); ctx.arc(x, y, 34 * s, 0, 7); ctx.fill();
    ctx.fillStyle = C.day; ctx.beginPath(); ctx.arc(x, y, 24 * s, 0, 7); ctx.fill();
  }
  ctx.restore();
  // counters
  const people = Array.from({ length: N_NODES }, (_, k) => t >= S.nodes + k * S.nodeStep).filter(Boolean).length;
  const pairs = pairsDone(t);
  const cy = 1370;
  [[L.people, people, 300], [L.pairs, pairs, 780]].forEach(([lab, v, x]) => {
    text(ctx, String(v), x, cy, { font: `800 120px ${F.display}`, align: 'center', alpha: a, color: lab === L.pairs ? C.day : C.ink });
    text(ctx, lab, x, cy + 56, { font: `600 34px ${F.mono}`, align: 'center', color: C.muted, alpha: a });
  });
}

// ---- frame
export function draw(ctx, t, lang) {
  const L = T[lang];
  background(ctx, C, t);

  // A: the year
  const aYear = life(t, 0, S.question + .2);
  kicker(ctx, C, L.kicker, life(t, .2, S.hint));
  text(ctx, L.year, 80, ROW.title, { font: `800 76px ${F.display}`, maxW: 920, lh: 94, alpha: aYear, dy: 30 * (1 - easeOut(prog(t, 0, .6))) });

  // B, C: question stays while options and countdown run
  const aQ = life(t, S.question, S.hint);
  text(ctx, L.question, 80, ROW.question, { font: `700 54px ${F.display}`, maxW: 900, lh: 72, alpha: aQ, dy: 24 * (1 - easeOut(prog(t, S.question, .6))) });

  drawCalendar(ctx, t, L, 1 - easeInOut(prog(t, S.options - .4, .5)));
  // people counter under the calendar
  const inRoom = DAYS.filter((_, i) => t >= S.people + i * S.peopleStep).length;
  const aRoom = life(t, S.people, S.options - .2);
  text(ctx, `${L.room}: ${inRoom}`, W - 80, 250, { font: `600 26px ${F.mono}`, color: C.day, align: 'right', alpha: aRoom });

  optionsGrid(ctx, C, OPTIONS, S.optAt, t, 1 - easeInOut(prog(t, S.hint - .5, .5)));
  countdown(ctx, C, L.pause, t, S.count, S.countEnd, life(t, S.pause, S.hint));

  // D: hint
  const aH = life(t, S.hint, S.end);
  kicker(ctx, C, L.hintKicker, aH);
  text(ctx, L.hint, 80, ROW.title, { font: `800 68px ${F.display}`, maxW: 900, lh: 86, alpha: aH, dy: 24 * (1 - easeOut(prog(t, S.hint, .6))) });
  drawPairs(ctx, t, L, aH);
  text(ctx, L.hintSub, W / 2, 1520, { font: `600 42px ${F.body}`, align: 'center', alpha: life(t, S.hintSub, S.end) });

  endCard(ctx, C, L, OPTIONS, t, S.end);
}

// ---- sound cues: [time, kind, param]
export function cues() {
  const c = [[0.05, 'whoosh'], [S.question, 'whoosh']];
  DAYS.forEach((_, i) => c.push([S.people + i * S.peopleStep, 'tick', i]));
  c.push(...optionCues(S.optAt), ...countdownCues(S.count, S.countEnd));
  c.push([S.hint, 'whoosh']);
  for (let k = 0; k < N_NODES; k++) c.push([S.nodes + k * S.nodeStep, 'tick', k]);
  for (let k = 1; k < N_NODES; k++) for (let j = 0; j < k; j++) c.push([lineT(k, j) + .3, 'pluck', k * (k - 1) / 2 + j]);
  c.push(...endCues(S.end, OPTIONS.length));
  return c;
}
