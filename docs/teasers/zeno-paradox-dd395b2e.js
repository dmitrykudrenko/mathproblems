
(() => {
  const root = document.getElementById('tz-zeno-paradox');
  if (!root) return;
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const NS = 'http://www.w3.org/2000/svg';
  const svg = root.querySelector('svg'), msg = root.querySelector('.tz-msg'), b = root.querySelector('.tz-btn');
  // where each walker gets to is the answer, so the numbers wait until the card is solved
  const card = root.closest('[data-spoil]'), solved = () => !!card && card.classList.contains('solved');
  const G = 0.5772156649015329, Z2 = Math.PI * Math.PI / 6;
  // partial sums: direct for small n, the asymptotic expansions beyond
  const direct = (n, f) => { let s = 0; for (let k = 1; k <= n; k++) s += f(k); return s; };
  const SUM = [
    n => 2 - Math.pow(2, 1 - n),
    n => n <= 1000 ? direct(n, k => 1 / (k * k)) : Z2 - 1 / n + 1 / (2 * n * n),
    n => n <= 1000 ? direct(n, k => 1 / k) : Math.log(n) + G + 1 / (2 * n)
  ];
  const STEP = [k => Math.pow(2, 1 - k), k => 1 / (k * k), k => 1 / k];
  const COL = ['#2A3DD1', '#157F51', '#C47F00'], NAME = ['A', 'B', 'C'], KM = 12, X = v => 26 + Math.min(v, KM) / KM * 320;
  let n = 0;
  const el = (tag, at, txt) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); if (txt) e.textContent = txt; svg.appendChild(e); return e; };
  function draw() {
    svg.textContent = '';
    el('line', { x1: X(10), y1: 8, x2: X(10), y2: 118, stroke: '#151515', 'stroke-width': 2.5 });
    el('text', { x: X(10), y: 128, 'font-size': 10, fill: '#5F5F5F', 'text-anchor': 'middle', 'font-family': 'ui-monospace, monospace' }, L('10 км', '10 km'));
    SUM.forEach((S, i) => {
      const y = 26 + i * 36, pos = n ? S(n) : 0;
      el('text', { x: 8, y: y + 4, 'font-size': 12, fill: COL[i], 'font-weight': 700, 'font-family': 'ui-monospace, monospace' }, NAME[i]);
      el('line', { x1: X(0), y1: y, x2: X(KM), y2: y, stroke: '#D8D8D8', 'stroke-width': 1 });
      let acc = 0;
      for (let k = 1; k <= Math.min(n, 60); k++) { acc += STEP[i](k); el('line', { x1: X(acc), y1: y - 5, x2: X(acc), y2: y + 5, stroke: COL[i], 'stroke-opacity': .5 }); }
      el('circle', { cx: X(pos), cy: y, r: 5, fill: COL[i] });
    });
  }
  const fmt = v => v.toLocaleString(en() ? 'en-US' : 'uk-UA');
  const km = v => (en() ? v.toFixed(2) : v.toFixed(2).replace('.', ',')) + L(' км', ' km');
  function text() {
    svg.setAttribute('aria-label', L('Три доріжки', 'Three lanes'));
    const many = solved();
    b.textContent = many ? (n >= 1e7 ? L('Спочатку', 'Start over') : L('×10 кроків', '×10 steps')) : (n >= 100 ? L('Спочатку', 'Start over') : L('+10 кроків', '+10 steps'));
    if (!n) { msg.textContent = L('Троє мандрівників на старті. Натисніть кнопку, і кожен зробить ще кілька кроків.', 'Three walkers at the start. Press the button and each takes a few more steps.'); return; }
    const done = L('Зроблено ' + fmt(n) + ' кроків. ', fmt(n) + ' steps taken. ');
    if (!many) { msg.textContent = done + L('Кроки дрібнішають, а до стовпа ще далеко. Хто з них колись його мине? Перевірте відповідь вище.', 'The steps get finer and the milestone is still far off. Which of them will ever pass it? Check the answer above.'); return; }
    const p = SUM.map(S => S(n));
    msg.textContent = done + 'A ' + (p[0] > 1.995 ? L('майже 2 км', 'almost 2 km') : km(p[0])) + ', B ' + km(p[1]) + ', C ' + km(p[2]) + '. ' +
      (p[2] > 10 ? L('C минув стовп на кроці 12 367 і йде далі, а A і B не дійдуть навіть до 2 км.', 'C passed the milestone at step 12,367 and keeps going, while A and B never reach even 2 km.') : L('A і B уже біля своїх меж, 2 і 1,645 км. C мине стовп на кроці 12 367.', 'A and B are already at their limits, 2 and 1.645 km. C passes the milestone at step 12,367.'));
  }
  b.addEventListener('click', () => {
    const many = solved();
    if (many) n = n >= 1e7 ? 0 : n ? n * 10 : 10;
    else n = n >= 100 ? 0 : n + 10;
    draw(); text();
  });
  document.addEventListener('langchange', () => { draw(); text(); });
  if (card) new MutationObserver(() => { if (!solved() && n > 100) n = 0; draw(); text(); }).observe(card, { attributes: true, attributeFilter: ['class'] });
  draw(); text();
})();
