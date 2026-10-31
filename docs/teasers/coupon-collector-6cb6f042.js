
(() => {
  const root = document.getElementById('tz-coupon-collector');
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  // the average is the answer, so it shows only once the card is solved
  const card = root.closest('[data-spoil]'), solved = () => !!card && card.classList.contains('solved');
  const grid = root.querySelector('div[aria-hidden]'), msg = root.querySelector('.tz-msg'), btns = root.querySelectorAll('.tz-btn');
  const N = 50, cells = [];
  for (let i = 0; i < N; i++) { const c = document.createElement('i'); c.style.cssText = 'aspect-ratio:1;border-radius:4px;background:#ECECEC'; grid.appendChild(c); cells.push(c); }
  let cnt, bought, have;
  function reset() { cnt = new Uint16Array(N); bought = 0; have = 0; cells.forEach(c => c.style.background = '#ECECEC'); }
  function pack() {
    cells.forEach((c, i) => { if (cnt[i]) c.style.background = 'var(--ink)'; });
    for (let k = 0; k < 5 && have < N; k++) {
      const d = Math.floor(Math.random() * N); bought++;
      if (!cnt[d]++) { have++; cells[d].style.background = 'var(--signal)'; }
    }
  }
  function text() {
    const dup = bought - have;
    msg.textContent = !bought
      ? L('Альбом на 50 місць порожній. Відкривайте пакетики по 5 наліпок і рахуйте, скільки знадобиться.', 'The 50-slot album is empty. Open packs of 5 stickers and count how many it takes.')
      : have === N
      ? L('Альбом повний! Наліпок куплено: ' + bought + ', дублікатів: ' + dup + '.', 'Album full! Stickers bought: ' + bought + ', duplicates: ' + dup + '.') +
        (solved() ? L(' У середньому потрібно 225.', ' The average is 225.') : L(' Чи це типово? Перевірте відповідь вище.', ' Is that typical? Check the answer above.'))
      : L('Куплено: ' + bought + '. Бракує: ' + (N - have) + '. Дублікатів: ' + dup + '.', 'Bought: ' + bought + '. Missing: ' + (N - have) + '. Duplicates: ' + dup + '.');
    btns[0].textContent = have === N ? L('Новий альбом', 'New album') : L('Відкрити пакетик (5)', 'Open a pack (5)');
    btns[1].textContent = L('До кінця', 'Fill it up');
    btns[1].disabled = have === N;
  }
  btns[0].addEventListener('click', () => { if (have === N) reset(); pack(); text(); });
  btns[1].addEventListener('click', () => { while (have < N) pack(); text(); });
  document.addEventListener('langchange', text);
  if (card) new MutationObserver(text).observe(card, { attributes: true, attributeFilter: ['class'] });
  reset(); text();
})();
