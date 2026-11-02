
(() => {
  const root = document.getElementById('tz-newcomb-paradox');
  if (!root) return;
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const svg = root.querySelector('svg'), msg = root.querySelector('.tz-msg'), bs = [...root.querySelectorAll('.tz-btn')];
  // how other people choose is part of the answer, so the poll split waits until the card is solved
  const card = root.closest('[data-spoil]'), solved = () => !!card && card.classList.contains('solved');
  const money = n => '$' + n.toLocaleString(en() ? 'en-US' : 'uk-UA');
  // a 99% predictor: its guess is drawn before the click, B stays sealed until you choose
  let pred = null, pick = null;
  const seal = c => (Math.random() < 0.99 ? c : (c === 'one' ? 'two' : 'one'));
  function draw() {
    const open = pick !== null, full = pred === 'one';
    const ring = k => open && (k === 'B' || pick === 'two') ? ' stroke="#DB9500" stroke-width="3"' : ' stroke="#9AA0B0" stroke-width="1.5"';
    let b = open
      ? '<rect x="198" y="34" width="120" height="78" rx="8" fill="#FFFFFF"' + ring('B') + '/>' +
        (full ? '<rect x="218" y="56" width="80" height="30" rx="4" fill="#157F51" opacity=".85"/><text x="258" y="76" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">' + money(1000000) + '</text>'
              : '<text x="258" y="78" text-anchor="middle" font-size="13" fill="#586079">' + L('порожньо', 'empty') + '</text>')
      : '<rect x="198" y="34" width="120" height="78" rx="8" fill="#2A3DD1"/><text x="258" y="86" text-anchor="middle" font-size="40" font-weight="800" fill="#F2F4FF">?</text>';
    svg.innerHTML =
      '<rect x="42" y="34" width="120" height="78" rx="8" fill="#E3ECF7" fill-opacity=".6"' + ring('A') + '/>' +
      '<rect x="62" y="56" width="80" height="30" rx="4" fill="#157F51" opacity=".85"/><text x="102" y="76" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">' + money(1000) + '</text>' + b +
      '<text x="102" y="24" text-anchor="middle" font-size="12" font-weight="700" fill="#586079" font-family="ui-monospace, monospace">A</text>' +
      '<text x="258" y="24" text-anchor="middle" font-size="12" font-weight="700" fill="#586079" font-family="ui-monospace, monospace">B</text>' +
      '<text x="180" y="128" text-anchor="middle" font-size="10" fill="#586079" font-family="ui-monospace, monospace">' + (open ? L('прогноз: ', 'forecast: ') + (pred === 'one' ? L('лише B', 'only B') : L('обидві', 'both')) : L('прогноз запечатано', 'forecast sealed')) + '</text>';
  }
  function text() {
    svg.setAttribute('aria-label', L('Дві скриньки', 'Two boxes'));
    bs[0].textContent = pick === null ? L('Лише B', 'Only B') : L('Ще раз', 'Again');
    bs[1].textContent = L('Обидві', 'Both'); bs[1].hidden = pick !== null;
    if (pick === null) { msg.textContent = L('Провидець уже вирішив, що лежить у B. Оберіть скриньки.', 'The predictor has already decided what is in B. Pick your boxes.'); return; }
    const win = (pred === 'one' ? 1000000 : 0) + (pick === 'two' ? 1000 : 0);
    msg.textContent = L('Ви взяли ' + (pick === 'one' ? 'лише B' : 'обидві') + ' і отримали ' + money(win) + '. ', 'You took ' + (pick === 'one' ? 'only B' : 'both') + ' and got ' + money(win) + '. ') +
      (solved() ? L('У великому опитуванні The Guardian 53,5% узяли лише B, а 46,5% обидві.', 'In a big Guardian poll 53.5% took only B and 46.5% took both.') : L('Як обирають інші, дивіться у відповіді вище.', 'How others choose: see the answer above.'));
  }
  // the guess is fixed before the click: it is drawn for both possible picks and the matching one is used
  let sealed = null;
  const fresh = () => { pick = null; sealed = { one: seal('one'), two: seal('two') }; pred = null; };
  bs.forEach(b => b.addEventListener('click', () => {
    if (pick !== null) { fresh(); draw(); text(); return; }
    pick = b.dataset.k; pred = sealed[pick]; draw(); text();
  }));
  document.addEventListener('langchange', () => { draw(); text(); });
  if (card) new MutationObserver(text).observe(card, { attributes: true, attributeFilter: ['class'] });
  fresh(); draw(); text();
})();
