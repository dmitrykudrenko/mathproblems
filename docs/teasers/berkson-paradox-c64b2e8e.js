
(() => {
  const root = document.getElementById('tz-berkson-paradox');
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const cv = root.querySelector('canvas'), msg = root.querySelector('.tz-msg'), btns = root.querySelectorAll('.tz-btn');
  const col = (name, fb) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fb;
  const randn = () => { let u = 0; while (!u) u = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random()); };
  // 150 people, looks and kindness independent; the bar on the sum keeps the top 30% (x + y > 0.7416)
  const BAR = 0.7416, R = 3;
  let ps = [], applied = false;
  const corr = a => {
    const n = a.length, mx = a.reduce((s, p) => s + p.x, 0) / n, my = a.reduce((s, p) => s + p.y, 0) / n;
    let xx = 0, yy = 0, xy = 0; a.forEach(p => { xx += (p.x - mx) ** 2; yy += (p.y - my) ** 2; xy += (p.x - mx) * (p.y - my); });
    return { r: xy / Math.sqrt(xx * yy), mx, my, b: xy / xx };
  };
  const fr = v => (v < 0 ? '−' : '') + Math.abs(v).toFixed(2).replace('.', en() ? '.' : ',');
  function roll() { ps = Array.from({ length: 150 }, () => ({ x: randn(), y: randn() })); }
  const sel = p => p.x + p.y > BAR;
  function draw() {
    const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight;
    if (!W) return;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    const ink = col('--ink', '#151515'), sig = col('--signal', '#D9318F'), mut = col('--muted', '#5F5F5F');
    const side = Math.min(W - 24, H - 24), ox = (W - side) / 2 + 6, oy = 4;
    const X = v => ox + (v + R) / (2 * R) * side, Y = v => oy + (1 - (v + R) / (2 * R)) * side;
    ctx.font = '600 11px ' + col('--f', 'system-ui'); ctx.fillStyle = mut;
    ctx.textAlign = 'right'; ctx.textBaseline = 'top'; ctx.fillText(L('врода →', 'looks →'), ox + side, oy + side + 4);
    ctx.save(); ctx.translate(ox - 4, oy); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; ctx.fillText(L('доброта →', 'kindness →'), 0, 0); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(ox, oy, side, side); ctx.clip();
    ps.forEach(p => {
      const on = applied && sel(p);
      ctx.globalAlpha = applied ? (on ? .9 : .2) : .6; ctx.fillStyle = on ? ink : mut;
      ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), on ? 3 : 2.4, 0, 7); ctx.fill();
    });
    ctx.globalAlpha = 1;
    if (applied) {
      ctx.setLineDash([6, 4]); ctx.strokeStyle = ink; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(X(-R), Y(BAR + R)); ctx.lineTo(X(R), Y(BAR - R)); ctx.stroke(); ctx.setLineDash([]);
      const k = corr(ps.filter(sel)); ctx.strokeStyle = sig; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(X(-R), Y(k.my + k.b * (-R - k.mx))); ctx.lineTo(X(R), Y(k.my + k.b * (R - k.mx))); ctx.stroke();
    }
    ctx.restore();
  }
  function text() {
    const k0 = corr(ps).r;
    msg.textContent = applied
      ? L('Усе місто: r = ' + fr(k0) + '. Ваші ' + ps.filter(sel).length + ' побачень: r = ' + fr(corr(ps.filter(sel)).r) + '. Хто не надто вродливий, той пройшов завдяки доброті.', 'Whole town: r = ' + fr(k0) + '. Your ' + ps.filter(sel).length + ' dates: r = ' + fr(corr(ps.filter(sel)).r) + '. Those who are not so good-looking got in thanks to kindness.')
      : L('150 людей: врода і доброта незалежні, кореляція r = ' + fr(k0) + '. Ви ходите на побачення лише з 30% з найбільшою сумою. Що буде серед них?', '150 people: looks and kindness are independent, correlation r = ' + fr(k0) + '. You only date the 30% with the highest total. What happens among them?');
    btns[0].textContent = L('Нове місто', 'New town');
    btns[1].textContent = L('Поставити планку', 'Set the bar');
    btns[1].disabled = applied;
  }
  btns[0].addEventListener('click', () => { roll(); applied = false; draw(); text(); });
  btns[1].addEventListener('click', () => { applied = true; draw(); text(); });
  document.addEventListener('langchange', () => { draw(); text(); });
  let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(draw, 100); });
  roll(); draw(); text();
})();
