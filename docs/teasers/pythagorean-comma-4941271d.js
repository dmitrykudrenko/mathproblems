
(() => {
  const root = document.getElementById('tz-pythagorean-comma');
  if (!root) return;
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const NS = 'http://www.w3.org/2000/svg';
  const svg = root.querySelector('svg'), msg = root.querySelector('.tz-msg');
  const bStep = root.querySelector('[data-a="step"]'), bReset = root.querySelector('[data-a="reset"]');
  // where the twelfth fifth lands is the answer, so it stays a "?" until the card is solved
  const card = root.closest('[data-spoil]'), solved = () => !!card && card.classList.contains('solved');
  const NAMES = ['C', 'G', 'D', 'A', 'E', 'B', 'F♯', 'C♯', 'G♯', 'D♯', 'A♯', 'E♯', 'B♯'];
  const LOG2F = Math.log2(1.5), cx = 150, cy = 112, R0 = 22, R1 = 92;
  let k = 0;
  const el = (tag, at, txt) => { const e = document.createElementNS(NS, tag); for (const a in at) e.setAttribute(a, at[a]); if (txt) e.textContent = txt; svg.appendChild(e); return e; };
  // a pitch spiral: one turn per octave, the angle is the place in the octave
  const P = oc => { const a = -Math.PI / 2 + 2 * Math.PI * oc, r = R0 + (R1 - R0) * oc / (12 * LOG2F); return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; };
  function draw() {
    svg.textContent = '';
    el('line', { x1: cx, y1: cy - 10, x2: cx, y2: cy - R1 - 12, stroke: '#8A8A8A', 'stroke-dasharray': '3 4' });
    const end = Math.min(k, solved() ? 12 : 11) * LOG2F;
    let d = '';
    for (let oc = 0; oc <= end + 1e-9; oc += .01) { const p = P(Math.min(oc, end)); d += (d ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }
    if (d) el('path', { d, fill: 'none', stroke: '#B2563A', 'stroke-width': 2, 'stroke-opacity': .6 });
    for (let j = 0; j <= k; j++) {
      if (j === 12 && !solved()) { el('text', { x: cx + 10, y: cy - R1 - 2, 'font-size': 20, 'font-weight': 800, fill: '#151515', 'font-family': 'ui-monospace, monospace' }, '?'); continue; }
      const [x, y] = P(j * LOG2F), last = j === 12;
      el('circle', { cx: x, cy: y, r: last ? 5.5 : 4, fill: last ? '#D9318F' : j ? '#B2563A' : '#151515' });
      if (j === 0 || j === k) el('text', { x: x + 8, y: y - 6, 'font-size': 11, 'font-weight': 700, fill: last ? '#D9318F' : '#151515', 'font-family': 'ui-monospace, monospace' }, NAMES[j]);
    }
  }
  function text() {
    bStep.textContent = L('Наступна квінта', 'Next fifth');
    bReset.textContent = L('Спочатку', 'Start over');
    bStep.disabled = k >= 12;
    svg.setAttribute('aria-label', L('Коло квінт', 'The circle of fifths'));
    if (!k) { msg.textContent = L('Спіраль висоти: один виток — октава. Ідіть квінтами від C.', 'A pitch spiral: one turn is an octave. Go up in fifths from C.'); return; }
    if (k < 12) { msg.textContent = L('Квінт: ', 'Fifths: ') + k + ' · ' + NAMES[k] + (k === 11 ? L('. Наступна — дванадцята.', '. The next one is the twelfth.') : ''); return; }
    msg.textContent = solved()
      ? L('Дванадцята квінта лягла на 1,36% вище за C: спіраль не замкнулася.', 'The twelfth fifth landed 1.36% above C: the spiral did not close.')
      : L('Де лягла дванадцята квінта: точно на C? Перевірте відповідь вище.', 'Where did the twelfth fifth land: exactly on C? Check the answer above.');
  }
  bStep.addEventListener('click', () => { if (k < 12) k++; draw(); text(); });
  bReset.addEventListener('click', () => { k = 0; draw(); text(); });
  document.addEventListener('langchange', () => { draw(); text(); });
  if (card) new MutationObserver(() => { draw(); text(); }).observe(card, { attributes: true, attributeFilter: ['class'] });
  draw(); text();
})();
