
(() => {
  const root = document.getElementById('tz-small-numbers');
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const cv = root.querySelector('canvas'), msg = root.querySelector('.tz-msg'), btns = root.querySelectorAll('.tz-btn');
  const col = (name, fb) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fb;
  // 100 counties, population 1,000…1,000,000 (log-uniform), the same true risk 25 per 100,000; cases are Poisson
  const pois = m => { let k = 0, p = Math.exp(-m), c = p; const u = Math.random(); while (u > c && k < 2000) { k++; p *= m / k; c += p; } return k; };
  let cs = [], shown = false;
  function roll() {
    cs = Array.from({ length: 100 }, () => { const n = Math.round(10 ** (3 + 3 * Math.random())), x = pois(n * 25e-5); return { n, r: x / n * 1e5, t: Math.random(), g: '' }; });
    const o = [...cs].sort((a, b) => a.r - b.r || a.t - b.t);
    o.slice(0, 10).forEach(c => c.g = 'lo'); o.slice(-10).forEach(c => c.g = 'hi');
  }
  function draw() {
    const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight;
    if (!W) return;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    const ink = col('--ink', '#151515'), sig = col('--signal', '#D9318F'), soft = col('--line', '#E4E4E4');
    const cell = Math.min(W, H) / 10, ox = (W - cell * 10) / 2, oy = (H - cell * 10) / 2;
    cs.forEach((c, i) => {
      const side = cell * (.28 + .66 * (Math.log10(c.n) - 3) / 3), cx = ox + (i % 10 + .5) * cell, cy = oy + (Math.floor(i / 10) + .5) * cell;
      ctx.fillStyle = c.g === 'lo' ? ink : c.g === 'hi' && shown ? sig : soft;
      ctx.fillRect(cx - side / 2, cy - side / 2, side, side);
    });
  }
  const small = a => a.filter(c => c.n < 1e4).length;
  function text() {
    const lo = cs.filter(c => c.g === 'lo'), hi = cs.filter(c => c.g === 'hi');
    msg.textContent = shown
      ? L('Пурпурові: 10 найхворіших, з них малих (до 10 000 людей) ' + small(hi) + '. Темні: 10 найздоровіших, малих ' + small(lo) + '. Справжній ризик у всіх однаковий.', 'Magenta: the 10 sickest, ' + small(hi) + ' of them small (under 10,000 people). Dark: the 10 healthiest, ' + small(lo) + ' small. The true risk is the same everywhere.')
      : L('100 округів, розмір квадрата показує населення. Темні: 10 найздоровіших, з них малих ' + small(lo) + '. А де найхворіші?', '100 counties; square size shows population. Dark: the 10 healthiest, ' + small(lo) + ' of them small. Where are the sickest?');
    btns[0].textContent = L('Нова країна', 'New country');
    btns[1].textContent = L('Показати найхворіші', 'Show the sickest');
    btns[1].disabled = shown;
  }
  btns[0].addEventListener('click', () => { roll(); shown = false; draw(); text(); });
  btns[1].addEventListener('click', () => { shown = true; draw(); text(); });
  document.addEventListener('langchange', () => { draw(); text(); });
  let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(draw, 100); });
  roll(); draw(); text();
})();
