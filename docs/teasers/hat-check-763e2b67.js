
(() => {
  const root = document.getElementById('tz-hat-check');
  if (!root) return;
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const cv = root.querySelector('canvas'), msg = root.querySelector('.tz-msg'), btn = root.querySelector('.tz-btn');
  const N = 5, COL = ['#2A3DD1', '#157F51', '#C98A00', '#7A4BC2', '#BF3E28'];
  let p = null, k = 0;
  const deal = () => { const a = [0, 1, 2, 3, 4]; for (let i = N - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  function hat(c, x, y, s, col) {
    c.fillStyle = col;
    c.beginPath(); c.ellipse(x, y, s * .62, s * .13, 0, 0, 6.3); c.fill();
    c.beginPath(); c.ellipse(x, y - s * .05, s * .38, s * .46, 0, Math.PI, 6.3); c.fill();
    c.fillStyle = 'rgba(0,0,0,.28)'; c.fillRect(x - s * .38, y - s * .16, s * .76, s * .09);
  }
  function draw() {
    const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight; if (!W || !H) return;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
    const cw = (W - 20) / N, s = Math.min(34, cw * .7), head = H - 58;
    for (let i = 0; i < N; i++) {
      const x = 10 + cw * (i + .5);
      c.fillStyle = '#fff'; c.strokeStyle = '#151515'; c.lineWidth = 1.5;
      c.beginPath(); c.arc(x, head + s * .3, s * .3, 0, 6.3); c.fill(); c.stroke();
      c.fillStyle = COL[i]; c.beginPath(); c.roundRect ? c.roundRect(x - s * .42, head + s * .66, s * .84, s * .9, 6) : c.rect(x - s * .42, head + s * .66, s * .84, s * .9); c.fill();
      c.fillStyle = '#fff'; c.font = '600 12px ui-monospace, Menlo, monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(i + 1), x, head + s * 1.1);
      if (p) {
        hat(c, x, head + s * .08, s * .8, COL[p[i]]);
        if (p[i] === i) { c.strokeStyle = '#151515'; c.lineWidth = 2.5; c.beginPath(); c.arc(x, head + s * .3, s * .52, 0, 6.3); c.stroke(); }
      } else hat(c, 10 + cw * (i + .5), 26, s * .8, COL[i]);
    }
  }
  function text() {
    btn.textContent = p ? L('Роздати ще раз', 'Hand out again') : L('Роздати капелюхи', 'Hand out the hats');
    if (!p) { msg.textContent = L('П\'ять гостей, п\'ять капелюхів кольору власника. Гардеробник роздає навмання.', 'Five guests, five hats in their owners\' colours. The attendant hands them out at random.'); return; }
    let m = 0; for (let i = 0; i < N; i++) if (p[i] === i) m++;
    msg.textContent = L('Роздача ' + k + ': свій капелюх отримали ' + m + ' з 5. А який шанс, що ніхто?', 'Hand-out ' + k + ': ' + m + ' of 5 got their own hat. So what is the chance that nobody does?');
  }
  btn.addEventListener('click', () => { p = deal(); k++; draw(); text(); });
  document.addEventListener('langchange', text);
  draw(); text();
})();
