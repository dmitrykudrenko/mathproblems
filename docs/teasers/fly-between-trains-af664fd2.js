
(() => {
  const root = document.getElementById('tz-fly-between-trains');
  if (!root) return;
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const cv = root.querySelector('canvas'), msg = root.querySelector('.tz-msg'), btn = root.querySelector('.tz-btn');
  const D = 100, V = 50, F = 75, T = 1, RUN = 6000;
  // every leg of the flight: [start time, end time, start x, end x]
  const LG = []; (() => { let t = 0, x = 0, toB = true; while (LG.length < 40) { const xa = V * t, xb = D - V * t; if (xb - xa < 1e-9) break; const dt = toB ? (xb - x) / (F + V) : (x - xa) / (F + V); const nx = toB ? xb - V * dt : xa + V * dt; LG.push([t, t + dt, x, nx]); t += dt; x = nx; toB = !toB; } })();
  let start = 0, raf = 0;
  const flyAt = t => { for (const g of LG) if (t <= g[1]) return g[2] + (g[3] - g[2]) * (t - g[0]) / (g[1] - g[0]); return D / 2; };
  const turns = t => { let k = 0; for (const g of LG) if (g[1] <= t) k++; return k; };
  function draw(t) {
    const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight; if (!W || !H) return;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
    const pad = 16, sx = k => pad + (W - 2 * pad) * k / D, rail = H - 22;
    c.strokeStyle = '#6B6B6B'; c.lineWidth = 2; c.beginPath(); c.moveTo(4, rail); c.lineTo(W - 4, rail); c.stroke();
    const train = (x, dir, col) => { c.fillStyle = col; const len = 54, x0 = dir > 0 ? x - len : x; c.fillRect(x0, rail - 20, len, 16); c.beginPath(); c.moveTo(x, rail - 4); c.lineTo(x, rail - 12); c.lineTo(x - dir * 8, rail - 20); c.lineTo(x - dir * 8, rail - 4); c.fill(); c.fillStyle = '#151515'; [6, 16, 38, 48].forEach(k => { c.beginPath(); c.arc(x - dir * k, rail - 3, 3, 0, 6.3); c.fill(); }); };
    train(sx(V * t), 1, '#151515'); train(sx(D - V * t), -1, '#9A9A9A');
    // the zig-zag so far, drawn as a trail above the track
    c.strokeStyle = 'rgba(21,21,21,.35)'; c.lineWidth = 1; c.beginPath();
    const yAt = tt => 14 + (rail - 44) * tt / T;
    c.moveTo(sx(0), yAt(0));
    for (const g of LG) { if (g[1] <= t) c.lineTo(sx(g[3]), yAt(g[1])); else { c.lineTo(sx(flyAt(t)), yAt(t)); break; } }
    c.stroke();
    const fx = sx(flyAt(t)), fy = rail - 30;
    c.fillStyle = 'rgba(160,190,230,.85)'; c.beginPath(); c.ellipse(fx - 3, fy - 4, 4, 3, -.5, 0, 6.3); c.fill(); c.beginPath(); c.ellipse(fx + 3, fy - 4, 4, 3, .5, 0, 6.3); c.fill();
    c.fillStyle = '#151515'; c.beginPath(); c.ellipse(fx, fy, 2.6, 3.6, 0, 0, 6.3); c.fill();
  }
  let lastT = 0;
  function text(t) {
    lastT = t; const k = turns(t);
    btn.textContent = raf ? L('Летить…', 'Flying…') : t > 0 ? L('Ще раз', 'Again') : L('Запустити муху', 'Launch the fly');
    btn.disabled = !!raf;
    if (t <= 0) msg.textContent = L('Натисніть і порахуйте розвороти. Шлях: ? км.', 'Press and count the turns. Path: ? km.');
    else if (t < T) msg.textContent = L('Розворотів: ' + k + '. Шлях: ? км.', 'Turns: ' + k + '. Path: ? km.');
    else msg.textContent = L('Розворотів нескінченно багато, а потяги зустрілися. Скільки ж кілометрів?', 'Infinitely many turns, and yet the trains have met. So how many kilometres?');
  }
  function loop(now) {
    const t = Math.min(T, (now - start) / RUN);
    draw(t);
    if (t >= T) { raf = 0; text(T); return; }
    raf = requestAnimationFrame(loop); text(t);
  }
  btn.addEventListener('click', () => {
    if (raf) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { draw(T); text(T); return; }
    start = performance.now(); raf = requestAnimationFrame(loop);
  });
  document.addEventListener('langchange', () => text(lastT));
  draw(0); text(0);
})();
