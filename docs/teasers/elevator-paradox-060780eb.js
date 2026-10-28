
(() => {
  const root = document.getElementById('tz-elevator-paradox');
  if (!root) return;
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const cv = root.querySelector('canvas'), msg = root.querySelector('.tz-msg'), btn = root.querySelector('.tz-btn');
  const N = 15, K = 2, C = 2 * (N - 1);
  // the lift's phase on its loop: 0..N-1 going up, N-1..C going down
  const height = p => { p = ((p % C) + C) % C; return p <= N - 1 ? p : C - p; };
  const up = p => { p = ((p % C) + C) % C; return p < N - 1; };
  let ph = 9, raf = 0, last = null, tries = 0;
  function draw(p, done) {
    const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight; if (!W || !H) return;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
    const top = 12, bot = H - 12, fy = f => bot - (bot - top) * (f - 1) / (N - 1), sx = W / 2 - 40, sw = 34;
    c.strokeStyle = '#D3D8E5'; c.lineWidth = 1;
    for (let f = 1; f <= N; f++) { c.beginPath(); c.moveTo(sx - 30, fy(f)); c.lineTo(sx + sw + 70, fy(f)); c.stroke(); }
    c.fillStyle = '#6B6B6B'; c.font = '9px ui-monospace, Menlo, monospace'; c.textAlign = 'right'; c.textBaseline = 'middle';
    [1, 2, 15].forEach(f => c.fillText(String(f), sx - 34, fy(f)));
    c.strokeStyle = '#151515'; c.lineWidth = 2; c.beginPath(); c.moveTo(sx - 30, fy(K)); c.lineTo(sx + sw + 70, fy(K)); c.stroke();
    c.strokeStyle = '#6B6B6B'; c.setLineDash([2, 3]); c.strokeRect(sx, top - 5, sw, bot - top + 10); c.setLineDash([]);
    const y = fy(1 + height(p)), u = up(p);
    c.fillStyle = done ? '#151515' : '#6B6B6B'; c.fillRect(sx + 3, y - 6, sw - 6, 12);
    c.fillStyle = '#fff'; c.beginPath();
    if (u) { c.moveTo(sx + sw / 2, y - 4); c.lineTo(sx + sw / 2 + 4, y + 3); c.lineTo(sx + sw / 2 - 4, y + 3); }
    else { c.moveTo(sx + sw / 2, y + 4); c.lineTo(sx + sw / 2 + 4, y - 3); c.lineTo(sx + sw / 2 - 4, y - 3); }
    c.fill();
    // you
    const px = sx + sw + 22; c.fillStyle = '#151515';
    c.beginPath(); c.arc(px, fy(K) - 16, 3.5, 0, 6.3); c.fill(); c.fillRect(px - 3.5, fy(K) - 12, 7, 11);
    c.font = '600 10px ui-monospace, Menlo, monospace'; c.textAlign = 'left'; c.textBaseline = 'bottom';
    c.fillText(L('ви', 'you'), px + 8, fy(K) - 3);
  }
  function text() {
    btn.textContent = raf ? L('Чекаємо…', 'Waiting…') : tries ? L('Вийти ще раз', 'Walk out again') : L('Вийти до ліфта', 'Walk out to the lift');
    btn.disabled = !!raf;
    if (raf) msg.textContent = L('Ви натиснули кнопку на 2-му поверсі. Ліфт уже їде…', 'You pressed the button on floor 2. The lift is on its way…');
    else if (last === null) msg.textContent = L('Ліфт десь у шахті. Вийдіть до нього у випадковий момент і подивіться, куди він їхатиме, коли доїде до вас.', 'The lift is somewhere in the shaft. Walk out at a random moment and see which way it is going when it reaches you.');
    else msg.textContent = L('Приїхав ' + (last ? 'вгору ↑' : 'вниз ↓') + '. Виходів: ' + tries + '.', 'It came ' + (last ? 'up ↑' : 'down ↓') + '. Walk-outs: ' + tries + '.');
  }
  btn.addEventListener('click', () => {
    if (raf) return;
    ph = Math.random() * C;
    const h = K - 1, dA = ((h - ph) % C + C) % C, dB = ((C - h - ph) % C + C) % C, t = Math.min(dA, dB), isUp = dA < dB;
    tries++;
    const finish = () => { raf = 0; last = isUp; ph += t; draw(ph, true); text(); };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { finish(); return; }
    const start = performance.now(), dur = Math.max(400, Math.min(2000, t * 70)), p0 = ph;
    const loop = now => { const f = Math.min(1, (now - start) / dur); draw(p0 + t * f, false); if (f < 1) raf = requestAnimationFrame(loop); else finish(); };
    raf = requestAnimationFrame(loop); last = null; text();
  });
  document.addEventListener('langchange', () => { draw(ph, last !== null); text(); });
  draw(ph, false); text();
})();
