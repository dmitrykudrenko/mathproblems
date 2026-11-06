
(() => {
  const root = document.getElementById('tz-ergodicity');
  if (!root) return;
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const svg = root.querySelector('svg'), msg = root.querySelector('.tz-msg'), bs = [...root.querySelectorAll('.tz-btn')];
  const card = root.closest('[data-spoil]'), solved = () => !!card && card.classList.contains('solved');
  const money = v => v < 0.005 ? L('менше 1¢', 'under 1¢') : v < 10 ? '$' + (en() ? v.toFixed(2) : v.toFixed(2).replace('.', ',')) : '$' + Math.round(v).toLocaleString(en() ? 'en-US' : 'uk-UA');
  // one player's money on a log scale, from $0.01 to $100,000; nothing is drawn until the first toss
  const T = 100;
  let path = [100];
  const y = v => 130 - (Math.log10(Math.max(v, 1e-3)) + 2) / 7 * 116;
  function draw() {
    let h = '<line x1="20" x2="344" y1="' + y(100) + '" y2="' + y(100) + '" stroke="#9AA0B0" stroke-dasharray="4 4"/>' +
      '<text x="22" y="' + (y(100) - 5) + '" font-size="10" fill="#586079" font-family="ui-monospace, monospace">$100</text>';
    if (path.length > 1) {
      const pts = path.map((v, t) => (20 + t / T * 324).toFixed(1) + ',' + Math.max(8, Math.min(140, y(v))).toFixed(1)).join(' ');
      h += '<polyline points="' + pts + '" fill="none" stroke="#2A3DD1" stroke-width="2.5" stroke-linejoin="round"/>';
    }
    svg.innerHTML = h;
  }
  function text() {
    svg.setAttribute('aria-label', L('Ваші гроші раунд за раундом', 'Your money round by round'));
    const t = path.length - 1, done = t >= T;
    bs[0].textContent = done ? L('Ще раз', 'Again') : L('Підкинути', 'Toss');
    bs[1].textContent = L('10 раундів', '10 rounds'); bs[1].hidden = done;
    if (!t) { msg.textContent = L('У вас $100. Орел +50%, решка −40%. Підкидайте.', 'You have $100. Heads +50%, tails −40%. Start tossing.'); return; }
    msg.textContent = L('Раунд ' + t + ' зі 100: у вас ' + money(path[t]) + '.', 'Round ' + t + ' of 100: you have ' + money(path[t]) + '.') +
      (done ? (solved() ? L(' Більше за $100 після 100 раундів мають лише 13,6% гравців.', ' Only 13.6% of players have more than $100 after 100 rounds.') : L(' Скільки гравців розбагатіє, дивіться у відповіді вище.', ' How many players get richer: see the answer above.')) : '');
  }
  bs.forEach(b => b.addEventListener('click', () => {
    if (path.length > T) { path = [100]; draw(); text(); return; }
    for (let i = 0; i < +b.dataset.k && path.length <= T; i++) path.push(path[path.length - 1] * (Math.random() < 0.5 ? 1.5 : 0.6));
    draw(); text();
  }));
  document.addEventListener('langchange', () => { draw(); text(); });
  if (card) new MutationObserver(text).observe(card, { attributes: true, attributeFilter: ['class'] });
  draw(); text();
})();
