
(() => {
  const root = document.getElementById('tz-inspection-paradox');
  const L = (uk, e) => document.documentElement.dataset.lang === 'en' ? e : uk;
  const dec = s => document.documentElement.dataset.lang === 'en' ? s : s.replace('.', ',');
  const NS = 'http://www.w3.org/2000/svg';
  const svg = root.querySelector('svg'), msg = root.querySelector('.tz-msg'), b = root.querySelector('.tz-btn');
  const exp = () => -10 * Math.log(1 - Math.random());
  // the wait is the answer, so the closing remark compares it with the timetable only once the card is solved
  const card = root.closest('[data-spoil]'), solved = () => !!card && card.classList.contains('solved');
  const pl = (n, a, f, m) => { const x = n % 10, y = n % 100; return x === 1 && y !== 11 ? a : x >= 2 && x <= 4 && (y < 12 || y > 14) ? f : m; };
  // the window shows 30 minutes before you arrive and 60 after
  const T0 = -30, T1 = 60, X = t => 16 + (t - T0) / (T1 - T0) * 328, AX = 72;
  let waits = [], last = null;
  const el = (tag, at) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); svg.appendChild(e); return e; };
  function draw() {
    svg.textContent = '';
    el('line', { x1: 16, y1: AX, x2: 344, y2: AX, stroke: 'var(--ink)', 'stroke-width': 2 });
    const t = el('text', { x: 16, y: 108, 'font-size': 11, fill: 'var(--muted)', 'font-family': 'ui-monospace, monospace' }); t.textContent = L('час →', 'time →');
    if (!last) return;
    const { prev, next, buses } = last;
    el('rect', { x: X(Math.max(prev, T0)), y: AX - 12, width: X(Math.min(next, T1)) - X(Math.max(prev, T0)), height: 22, fill: '#F7DC8E', rx: 3 });
    el('line', { x1: 16, y1: AX, x2: 344, y2: AX, stroke: 'var(--ink)', 'stroke-width': 2 });
    buses.forEach(s => el('rect', { x: X(s) - 5.5, y: AX - 10, width: 11, height: 8, rx: 2, fill: 'var(--ink)' }));
    el('line', { x1: X(0), y1: AX + 6, x2: X(Math.min(next, T1)), y2: AX + 6, stroke: 'var(--signal)', 'stroke-width': 3, 'stroke-linecap': 'round' });
    el('circle', { cx: X(0), cy: AX + 6, r: 5, fill: 'var(--ink)' });
    const lab = el('text', { x: X(0), y: AX - 22, 'font-size': 12, 'font-weight': 700, fill: 'var(--ink)', 'font-family': 'ui-monospace, monospace', 'text-anchor': 'middle' });
    lab.textContent = L('ви', 'you');
  }
  // you arrive at time 0; a Poisson stream looks the same in both directions, so buses before and after are independent
  function visit() {
    // the previous bus is the first one found walking back, not the last one before the window edge
    let tb = 0, prev = null; const buses = []; while ((tb -= exp()) > T0) { buses.push(tb); if (prev === null) prev = tb; }
    if (prev === null) prev = tb; let ta = 0, next = null; while ((ta += exp()) < T1) { buses.push(ta); if (next === null) next = ta; }
    if (next === null) next = ta;
    return { prev, next, buses, w: next, gap: next - prev };
  }
  function text() {
    svg.setAttribute('aria-label', L('Автобусна зупинка', 'Bus stop'));
    if (!last) { msg.textContent = L('Автобус ходить у середньому раз на 10 хвилин. Натисніть «Прийти на зупинку» і подивіться, скільки доведеться чекати.', 'The bus comes every 10 minutes on average. Press "Go to the stop" and see how long you wait.'); b.textContent = L('Прийти на зупинку', 'Go to the stop'); return; }
    const n = waits.length, avg = waits.reduce((a, c) => a + c, 0) / n;
    msg.textContent = L('Ви чекали ' + dec(last.w.toFixed(1)) + ' хв в інтервалі довжиною ' + dec(last.gap.toFixed(1)) + ' хв. Середнє за ' + n + ' ' + pl(n, 'прихід', 'приходи', 'приходів') + ': ' + dec(avg.toFixed(1)) + ' хв' + (solved() ? ', хоча автобус ходить «раз на 10 хвилин».' : '. Чи це типово? Перевірте відповідь вище.'),
      'You waited ' + last.w.toFixed(1) + ' min in a ' + last.gap.toFixed(1) + '-min gap. Average over ' + n + ' ' + (n === 1 ? 'visit' : 'visits') + ': ' + avg.toFixed(1) + ' min' + (solved() ? ', for a bus that comes "every 10 minutes".' : '. Is that typical? Check the answer above.'));
    b.textContent = L('Прийти ще раз', 'Go again');
  }
  b.addEventListener('click', () => { last = visit(); waits.push(last.w); draw(); text(); });
  document.addEventListener('langchange', () => { draw(); text(); });
  if (card) new MutationObserver(text).observe(card, { attributes: true, attributeFilter: ['class'] });
  draw(); text();
})();
