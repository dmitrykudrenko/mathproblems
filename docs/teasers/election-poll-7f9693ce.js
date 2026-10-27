
(() => {
  const root = document.getElementById('tz-election-poll');
  const L = (uk, e) => document.documentElement.dataset.lang === 'en' ? e : uk;
  const cv = root.querySelector('canvas'), msg = root.querySelector('.tz-msg'), b = root.querySelector('.tz-btn');
  const LANDS = [3e7, 3e8], DOTS = 300, STEP = 100, FULL = 1100;
  let land = 0, t = 0, n = 0, a = 0, started = false, lit = new Int8Array(DOTS).fill(-1);
  const fmt = v => Math.round(v).toLocaleString(L('uk-UA', 'en-US'));
  const pc = v => L((100 * v).toFixed(1).replace('.', ','), (100 * v).toFixed(1));
  function fresh() { t = .47 + Math.random() * .08; n = 0; a = 0; lit = new Int8Array(DOTS).fill(-1); }
  function draw() {
    const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight; if (!W) return;
    cv.width = W * dpr; cv.height = H * dpr;
    const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const css = getComputedStyle(document.documentElement), ink = css.getPropertyValue('--ink').trim() || '#151515', line = '#D6DAE2';
    const cols = 30, rows = DOTS / cols, dx = (W - 20) / cols, dy = (H - 20) / rows, r = Math.min(dx, dy) * .3;
    for (let i = 0; i < DOTS; i++) {
      c.fillStyle = lit[i] < 0 ? line : lit[i] ? ink : '#A3A9B8';
      c.beginPath(); c.arc(10 + (i % cols + .5) * dx, 10 + (Math.floor(i / cols) + .5) * dy, r, 0, 2 * Math.PI); c.fill();
    }
  }
  function step() {
    if (!started) { started = true; fresh(); }
    if (n >= FULL) { land = 1 - land; fresh(); }
    for (let i = 0; i < STEP; i++) { const v = Math.random() < t ? 1 : 0; a += v; lit[Math.floor(Math.random() * DOTS)] = v; }
    n += STEP; draw(); text();
  }
  function text() {
    const N = LANDS[land];
    if (!n) { msg.textContent = L('Країна на ' + fmt(N) + ' виборців. Опитуйте випадкових людей по 100 і стежте за похибкою.', 'A country of ' + fmt(N) + ' voters. Ask random people 100 at a time and watch the margin of error.'); b.textContent = L('Опитати 100 людей', 'Ask 100 people'); return; }
    const p = a / n, e = 1.96 * Math.sqrt(p * (1 - p) / n);
    msg.textContent = L('Опитано ' + fmt(n) + '. За А ' + pc(p) + '% ± ' + pc(e) + ' пункти.', 'Asked ' + fmt(n) + '. For A ' + pc(p) + '% ± ' + pc(e) + ' points.') +
      (n >= FULL ? ' ' + L('Справжній результат ' + pc(t) + '%. А якщо країна вдесятеро більша?', 'The true result is ' + pc(t) + '%. What if the country were ten times bigger?') : '');
    b.textContent = n >= FULL ? L('Країна на ' + fmt(LANDS[1 - land]), 'A country of ' + fmt(LANDS[1 - land])) : L('Опитати ще 100', 'Ask 100 more');
  }
  b.addEventListener('click', step);
  document.addEventListener('langchange', () => { draw(); text(); });
  window.addEventListener('resize', draw);
  draw(); text();
})();
