
(() => {
  const root = document.getElementById('tz-potato-paradox');
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const cv = root.querySelector('canvas'), msg = root.querySelector('.tz-msg'), btn = root.querySelector('.tz-btn');
  const col = (name, fb) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fb;
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  let m = 100, go = false, raf = 0;
  // drying to 98 % water is the answer, so it also opens the card's answer; hiding it again resets the sack
  const card = root.closest('[data-spoil][id]');
  const solved = () => !card || card.classList.contains('solved');
  const solve = () => { if (!solved()) { const r = card.querySelector('[data-solve]'); if (r) r.click(); } };
  function draw() {
    const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight;
    if (!W) return;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    const cell = Math.min(W, H) / 10, side = cell - 3, x0 = (W - cell * 10) / 2 + 1.5, y0 = (H - cell * 10) / 2 + 1.5;
    for (let k = 0; k < 100; k++) {
      const x = x0 + (k % 10) * cell, y = y0 + (9 - Math.floor(k / 10)) * cell, left = m - k;
      if (left <= 0) { ctx.strokeStyle = '#C9CEDC'; ctx.lineWidth = 1; ctx.setLineDash([2, 3]); ctx.strokeRect(x + .5, y + .5, side - 1, side - 1); ctx.setLineDash([]); continue; }
      ctx.globalAlpha = left < 1 ? .35 + .65 * left : 1;
      ctx.fillStyle = k === 0 ? '#9A6A32' : '#4C8FE0'; ctx.fillRect(x, y, side, side); ctx.globalAlpha = 1;
    }
    if (go && m <= 50) {
      ctx.fillStyle = col('--signal', '#D9318F'); ctx.font = '800 22px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(L('50 кг', '50 kg'), W / 2, y0 + 2.5 * cell);
    }
  }
  function text() {
    if (!go) { msg.textContent = L('Мішок зі 100 клітинок по 1 кг: 99 синіх клітинок води й 1 коричнева суха. Скільки клітинок лишиться, коли води стане 98 %? Вирішіть, а потім натисніть кнопку.', 'A sack of 100 cells of 1 kg: 99 blue cells of water and 1 brown dry cell. How many cells are left when it is 98% water? Decide, then press the button.'); btn.textContent = L('Висушити до 98 %', 'Dry to 98%'); return; }
    if (m > 50) { msg.textContent = L('Сушимо… ' + Math.round(m) + ' кг', 'Drying… ' + Math.round(m) + ' kg'); return; }
    msg.textContent = L('Лишилося 50 клітинок: 49 води й 1 суха. Суха клітинка — кожна п\'ятдесята, тобто 2 %. Картопля важить 50 кг, а не 99.', '50 cells are left: 49 of water and 1 dry. The dry cell is one in fifty, that is 2%. The potatoes weigh 50 kg, not 99.');
    btn.textContent = L('Знову 100 кг', 'Back to 100 kg');
  }
  function dry() {
    cancelAnimationFrame(raf);
    if (reduce()) { m = 50; draw(); text(); return; }
    let prev = 0;
    const step = ts => { if (prev) m = Math.max(50, m - (ts - prev) / 1000 * 30); prev = ts; draw(); text(); if (m > 50) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
  }
  btn.addEventListener('click', () => {
    if (go && m <= 50) { cancelAnimationFrame(raf); m = 100; go = false; draw(); text(); return; }
    go = true; m = 100; solve(); dry();
  });
  if (card) new MutationObserver(() => { if (!solved() && go) { cancelAnimationFrame(raf); go = false; m = 100; draw(); text(); } }).observe(card, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('langchange', () => { draw(); text(); });
  let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(draw, 100); });
  draw(); text();
})();
