
(() => {
  const root = document.getElementById('tz-keep-waiting');
  if (!root) return;
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const NS = 'http://www.w3.org/2000/svg';
  const svg = root.querySelector('svg'), msg = root.querySelector('.tz-msg'), b = root.querySelector('.tz-btn');
  // how long is left is the answer, so the remark about it waits until the card is solved
  const card = root.closest('[data-spoil]'), solved = () => !!card && card.classList.contains('solved');
  const ex = m => -m * Math.log(1 - Math.random());
  // uniform 0–20, exponential with mean 10, Lomax with α = 3 and λ = 20: all three average 10
  const DRAW = [() => 20 * Math.random(), () => ex(10), () => 20 * (Math.pow(1 - Math.random(), -1 / 3) - 1)];
  const COL = ['#2A3DD1', '#157F51', '#C47F00'], N = 24;
  let q = [], t = 0;
  const el = (tag, at) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); svg.appendChild(e); return e; };
  const fresh = () => { q = DRAW.map(d => Array.from({ length: N }, d)); t = 0; };
  function draw() {
    svg.textContent = '';
    const names = [L('за розкладом', 'timetable'), L('без розкладу', 'random bus'), L('заявка', 'job reply')];
    q.forEach((g, i) => {
      const y = 22 + i * 40;
      const lab = el('text', { x: 12, y: y + 4, 'font-size': 11, fill: COL[i], 'font-weight': 700, 'font-family': 'ui-monospace, monospace' }); lab.textContent = names[i];
      g.forEach((x, j) => {
        const c = el('circle', { cx: 112 + j * 10, cy: y, r: 3.6 });
        if (x > t) c.setAttribute('fill', COL[i]); else { c.setAttribute('fill', 'none'); c.setAttribute('stroke', '#9AA0B0'); }
      });
    });
  }
  function text() {
    svg.setAttribute('aria-label', L('Три черги', 'Three queues'));
    if (!t) { msg.textContent = L('По 24 людини в трьох чергах щойно почали чекати. Натисніть «Прочекати 10» і подивіться, хто лишиться.', '24 people in each of three queues have just started waiting. Press "Wait 10" and see who is left.'); b.textContent = L('Прочекати 10', 'Wait 10'); return; }
    const n = q.map(g => g.filter(x => x > t));
    const avg = g => g.length ? (g.reduce((a, x) => a + x - t, 0) / g.length).toFixed(1) : '–';
    const dec = s => en() ? s : s.replace('.', ',');
    msg.textContent = L('Ще чекають: ' + n[0].length + ', ' + n[1].length + ' і ' + n[2].length + ' з 24. ', 'Still waiting: ' + n[0].length + ', ' + n[1].length + ' and ' + n[2].length + ' of 24. ') +
      (solved() ? L('Їм лишилося в середньому ' + dec(avg(n[0])) + ', ' + dec(avg(n[1])) + ' і ' + dec(avg(n[2])) + '.', 'They have ' + avg(n[0]) + ', ' + avg(n[1]) + ' and ' + avg(n[2]) + ' left on average.') : L('Скільки їм лишилося? Перевірте відповідь вище.', 'How long do they have left? Check the answer above.'));
    b.textContent = L('Нові люди', 'New people');
  }
  b.addEventListener('click', () => { if (t) fresh(); else t = 10; draw(); text(); });
  document.addEventListener('langchange', () => { draw(); text(); });
  if (card) new MutationObserver(text).observe(card, { attributes: true, attributeFilter: ['class'] });
  fresh(); draw(); text();
})();
