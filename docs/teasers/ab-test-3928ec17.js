
(() => {
  const root = document.getElementById('tz-ab-test');
  const L = (uk, e) => document.documentElement.dataset.lang === 'en' ? e : uk;
  const cv = root.querySelector('canvas'), msg = root.querySelector('.tz-msg'), b = root.querySelector('.tz-btn');
  const N = 1000, P = .05, COLS = 40;
  let runs = 0, a = null, c = null, hist = [];
  function test() { a = new Uint8Array(N); c = new Uint8Array(N); for (let i = 0; i < N; i++) { a[i] = Math.random() < P; c[i] = Math.random() < P; } }
  const sum = v => v.reduce((s, x) => s + x, 0);
  function draw() {
    const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight; if (!W) return;
    cv.width = W * dpr; cv.height = H * dpr;
    const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const css = getComputedStyle(document.documentElement), ink = css.getPropertyValue('--ink').trim() || '#151515', line = '#D6DAE2';
    const half = (W - 30) / 2, d = Math.min(half / COLS, (H - 34) / (N / COLS));
    [a, c].forEach((arr, s) => {
      const x0 = 10 + s * (half + 10);
      g.fillStyle = ink; g.font = '700 12px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s ? 'B' : 'A', x0 + half / 2, 12);
      for (let i = 0; i < N; i++) {
        const on = arr && arr[i];
        g.fillStyle = on ? ink : line; g.beginPath(); g.arc(x0 + (i % COLS + .5) * d, 26 + (Math.floor(i / COLS) + .5) * d, on ? d * .48 : d * .26, 0, 2 * Math.PI); g.fill();
      }
    });
  }
  function text() {
    if (!a) { msg.textContent = L('Дві однакові сторінки, по 1 000 відвідувачів, конверсія 5%. Запустіть A/A-тест і подивіться, яку «перемогу» покаже дашборд.', 'Two identical pages, 1,000 visitors each, 5% conversion. Run an A/A test and see what "win" the dashboard shows.'); b.textContent = L('Запустити A/A-тест', 'Run an A/A test'); return; }
    const x = sum(a), y = sum(c), mx = Math.max(x, y), mn = Math.min(x, y), l = mn ? mx / mn - 1 : 0;
    const lift = x === y ? L('нічия', 'a tie') : (y > x ? 'B' : 'A') + ' +' + Math.round(100 * l) + '%';
    const big = hist.filter(v => v >= .2 - 1e-9).length;
    msg.textContent = 'A ' + x + ' · B ' + y + ' · ' + lift + '. ' + L('Тестів: ' + runs + ', з «перемогою» на 20% і більше: ' + big + '.', 'Tests: ' + runs + ', with a "win" of 20% or more: ' + big + '.');
    b.textContent = L('Ще один A/A-тест', 'Another A/A test');
  }
  b.addEventListener('click', () => { test(); runs++; const x = sum(a), y = sum(c), mn = Math.min(x, y); hist.push(mn ? Math.max(x, y) / mn - 1 : (x === y ? 0 : 1)); draw(); text(); });
  document.addEventListener('langchange', () => { draw(); text(); });
  window.addEventListener('resize', draw);
  draw(); text();
})();
