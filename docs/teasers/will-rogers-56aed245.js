
(() => {
  const root = document.getElementById('tz-will-rogers');
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const dec = v => { const s = String(+v.toFixed(2)); return en() ? s : s.replace('.', ','); };
  const cv = root.querySelector('canvas'), msg = root.querySelector('.tz-msg'), btns = root.querySelectorAll('.tz-btn');
  const col = (name, fb) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fb;
  const A0 = [5, 6, 7, 8, 9], B0 = [1, 2, 3, 4], mean = a => a.reduce((t, v) => t + v, 0) / a.length;
  // nothing is shown about the averages' change before the first click
  let moved = null;
  const order = [9, 7, 5, 8, 6]; let k = 0;
  function draw() {
    const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight;
    if (!W) return;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    const ink = col('--ink', '#151515'), sig = col('--signal', '#D9318F'), mut = col('--muted', '#5F5F5F'), soft = '#9A9A9A';
    const l = 22, r = 10, X = v => l + (v - .5) / 9 * (W - l - r), yA = 42, yB = 108, rad = Math.min(12, (W - l - r) / 22);
    const A = A0.filter(v => v !== moved), B = moved ? [...B0, moved] : B0;
    ctx.font = '600 11px ' + col('--f', 'system-ui'); ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    ctx.fillStyle = ink; ctx.fillText('A', 2, yA); ctx.fillStyle = mut; ctx.fillText('B', 2, yB);
    const tick = (v, y, c, ghost) => { ctx.globalAlpha = ghost ? .35 : 1; if (!ghost) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(X(v), y - rad - 8); ctx.lineTo(X(v), y + rad + 8); ctx.stroke(); } ctx.strokeStyle = c; ctx.lineWidth = ghost ? 2 : 3; ctx.beginPath(); ctx.moveTo(X(v), y - rad - 8); ctx.lineTo(X(v), y + rad + 8); ctx.stroke(); ctx.globalAlpha = 1; };
    if (moved) { tick(7, yA, ink, true); tick(2.5, yB, mut, true); }
    A.forEach(v => { ctx.fillStyle = ink; ctx.beginPath(); ctx.arc(X(v), yA, rad, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText(v, X(v), yA + 1); });
    B.forEach(v => { ctx.fillStyle = v === moved ? sig : soft; ctx.beginPath(); ctx.arc(X(v), yB, rad, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText(v, X(v), yB + 1); });
    tick(mean(A), yA, ink); tick(mean(B), yB, mut);
    ctx.fillStyle = mut; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.fillText(dec(mean(A)), X(mean(A)), yA - rad - 10);
    ctx.textBaseline = 'top'; ctx.fillText(dec(mean(B)), X(mean(B)), yB + rad + 10);
  }
  function text() {
    if (!moved) msg.textContent = L('Команда A: середнє 7. Команда B: середнє 2,5. Переведіть когось з A в B і подивіться на обидва середні.', 'Team A averages 7. Team B averages 2.5. Move someone from A to B and watch both averages.');
    else {
      const a = mean(A0.filter(v => v !== moved)), b = mean([...B0, moved]);
      msg.textContent = L('Переведено учасника з ' + moved + ' балами. A: 7 → ' + dec(a) + ', B: 2,5 → ' + dec(b) + '.' + (a > 7 && b > 2.5 ? ' Обидва середні виросли!' : ''),
        'Moved the ' + moved + '-point player. A: 7 → ' + dec(a) + ', B: 2.5 → ' + dec(b) + '.' + (a > 7 && b > 2.5 ? ' Both averages rose!' : ''));
    }
    btns[0].textContent = moved ? L('Перевести іншого', 'Move someone else') : L('Перевести когось', 'Move someone');
    btns[1].textContent = L('Почати знову', 'Start over');
    btns[1].disabled = !moved;
  }
  btns[0].addEventListener('click', () => { moved = order[k++ % order.length]; draw(); text(); });
  btns[1].addEventListener('click', () => { moved = null; k = 0; draw(); text(); });
  document.addEventListener('langchange', () => { draw(); text(); });
  let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(draw, 100); });
  draw(); text();
})();
