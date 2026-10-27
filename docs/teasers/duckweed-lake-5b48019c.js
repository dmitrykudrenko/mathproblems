
(() => {
  const root = document.getElementById('tz-duckweed-lake');
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const cv = root.querySelector('canvas'), msg = root.querySelector('.tz-msg'), btns = root.querySelectorAll('.tz-btn');
  const col = (name, fb) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fb;
  // cells inside a circle, ordered by noisy distance from a seed point; day d covers 2^d / 2^30 of them
  let s = 11; const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  const S = 0.06, cells = [];
  for (let y = -1; y <= 1; y += S * 0.866) for (let x = -1; x <= 1; x += S) {
    const px = x + (Math.round(y / (S * 0.866)) % 2 ? S / 2 : 0);
    if (Math.hypot(px, y) < 0.92) cells.push({ x: px, y, o: Math.hypot(px + 0.3, y - 0.2) + rnd() * 0.25 });
  }
  cells.sort((a, b) => a.o - b.o);
  let day = 25;
  const cover = d => Math.min(1, Math.pow(2, d - 30));
  function draw() {
    const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight;
    if (!W) return;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    const R = Math.min(W, H) / 2 - 4, cx = W / 2, cy = H / 2, cr = Math.max(1, S * R * 0.62);
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
    const n = cover(day) * cells.length, prev = Math.floor(cover(day - 1) * cells.length);
    const ink = col('--ink', '#151515'), sig = col('--signal', '#D9318F');
    for (let i = 0; i < Math.ceil(n) && i < cells.length; i++) {
      const c = cells[i], part = Math.min(1, n - i);
      ctx.fillStyle = i >= prev ? sig : ink;
      ctx.beginPath(); ctx.arc(cx + c.x * R, cy + c.y * R, Math.max(1.1, cr * Math.sqrt(part)), 0, 7); ctx.fill();
    }
  }
  function text() {
    const p = 100 * cover(day), d = s => en() ? s : s.replace('.', ',');
    const ps = p >= 1 ? d(String(+p.toFixed(1))) : d(p.toFixed(2));
    const left = 30 - day, w = left === 1 ? L('день', 'day') : left >= 2 && left <= 4 ? L('дні', 'days') : L('днів', 'days');
    msg.textContent = day >= 30
      ? L('День 30: озеро заросло. Половина ряски з\'явилася за останню добу.', 'Day 30: the lake is full. Half of the duckweed appeared in the last day.')
      : L('День ' + day + ': вкрито ' + ps + '% озера. До повного озера ' + left + ' ' + w + '.', 'Day ' + day + ': ' + ps + '% of the lake covered. ' + left + ' ' + w + ' to a full lake.');
    btns[0].textContent = L('Наступний день', 'Next day');
    btns[1].textContent = L('Знову з 25-го дня', 'Back to day 25');
    btns[0].disabled = day >= 30;
  }
  btns[0].addEventListener('click', () => { if (day < 30) day++; draw(); text(); });
  btns[1].addEventListener('click', () => { day = 25; draw(); text(); });
  document.addEventListener('langchange', text);
  let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(draw, 100); });
  draw(); text();
})();
