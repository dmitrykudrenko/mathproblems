
(() => {
  const root = document.getElementById('tz-condorcet-paradox');
  if (!root) return;
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const NS = 'http://www.w3.org/2000/svg';
  const svg = root.querySelector('svg'), msg = root.querySelector('.tz-msg'), btns = [...root.querySelectorAll('.tz-btn')];
  // seeing every order's winner gives the answer away, so before the card is solved only one order can be played
  const card = root.closest('[data-spoil]'), solved = () => !!card && card.classList.contains('solved');
  const DISH = [['піца', 'pizza', '#D2553A'], ['суші', 'sushi', '#2F6FD6'], ['вареники', 'dumplings', '#2E9A5A']];
  const WHO = [['Оля', 'Olya'], ['Марко', 'Marko'], ['Ірина', 'Iryna']];
  const PROF = [[0, 1, 2], [1, 2, 0], [2, 0, 1]];
  const dn = i => L(DISH[i][0], DISH[i][1]);
  const beats = (a, b) => PROF.filter(r => r.indexOf(a) < r.indexOf(b)).length >= 2;
  let played = -1;
  const el = (tag, at, txt) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); if (txt) e.textContent = txt; svg.appendChild(e); return e; };
  function draw() {
    svg.textContent = '';
    PROF.forEach((r, v) => {
      const x = 20 + v * 92;
      el('text', { x: x + 40, y: 26, 'font-size': 13, 'font-weight': 700, fill: '#151515', 'text-anchor': 'middle', 'font-family': 'system-ui, sans-serif' }, L(WHO[v][0], WHO[v][1]));
      r.forEach((d, j) => {
        el('rect', { x, y: 38 + j * 34, width: 80, height: 26, rx: 13, fill: DISH[d][2], 'fill-opacity': j ? .18 : .9, stroke: DISH[d][2], 'stroke-width': 1.5 });
        el('text', { x: x + 40, y: 55 + j * 34, 'font-size': 12, 'font-weight': 600, fill: j ? '#151515' : '#fff', 'text-anchor': 'middle', 'font-family': 'system-ui, sans-serif' }, dn(d));
      });
    });
  }
  function text() {
    btns.forEach(b => { b.textContent = L('Чекає: ', 'Waits: ') + dn(+b.dataset.h); });
    svg.setAttribute('aria-label', L('Списки трьох друзів', 'The three friends\' lists'));
    if (played < 0) { msg.textContent = L('Оберіть, яка страва чекає фіналу. Дві інші змагаються першими.', 'Choose which dish waits for the final. The other two go first.'); return; }
    const h = played, [a, b] = [0, 1, 2].filter(x => x !== h), w1 = beats(a, b) ? a : b, w = beats(w1, h) ? w1 : h;
    const GEN = ['піци', 'суші', 'вареників'], ACC = ['піцу', 'суші', 'вареники'];
    msg.textContent = L('Спершу ' + dn(a) + ' проти ' + GEN[b] + ': ' + (w1 === 2 ? 'перемагають ' : 'перемагає ') + dn(w1) + '. Фінал проти ' + GEN[h] + ': замовляють ' + ACC[w] + '.', 'First ' + dn(a) + ' vs ' + dn(b) + ': ' + dn(w1) + ' win' + (w1 === 2 ? '' : 's') + '. Final against ' + dn(h) + ': they order ' + dn(w) + '.') +
      (solved() ? '' : ' ' + L('А інший порядок? Дайте відповідь вище, і тут можна буде спробувати всі.', 'And another order? Answer above and you can try them all here.'));
  }
  btns.forEach(b => b.addEventListener('click', () => {
    if (played >= 0 && !solved() && +b.dataset.h !== played) { text(); return; }
    played = +b.dataset.h; text();
  }));
  document.addEventListener('langchange', () => { draw(); text(); });
  if (card) new MutationObserver(() => text()).observe(card, { attributes: true, attributeFilter: ['class'] });
  draw(); text();
})();
