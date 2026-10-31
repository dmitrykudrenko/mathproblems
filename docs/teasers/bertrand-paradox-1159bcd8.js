
(() => {
  const root = document.getElementById('tz-bertrand-paradox');
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  // the exact values are the answer, so they show only once the card is solved
  const card = root.closest('[data-spoil]'), solved = () => !!card && card.classList.contains('solved');
  const cv = root.querySelector('canvas'), msg = root.querySelector('.tz-msg'), btns = root.querySelectorAll('.tz-btn');
  const col = (name, fb) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fb;
  const TAU = 2 * Math.PI, FR = ['1/3', '1/2', '1/4'];
  let m = 0, list = [];
  // one random chord of the unit circle; method 0: random endpoints, 1: random radius, 2: random midpoint
  function chord() {
    if (m === 0) { const a = Math.random() * TAU, b = Math.random() * TAU; return { x1: Math.cos(a), y1: Math.sin(a), x2: Math.cos(b), y2: Math.sin(b), d: Math.abs(Math.cos((a - b) / 2)) }; }
    let d, p;
    if (m === 1) { d = Math.random(); p = Math.random() * TAU; }
    else { let x, y; do { x = 2 * Math.random() - 1; y = 2 * Math.random() - 1; } while (x * x + y * y > 1); d = Math.hypot(x, y); p = Math.atan2(y, x); }
    const ux = Math.cos(p), uy = Math.sin(p), h = Math.sqrt(1 - d * d);
    return { x1: d * ux - h * uy, y1: d * uy + h * ux, x2: d * ux + h * uy, y2: d * uy - h * ux, d };
  }
  function add(k) { for (let i = 0; i < k; i++) list.push(chord()); if (list.length > 1000) list.splice(0, list.length - 1000); draw(); text(); }
  function draw() {
    const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight;
    if (!W || !H) return;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    const R = Math.min(W, H) / 2 - 4, cx = W / 2, cy = H / 2, ink = col('--ink', '#151515'), sig = col('--signal', '#D9318F');
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();
    ctx.lineCap = 'round'; ctx.lineWidth = list.length > 200 ? .8 : 1.4;
    [false, true].forEach(pass => list.forEach(c => {
      const long = c.d < .5; if (long !== pass) return;
      ctx.strokeStyle = long ? sig : ink; ctx.globalAlpha = long ? .9 : .4;
      ctx.beginPath(); ctx.moveTo(cx + c.x1 * R, cy - c.y1 * R); ctx.lineTo(cx + c.x2 * R, cy - c.y2 * R); ctx.stroke();
    }));
    ctx.globalAlpha = 1; ctx.strokeStyle = ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
  }
  function text() {
    btns[1].hidden = !list.length;
    if (!list.length) { msg.textContent = L('Натисніть «Провести 100 хорд» і порахуйте, скільки з них довші за сторону вписаного трикутника.', 'Press "Draw 100 chords" and count how many are longer than the side of the inscribed triangle.'); btns[0].textContent = L('Провести 100 хорд', 'Draw 100 chords'); return; }
    const n = list.length, l = list.filter(c => c.d < .5).length, d = s => en() ? s : s.replace('.', ',');
    const name = [L('випадкові кінці', 'random endpoints'), L('випадковий радіус', 'random radius'), L('випадкова середина', 'random midpoint')][m];
    msg.textContent = L('Спосіб ' + (m + 1) + ', ' + name + ': довгих ' + l + ' з ' + n + ' (' + d((100 * l / n).toFixed(0)) + '%). ' + (solved() ? 'Точне значення ' + FR[m] + '.' : 'Скільки буде іншим способом?'),
      'Method ' + (m + 1) + ', ' + name + ': ' + l + ' of ' + n + ' long (' + (100 * l / n).toFixed(0) + '%). ' + (solved() ? 'Exact value ' + FR[m] + '.' : 'What does another method give?'));
    btns[0].textContent = L('Ще 50 хорд', '50 more chords');
    btns[1].textContent = L('Інший спосіб', 'Another method');
  }
  btns.forEach(b => b.addEventListener('click', () => { if (b.dataset.a === 'next') { m = (m + 1) % 3; list = []; add(100); } else add(list.length ? 50 : 100); }));
  document.addEventListener('langchange', text);
  if (card) new MutationObserver(text).observe(card, { attributes: true, attributeFilter: ['class'] });
  let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(draw, 100); });
  draw(); text();
})();
