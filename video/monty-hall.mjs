// Monty Hall short, 9:16, ~50 s. Ends with the question, never the answer:
// the hint (make the game bigger: 100 doors) is the page's own first easy explanation,
// shown only up to the point where two doors are closed again; no chances are named.
// VOICE holds the narration; setTimeline(durations) fits the scenes to the spoken lines,
// then draw(ctx, t, lang) paints one frame and cues() lists the sound events.

import {
  W, H, F, ROW, clamp, prog, easeOut, easeInOut, back, life, rng, text, rrect,
  background, kicker, optionBox, countdown, endCard, optionCues, countdownCues, endCues,
} from './lib.mjs';

export { W, H };
export let DURATION = 48;

// the page's :root
const C = {
  paper: '#EDEFF5', surface: '#FFFFFF', ink: '#141A30', muted: '#586079',
  line: '#D3D8E5', door: '#2A3DD1', doorDeep: '#1B2894', doorInk: '#F2F4FF',
  tint: '#EEEAFF', tintSoft: '#EEEDF9', accent: '#DB9500',
};

const T = {
  uk: {
    kicker: 'ПАРАДОКС МОНТІ ГОЛЛА',
    hook: 'Три двері. Одне авто. Дві кози.',
    question: 'Ви на телешоу й обрали одні з трьох дверей. Ведучий, який знає, де авто, відчиняє інші двері з козою й пропонує змінити вибір. Змінювати?',
    endQ: 'Ведучий відчинив двері з козою. Змінювати вибір?',
    mine: 'ваш вибір',
    options: ['Залишитися', 'Змінити', 'Без різниці'],
    pause: 'Зупиніть відео і вгадайте',
    hintKicker: 'ПІДКАЗКА',
    hint: 'Збільште гру: 100 дверей',
    opened: 'відчинено',
    hintSub: 'Закритих дверей знову двоє.',
    comment: 'Ваша відповідь — у коментарях',
    play: 'Гра, симуляція і 20 дверей:',
    url: 'mathparadoxes.com/uk/monty-hall',
  },
  en: {
    kicker: 'THE MONTY HALL PROBLEM',
    hook: 'Three doors. One car. Two goats.',
    question: "You're on a game show and pick one of three doors. The host, who knows where the car is, opens another door to reveal a goat and offers a switch. Should you take it?",
    endQ: 'The host showed a goat. Should you switch?',
    mine: 'your pick',
    options: ['Stay', 'Switch', 'No difference'],
    pause: 'Pause and make your guess',
    hintKicker: 'HINT',
    hint: 'Make the game bigger: 100 doors',
    opened: 'opened',
    hintSub: 'Two doors are closed again.',
    comment: 'Drop your answer in the comments',
    play: 'Play it, simulate it, try 20 doors:',
    url: 'mathparadoxes.com/monty-hall',
  },
};

// Numbers in words so the system voices read them right; a recorded voice can say anything.
export const VOICE = {
  uk: [
    'Три двері. За одними авто, за двома іншими кози.',
    'Ви на телешоу й обрали одні з трьох дверей. Ведучий, який знає, де авто, відчиняє інші двері з козою й пропонує змінити вибір. Чи варто погоджуватися?',
    'Залишитися на своїх дверях? Змінити вибір? Чи це не має значення?',
    'Зупиніть відео і вгадайте.',
    'Підказка: збільште гру. Сто дверей, одне авто. Ви обираєте одні.',
    "Ведучий відчиняє дев'яносто вісім інших. За всіма кози. Закритими лишаються ваші двері й ті, які він обминув.",
    'То залишитися чи змінити? Пишіть у коментарях, а перевірити себе можна на сайті — посилання на екрані.',
  ],
  en: [
    'Three doors. A car behind one, goats behind the other two.',
    "You're on a game show and pick one of three doors. The host, who knows where the car is, opens another door to reveal a goat and offers a switch. Should you take it?",
    'Stay with your door? Switch? Or does it make no difference?',
    'Pause the video and make your guess.',
    "Here's a hint: make the game bigger. A hundred doors, one car. You pick one.",
    'The host opens ninety-eight of the others. All goats. Two doors stay closed: yours, and the one he skipped.',
    'So, stay or switch? Drop your answer in the comments, and check it on the site. The link is on screen.',
  ],
};

// Branded sting before the first scene (intro.mjs); the tint is the problem's own colour.
export const INTRO = {
  tint: '#A99BFF',
  uk: { title: 'Парадокс Монті Голла' },
  en: { title: 'The Monty Hall problem' },
};

// ---- the 100 doors of the hint: one picked, one skipped by the host, 98 opened
const N = 100, PICK = 23, SKIP = 71;
const OPEN_ORDER = (() => {
  const rnd = rng(20261114);
  const ids = [...Array(N).keys()].filter(i => i !== PICK && i !== SKIP);
  for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
  return ids;                                   // 98 doors
})();
const OPEN_AT = new Map(OPEN_ORDER.map((d, k) => [d, k]));

// Timeline (seconds), built around the spoken lines: d[i] is the length of VOICE line i.
let S;
export function setTimeline(d) {
  S = { voice: [0.3] };
  S.doors = 0.4;
  S.question = 0.3 + d[0] + 0.5;
  S.voice[1] = S.question + 0.1;
  S.pick = S.voice[1] + d[1] * 0.28;              // «…pick one of three doors»
  S.reveal = S.voice[1] + d[1] * 0.62;            // «…opens another door to reveal a goat»
  S.options = S.voice[1] + d[1] + 0.4;
  S.voice[2] = S.options + 0.2;
  S.optAt = [0, 1, 2].map(i => S.voice[2] + [0, .4, .66][i] * d[2]);   // each card as it is said
  S.pause = S.voice[2] + d[2] + 0.3;
  S.voice[3] = S.pause;
  S.count = S.pause + d[3] + 0.2;
  S.countEnd = S.count + 4;                       // four silent seconds to think
  S.hint = S.countEnd + 1;
  S.voice[4] = S.hint + 0.2;
  S.grid = S.hint + 0.5;
  S.gridPick = Math.max(S.grid + 1.6, S.voice[4] + d[4] * 0.85);
  S.voice[5] = Math.max(S.voice[4] + d[4] + 0.4, S.gridPick + 0.6);
  S.open = S.voice[5] + d[5] * 0.15;              // «…opens ninety-eight of the others»
  S.openStep = Math.min(0.035, d[5] * 0.35 / OPEN_ORDER.length);
  S.openEnd = S.open + OPEN_ORDER.length * S.openStep + 0.5;
  S.hintSub = Math.max(S.openEnd + 0.2, S.voice[5] + d[5] * 0.75);
  S.end = Math.max(S.voice[5] + d[5] + 0.6, S.hintSub + 1.6);
  S.voice[6] = S.end + 0.3;
  DURATION = Math.ceil(S.voice[6] + d[6] + 2.5);
  return S;
}
setTimeline([3, 9, 4, 2, 5, 8, 6]);

// ---- a goat, side view, centred on (cx, cy), about 2.2·s wide
function goat(ctx, cx, cy, s, color) {
  ctx.save();
  ctx.translate(cx, cy); ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.ellipse(-.1 * s, 0, .62 * s, .32 * s, 0, 0, 7); ctx.fill();                 // body
  ctx.lineWidth = .13 * s;
  [[-.55, -.05], [-.32, .02], [.12, .02], [.34, -.05]].forEach(([x, k]) => {                     // legs
    ctx.beginPath(); ctx.moveTo(x * s, .15 * s); ctx.lineTo((x + k) * s, .78 * s); ctx.stroke();
  });
  ctx.lineWidth = .16 * s;
  ctx.beginPath(); ctx.moveTo(.38 * s, -.12 * s); ctx.lineTo(.62 * s, -.5 * s); ctx.stroke();     // neck
  ctx.beginPath(); ctx.ellipse(.78 * s, -.5 * s, .26 * s, .15 * s, .45, 0, 7); ctx.fill();       // head
  ctx.lineWidth = .07 * s;
  ctx.beginPath(); ctx.moveTo(.62 * s, -.62 * s); ctx.quadraticCurveTo(.5 * s, -.98 * s, .3 * s, -.9 * s); ctx.stroke();   // horn
  ctx.beginPath(); ctx.moveTo(.92 * s, -.4 * s); ctx.lineTo(.9 * s, -.18 * s); ctx.stroke();     // beard
  ctx.beginPath(); ctx.moveTo(-.68 * s, -.12 * s); ctx.lineTo(-.86 * s, -.3 * s); ctx.stroke();  // tail
  ctx.restore();
}

// ---- a door as on the page: blue leaf with two panels, hinged on the left, swings open
function door(ctx, x, y, w, h, open, { label = '', inside = null, r = 12, panels = true } = {}) {
  ctx.save();
  // the doorway
  ctx.fillStyle = C.paper; rrect(ctx, x, y, w, h, r); ctx.fill();
  ctx.strokeStyle = C.line; ctx.lineWidth = Math.max(2, w / 80); ctx.stroke();
  if (open > 0 && inside) inside(x + w / 2, y + h * .58, open);
  // the leaf: narrower as it swings towards the viewer
  const lw = w * (1 - .86 * easeInOut(open));
  if (lw > 1) {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, open > 0 ? '#3A4CE0' : C.door); g.addColorStop(1, C.doorDeep);
    ctx.fillStyle = g; rrect(ctx, x, y, lw, h, Math.min(r, lw / 2)); ctx.fill();
    if (panels && lw > w * .5) {
      ctx.globalAlpha = clamp((lw / w - .5) * 2);
      ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.lineWidth = Math.max(1.5, w / 90);
      rrect(ctx, x + lw * .14, y + h * .12, lw * .72, h * .34, 6); ctx.stroke();
      rrect(ctx, x + lw * .14, y + h * .6, lw * .72, h * .3, 6); ctx.stroke();
      ctx.fillStyle = C.doorInk;
      ctx.beginPath(); ctx.arc(x + lw * .84, y + h * .53, Math.max(2.5, w / 34), 0, 7); ctx.fill();   // knob
      if (label) text(ctx, label, x + lw / 2, y + h * .32, { font: `800 ${Math.round(w * .3)}px ${F.display}`, color: C.doorInk, align: 'center' });
    }
  }
  ctx.restore();
}

// ---- scene B: three doors, you pick door 1, the host opens door 3
const D3 = { w: 260, h: 400, gap: 50, y: 900 };
function drawThree(ctx, t, L, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  const x0 = (W - 3 * D3.w - 2 * D3.gap) / 2;
  for (let i = 0; i < 3; i++) {
    const p = prog(t, S.doors + i * .15, .5);
    if (p <= 0) continue;
    const x = x0 + i * (D3.w + D3.gap), s = .7 + .3 * back(p);
    ctx.save();
    ctx.globalAlpha = a * clamp(p * 3);
    ctx.translate(x + D3.w / 2, D3.y + D3.h); ctx.scale(s, s); ctx.translate(-D3.w / 2, -D3.h);
    const open = i === 2 ? easeOut(prog(t, S.reveal, .8)) : 0;
    door(ctx, 0, 0, D3.w, D3.h, open, {
      label: String(i + 1), r: 16,
      inside: (cx, cy, o) => goat(ctx, cx, cy + 20, 80, C.muted),
    });
    // your pick: a gold frame and a caption
    if (i === 0) {
      const pk = easeOut(prog(t, S.pick, .5));
      if (pk > 0) {
        ctx.globalAlpha = a * pk;
        ctx.strokeStyle = C.accent; ctx.lineWidth = 7;
        rrect(ctx, -12, -12, D3.w + 24, D3.h + 24, 24); ctx.stroke();
        text(ctx, L.mine, D3.w / 2, D3.h + 70, { font: `600 32px ${F.mono}`, color: C.accent, align: 'center' });
      }
    }
    ctx.restore();
  }
  // floor line
  const fl = easeOut(prog(t, S.doors, .6));
  ctx.strokeStyle = C.line; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(W / 2 - 440 * fl, D3.y + D3.h + 2); ctx.lineTo(W / 2 + 440 * fl, D3.y + D3.h + 2); ctx.stroke();
  ctx.restore();
}

// ---- the options: two cards on top, the third centred below
function drawOptions(ctx, L, t, a) {
  const w = 410, h = 200, gap = 28, x0 = (W - 2 * w - gap) / 2, y0 = 820;
  const pos = [[x0, y0], [x0 + w + gap, y0], [(W - w) / 2, y0 + h + gap]];
  L.options.forEach((v, i) => {
    const p = prog(t, S.optAt[i], .5);
    if (p <= 0) return;
    optionBox(ctx, C, 'ABC'[i], v, pos[i][0], pos[i][1], w, h, .4 + .6 * back(p), a * clamp(p * 3));
  });
}

// ---- scene D: 100 doors, 10 × 10
const G = { w: 64, h: 68, gx: 26, gy: 10, y: 650 };
G.x = (W - 10 * G.w - 9 * G.gx) / 2;
function drawHundred(ctx, t, L, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  let opened = 0;
  for (let i = 0; i < N; i++) {
    const r = Math.floor(i / 10), c = i % 10;
    const x = G.x + c * (G.w + G.gx), y = G.y + r * (G.h + G.gy);
    const p = prog(t, S.grid + (r + c) * .045, .35);
    if (p <= 0) continue;
    const k = OPEN_AT.get(i);
    const open = k === undefined ? 0 : easeOut(prog(t, S.open + k * S.openStep, .35));
    if (open >= .5) opened++;
    ctx.save();
    ctx.globalAlpha = a * clamp(p * 3);
    const s = .6 + .4 * back(p);
    ctx.translate(x + G.w / 2, y + G.h / 2); ctx.scale(s, s); ctx.translate(-G.w / 2, -G.h / 2);
    door(ctx, 0, 0, G.w, G.h, open, { r: 7, panels: true, inside: (cx, cy) => goat(ctx, cx - 2, cy - 4, 17, C.muted) });
    ctx.restore();
    if (i === PICK) {
      const pk = easeOut(prog(t, S.gridPick, .5));
      if (pk > 0) {
        ctx.save(); ctx.globalAlpha = a * pk;
        ctx.strokeStyle = C.accent; ctx.lineWidth = 5;
        rrect(ctx, x - 7, y - 7, G.w + 14, G.h + 14, 12); ctx.stroke();
        ctx.restore();
      }
    }
  }
  ctx.restore();
  // counter of opened doors, top right
  const aC = a * easeOut(prog(t, S.open - .3, .4));
  text(ctx, `${L.opened}: ${opened}`, W - 80, ROW.kicker, { font: `600 30px ${F.mono}`, color: C.door, align: 'right', alpha: aC });
  return opened;
}

// ---- frame
export function draw(ctx, t, lang) {
  const L = T[lang];
  background(ctx, C, t);

  // A: the hook
  const aHook = life(t, 0, S.question + .2);
  kicker(ctx, C, L.kicker, life(t, .2, S.hint));
  text(ctx, L.hook, 80, ROW.title, { font: `800 72px ${F.display}`, maxW: 920, lh: 92, alpha: aHook, dy: 30 * (1 - easeOut(prog(t, 0, .6))) });

  // B, C: the question stays while the options and the countdown run
  const aQ = life(t, S.question, S.hint);
  text(ctx, L.question, 80, ROW.question, { font: `700 48px ${F.display}`, maxW: 920, lh: 64, alpha: aQ, dy: 24 * (1 - easeOut(prog(t, S.question, .6))) });

  drawThree(ctx, t, L, 1 - easeInOut(prog(t, S.options - .4, .5)));
  drawOptions(ctx, L, t, 1 - easeInOut(prog(t, S.hint - .5, .5)));
  countdown(ctx, C, L.pause, t, S.count, S.countEnd, life(t, S.pause, S.hint));

  // D: hint
  const aH = life(t, S.hint, S.end);
  kicker(ctx, C, L.hintKicker, aH);
  text(ctx, L.hint, 80, ROW.title, { font: `800 60px ${F.display}`, maxW: 920, lh: 78, alpha: aH, dy: 24 * (1 - easeOut(prog(t, S.hint, .6))) });
  drawHundred(ctx, t, L, aH);
  text(ctx, L.hintSub, W / 2, 1530, { font: `600 44px ${F.body}`, align: 'center', alpha: life(t, S.hintSub, S.end) });

  endCard(ctx, C, { ...L, question: L.endQ }, L.options, t, S.end);
}

// ---- sound cues: [time, kind, param]
export function cues() {
  const c = [[0.05, 'whoosh'], [S.question, 'whoosh']];
  [0, 1, 2].forEach(i => c.push([S.doors + i * .15, 'tick', i]));
  c.push([S.pick, 'pop', 0], [S.reveal, 'whoosh']);
  c.push(...optionCues(S.optAt), ...countdownCues(S.count, S.countEnd));
  c.push([S.hint, 'whoosh'], [S.gridPick, 'pop', 1]);
  OPEN_ORDER.forEach((_, k) => { if (k % 4 === 0) c.push([S.open + k * S.openStep, 'tick', (k / 4) % 12]); });
  c.push(...endCues(S.end, 3));
  return c;
}
