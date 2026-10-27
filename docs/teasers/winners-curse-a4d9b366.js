
(() => {
  const root = document.getElementById('tz-winners-curse');
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const cv = root.querySelector('canvas'), msg = root.querySelector('.tz-msg'), btns = root.querySelectorAll('.tz-btn');
  const col = (name, fb) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fb;
  const randn = () => { let u = 0; while (!u) u = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random()); };
  // a jar worth 100, ten honest estimates with error SD 20; the highest bid wins and pays itself
  let bids = [], runs = 0, total = 0;
  const top = () => Math.max(...bids);
  function auction() { bids = Array.from({ length: 10 }, () => Math.round(100 + 20 * randn())); runs++; total += 100 - top(); }
  function draw() {
    const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight;
    if (!W) return;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    const ink = col('--ink', '#151515'), sig = col('--signal', '#D9318F'), mut = col('--muted', '#5F5F5F'), f = col('--f', 'system-ui');
    const lo = 40, hi = 170, x = v => 10 + (Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo) * (W - 20), base = H - 26;
    ctx.strokeStyle = mut; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(10, base); ctx.lineTo(W - 10, base); ctx.stroke();
    ctx.fillStyle = mut; ctx.font = '11px ' + f; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    [50, 100, 150].forEach(v => ctx.fillText(v, x(v), base + 6));
    ctx.strokeStyle = ink; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(x(100), 22); ctx.lineTo(x(100), base); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = ink; ctx.font = '600 11px ' + f; ctx.textBaseline = 'bottom'; ctx.fillText(L('банка: 100', 'jar: 100'), x(100), 18);
    const t = top();
    [...bids].sort((a, b) => a - b).forEach((v, i) => {
      const w = v === t; ctx.fillStyle = w ? sig : mut; ctx.globalAlpha = w ? 1 : .45;
      ctx.beginPath(); ctx.arc(x(v), w ? base - 80 : base - 16 - (i % 3) * 18, w ? 7 : 5, 0, 7); ctx.fill();
    });
    ctx.globalAlpha = 1;
  }
  function text() {
    const t = top(), p = 100 - t, s = v => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v);
    msg.textContent = runs > 1
      ? L('Аукціонів: ' + runs + '. Переможець отримав у середньому ' + s(Math.round(total / runs)) + ' за банку на 100.', 'Auctions: ' + runs + '. The winner got ' + s(Math.round(total / runs)) + ' on average for a jar worth 100.')
      : L('Найвища з десяти оцінок: ' + t + '. Переможець платить ' + t + ' за банку на 100: ' + s(p) + '.', 'The highest of ten estimates: ' + t + '. The winner pays ' + t + ' for a jar worth 100: ' + s(p) + '.');
    btns[0].textContent = L('Новий аукціон', 'New auction');
    btns[1].textContent = L('Ще 100 аукціонів', '100 more auctions');
  }
  btns[0].addEventListener('click', () => { runs = 0; total = 0; auction(); draw(); text(); });
  btns[1].addEventListener('click', () => { for (let i = 0; i < 100; i++) auction(); draw(); text(); });
  document.addEventListener('langchange', () => { draw(); text(); });
  let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(draw, 100); });
  auction(); draw(); text();
})();
