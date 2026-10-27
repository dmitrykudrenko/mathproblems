
(() => {
  const root = document.getElementById('tz-buffon-needle');
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const cv = root.querySelector('canvas'), msg = root.querySelector('.tz-msg'), btns = root.querySelectorAll('.tz-btn');
  const B = 5, all = [];
  let n = 0, h = 0;
  const col = (name, fb) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fb;
  function drop(k) {
    for (let i = 0; i < k; i++) {
      let u, v, r;
      do { u = 2 * Math.random() - 1; v = Math.random(); r = u * u + v * v; } while (r > 1 || r === 0);
      r = Math.sqrt(r);
      const c = u / r, s = v / r, cx = .5 + Math.random() * (B - 1);
      const hit = Math.floor(cx + c / 2) !== Math.floor(cx - c / 2);
      all.push({ cx, f: Math.random(), c, s, hit }); n++; if (hit) h++;
    }
    if (all.length > 1500) all.splice(0, all.length - 1500);
    draw(); text();
  }
  function draw() {
    const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight;
    if (!W) return;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    const bw = W / B, ink = col('--ink', '#151515'), sig = col('--signal', '#D9318F');
    ctx.strokeStyle = '#BDBDBD'; ctx.lineWidth = 1;
    for (let i = 1; i < B; i++) { ctx.beginPath(); ctx.moveTo(i * bw, 0); ctx.lineTo(i * bw, H); ctx.stroke(); }
    ctx.lineCap = 'round'; ctx.lineWidth = all.length > 300 ? 1.2 : 2.2;
    [false, true].forEach(pass => all.forEach(m => {
      if (m.hit !== pass) return;
      const px = m.cx * bw, py = bw / 2 + m.f * (H - bw), dx = m.c * bw / 2, dy = m.s * bw / 2;
      ctx.strokeStyle = m.hit ? sig : ink; ctx.globalAlpha = m.hit ? 1 : .45;
      ctx.beginPath(); ctx.moveTo(px - dx, py - dy); ctx.lineTo(px + dx, py + dy); ctx.stroke();
    }));
    ctx.globalAlpha = 1;
  }
  function text() {
    const d = s => en() ? s : s.replace('.', ',');
    btns[0].textContent = L('Кинути 10 сірників', 'Drop 10 matches');
    btns[1].textContent = L('Кинути 100', 'Drop 100');
    if (!n) { msg.textContent = L('Натисніть «Кинути 10 сірників» і порахуйте, яка частка перетне шов між дошками.', 'Press "Drop 10 matches" and see what share of them crosses a seam between boards.'); return; }
    const est = h ? d((2 * n / h).toFixed(3)) : '–';
    msg.textContent = L('Кидків: ' + n + ', перетинів: ' + h + ' (' + d((100 * h / n).toFixed(1)) + '%). π ≈ 2 · ' + n + ' / ' + h + ' = ' + est,
      'Drops: ' + n + ', crossings: ' + h + ' (' + (100 * h / n).toFixed(1) + '%). π ≈ 2 · ' + n + ' / ' + h + ' = ' + est);
  }
  btns.forEach(b => b.addEventListener('click', () => drop(+b.dataset.k)));
  document.addEventListener('langchange', text);
  let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(draw, 100); });
  draw(); text();
})();
