
(() => {
  const root = document.getElementById('tz-coastline-paradox');
  if (!root) return;
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const NS = 'http://www.w3.org/2000/svg';
  const svg = root.querySelector('svg'), msg = root.querySelector('.tz-msg');
  const b100 = root.querySelector('[data-e="100"]'), b50 = root.querySelector('[data-e="50"]');
  // the 50 km length is the answer, so that walk stays hidden until the card is solved
  const card = root.closest('[data-spoil]'), solved = () => !!card && card.classList.contains('solved');
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KM = 400;
  // the same island as on the page, at coarser detail: every side becomes 4 copies with a random bump, 4 · r^1.25 = 1
  let a = 4;
  const rnd = () => { a = a + 0x6D2B79F5 >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const r = Math.pow(4, -1 / 1.25), hb = (1 - 2 * r) / 2, h = Math.sqrt(r * r - hb * hb);
  let P = [];
  for (let i = 0; i < 7; i++) { const g = 2 * Math.PI * i / 7 + (rnd() - .5) * .5, rad = 1 + (rnd() - .5) * .45; P.push([Math.cos(g) * rad, Math.sin(g) * rad]); }
  for (let d = 0; d < 4; d++) {
    const Q = [];
    for (let i = 0; i < P.length; i++) {
      const A = P[i], B = P[(i + 1) % P.length], ux = B[0] - A[0], uy = B[1] - A[1], s = rnd() < .5 ? 1 : -1;
      Q.push(A, [A[0] + r * ux, A[1] + r * uy], [A[0] + .5 * ux + s * h * uy, A[1] + .5 * uy - s * h * ux], [A[0] + (1 - r) * ux, A[1] + (1 - r) * uy]);
    }
    P = Q;
  }
  function walk(eps) {
    const n = P.length; let cx = P[0][0], cy = P[0][1], i = 0, steps = 0; const pts = [[cx, cy]];
    for (;;) {
      let found = false;
      for (let k = i; k < n; k++) {
        const B = P[(k + 1) % n], dx = B[0] - cx, dy = B[1] - cy;
        if (dx * dx + dy * dy >= eps * eps) {
          const A = k === i ? [cx, cy] : P[k], ex = B[0] - A[0], ey = B[1] - A[1], fx = A[0] - cx, fy = A[1] - cy;
          const qa = ex * ex + ey * ey, qb = 2 * (ex * fx + ey * fy), qc = fx * fx + fy * fy - eps * eps;
          const t = (-qb + Math.sqrt(Math.max(0, qb * qb - 4 * qa * qc))) / (2 * qa);
          cx = A[0] + t * ex; cy = A[1] + t * ey; i = k; steps++; pts.push([cx, cy]); found = true; break;
        }
      }
      if (!found) return { steps, len: (steps * eps + Math.hypot(P[0][0] - cx, P[0][1] - cy)) * KM, pts };
    }
  }
  const W = { 100: walk(100 / KM), 50: walk(50 / KM) };
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  P.forEach(p => { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); });
  const sc = Math.min(280 / (x1 - x0), 180 / (y1 - y0)), X = p => (150 + sc * (p[0] - (x0 + x1) / 2)).toFixed(1), Y = p => (100 + sc * (p[1] - (y0 + y1) / 2)).toFixed(1);
  const land = 'M' + P.map(p => X(p) + ' ' + Y(p)).join('L') + 'Z';
  let e = null, k = 0, raf = 0;
  const fmt = x => Math.round(x).toLocaleString(en() ? 'en-US' : 'uk-UA');
  function draw() {
    svg.textContent = '';
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', land); p.setAttribute('fill', '#EADFC0'); p.setAttribute('stroke', '#7D6B3E'); p.setAttribute('stroke-width', '1'); p.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(p);
    if (!e || (e === 50 && !solved())) return;
    const w = W[e], m = Math.min(Math.floor(k), w.pts.length - 1);
    const pl = document.createElementNS(NS, 'polyline');
    pl.setAttribute('points', w.pts.slice(0, m + 1).map(q => X(q) + ',' + Y(q)).join(' '));
    pl.setAttribute('fill', 'none'); pl.setAttribute('stroke', '#D2560F'); pl.setAttribute('stroke-width', '2'); pl.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(pl);
  }
  function text() {
    b100.textContent = L('Крок 100 км', '100 km step');
    b50.textContent = L('Крок 50 км', '50 km step');
    svg.setAttribute('aria-label', L('Острів на карті', 'An island on a map'));
    if (!e) { msg.textContent = L('Пройдіть острів циркулем із кроком 100 км, а потім 50 км.', 'Walk the island with dividers at a 100 km step, then at 50 km.'); return; }
    const w = W[e], done = k >= w.pts.length - 1;
    if (e === 100) { msg.textContent = done ? L(w.steps + ' кроків, разом ' + fmt(w.len) + ' км. А з кроком 50 км?', w.steps + ' steps, ' + fmt(w.len) + ' km in all. And with a 50 km step?') : L('Крокуємо…', 'Walking…'); return; }
    if (!solved()) { msg.textContent = L('На скільки довшим буде берег? Перевірте відповідь вище, і циркуль пройде острів кроком 50 км.', 'How much longer will the coast be? Check the answer above, and the dividers walk the island at 50 km.'); return; }
    msg.textContent = done ? L(w.steps + ' кроків, ' + fmt(w.len) + ' км: на ' + Math.round(100 * (w.len / W[100].len - 1)) + ' % більше, ніж кроком 100 км.', w.steps + ' steps, ' + fmt(w.len) + ' km: ' + Math.round(100 * (w.len / W[100].len - 1)) + '% more than with the 100 km step.') : L('Крокуємо…', 'Walking…');
  }
  function go(v) {
    cancelAnimationFrame(raf); e = v; k = 0;
    const w = W[v];
    if (reduce() || (v === 50 && !solved())) { k = 1e9; draw(); text(); return; }
    let prev = 0;
    const step = ts => { if (prev) k = Math.min(w.pts.length - 1, k + (ts - prev) / 1000 * w.steps / 2.5); prev = ts; draw(); text(); if (k < w.pts.length - 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
  }
  b100.addEventListener('click', () => go(100));
  b50.addEventListener('click', () => go(50));
  document.addEventListener('langchange', () => { draw(); text(); });
  if (card) new MutationObserver(() => { draw(); text(); }).observe(card, { attributes: true, attributeFilter: ['class'] });
  draw(); text();
})();
