
(() => {
  const root = document.getElementById('tz-rope-around-earth');
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const cv = root.querySelector('canvas'), msg = root.querySelector('.tz-msg'), btn = root.querySelector('.tz-btn');
  const col = (name, fb) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fb;
  const BALLS = [
    { R: 0.04, uk: 'Апельсин', en: 'An orange' },
    { R: 0.11, uk: 'Футбольний м\'яч', en: 'A football' },
    { R: 6378137, uk: 'Земля', en: 'The Earth' },
    { R: 695700000, uk: 'Сонце', en: 'The Sun' }
  ];
  const G = 1 / (2 * Math.PI);                       // gap for one extra metre, any sphere
  let i = 2, go = false;
  function draw() {
    const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight;
    if (!W) return;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    const R = BALLS[i].R, k = H / 0.45, top = H * 0.66, cx = W * 0.4, ink = col('--ink', '#151515'), sig = col('--signal', '#D9318F');
    ctx.fillStyle = '#fff'; ctx.strokeStyle = ink; ctx.lineWidth = 1.5;
    if (R * k < 1e5) { ctx.beginPath(); ctx.arc(cx, top + R * k, R * k, 0, 7); ctx.fill(); ctx.stroke(); }
    else { ctx.fillRect(0, top, W, H - top); ctx.beginPath(); ctx.moveTo(0, top); ctx.lineTo(W, top); ctx.stroke(); }
    if (!go) { ctx.fillStyle = sig; ctx.font = '700 22px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.fillText('?', cx, top - 8); return; }
    ctx.strokeStyle = sig; ctx.lineWidth = 2.5; ctx.beginPath();
    if ((R + G) * k < 1e5) ctx.arc(cx, top + R * k, (R + G) * k, 0, 7);
    else { ctx.moveTo(0, top - G * k); ctx.lineTo(W, top - G * k); }
    ctx.stroke();
    // gap arrow and label
    ctx.fillStyle = sig; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(cx, top); ctx.lineTo(cx, top - G * k); ctx.stroke();
    ctx.font = '600 12px system-ui, sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillText(L('15,9 см', '15.9 cm'), cx - 6, top - G * k / 2);
    // a cat for scale (about 25 cm) on the flat spheres
    if (R > 2) {
      const u = 0.25 * k, x = cx + 46, X = v => x + v * u, Y = v => top - v * u;
      ctx.fillStyle = col('--muted', '#666');
      ctx.beginPath(); ctx.ellipse(X(0), Y(0.36), 0.55 * u, 0.24 * u, 0, 0, 7); ctx.fill();
      ctx.fillRect(X(-0.42), Y(0.2), 0.12 * u, 0.2 * u); ctx.fillRect(X(0.3), Y(0.2), 0.12 * u, 0.2 * u);
      ctx.beginPath(); ctx.arc(X(0.55), Y(0.66), 0.2 * u, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.moveTo(X(0.38), Y(0.74)); ctx.lineTo(X(0.42), Y(1)); ctx.lineTo(X(0.55), Y(0.84)); ctx.fill();
      ctx.beginPath(); ctx.moveTo(X(0.58), Y(0.84)); ctx.lineTo(X(0.7), Y(1)); ctx.lineTo(X(0.74), Y(0.72)); ctx.fill();
    }
  }
  function text() {
    const b = BALLS[i];
    if (!go) { msg.textContent = L(b.uk + ', мотузка на 1 м довша за обхват. Яка між ними щілина? Вирішіть, а потім натисніть кнопку.', b.en + ', a rope 1 m longer than the circumference. How big is the gap? Decide, then press the button.'); btn.textContent = L('Показати щілину', 'Show the gap'); return; }
    msg.textContent = L(b.uk + ', мотузка на 1 м довша за обхват: щілина 15,9 см.' + (b.R > 2 ? ' Кіт пролізе лише пригнувшись.' : ''),
      b.en + ', a rope 1 m longer than the circumference: the gap is 15.9 cm.' + (b.R > 2 ? ' A cat has to crouch to get under.' : ''));
    btn.textContent = L('Інша куля', 'Another sphere');
  }
  btn.addEventListener('click', () => { if (go) i = (i + 1) % BALLS.length; go = true; draw(); text(); });
  document.addEventListener('langchange', () => { draw(); text(); });
  let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(draw, 100); });
  draw(); text();
})();
