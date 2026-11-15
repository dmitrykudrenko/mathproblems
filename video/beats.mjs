// Shorts told as a list of beats instead of a hand-made animation: the formats around the
// puzzles (a research figure, a glossary word, a true story, a try-it-yourself, a costly
// mistake, what visitors chose). A video file is a spec:
//   export default makeShort({ format, intro, cover, url, beats: [{ say, show }, …] })
// `say` is one spoken line (VOICE), `show` what the screen holds while it is said:
//   { title, sub }                         a big line and a smaller one
//   { stat, label, source }                one huge number or phrase with its caption
//   { compare: [{ value, label }], source } two or three numbers side by side
//   { question, options, countdown }       the question, answer cards, a silent 4 s guess
//   { bars: [{ label, n }], title, note }  a vote count per option, none marked right
//   { steps: [...] }                       a numbered list
//   { end: cta, play }                     the closing card with the page link (spec.url)
// Each beat also takes `kicker` (default: the format's). The format sets the kicker and colours,
// so every video of one format looks the same and the formats differ from each other.
import {
  W, H, F, ROW, clamp, prog, easeOut, easeInOut, back, life, text, rrect, wrap,
  background, kicker, optionsGrid, countdown, optionCues, countdownCues,
} from './lib.mjs';
import { T0 } from './intro.mjs';

const BASE = { paper: '#EDEFF5', surface: '#FFFFFF', ink: '#141A30', muted: '#586079', line: '#D3D8E5' };
export const FORMATS = {
  wrong: { kicker: 'MOST PEOPLE GET THIS WRONG', tint: '#FFD9D2', tintSoft: '#F6ECEA', accent: '#D2462F', intro: '#FF8A73' },
  word:  { kicker: 'ONE WORD, 40 SECONDS', tint: '#CFF1EC', tintSoft: '#E8F3F1', accent: '#0F8F80', intro: '#5FD6C6' },
  story: { kicker: 'A TRUE STORY', tint: '#F7E6C4', tintSoft: '#F3EEE3', accent: '#B87400', intro: '#F2B84B' },
  try:   { kicker: 'TRY IT YOURSELF', tint: '#DDF2CF', tintSoft: '#ECF3E6', accent: '#3D8B1F', intro: '#9BDB6F' },
  cost:  { kicker: 'A COSTLY MISTAKE', tint: '#E3DCFA', tintSoft: '#EDEAF6', accent: '#5B3FD1', intro: '#A99BFF' },
  poll:  { kicker: 'WHAT VISITORS CHOSE', tint: '#D7E3FF', tintSoft: '#E8EDF8', accent: '#2A3DD1', intro: '#8FA8FF' },
};

const GAP = 0.55;                       // silence after each line
const ABCD = 'ABCDE';

export function makeShort(spec) {
  const fmt = FORMATS[spec.format], C = { ...BASE, ...fmt, day: fmt.accent };
  const beats = spec.beats;
  let S = { start: [], voice: [], end: [] }, DURATION = 30;

  function setTimeline(d) {
    let t = 0.3;
    S = { start: [], voice: [], end: [], count: [] };
    beats.forEach((b, i) => {
      S.start[i] = t;
      S.voice[i] = t + 0.2;
      let e = S.voice[i] + d[i] + GAP;
      if (b.show.countdown) { S.count[i] = S.voice[i] + d[i] + 0.2; e = S.count[i] + 4 + 0.6; }
      if (b.show.end) e = Math.max(e, S.voice[i] + 4.5) + 1.5;
      S.end[i] = e; t = e;
    });
    DURATION = Math.ceil(t);
    return S;
  }
  setTimeline(beats.map(b => Math.max(2, b.say.split(' ').length / 2.6)));

  // ---- the beat kinds
  function title(ctx, s, t0, t, a) {
    const n = text(ctx, s.title, 80, ROW.title, { font: `800 ${s.size || 76}px ${F.display}`, maxW: 920, lh: (s.size || 76) * 1.22, alpha: a, dy: 24 * (1 - easeOut(prog(t, t0, .6))) });
    if (s.sub) text(ctx, s.sub, 80, ROW.title + n * (s.size || 76) * 1.22 + 40, { font: `500 46px ${F.body}`, maxW: 900, lh: 62, color: C.muted, alpha: a * easeOut(prog(t, t0 + .5, .5)) });
  }

  function source(ctx, s, a) {
    if (s) text(ctx, s, 80, 1500, { font: `500 28px ${F.mono}`, color: C.muted, alpha: a, maxW: 920, lh: 38 });
  }

  function fitFont(ctx, s, weight, family, max, maxW) {
    let px = max;
    for (; px > 40; px -= 4) { ctx.font = `${weight} ${px}px ${family}`; if (ctx.measureText(s).width <= maxW) break; }
    return px;
  }

  function stat(ctx, s, t0, t, a) {
    const p = easeOut(prog(t, t0 + .2, .7));
    const px = fitFont(ctx, s.stat, 800, F.display, s.size || 230, 920);
    ctx.save(); ctx.globalAlpha = a * p;
    ctx.translate(W / 2, 960); ctx.scale(.85 + .15 * back(p), .85 + .15 * back(p));
    ctx.font = `800 ${px}px ${F.display}`; ctx.fillStyle = C.accent; ctx.textAlign = 'center';
    ctx.fillText(s.stat, 0, px * .36);
    ctx.restore();
    if (s.label) text(ctx, s.label, W / 2, 1170, { font: `600 50px ${F.body}`, align: 'center', maxW: 900, lh: 66, alpha: a * easeOut(prog(t, t0 + .7, .5)) });
    source(ctx, s.source, a * easeOut(prog(t, t0 + 1.2, .5)));
  }

  function compare(ctx, s, t0, t, a, dur) {
    const n = s.compare.length, colW = 920 / n;
    s.compare.forEach((c, i) => {
      const at = t0 + .3 + i * Math.max(.6, (dur - 1) / n);
      const p = easeOut(prog(t, at, .6));
      if (p <= 0) return;
      const cx = 80 + colW * (i + .5);
      const px = fitFont(ctx, c.value, 800, F.display, n > 2 ? 150 : 210, colW - 30);
      // a light card behind each number
      ctx.save(); ctx.globalAlpha = a * p * .9; ctx.fillStyle = C.surface;
      rrect(ctx, cx - colW / 2 + 12, 760, colW - 24, 420, 32); ctx.fill(); ctx.restore();
      text(ctx, c.value, cx, 1000, { font: `800 ${px}px ${F.display}`, align: 'center', color: c.color === 'accent' ? C.accent : C.ink, alpha: a * p, dy: 30 * (1 - p) });
      text(ctx, c.label, cx, 1090, { font: `600 40px ${F.body}`, align: 'center', color: C.muted, maxW: colW - 60, lh: 50, alpha: a * p });
    });
    source(ctx, s.source, a * easeOut(prog(t, t0 + 1, .5)));
  }

  // question, cards and countdown share 430–1540 px: the question shrinks before the cards do
  function question(ctx, s, t0, t, a, i) {
    const rows = s.options ? Math.ceil(s.options.length / 2) : 0;
    let px = 56, n, cardH = 230;
    fit: for (cardH of [230, 200, 180]) {
      const need = rows ? rows * cardH + (rows - 1) * 30 + 80 : 0;
      for (px = 56; px >= 44; px -= 4) {
        ctx.font = `700 ${px}px ${F.display}`;
        n = wrap(ctx, s.question, 900).length;
        if (ROW.question + n * px * 1.32 + need + (s.countdown ? 190 : 0) <= 1560) break fit;
      }
    }
    const lh = px * 1.32;
    text(ctx, s.question, 80, ROW.question, { font: `700 ${px}px ${F.display}`, maxW: 900, lh, alpha: a, dy: 24 * (1 - easeOut(prog(t, t0, .6))) });
    let y = ROW.question + n * lh + 40;
    if (s.options) {
      const at = s.options.map((_, k) => S.voice[i] + .6 + k * .35);
      optionsGrid(ctx, C, s.options, at, t, a, { y0: y, h: cardH });
      y += rows * cardH + (rows - 1) * 30 + 70;
    } else y = Math.max(y + 60, 900);
    if (s.countdown) countdown(ctx, C, s.pause || 'Pause and make your guess', t, S.count[i], S.count[i] + 4, a * easeOut(prog(t, S.count[i] - .3, .3)), { y: Math.min(y, 1360) });
  }

  function bars(ctx, s, t0, t, a, dur) {
    const total = s.bars.reduce((x, b) => x + b.n, 0), max = Math.max(...s.bars.map(b => b.n));
    const y0 = 740, rowH = s.bars.length > 4 ? 128 : 150, barW = 600;
    s.bars.forEach((b, k) => {
      const at = t0 + .4 + k * Math.min(.7, (dur - 1.5) / s.bars.length);
      const p = easeOut(prog(t, at, .8));
      const y = y0 + k * rowH;
      text(ctx, `${ABCD[k]} · ${b.label}`, 80, y, { font: `700 40px ${F.body}`, alpha: a * clamp(p * 3), maxW: 920 });
      ctx.save(); ctx.globalAlpha = a;
      ctx.fillStyle = C.line; rrect(ctx, 80, y + 24, barW, 44, 22); ctx.fill();
      ctx.fillStyle = C.accent; if (b.n) { rrect(ctx, 80, y + 24, Math.max(44, barW * b.n / max * p), 44, 22); ctx.fill(); }
      ctx.restore();
      text(ctx, `${Math.round(b.n * p)}  ·  ${Math.round(100 * b.n / total * p)}%`, 80 + barW + 30, y + 60, { font: `700 40px ${F.mono}`, color: C.ink, alpha: a * clamp(p * 3) });
    });
    if (s.note) text(ctx, s.note, 80, y0 + s.bars.length * rowH + 40, { font: `500 32px ${F.mono}`, color: C.muted, maxW: 920, lh: 42, alpha: a * easeOut(prog(t, t0 + 1.5, .5)) });
  }

  function steps(ctx, s, t0, t, a, dur) {
    let y = s.title ? 760 : 560;
    s.steps.forEach((st, k) => {
      const p = easeOut(prog(t, t0 + .3 + k * Math.max(.7, (dur - 1) / s.steps.length), .5));
      ctx.save(); ctx.globalAlpha = a * p;
      ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(120, y - 16, 40, 0, 7); ctx.fill();
      ctx.restore();
      text(ctx, String(k + 1), 120, y + 2, { font: `800 44px ${F.display}`, color: '#fff', align: 'center', alpha: a * p });
      const n = text(ctx, st, 190, y, { font: `600 46px ${F.body}`, maxW: 800, lh: 60, alpha: a * p, dy: 20 * (1 - p) });
      y += Math.max(130, n * 60 + 70);
    });
  }

  function end(ctx, s, t0, t, a) {
    s.end.split('\n').reduce((y, line) => y + 82 * text(ctx, line, 80, y, { font: `800 66px ${F.display}`, maxW: 920, lh: 82, alpha: a }), ROW.title);
    const pu = easeOut(prog(t, t0 + 1, .5));
    text(ctx, s.play || '', W / 2, 1180, { font: `500 42px ${F.body}`, color: C.muted, align: 'center', alpha: a * pu, maxW: 900, lh: 56 });
    if (pu <= 0) return;
    const url = spec.url;
    ctx.save(); ctx.globalAlpha = a * pu;
    let px = 46;
    for (; px > 24; px -= 2) { ctx.font = `600 ${px}px ${F.mono}`; if (ctx.measureText(url).width + 70 <= W - 160) break; }
    const tw = ctx.measureText(url).width + 70;
    ctx.fillStyle = C.ink; rrect(ctx, (W - tw) / 2, 1240, tw, 100, 50); ctx.fill();
    ctx.restore();
    text(ctx, url, W / 2, 1290 + px * .34, { font: `600 ${px}px ${F.mono}`, color: C.paper, align: 'center', alpha: a * pu });
  }

  function draw(ctx, t, lang) {
    background(ctx, C, t);
    beats.forEach((b, i) => {
      const t0 = S.start[i], t1 = S.end[i];
      if (t < t0 - .1 || t > t1 + .5) return;
      const last = i === beats.length - 1;
      const a = last ? easeOut(prog(t, t0, .4)) : life(t, t0, t1 + .3, .35);
      if (a <= 0) return;
      const s = b.show, dur = t1 - t0;
      kicker(ctx, C, b.kicker || fmt.kicker, a);
      // a title sits on top; any one visual below it
      if (s.title) title(ctx, s, t0, t, a);
      if (s.stat) stat(ctx, s, t0, t, a);
      else if (s.compare) compare(ctx, s, t0, t, a, dur);
      else if (s.question) question(ctx, s, t0, t, a, i);
      else if (s.bars) bars(ctx, s, t0, t, a, dur);
      else if (s.steps) steps(ctx, s, t0, t, a, dur);
      else if (s.end) end(ctx, s, t0, t, a);
    });
  }

  function cues() {
    const c = [];
    beats.forEach((b, i) => {
      const s = b.show, t0 = S.start[i], dur = S.end[i] - t0;
      c.push([t0, 'whoosh']);
      if (s.stat) c.push([t0 + .25, 'chime']);
      if (s.compare) s.compare.forEach((_, k) => c.push([t0 + .3 + k * Math.max(.6, (dur - 1) / s.compare.length), 'pop', k]));
      if (s.options) c.push(...optionCues(s.options.map((_, k) => S.voice[i] + .6 + k * .35)));
      if (s.countdown) c.push(...countdownCues(S.count[i], S.count[i] + 4));
      if (s.bars) s.bars.forEach((_, k) => c.push([t0 + .4 + k * Math.min(.7, (dur - 1.5) / s.bars.length), 'pluck', k]));
      if (s.steps) s.steps.forEach((_, k) => c.push([t0 + .3 + k * Math.max(.7, (dur - 1) / s.steps.length), 'tick', k]));
    });
    return c;
  }

  const cover = spec.cover && {
    crop: spec.cover.crop || [560, 1560],
    en: { hook: spec.cover.hook },
    get t() { return T0 + (S.start[spec.cover.beat] + S.end[spec.cover.beat]) / 2; },
  };

  return {
    W, H,
    VOICE: { en: beats.map(b => b.say) },
    INTRO: { tint: fmt.intro, en: { title: spec.intro } },
    COVER: cover,
    get DURATION() { return DURATION; },
    setTimeline, draw, cues,
  };
}
