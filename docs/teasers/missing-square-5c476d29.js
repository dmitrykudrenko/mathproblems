
(() => {
  const root = document.getElementById('tz-missing-square');
  if (!root) return;
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const svg = root.querySelector('svg'), msg = root.querySelector('.tz-msg'), bs = [...root.querySelectorAll('.tz-btn')];
  // the ruler shows the bend, which is the answer, so it waits until the card is solved
  const card = root.closest('[data-spoil]'), solved = () => !!card && card.classList.contains('solved');
  const P = [
    { c: '#C8462B', p: [[0, 0], [8, 0], [8, 3]], f: [[0, 0], [5, 2]] },
    { c: '#2F6FD6', p: [[0, 0], [5, 0], [5, 2]], f: [[8, 3], [0, 0]] },
    { c: '#2E9A5A', p: [[0, 0], [5, 0], [5, 1], [2, 1], [2, 2], [0, 2]], f: [[8, 0], [5, 0]] },
    { c: '#E39A1E', p: [[2, 1], [5, 1], [5, 3], [0, 3], [0, 2], [2, 2]], f: [[8, 0], [8, -1]] }
  ];
  const S = 25, X = x => 17.5 + x * S, Y = y => 145 - y * S;
  let fig = 0, ruler = false;
  function draw() {
    let h = '';
    for (let x = 0; x <= 13; x++) h += '<line x1="' + X(x) + '" y1="' + Y(5.4) + '" x2="' + X(x) + '" y2="' + Y(0) + '" stroke="#D3D8E5"/>';
    for (let y = 0; y <= 5; y++) h += '<line x1="' + X(0) + '" y1="' + Y(y) + '" x2="' + X(13) + '" y2="' + Y(y) + '" stroke="#D3D8E5"/>';
    P.forEach(q => { const o = q.f[fig]; h += '<polygon points="' + q.p.map(v => X(v[0] + o[0]) + ',' + Y(v[1] + o[1])).join(' ') + '" fill="' + q.c + '" fill-opacity=".85" stroke="#141A30" stroke-width="1.2"/>'; });
    if (fig) h += '<rect x="' + (X(7) + 2) + '" y="' + (Y(2) + 2) + '" width="' + (S - 4) + '" height="' + (S - 4) + '" fill="none" stroke="#141A30" stroke-dasharray="3 3" stroke-width="1.5"/>';
    if (ruler && solved()) h += '<line x1="' + X(-.5) + '" y1="' + Y(-.5 * 5 / 13) + '" x2="' + X(13.5) + '" y2="' + Y(13.5 * 5 / 13) + '" stroke="#D9318F" stroke-width="1.5"/>';
    svg.innerHTML = h;
  }
  function text() {
    svg.setAttribute('aria-label', L('Чотири шматки', 'Four pieces'));
    bs[0].textContent = fig ? L('Назад', 'Back') : L('Переставити', 'Rearrange');
    bs[1].textContent = ruler ? L('Сховати лінійку', 'Hide the ruler') : L('Лінійка', 'Ruler');
    bs[1].hidden = !solved();
    msg.textContent = !fig ? L('Чотири шматки складають трикутник 13 × 5. Переставте їх.', 'Four pieces make a 13 × 5 triangle. Rearrange them.')
      : !solved() ? L('Той самий контур, а одна клітинка порожня. Звідки вона? Перевірте відповідь вище.', 'The same outline, and one square is empty. Where did it come from? Check the answer above.')
      : ruler ? L('Лінійка від кута до кута: в одній фігурі край прогинається під неї, в іншій вигинається над нею.', 'A ruler from corner to corner: in one figure the edge sags below it, in the other it bulges above it.')
      : L('Прикладіть лінійку до «гіпотенузи».', 'Hold a ruler against the "hypotenuse".');
  }
  bs.forEach(b => b.addEventListener('click', () => { if (b.dataset.k === 'swap') fig = 1 - fig; else ruler = !ruler; draw(); text(); }));
  document.addEventListener('langchange', () => { draw(); text(); });
  if (card) new MutationObserver(() => { if (!solved()) ruler = false; draw(); text(); }).observe(card, { attributes: true, attributeFilter: ['class'] });
  draw(); text();
})();
