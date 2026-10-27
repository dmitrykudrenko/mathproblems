
(() => {
  const root = document.getElementById('tz-lake-escape');
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const cv = root.querySelector('canvas'), msg = root.querySelector('.tz-msg'), btn = root.querySelector('.tz-btn');
  const col = (name, fb) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fb;
  const K = 4, TAU = 2 * Math.PI;
  const wrap = a => { a = (a + Math.PI) % TAU; if (a < 0) a += TAU; return a - Math.PI; };
  // lake radius 1, swimmer speed 1, teacher 4 along the shore, always the short way to the swimmer's nearest shore point
  let st = 0, c = null, raf = null;           // st: 0 waiting, 1 straight swim, 2 straight done, 3 escape, 4 escape done
  function fresh() { return { x: 0, y: 0, T: Math.PI / 2, s: 0, phase: 0, dir: null, trail: [[0, 0]], end: null }; }
  function vel(plan) {
    const r = Math.hypot(c.x, c.y), a = Math.atan2(c.y, c.x);
    if (plan === 'straight') { if (c.dir === null) c.dir = c.T + Math.PI; return [Math.cos(c.dir), Math.sin(c.dir)]; }
    if (r < 1e-6) return [Math.cos(c.T + Math.PI), Math.sin(c.T + Math.PI)];
    if (c.phase === 0) {
      const off = wrap(c.T + Math.PI - a), u = Math.max(-1, Math.min(1, (c.s * K + 6 * off) * r));
      const out = r < 0.995 / K ? Math.sqrt(1 - u * u) : 0;
      if (r >= 0.995 / K - 1e-4 && Math.abs(off) < 0.004) c.phase = 1;
      else return [out * Math.cos(a) - u * Math.sin(a), out * Math.sin(a) + u * Math.cos(a)];
    }
    return [Math.cos(a), Math.sin(a)];
  }
  function step(plan, dt) {
    const [vx, vy] = vel(plan);
    c.x += vx * dt; c.y += vy * dt;
    const r = Math.hypot(c.x, c.y);
    if (r > 1e-6) {
      const g = wrap(Math.atan2(c.y, c.x) - c.T);
      let s = Math.abs(g) <= K * dt ? g / (K * dt) : Math.sign(g);
      if (c.s && Math.sign(g) !== c.s && Math.PI - Math.abs(g) < 0.02) s = c.s;
      c.s = s; c.T = wrap(c.T + s * K * dt);
    }
    const p = c.trail[c.trail.length - 1];
    if (Math.hypot(c.x - p[0], c.y - p[1]) > 0.01) c.trail.push([c.x, c.y]);
    if (r >= 1) { c.x /= r; c.y /= r; c.trail.push([c.x, c.y]); const gap = Math.abs(wrap(Math.atan2(c.y, c.x) - c.T)); c.end = { gap, free: gap > 0.02 }; }
  }
  function draw() {
    const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight;
    if (!W) return;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    const R = Math.min(W, H) / 2 - 14, cx = W / 2, cy = H / 2, X = x => cx + x * R, Y = y => cy - y * R;
    const ink = col('--ink', '#151515'), sig = col('--signal', '#D9318F');
    ctx.fillStyle = '#B7DCE6'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
    ctx.strokeStyle = ink; ctx.lineWidth = 2; ctx.stroke();
    if (st >= 3) { ctx.strokeStyle = sig; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(cx, cy, R / K, 0, 7); ctx.stroke(); ctx.setLineDash([]); }
    if (c) {
      ctx.strokeStyle = st >= 3 ? sig : ink; ctx.lineWidth = 2; ctx.beginPath();
      c.trail.forEach(([x, y], i) => i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y))); ctx.lineTo(X(c.x), Y(c.y)); ctx.stroke();
    }
    const T = c ? c.T : Math.PI / 2, px = c ? c.x : 0, py = c ? c.y : 0;
    ctx.fillStyle = '#E07A1F'; ctx.beginPath(); ctx.arc(X(Math.cos(T) * 1.04), Y(Math.sin(T) * 1.04), 7, 0, 7); ctx.fill();
    ctx.fillStyle = ink; ctx.beginPath(); ctx.arc(X(px), Y(py), 5, 0, 7); ctx.fill();
  }
  function text() {
    if (st === 0) { msg.textContent = L('Учень посередині, вихователь (помаранчевий) на березі, учетверо швидший. Спершу спробуйте найпростіше.', 'The pupil is in the middle, the teacher (orange) on the shore, four times faster. First try the obvious.'); btn.textContent = L('Пливти прямо від нього', 'Swim straight away from him'); }
    else if (st === 1) { msg.textContent = L('Пливе 100 м…', 'Swimming 100 m…'); btn.textContent = L('Пливе…', 'Swimming…'); }
    else if (st === 2) { msg.textContent = L('Впіймав: учню 100 с, вихователю пів кола за 78,5 с. Чи є інший шлях?', 'Caught: the pupil needs 100 s, the teacher runs half the shore in 78.5 s. Is there another way?'); btn.textContent = L('Показати втечу', 'Show the escape'); }
    else if (st === 3) { msg.textContent = L('Кружляє біля центру, тримаючись навпроти…', 'Circling near the centre, keeping opposite…'); btn.textContent = L('Пливе…', 'Swimming…'); }
    else { msg.textContent = L('Утік! Біля центру учень обертається швидше за вихователя. Навпроти нього до берега 75 м (75 с), а вихователю 314 м (78,5 с).', 'Escaped! Near the centre the pupil turns faster than the teacher. From opposite him it is 75 m to the shore (75 s), while the teacher runs 314 m (78.5 s).'); btn.textContent = L('Ще раз', 'Again'); }
    btn.disabled = st === 1 || st === 3;
  }
  function run(plan) {
    c = fresh(); let last = 0;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { while (!c.end) step(plan, 1e-3); st++; draw(); text(); return; }
    (function frame(ts) {
      const dt = Math.min(0.05, (ts - (last || ts)) / 1000); last = ts;
      const n = Math.max(1, Math.ceil(dt * 0.3 / 1e-3));
      for (let i = 0; i < n && !c.end; i++) step(plan, dt * 0.3 / n);
      draw();
      if (c.end) { st++; text(); return; }
      raf = requestAnimationFrame(frame);
    })(performance.now());
  }
  btn.addEventListener('click', () => {
    if (st === 0) { st = 1; text(); run('straight'); }
    else if (st === 2) { st = 3; text(); run('dash'); }
    else if (st === 4) { cancelAnimationFrame(raf); st = 0; c = null; draw(); text(); }
  });
  document.addEventListener('langchange', () => { draw(); text(); });
  let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(draw, 100); });
  draw(); text();
})();
