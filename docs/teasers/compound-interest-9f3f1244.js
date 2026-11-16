
(() => {
  const root = document.getElementById('tz-compound-interest');
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const cv = root.querySelector('canvas'), msg = root.querySelector('.tz-msg'), btn = root.querySelector('.tz-btn');
  const col = (name, fb) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fb;
  const N = [[1, 'раз на рік', 'once a year'], [2, 'двічі на рік', 'twice a year'], [12, 'щомісяця', 'monthly'], [365, 'щодня', 'daily'], [31536000, 'щосекунди', 'every second']];
  const val = n => 1000 * Math.pow(1 + 1 / n, n);
  const fmt = x => x.toLocaleString(en() ? 'en-US' : 'uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  let i = 0;
  // turning the frequency up is the answer, so the first click also opens the card's answer; hiding it again resets
  const card = root.closest('[data-spoil][id]');
  const solved = () => !card || card.classList.contains('solved');
  const solve = () => { if (!solved()) { const r = card.querySelector('[data-solve]'); if (r) r.click(); } };
  function draw() {
    const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight;
    if (!W) return;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    const top = i ? 2900 : 2250, X = f => 8 + f * (W - 16), Y = v => 10 + (1 - (v - 900) / (top - 900)) * (H - 20);
    if (i) { ctx.setLineDash([5, 4]); ctx.strokeStyle = '#1F8A5B'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X(0), Y(1000 * Math.E)); ctx.lineTo(X(1), Y(1000 * Math.E)); ctx.stroke(); ctx.setLineDash([]); }
    const path = (n, c, w) => {
      ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(X(0), Y(1000));
      if (n <= 400) { let s = 1000; for (let k = 1; k <= n; k++) { ctx.lineTo(X(k / n), Y(s)); s *= 1 + 1 / n; ctx.lineTo(X(k / n), Y(s)); } }
      else for (let k = 1; k <= 200; k++) ctx.lineTo(X(k / 200), Y(1000 * Math.pow(1 + 1 / n, n * k / 200)));
      ctx.stroke();
    };
    for (let j = 0; j < i; j++) path(N[j][0], '#C9CEDC', 1.5);
    path(N[i][0], i === N.length - 1 ? col('--signal', '#D9318F') : '#B8860B', 2.5);
  }
  function text() {
    const n = N[i];
    msg.textContent = i === 0
      ? L('Раз на рік: одна сходинка до 2 000. А якщо нараховувати частіше? Вирішіть, скільки буде щосекунди, а потім натискайте.', 'Once a year: one step up to 2,000. What if interest is paid more often? Decide how much every second gives, then press.')
      : i === N.length - 1
        ? L('Щосекунди: ' + fmt(val(n[0])) + '. Щодня було 2 714,57: частіші нарахування майже нічого не додають, сума впирається в 1 000 · e.', 'Every second: ' + fmt(val(n[0])) + '. Daily was 2,714.57: more frequent payouts add almost nothing, the sum hits 1,000 · e.')
        : L(n[1] + ': ' + fmt(val(n[0])), n[2] + ': ' + fmt(val(n[0])));
    btn.textContent = i === N.length - 1 ? L('Знову раз на рік', 'Back to once a year') : L('Нараховувати частіше', 'Pay more often');
  }
  btn.addEventListener('click', () => { if (i === N.length - 1) i = 0; else { i++; solve(); } draw(); text(); });
  if (card) new MutationObserver(() => { if (!solved() && i) { i = 0; draw(); text(); } }).observe(card, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('langchange', () => { draw(); text(); });
  let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(draw, 100); });
  draw(); text();
})();
