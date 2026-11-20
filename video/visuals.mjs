// Animated pictures for beats shorts (beats.mjs): `show.visual = { kind, … }` draws one of these in the
// middle of the frame, from `top` (below the title) down to about 1450 px. Each takes the beat's start t0,
// its length dur, the frame time t, an alpha a and the format's colours C, and animates on its own clock.
import { W, F, clamp, prog, easeOut, easeInOut, back, rng, text, rrect } from './lib.mjs';

const fmtNum = n => n.toLocaleString('en-US');

// ---- dots: n people as dots; groups light up one after another
function dots(ctx, v, t0, t, a, dur, C, top) {
  const n = v.n, cols = v.cols, rows = Math.ceil(n / cols);
  const areaW = 920, areaH = Math.min(760, 1450 - top);
  const gap = Math.min(areaW / cols, areaH / rows), r = Math.max(1.6, gap * .36);
  const x0 = (W - gap * (cols - 1)) / 2, y0 = top + 20;
  const rnd = rng(v.seed || 7), marked = new Map();
  (v.marks || []).forEach((m, g) => { for (let k = 0; k < m.count; k++) { let i; do i = Math.floor(rnd() * n); while (marked.has(i)); marked.set(i, g); } });
  const fill = easeOut(prog(t, t0 + .1, Math.min(1.2, dur * .3)));
  ctx.save();
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / cols), col = i % cols;
    if (row / rows > fill) break;
    ctx.globalAlpha = a * .55; ctx.fillStyle = C.line;
    ctx.beginPath(); ctx.arc(x0 + col * gap, y0 + row * gap, r, 0, 7); ctx.fill();
  }
  marked.forEach((g, i) => {
    const m = v.marks[g], p = prog(t, t0 + m.at * dur, .5);
    if (p <= 0) return;
    const x = x0 + (i % cols) * gap, y = y0 + Math.floor(i / cols) * gap;
    const ring = easeOut(prog(t, t0 + m.at * dur, 1.4));
    ctx.globalAlpha = a * (1 - ring) * .6; ctx.strokeStyle = C.accent; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(x, y, r + 20 + 120 * ring, 0, 7); ctx.stroke();
    ctx.globalAlpha = a; ctx.fillStyle = m.color === 'ink' ? C.ink : C.accent;
    ctx.beginPath(); ctx.arc(x, y, Math.max(r * 2.2, 15) * back(clamp(p)), 0, 7); ctx.fill();
  });
  ctx.restore();
  (v.marks || []).forEach((m, g) => {
    if (!m.label) return;
    text(ctx, m.label, W / 2, Math.min(1500, y0 + rows * gap + 60) + g * 56, { font: `700 44px ${F.body}`, align: 'center', color: m.color === 'ink' ? C.ink : C.accent, alpha: a * easeOut(prog(t, t0 + m.at * dur + .3, .5)) });
  });
  if (v.label) text(ctx, v.label, W / 2, top - 10, { font: `600 34px ${F.mono}`, align: 'center', color: C.muted, alpha: a });
}

// ---- scatter: hits falling on a map split into squares; random clumps appear by themselves
function scatter(ctx, v, t0, t, a, dur, C, top) {
  const size = Math.min(860, 1450 - top), x0 = (W - size) / 2, y0 = top + 10, k = v.cells, cell = size / k;
  const rnd = rng(v.seed || 1944);
  const pts = Array.from({ length: v.hits }, () => [rnd(), rnd()]);
  ctx.save(); ctx.globalAlpha = a;
  ctx.fillStyle = C.surface; rrect(ctx, x0, y0, size, size, 24); ctx.fill();
  ctx.strokeStyle = C.line; ctx.lineWidth = 1.5;
  for (let i = 1; i < k; i++) {
    ctx.beginPath(); ctx.moveTo(x0 + i * cell, y0); ctx.lineTo(x0 + i * cell, y0 + size); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x0, y0 + i * cell); ctx.lineTo(x0 + size, y0 + i * cell); ctx.stroke();
  }
  const shown = Math.floor(v.hits * easeInOut(prog(t, t0 + .2, Math.max(1, dur * .7))));
  // squares with 3+ hits glow once all hits are in: the «aimed» clusters
  if (v.glow && shown === v.hits) {
    const cnt = new Map();
    pts.forEach(([x, y]) => { const key = Math.floor(x * k) + ',' + Math.floor(y * k); cnt.set(key, (cnt.get(key) || 0) + 1); });
    ctx.fillStyle = C.accent;
    cnt.forEach((c, key) => {
      if (c < 3) return;
      const [cx, cy] = key.split(',').map(Number);
      ctx.globalAlpha = a * .22; ctx.fillRect(x0 + cx * cell, y0 + cy * cell, cell, cell);
    });
  }
  ctx.globalAlpha = a; ctx.fillStyle = C.ink;
  for (let i = 0; i < shown; i++) { ctx.beginPath(); ctx.arc(x0 + pts[i][0] * size, y0 + pts[i][1] * size, 5, 0, 7); ctx.fill(); }
  ctx.restore();
  text(ctx, `${fmtNum(shown)} hits`, x0 + size, y0 - 18, { font: `600 32px ${F.mono}`, align: 'right', color: C.accent, alpha: a });
}

// ---- tower: a sheet folded k times, on a scale of doublings, with landmarks passing by
function tower(ctx, v, t0, t, a, dur, C, top) {
  const yB = 1380, yT = top + 30, kMax = v.max || 42;
  const k = Math.floor(kMax * easeInOut(prog(t, t0 + .3, Math.max(1, dur - 1))));
  const yOf = n => yB - (yB - yT) * n / kMax;
  ctx.save(); ctx.globalAlpha = a;
  // the stack
  const g = ctx.createLinearGradient(0, yOf(k), 0, yB);
  g.addColorStop(0, C.accent); g.addColorStop(1, C.ink);
  ctx.fillStyle = g; rrect(ctx, 140, yOf(k), 110, yB - yOf(k) + 4, 12); ctx.fill();
  ctx.strokeStyle = C.line; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(120, yB + 4); ctx.lineTo(980, yB + 4); ctx.stroke();
  ctx.restore();
  (v.marks || []).forEach(m => {
    const on = k >= m.k, y = yOf(m.k);
    ctx.save(); ctx.globalAlpha = a * (on ? 1 : .35); ctx.strokeStyle = on ? C.accent : C.muted; ctx.lineWidth = 2; ctx.setLineDash([8, 8]);
    ctx.beginPath(); ctx.moveTo(270, y); ctx.lineTo(980, y); ctx.stroke(); ctx.restore();
    text(ctx, `${m.k} · ${m.label}`, 300, y - 14, { font: `${on ? 700 : 500} 34px ${F.body}`, color: on ? C.ink : C.muted, alpha: a });
  });
  const mm = 0.1 * 2 ** k;
  const h = mm < 1000 ? `${mm < 10 ? mm.toFixed(1) : Math.round(mm)} mm` : mm < 1e6 ? `${fmtNum(Math.round(mm / 1000))} m` : `${fmtNum(Math.round(mm / 1e6))} km`;
  text(ctx, `${k} folds · ${h}`, W / 2, yB + 80, { font: `800 52px ${F.display}`, align: 'center', color: C.accent, alpha: a });
}

// ---- icons: a row (or grid) of small drawings popping in, each with a caption
const ICON = {
  tank(ctx, c, s) {
    ctx.fillStyle = c.body;
    rrect(ctx, -90 * s, -10 * s, 180 * s, 50 * s, 14 * s); ctx.fill();              // hull
    rrect(ctx, -45 * s, -50 * s, 90 * s, 44 * s, 12 * s); ctx.fill();               // turret
    ctx.fillRect(40 * s, -36 * s, 80 * s, 12 * s);                                  // barrel
    ctx.fillStyle = c.dark;
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc((-68 + i * 34) * s, 44 * s, 15 * s, 0, 7); ctx.fill(); }
  },
  envelope(ctx, c, s) {
    ctx.fillStyle = c.paper; ctx.strokeStyle = c.dark; ctx.lineWidth = 4 * s;
    rrect(ctx, -70 * s, -45 * s, 140 * s, 90 * s, 10 * s); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-70 * s, -45 * s); ctx.lineTo(0, 10 * s); ctx.lineTo(70 * s, -45 * s); ctx.stroke();
  },
  cup(ctx, c, s, item, t) {
    const lift = item.lift ? easeOut(prog(t, item.lift, .5)) * 90 * s : 0;
    if (item.coin && lift > 0) { ctx.fillStyle = '#E3A21A'; ctx.beginPath(); ctx.arc(0, 52 * s, 26 * s, 0, 7); ctx.fill(); }
    ctx.save(); ctx.translate(0, -lift);
    ctx.fillStyle = c.body;
    ctx.beginPath(); ctx.moveTo(-50 * s, -60 * s); ctx.lineTo(50 * s, -60 * s); ctx.lineTo(72 * s, 80 * s); ctx.lineTo(-72 * s, 80 * s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = c.dark; ctx.fillRect(-76 * s, 72 * s, 152 * s, 14 * s);
    ctx.restore();
  },
  card(ctx, c, s, item) {
    ctx.fillStyle = '#fff'; ctx.strokeStyle = c.line; ctx.lineWidth = 3 * s;
    rrect(ctx, -60 * s, -85 * s, 120 * s, 170 * s, 14 * s); ctx.fill(); ctx.stroke();
    const red = /[♥♦]/.test(item.face || '');
    const face = item.face || 'A♠', px = (face.length > 3 ? 30 : 56) * s;
    text(ctx, face, 0, px * .36, { font: `800 ${px}px ${F.display}`, align: 'center', color: red ? '#D2462F' : c.dark });
  },
  person(ctx, c, s, item) {
    ctx.fillStyle = item.hi ? c.accent : c.body; ctx.strokeStyle = item.hi ? c.accent : c.body; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, -70 * s, 24 * s, 0, 7); ctx.fill();
    rrect(ctx, -26 * s, -42 * s, 52 * s, 70 * s, 18 * s); ctx.fill();
    ctx.lineWidth = 14 * s;
    const legs = item.legs ?? 2;
    if (legs >= 1) { ctx.beginPath(); ctx.moveTo(-12 * s, 26 * s); ctx.lineTo(-14 * s, 84 * s); ctx.stroke(); }
    if (legs >= 2) { ctx.beginPath(); ctx.moveTo(12 * s, 26 * s); ctx.lineTo(14 * s, 84 * s); ctx.stroke(); }
  },
  bubble(ctx, c, s, item) {
    ctx.fillStyle = item.hi ? c.accent : '#fff';
    rrect(ctx, -170 * s, -40 * s, 340 * s, 80 * s, 30 * s); ctx.fill();
    text(ctx, item.text || '', 0, 12 * s, { font: `600 ${34 * s}px ${F.body}`, align: 'center', color: item.hi ? '#fff' : c.dark });
  },
  ball(ctx, c, s) {
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#D2462F'; ctx.lineWidth = 5 * s;
    ctx.beginPath(); ctx.arc(0, 0, 50 * s, 0, 7); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(-70 * s, 0, 50 * s, -.6, .6); ctx.stroke(); ctx.beginPath(); ctx.arc(70 * s, 0, 50 * s, Math.PI - .6, Math.PI + .6); ctx.stroke();
  },
  bat(ctx, c, s) {
    ctx.save(); ctx.rotate(-.5); ctx.fillStyle = '#B8743B';
    ctx.beginPath(); ctx.moveTo(-150 * s, -8 * s); ctx.lineTo(60 * s, -26 * s); ctx.quadraticCurveTo(140 * s, 0, 60 * s, 26 * s); ctx.lineTo(-150 * s, 8 * s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = c.dark; ctx.fillRect(-170 * s, -10 * s, 26 * s, 20 * s);
    ctx.restore();
  },
};
function icons(ctx, v, t0, t, a, dur, C, top) {
  // `icon` is the drawing for every item; `mixed` gives each item its own
  const items = v.items, cols = v.cols || items.length, rows = Math.ceil(items.length / cols);
  const cellW = 920 / cols, cellH = Math.min(v.cellH || 260, (1430 - top) / rows), s = v.scale || Math.min(1, cellW / 220);
  const col = { body: C.ink, dark: C.ink, paper: C.surface, line: C.line, accent: C.accent };
  items.forEach((it, i) => {
    const at = t0 + .2 + (it.at ?? i * Math.min(.45, (dur * .6) / items.length));
    const p = prog(t, at, .45);
    if (p <= 0) return;
    const cx = 80 + cellW * (i % cols + .5), cy = top + 40 + cellH * (Math.floor(i / cols) + .45);
    ctx.save(); ctx.globalAlpha = a * clamp(p * 2.5);
    ctx.translate(cx, cy + (v.drop ? -400 * (1 - easeOut(p)) : 0)); ctx.scale(.5 + .5 * back(p), .5 + .5 * back(p));
    const item = it.lift != null ? { ...it, lift: t0 + it.lift * dur } : it;   // lift: a share of the beat
    ICON[v.mixed ? v.mixed[i] : v.icon](ctx, it.hi ? { ...col, body: C.accent } : col, s, item, t);
    ctx.restore();
    if (it.label) text(ctx, it.label, cx, cy + cellH * .48, { font: `700 ${v.labelSize || 36}px ${F.mono}`, align: 'center', color: it.hi ? C.accent : C.ink, alpha: a * clamp(p * 2) });
  });
  if (v.counter) {
    const n = Math.round(v.counter.to * easeOut(prog(t, t0 + .3, dur * .7)));
    text(ctx, `${fmtNum(n)} ${v.counter.unit}`, W / 2, 1460, { font: `800 72px ${F.display}`, align: 'center', color: C.accent, alpha: a });
  }
}

// ---- stack: many small bars piling into one tall column, next to one honest column
function stack(ctx, v, t0, t, a, dur, C, top) {
  const yB = 1400, scale = (yB - top - 80) / v.total;
  const n = v.pieces.length, x1 = 300, x2 = 700, w = 180;
  let y = yB;
  v.pieces.forEach((h, i) => {
    const p = easeOut(prog(t, t0 + .2 + i * (dur * .5) / n, .35));
    if (p <= 0) return;
    const hh = h * scale;
    ctx.save(); ctx.globalAlpha = a * p; ctx.fillStyle = i % 2 ? C.accent : C.ink;
    rrect(ctx, x1 - w / 2, y - hh - (1 - p) * 80, w, Math.max(4, hh - 3), 6); ctx.fill(); ctx.restore();
    y -= hh;
  });
  const done = easeOut(prog(t, t0 + .3 + dur * .5, .5));
  text(ctx, v.leftLabel, x1, yB + 56, { font: `700 38px ${F.body}`, align: 'center', alpha: a });
  text(ctx, v.leftValue, x1, y - 30, { font: `800 64px ${F.display}`, align: 'center', color: C.ink, alpha: a * done });
  const pr = easeOut(prog(t, t0 + dur * .65, .6));
  const hr = v.right * scale * pr;
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = C.accent;
  if (pr > 0) { rrect(ctx, x2 - w / 2, yB - hr, w, hr, 8); ctx.fill(); }
  ctx.restore();
  text(ctx, v.rightLabel, x2, yB + 56, { font: `700 38px ${F.body}`, align: 'center', alpha: a * clamp(pr * 3) });
  text(ctx, v.rightValue, x2, yB - hr - 30, { font: `800 64px ${F.display}`, align: 'center', color: C.accent, alpha: a * pr });
}

// ---- histogram: many repeated tests of one effect; the ones past the bar are «wins»
function histogram(ctx, v, t0, t, a, dur, C, top) {
  const x0 = 100, x1 = 980, yB = 1300, hMax = yB - top - 120;
  const lo = v.from, hi = v.to, bins = 36, bw = (x1 - x0) / bins;
  const pdf = x => Math.exp(-((x - v.mean) ** 2) / (2 * v.sd ** 2));
  const xOf = val => x0 + (val - lo) / (hi - lo) * (x1 - x0);
  for (let b = 0; b < bins; b++) {
    const val = lo + (b + .5) * (hi - lo) / bins, h = pdf(val) * hMax;
    const p = easeOut(prog(t, t0 + .2 + b * .025, .5));
    const win = val >= v.bar;
    ctx.save(); ctx.globalAlpha = a * p; ctx.fillStyle = win && t > t0 + dur * .45 ? C.accent : C.line;
    rrect(ctx, x0 + b * bw + 2, yB - h * p, bw - 4, h * p, 4); ctx.fill(); ctx.restore();
  }
  // the three lines get their labels on different rows so they never overlap
  const ax = (val, label, color, row, align) => {
    const x = xOf(val), y = top + 20 + row * 52;
    ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.setLineDash([10, 8]);
    ctx.beginPath(); ctx.moveTo(x, yB + 10); ctx.lineTo(x, y + 14); ctx.stroke(); ctx.restore();
    text(ctx, label, x + (align === 'left' ? 12 : align === 'right' ? -12 : 0), y, { font: `700 34px ${F.mono}`, align, color, alpha: a });
  };
  ax(v.mean, v.meanLabel, C.ink, 0, 'right');
  if (t > t0 + dur * .3) ax(v.bar, v.barLabel, C.muted, 1, 'left');
  if (t > t0 + dur * .55) ax(v.winMean, v.winLabel, C.accent, 2, 'left');
  text(ctx, v.axis, (x0 + x1) / 2, yB + 60, { font: `600 32px ${F.body}`, align: 'center', color: C.muted, alpha: a });
}

export const VISUALS = { dots, scatter, tower, icons, stack, histogram };
