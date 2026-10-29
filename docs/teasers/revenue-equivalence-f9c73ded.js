
(() => {
  const root = document.getElementById('tz-revenue-equivalence');
  if (!root) return;
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const cv = root.querySelector('canvas'), msg = root.querySelector('.tz-msg'), btns = root.querySelectorAll('.tz-btn');
  const col = (name, fb) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fb;
  const dec = v => en() ? v.toFixed(1) : v.toFixed(1).replace('.', ',');
  // four buyers with values uniform 0–100; equilibrium bids: honest at second price and English, 3/4 at first price and Dutch
  const NAMES = [['1-ша ціна', '1st price'], ['2-га ціна', '2nd price'], ['Англ.', 'English'], ['Голл.', 'Dutch']];
  let vals = null, last = null, runs = 0, sums = [0, 0, 0, 0];
  function lot() {
    vals = Array.from({ length: 4 }, () => Math.round(100 * Math.random()));
    const s = [...vals].sort((a, b) => b - a);
    last = [.75 * s[0], s[1], s[1], .75 * s[0]];
    runs++; last.forEach((v, i) => { sums[i] += v; });
  }
  function draw() {
    const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight;
    if (!W) return;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    const ink = col('--ink', '#151515'), mut = col('--muted', '#5F5F5F'), line = col('--line', '#E4E4E4'), f = col('--f', 'system-ui');
    const cw = (W - 8) / 4, base = H - 34, top = 30, y = v => base - v / 100 * (base - top);
    ctx.strokeStyle = line; ctx.beginPath(); ctx.moveTo(4, base); ctx.lineTo(W - 4, base); ctx.stroke();
    // buyers' values along the top
    ctx.font = '600 11px ' + f; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = mut;
    ctx.fillText(L('цінності: ', 'values: ') + (vals ? vals.join(' · ') : '? · ? · ? · ?'), W / 2, 12);
    NAMES.forEach((n, i) => {
      const cx = 4 + i * cw + cw / 2, v = runs > 1 ? sums[i] / runs : last ? last[i] : null;
      if (v === null) { ctx.fillStyle = ink; ctx.font = '800 26px ' + f; ctx.fillText('?', cx, (base + top) / 2); }
      else {
        ctx.fillStyle = ink; ctx.globalAlpha = .85; ctx.fillRect(cx - cw * .28, y(v), cw * .56, base - y(v)); ctx.globalAlpha = 1;
        ctx.font = '700 12px ' + f; ctx.textBaseline = 'bottom'; ctx.fillText(dec(v), cx, y(v) - 3); ctx.textBaseline = 'middle';
      }
      ctx.fillStyle = mut; ctx.font = '600 11px ' + f; ctx.textBaseline = 'top'; ctx.fillText(L(n[0], n[1]), cx, base + 8); ctx.textBaseline = 'middle';
    });
  }
  function text() {
    msg.textContent = !last
      ? L('Четверо покупців, той самий лот у чотирьох форматах. Скільки отримає продавець?', 'Four buyers, the same lot in four formats. What does the seller get?')
      : runs > 1
        ? L('Лотів: ' + runs + '. Стовпчики: середній дохід продавця в кожному форматі.', 'Lots: ' + runs + '. Bars: the seller\'s average revenue in each format.')
        : L('Один лот: дохід продавця в кожному форматі, якщо покупці ставлять розумно.', 'One lot: the seller\'s revenue in each format when buyers bid smartly.');
    btns[0].textContent = L('Новий лот', 'New lot');
    btns[1].textContent = L('Ще 100 лотів', '100 more lots');
  }
  btns[0].addEventListener('click', () => { runs = 0; sums = [0, 0, 0, 0]; lot(); draw(); text(); });
  btns[1].addEventListener('click', () => { if (!last) { runs = 0; sums = [0, 0, 0, 0]; } for (let i = 0; i < 100; i++) lot(); draw(); text(); });
  document.addEventListener('langchange', () => { draw(); text(); });
  let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(draw, 100); });
  draw(); text();
})();
