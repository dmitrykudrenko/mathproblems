
(() => {
  const root = document.getElementById('tz-cognitive-reflection');
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const money = c => en() ? '$' + (c / 100).toFixed(2) : (c / 100).toFixed(2).replace('.', ',') + ' $';
  const msg = root.querySelector('.tz-msg'), btns = root.querySelectorAll('.tz-btn');
  const k = n => root.querySelector('[data-k="' + n + '"]'), v = n => root.querySelector('[data-v="' + n + '"]');
  // the price is found with a stepper, so no answer is printed on a button; finding it opens the card's answer
  const card = root.closest('[data-spoil][id]');
  const solved = () => !card || card.classList.contains('solved');
  const solve = () => { if (!solved()) { const r = card.querySelector('[data-solve]'); if (r) r.click(); } };
  let ball = null;
  function text() {
    k('ball').textContent = L("М'яч", 'Ball'); k('bat').textContent = L('Бита (на 1 $ дорожча)', 'Bat ($1 more)'); k('tot').textContent = L('Разом', 'Total');
    btns[0].textContent = L('−1 ¢', '−1¢');
    btns[1].textContent = L('+1 ¢', '+1¢');
    btns[0].disabled = ball === 0;
    if (ball === null) {
      ['ball', 'bat', 'tot'].forEach(n => { v(n).textContent = '?'; v(n).style.color = ''; });
      msg.textContent = L('Підберіть ціну м\'яча, щоб разом вийшло 1,10 $.', 'Find the ball price that makes the total $1.10.');
      return;
    }
    const tot = 2 * ball + 100;
    v('ball').textContent = money(ball); v('bat').textContent = money(ball + 100); v('tot').textContent = money(tot);
    v('tot').style.color = tot === 110 ? 'var(--signal)' : '#CC2F2B';
    msg.textContent = tot === 110
      ? L('5 центів і 1,05 $: разом рівно 1,10 $, і бита дорожча рівно на долар.', '5 cents and $1.05: exactly $1.10 in total, and the bat costs exactly a dollar more.')
      : ball === 10 && solved()
        ? L('Швидка відповідь: 10 центів. Але тоді бита коштує 1,10 $, а разом 1,20 $.', 'The fast answer: 10 cents. But then the bat costs $1.10 and the total is $1.20.')
        : tot > 110 ? L('Разом ' + money(tot) + ': забагато.', 'Total ' + money(tot) + ': too much.') : L('Разом ' + money(tot) + ': замало.', 'Total ' + money(tot) + ': too little.');
  }
  // the stepper starts from the intuitive 10 cents
  const step = d => { ball = Math.max(0, (ball === null ? 10 : ball) + d); if (2 * ball + 100 === 110) solve(); text(); };
  btns[0].addEventListener('click', () => step(-1));
  btns[1].addEventListener('click', () => step(1));
  document.addEventListener('langchange', text);
  if (card) new MutationObserver(() => { if (!solved() && ball !== null) ball = null; text(); }).observe(card, { attributes: true, attributeFilter: ['class'] });
  text();
})();
