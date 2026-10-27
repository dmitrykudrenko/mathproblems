
(() => {
  const root = document.getElementById('tz-multiple-testing');
  const L = (uk, e) => document.documentElement.dataset.lang === 'en' ? e : uk;
  const cv = root.querySelector('canvas'), msg = root.querySelector('.tz-msg'), b = root.querySelector('.tz-btn');
  const CODES = ['DE', 'FR', 'PL', 'UA', 'ES', 'IT', 'NL', 'BE', 'SE', 'NO', 'DK', 'FI', 'CZ', 'AT', 'PT', 'IE', 'RO', 'HU', 'GR', 'SK'];
  let z = null, runs = 0, withHit = 0;
  const randn = () => { let u = 0; while (!u) u = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random()); };
  function draw() {
    const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight; if (!W) return;
    cv.width = W * dpr; cv.height = H * dpr;
    const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const css = getComputedStyle(document.documentElement), ink = css.getPropertyValue('--ink').trim() || '#151515', card = root.closest('[data-spoil]'), sig = card && !card.classList.contains('solved') ? ink : (css.getPropertyValue('--signal').trim() || '#D9318F');
    const cols = 5, gap = 6, pad = 10, tw = (W - 2 * pad - gap * (cols - 1)) / cols, th = (H - 2 * pad - gap * 3) / 4;
    for (let i = 0; i < 20; i++) {
      const x = pad + (i % cols) * (tw + gap), y = pad + Math.floor(i / cols) * (th + gap), on = z && Math.abs(z[i]) > 1.96;
      c.fillStyle = on ? sig : '#fff'; c.beginPath(); c.roundRect ? c.roundRect(x, y, tw, th, 7) : c.rect(x, y, tw, th); c.fill(); if (!on) { c.strokeStyle = '#E4E4E4'; c.lineWidth = 1; c.stroke(); }
      c.fillStyle = on ? '#fff' : ink; c.font = '700 11px system-ui, sans-serif'; c.textBaseline = 'top'; c.fillText(CODES[i], x + 6, y + 5);
      const a0 = x + 6, a1 = x + tw - 6, X = v => a0 + (Math.max(-4.5, Math.min(4.5, v)) + 4.5) / 9 * (a1 - a0), yb = y + th - 8;
      c.strokeStyle = on ? '#fff' : '#A3A9B8'; c.lineWidth = 1; c.beginPath(); c.moveTo(X(0), yb - 5); c.lineTo(X(0), yb + 5); c.stroke();
      if (z) { c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(X(z[i] - 1.96), yb); c.lineTo(X(z[i] + 1.96), yb); c.stroke(); c.lineCap = 'butt'; }
    }
  }
  function step() {
    z = CODES.map(randn); runs++;
    const m = z.filter(v => Math.abs(v) > 1.96).length; if (m) withHit++;
    draw(); text(m);
  }
  function text(m) {
    if (!runs) { msg.textContent = L('B ідентичний A. Запустіть кампанію: у кожній з 20 країн свій тест.', 'B is identical to A. Run a campaign: each of the 20 countries gets its own test.'); b.textContent = L('Провести кампанію', 'Run a campaign'); return; }
    msg.textContent = L('«Значущих» країн: ' + m + '. Кампаній з хоча б одним «переможцем»: ' + withHit + ' з ' + runs + '.', '"Significant" countries: ' + m + '. Campaigns with at least one "winner": ' + withHit + ' of ' + runs + '.');
    b.textContent = L('Ще одна кампанія', 'Another campaign');
  }
  b.addEventListener('click', step);
  document.addEventListener('click', e => { if (e.target.closest && e.target.closest('[data-solve], [data-unsolve]')) setTimeout(draw, 0); });
  document.addEventListener('langchange', () => { draw(); text(z ? z.filter(v => Math.abs(v) > 1.96).length : 0); });
  window.addEventListener('resize', draw);
  draw(); text(0);
})();
