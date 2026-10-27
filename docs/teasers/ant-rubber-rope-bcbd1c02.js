
(() => {
  const root = document.getElementById('tz-ant-rubber-rope');
  if (!root) return;
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const cv = root.querySelector('canvas'), msg = root.querySelector('.tz-msg'), btn = root.querySelector('.tz-btn');
  // time jumps of the real puzzle: rope 1 km, ant 1 cm/s, +1 km every second; share after n s = (1 + 1/2 + ... + 1/n) / 100000
  const J = [[1, '1 секунда', '1 second'], [60, '1 хвилина', '1 minute'], [3600, '1 година', '1 hour'], [86400, '1 доба', '1 day'], [31557600, '1 рік', '1 year'], [31557600e3, '1000 років', '1,000 years'], [4.355e17, 'вік Всесвіту', 'the age of the universe']];
  const H = n => { if (n < 1e5) { let s = 0; for (let k = 1; k <= n; k++) s += 1 / k; return s; } return Math.log(n) + 0.5772156649 + 1 / (2 * n); };
  const fmt = (x, d) => { const s = x.toLocaleString('en-US', { maximumFractionDigits: d }); return en() ? s : s.replace(/,/g, ' ').replace('.', ','); };
  let i = -1;
  function draw() {
    const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, Hh = cv.clientHeight; if (!W || !Hh) return;
    cv.width = Math.round(W * dpr); cv.height = Math.round(Hh * dpr);
    const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, Hh);
    const x0 = 18, x1 = W - 18, y = 46, n = i < 0 ? 0 : J[i][0], len = n + 1, f = n ? H(n) / 1e5 : 0;
    c.fillStyle = '#6B6B6B'; c.fillRect(x0 - 6, y - 20, 5, 30);
    c.strokeStyle = '#C2703D'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke();
    c.fillStyle = '#DB9500'; c.beginPath(); c.arc(x1, y, 5, 0, 6.3); c.fill();
    const ax = x0 + (x1 - x0) * f;
    c.fillStyle = '#151515'; [[-5, 4], [0, 3], [5, 3.4]].forEach(([dx, r]) => { c.beginPath(); c.arc(ax + dx, y - 6, r, 0, 6.3); c.fill(); });
    c.font = '11px ui-monospace, Menlo, monospace'; c.fillStyle = '#555'; c.textBaseline = 'top';
    c.textAlign = 'right'; c.fillText(len < 1e9 ? fmt(len, 0) + L(' км', ' km') : (len / 10 ** Math.floor(Math.log10(len))).toFixed(1) + '·10^' + Math.floor(Math.log10(len)) + L(' км', ' km'), x1, y + 10);
    c.textAlign = 'left'; c.fillText(L('пройдено ', 'covered ') + fmt(100 * f, 4) + '%', x0, y + 10);
    c.fillStyle = '#151515'; c.font = '600 12px ui-monospace, Menlo, monospace'; c.fillText(i < 0 ? L('старт', 'start') : L('минуло: ', 'elapsed: ') + L(J[i][1], J[i][2]), x0, 8);
  }
  function text() {
    btn.textContent = i < 0 ? L('Перемотати час', 'Fast-forward') : i < J.length - 1 ? L('Ще далі', 'Further') : L('Спочатку', 'Start over');
    if (i < 0) msg.textContent = L('Мураха біля стовпа. Перемотуйте час і стежте за часткою мотузки.', 'The ant is at the post. Fast-forward and watch the share of the rope.');
    else if (i < J.length - 1) msg.textContent = L('Частка росте дедалі повільніше. Доповзе чи ні?', 'The share grows ever more slowly. Will it get there?');
    else msg.textContent = L('За весь вік Всесвіту лише 0,04%. Тож ніколи? Відповідь на сторінці.', 'Only 0.04% in the whole age of the universe. So never? The answer is on the page.');
  }
  btn.addEventListener('click', () => { i = i < J.length - 1 ? i + 1 : -1; draw(); text(); });
  document.addEventListener('langchange', () => { draw(); text(); });
  draw(); text();
})();
