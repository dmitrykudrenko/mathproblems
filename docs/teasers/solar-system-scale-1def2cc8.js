
(() => {
  const root = document.getElementById('tz-solar-system-scale');
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const cv = root.querySelector('canvas'), msg = root.querySelector('.tz-msg'), btn = root.querySelector('.tz-btn');
  const col = (name, fb) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fb;
  // model metres for a 5 cm Earth: [uk, en, distance from the Sun's centre, radius]
  const SC = 12742e3 / 0.05, AU = 149597870700 / SC;
  const B = [['Сонце', 'Sun', 0, 695700e3 / SC], ['Меркурій', 'Mercury', .3871 * AU, 2439.5e3 / SC], ['Венера', 'Venus', .7233 * AU, 6052e3 / SC], ['Земля', 'Earth', AU, 6371e3 / SC], ['Марс', 'Mars', 1.5237 * AU, 3389.5e3 / SC],
    ['Юпітер', 'Jupiter', 5.2029 * AU, 69910e3 / SC], ['Сатурн', 'Saturn', 9.5367 * AU, 58230e3 / SC], ['Уран', 'Uranus', 19.1892 * AU, 25362e3 / SC], ['Нептун', 'Neptune', 30.0699 * AU, 24622e3 / SC]];
  const WS = [8, 80, 800, 8000, 18800];
  let i = 0;
  // zooming out is the answer, so the first click also opens the card's answer; hiding it again resets
  const card = root.closest('[data-spoil][id]');
  const solved = () => !card || card.classList.contains('solved');
  const solve = () => { if (!solved()) { const r = card.querySelector('[data-solve]'); if (r) r.click(); } };
  const fmt = m => m >= 1000 ? (m / 1000).toLocaleString(en() ? 'en-US' : 'uk-UA', { maximumFractionDigits: 1 }) + L(' км', ' km') : Math.round(m).toLocaleString(en() ? 'en-US' : 'uk-UA') + L(' м', ' m');
  function draw() {
    const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight;
    if (!W) return;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    const w = WS[i], x0 = -B[0][3] - .03 * w, X = m => (m - x0) / w * W, y = H / 2;
    ctx.strokeStyle = col('--line', '#D3D8E5'); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    ctx.font = '600 10px ' + col('--f-mono', 'monospace'); ctx.textAlign = 'center';
    let last = -99;
    B.forEach((b, k) => {
      const x = X(b[2]), r = b[3] / w * W;
      if (x - r > W) return;
      if (r >= 1) { ctx.fillStyle = k ? (k === 3 ? '#2A6FD1' : '#8C8FA0') : '#F2A93B'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }
      else { ctx.fillStyle = k === 8 ? col('--signal', '#D9318F') : col('--muted', '#586079'); ctx.beginPath(); ctx.moveTo(x, y + 4); ctx.lineTo(x - 4, y + 11); ctx.lineTo(x + 4, y + 11); ctx.fill(); }
      if (x - last > 34 || k === 8) { ctx.fillStyle = k === 8 ? col('--signal', '#D9318F') : col('--ink', '#141A30'); ctx.fillText(L(b[0], b[1]), Math.min(W - 22, Math.max(18, x)), k % 2 ? y + 26 : y - Math.max(10, Math.min(r, H / 2 - 12)) - 6); last = x; }
    });
    ctx.fillStyle = col('--muted', '#586079'); ctx.textAlign = 'left'; ctx.fillText(L('ширина: ', 'width: ') + fmt(w), 4, H - 6);
  }
  function text() {
    msg.textContent = i === 0
      ? L('Сонце — куля 5,5 м. Земля завбільшки 5 см. Де вона і де Нептун? Вирішіть, а потім віддаляйте.', 'The Sun is a 5.5 m ball. Earth is 5 cm across. Where is it, and where is Neptune? Decide, then zoom out.')
      : i === 1 ? L('80 м: Сонце вже маленьке, а планет іще не видно.', '80 m: the Sun is already small, and still no planets.')
        : i === 2 ? L('800 м: Меркурій за 227 м, Земля за 587 м. Самі планети менші за піксель, тут лише позначки.', '800 m: Mercury at 227 m, Earth at 587 m. The planets are smaller than a pixel; only markers show.')
          : i === 3 ? L('8 км: Юпітер за 3 км, Сатурн за 5,6 км. А Уран і Нептун ще далі.', '8 km: Jupiter at 3 km, Saturn at 5.6 km. Uranus and Neptune are farther still.')
            : L('Нептун за 17,65 км. Аркуш — смуга завдовжки з місто, а Сонце на ній менше за піксель.', 'Neptune is 17.65 km away. The sheet is a strip as long as a city, and the Sun on it is smaller than a pixel.');
    btn.textContent = i === WS.length - 1 ? L('Знову до Сонця', 'Back to the Sun') : L('Віддалити ×10', 'Zoom out ×10');
  }
  btn.addEventListener('click', () => { if (i === WS.length - 1) i = 0; else { i++; solve(); } draw(); text(); });
  if (card) new MutationObserver(() => { if (!solved() && i) { i = 0; draw(); text(); } }).observe(card, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('langchange', () => { draw(); text(); });
  let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(draw, 100); });
  draw(); text();
})();
