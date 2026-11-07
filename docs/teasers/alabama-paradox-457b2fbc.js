
(() => {
  const root = document.getElementById('tz-alabama-paradox');
  if (!root) return;
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const NS = 'http://www.w3.org/2000/svg';
  const svg = root.querySelector('svg'), msg = root.querySelector('.tz-msg');
  const b10 = root.querySelector('[data-h="10"]'), b11 = root.querySelector('[data-h="11"]');
  // the 11-seat split is the answer, so it stays hidden until the card is solved
  const card = root.closest('[data-spoil]'), solved = () => !!card && card.classList.contains('solved');
  const COL = ['#2A3DD1', '#157F51', '#C47F00'];
  const SPLIT = { 10: [4, 4, 2], 11: [5, 5, 1] };
  let h = null;
  const el = (tag, at, txt) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); if (txt) e.textContent = txt; svg.appendChild(e); return e; };
  function draw() {
    svg.textContent = '';
    const n = h || 10, show = h === 10 || (h === 11 && solved());
    const seats = [];
    if (show) SPLIT[n].forEach((k, i) => { for (let j = 0; j < k; j++) seats.push(COL[i]); });
    else for (let j = 0; j < n; j++) seats.push(null);
    const cx = 150, cy = 120, R = 92, r = Math.min(R * Math.PI / n * .4, 13);
    seats.forEach((c, k) => {
      const th = Math.PI - (k + .5) * Math.PI / n, x = cx + Math.cos(th) * R, y = cy - Math.sin(th) * R;
      el('circle', c ? { cx: x, cy: y, r, fill: c } : { cx: x, cy: y, r, fill: 'none', stroke: '#8A90A3', 'stroke-width': 2, 'stroke-dasharray': '3 3' });
    });
    el('text', { x: cx, y: cy + 6, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: '#141A30', 'font-family': 'ui-monospace, monospace' }, n + ' ' + L('місць', 'seats'));
    const lt = L('АБВ', 'ABC');
    [6, 6, 2].forEach((p, i) => {
      const x = 60 + i * 90;
      el('circle', { cx: x - 22, cy: 152, r: 5, fill: COL[i] });
      el('text', { x: x + 6, y: 156, 'text-anchor': 'middle', 'font-size': 11, fill: '#586079', 'font-family': 'ui-monospace, monospace' }, lt[i] + ' ' + p + L(' тис.', 'k') + (show ? ' · ' + SPLIT[n][i] : ''));
    });
  }
  function text() {
    b10.textContent = L('10 місць', '10 seats');
    b11.textContent = L('11 місць', '11 seats');
    svg.setAttribute('aria-label', L('Рада з місцями', 'A council of seats'));
    if (!h) { msg.textContent = L('Подивіться раду з 10 місць, а потім з 11.', 'Look at the council of 10 seats, then of 11.'); return; }
    if (h === 10) { msg.textContent = L('Частки 4,29, 4,29 і 1,43. Цілі частини 4, 4 і 1, а десяте місце бере найбільший залишок, 0,43 у В: 4, 4 і 2.', 'Shares 4.29, 4.29 and 1.43. Whole parts 4, 4 and 1, and the tenth seat goes to the largest remainder, C\'s 0.43: 4, 4 and 2.'); return; }
    if (!solved()) { msg.textContent = L('Як поділять 11 місць? Перевірте відповідь вище, і місця тут розфарбуються.', 'How will 11 seats be split? Check the answer above, and the seats here get their colours.'); return; }
    msg.textContent = L('5, 5 і 1: місць більше, а район В утратив одне. Залишки великих, 0,71, обігнали його 0,57.', '5, 5 and 1: more seats, yet district C lost one. The big ones\' remainders, 0.71, overtook its 0.57.');
  }
  b10.addEventListener('click', () => { h = 10; draw(); text(); });
  b11.addEventListener('click', () => { h = 11; draw(); text(); });
  document.addEventListener('langchange', () => { draw(); text(); });
  if (card) new MutationObserver(() => { draw(); text(); }).observe(card, { attributes: true, attributeFilter: ['class'] });
  draw(); text();
})();
