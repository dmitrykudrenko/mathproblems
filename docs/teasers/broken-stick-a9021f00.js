
(() => {
  const root = document.getElementById('tz-broken-stick');
  if (!root) return;
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const cv = root.querySelector('canvas'), msg = root.querySelector('.tz-msg'), btn = root.querySelector('.tz-btn');
  const COLS = ['#C8955A', '#2A3DD1', '#8A8FA3'];
  let cur = null, n = 0, k = 0;
  function draw() {
    const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight; if (!W || !H) return;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
    const pad = 16, w = W - 2 * pad, y = 26;
    const p = cur || [1];
    let x = pad; const gap = cur ? 6 : 0, u = w - gap * (p.length - 1);
    p.forEach((len, i) => { c.fillStyle = COLS[i]; c.fillRect(x, y - 5, Math.max(2, u * len), 10); x += u * len + gap; });
    if (!cur) return;
    // the longest piece is the base; the other two try to meet above it
    const idx = [0, 1, 2].sort((i, j) => p[j] - p[i]), B = p[idx[0]], a = p[idx[1]], b = p[idx[2]];
    const s = Math.min(w * 0.85, (H - 60) * 1.7), by = H - 16, xl = W / 2 - B * s / 2, xr = W / 2 + B * s / 2;
    let tl, tr;
    if (a + b > B) { const px = (B * B + a * a - b * b) / (2 * B), py = Math.sqrt(Math.max(0, a * a - px * px)); tl = tr = [xl + px * s, by - py * s]; }
    else { tl = [xl + a * s * Math.cos(.42), by - a * s * Math.sin(.42)]; tr = [xr - b * s * Math.cos(.42), by - b * s * Math.sin(.42)]; }
    c.lineWidth = 5; c.lineCap = 'round';
    const seg = (P, Q, col) => { c.strokeStyle = col; c.beginPath(); c.moveTo(P[0], P[1]); c.lineTo(Q[0], Q[1]); c.stroke(); };
    seg([xl, by], [xr, by], COLS[idx[0]]); seg([xl, by], tl, COLS[idx[1]]); seg([xr, by], tr, COLS[idx[2]]);
  }
  function text() {
    btn.textContent = n ? L('Зламати ще одну', 'Break another') : L('Зламати паличку', 'Break the stick');
    if (!cur) { msg.textContent = L('Натисніть: паличка зламається у двох випадкових місцях.', 'Press it: the stick breaks at two random points.'); return; }
    const ok = Math.max(...cur) < 0.5;
    msg.textContent = (ok ? L('Трикутник склався. ', 'A triangle closed. ') : L('Не сходиться. ', 'It does not close. ')) + L('Трикутників: ' + k + ' з ' + n + '.', 'Triangles: ' + k + ' of ' + n + '.');
  }
  btn.addEventListener('click', () => {
    const u = Math.random(), v = Math.random(), x = Math.min(u, v), y = Math.max(u, v);
    cur = [x, y - x, 1 - y]; n++; if (Math.max(...cur) < 0.5) k++;
    draw(); text();
  });
  document.addEventListener('langchange', text);
  draw(); text();
})();
