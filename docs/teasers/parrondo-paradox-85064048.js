
(() => {
  const root = document.getElementById('tz-parrondo-paradox');
  if (!root) return;
  const L = (uk, e) => document.documentElement.dataset.lang === 'en' ? e : uk;
  const cv = root.querySelector('canvas'), msg = root.querySelector('.tz-msg'), btns = [...root.querySelectorAll('.tz-btn')];
  const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const E = .005, PA = .5 - E, P1 = .1 - E, P2 = .75 - E, N = 1000, M = 300;
  const NAME = { A: ['Лише A', 'Only A'], B: ['Лише B', 'Only B'], R: ['Навмання', 'At random'] };
  const COL = { A: '#3E7CB1', B: '#B5651D', R: '' };
  const lines = {};
  // the average capital of M players over N rounds
  function run(g) {
    const sum = new Float64Array(N + 1);
    for (let k = 0; k < M; k++) {
      let c = 0;
      for (let t = 0; t < N; t++) {
        const game = g === 'R' ? (Math.random() < .5 ? 'A' : 'B') : g;
        const p = game === 'A' ? PA : ((c % 3) + 3) % 3 === 0 ? P1 : P2;
        c += Math.random() < p ? 1 : -1; sum[t + 1] += c;
      }
    }
    return Array.from(sum, v => v / M);
  }
  const sgn = v => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(1).replace('.', L(',', '.'));
  function draw() {
    const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight;
    if (!W) return;
    cv.width = W * dpr; cv.height = H * dpr;
    const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
    const l = 34, r = 10, t = 12, b = 12, lo = -15, hi = 20;
    const x = i => l + i / N * (W - l - r), y = v => t + (hi - v) / (hi - lo) * (H - t - b);
    c.font = '11px ' + (css('--f') || 'sans-serif'); c.fillStyle = '#9A9A9A'; c.textAlign = 'right'; c.textBaseline = 'middle';
    [-10, 0, 10, 20].forEach(v => { c.strokeStyle = v ? '#EEEEEE' : '#BDBDBD'; c.beginPath(); c.moveTo(l, y(v)); c.lineTo(W - r, y(v)); c.stroke(); c.fillText(v > 0 ? '+' + v : v < 0 ? '−' + (-v) : '0', l - 6, y(v)); });
    Object.keys(lines).forEach(g => {
      const a = lines[g];
      c.strokeStyle = COL[g] || css('--signal') || '#D9318F'; c.lineWidth = g === 'R' ? 2.6 : 2; c.beginPath();
      for (let i = 0; i <= N; i += 5) i ? c.lineTo(x(i), y(a[i])) : c.moveTo(x(0), y(a[0]));
      c.stroke();
    });
  }
  function text(last) {
    btns.forEach(b => { b.textContent = L(NAME[b.dataset.g][0], NAME[b.dataset.g][1]); });
    if (!last) { msg.textContent = L('Оберіть гру: 300 гравців зіграють по 1000 партій, лінія — їхній середній капітал.', 'Pick a game: 300 players play 1,000 rounds each, the line is their average capital.'); return; }
    msg.textContent = L(NAME[last][0], NAME[last][1]) + ': ' + L('середній капітал після 1000 партій ', 'average capital after 1,000 rounds ') + sgn(lines[last][N]) + '.';
  }
  let lastG = null;
  btns.forEach(b => b.addEventListener('click', () => { lastG = b.dataset.g; lines[lastG] = run(lastG); draw(); text(lastG); }));
  document.addEventListener('langchange', () => text(lastG));
  window.addEventListener('resize', draw);
  draw(); text(null);
})();
