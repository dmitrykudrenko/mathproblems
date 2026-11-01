
(() => {
  const root = document.getElementById('tz-hundred-prisoners');
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const cv = root.querySelector('canvas'), msg = root.querySelector('.tz-msg'), btns = root.querySelectorAll('.tz-btn');
  const col = (name, fb) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fb;
  const N = 100;
  // the loops show the answer, so the first shuffle also opens the card's answer; hiding it again resets the game
  const card = root.closest('[data-spoil][id]');
  const solved = () => !card || card.classList.contains('solved');
  const solve = () => { if (!solved()) { const r = card.querySelector('[data-solve]'); if (r) r.click(); } };
  function perm() {
    const p = Array.from({ length: N }, (_, i) => i);
    for (let i = N - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
    return p;
  }
  function loops(p) {
    const seen = new Uint8Array(N), out = [];
    for (let s = 0; s < N; s++) { if (seen[s]) continue; let b = s, n = 0; while (!seen[b]) { seen[b] = 1; b = p[b]; n++; } out.push(n); }
    return out.sort((a, b) => b - a);
  }
  let lens = [], tries = 0, wins = 0;
  function roll(k) {
    solve();
    for (let i = 0; i < k; i++) { lens = loops(perm()); tries++; if (lens[0] <= 50) wins++; }
    draw(); text();
  }
  function draw() {
    const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight;
    if (!W) return;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    const ink = col('--ink', '#151515'), sig = col('--signal', '#D9318F'), pad = 10;
    if (!tries) {                                   // before the first click: 100 closed boxes
      const s = Math.min((W - 2 * pad) / 10, (H - 2 * pad) / 10), x0 = (W - 10 * s) / 2, y0 = (H - 10 * s) / 2;
      ctx.fillStyle = col('--muted', '#999');
      for (let j = 0; j < N; j++) ctx.fillRect(x0 + (j % 10) * s + s * 0.2, y0 + Math.floor(j / 10) * s + s * 0.2, s * 0.6, s * 0.6);
      return;
    }
    // shelf-pack one ring per loop, circumference proportional to its length
    for (let s = 9; s > 1.5; s *= 0.94) {
      const rows = []; let row = { it: [], w: 0, h: 0 }, ok = true;
      for (const n of lens) {
        const r = n === 1 ? 0 : Math.max(n * s / (2 * Math.PI), s * 0.55), d = 2 * r + s;
        if (d > W - 2 * pad) { ok = false; break; }
        if (row.w + d > W - 2 * pad && row.it.length) { rows.push(row); row = { it: [], w: 0, h: 0 }; }
        row.it.push({ n, r, d }); row.w += d; row.h = Math.max(row.h, d);
      }
      if (!ok) continue;
      rows.push(row);
      const tot = rows.reduce((a, r) => a + r.h, 0);
      if (tot > H - 2 * pad) continue;
      let y = (H - tot) / 2;
      rows.forEach(rw => {
        let x = (W - rw.w) / 2;
        rw.it.forEach(({ n, r, d }) => {
          const cx = x + d / 2, cy = y + rw.h / 2;
          ctx.fillStyle = n > 50 ? sig : ink;
          for (let j = 0; j < n; j++) { const a = -Math.PI / 2 + 2 * Math.PI * j / n; ctx.beginPath(); ctx.arc(cx + r * Math.cos(a), cy + r * Math.sin(a), Math.max(1.3, s * 0.3), 0, 7); ctx.fill(); }
          x += d;
        });
        y += rw.h;
      });
      return;
    }
  }
  function text() {
    const m = lens[0], p = Math.round(100 * wins / tries);
    msg.textContent = !tries
      ? L('100 коробок, у кожній випадковий номер. Перемішайте номери й подивіться, на які петлі вони розпадаються.', '100 boxes, each with a random number. Shuffle the numbers and see which loops they form.') +
        (solved() ? '' : ' ' + L('Це покаже й відповідь.', 'This also shows the answer.'))
      : (m > 50 ? L('Найдовша петля: ' + m + '. Програш.', 'Longest loop: ' + m + '. They lose.') : L('Найдовша петля: ' + m + '. Усі на волі!', 'Longest loop: ' + m + '. All go free!')) + ' ' +
      L('Виграшів: ' + wins + ' з ' + tries + ' (' + p + '%).', 'Wins: ' + wins + ' of ' + tries + ' (' + p + '%).');
    btns[0].textContent = L('Нове розміщення', 'New arrangement');
    btns[1].textContent = L('Ще 100 розміщень', '100 more');
  }
  btns[0].addEventListener('click', () => roll(1));
  btns[1].addEventListener('click', () => roll(100));
  document.addEventListener('langchange', text);
  if (card) new MutationObserver(() => { if (!solved() && tries) { lens = []; tries = 0; wins = 0; draw(); } text(); }).observe(card, { attributes: true, attributeFilter: ['class'] });
  let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(draw, 100); });
  draw(); text();
})();
