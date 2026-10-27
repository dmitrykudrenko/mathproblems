
(() => {
  const root = document.getElementById('tz-cognitive-reflection');
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const money = c => en() ? '$' + (c / 100).toFixed(2) : (c / 100).toFixed(2).replace('.', ',') + ' $';
  const msg = root.querySelector('.tz-msg'), btns = root.querySelectorAll('.tz-btn');
  const k = n => root.querySelector('[data-k="' + n + '"]'), v = n => root.querySelector('[data-v="' + n + '"]');
  let ball = null;
  function text() {
    k('ball').textContent = L("М'яч", 'Ball'); k('bat').textContent = L('Бита (на 1 $ дорожча)', 'Bat ($1 more)'); k('tot').textContent = L('Разом', 'Total');
    btns[0].textContent = L('М\'яч = 10 центів', 'Ball = 10 cents');
    btns[1].textContent = L('М\'яч = 5 центів', 'Ball = 5 cents');
    if (ball === null) {
      ['ball', 'bat', 'tot'].forEach(n => { v(n).textContent = '?'; v(n).style.color = ''; });
      msg.textContent = L('Скільки коштує м\'яч? Оберіть відповідь.', 'How much is the ball? Pick an answer.');
      return;
    }
    const tot = 2 * ball + 100;
    k('ball').textContent = L("М'яч", 'Ball'); k('bat').textContent = L('Бита (на 1 $ дорожча)', 'Bat ($1 more)'); k('tot').textContent = L('Разом', 'Total');
    v('ball').textContent = money(ball); v('bat').textContent = money(ball + 100); v('tot').textContent = money(tot);
    v('tot').style.color = tot === 110 ? 'var(--signal)' : '#CC2F2B';
    msg.textContent = ball === 10
      ? L('Швидка відповідь: 10 центів. Але тоді бита коштує 1,10 $, а разом 1,20 $.', 'The fast answer: 10 cents. But then the bat costs $1.10 and the total is $1.20.')
      : L('5 центів і 1,05 $: разом рівно 1,10 $, і бита дорожча рівно на долар.', '5 cents and $1.05: exactly $1.10 in total, and the bat costs exactly a dollar more.');
    btns[0].textContent = L('М\'яч = 10 центів', 'Ball = 10 cents');
    btns[1].textContent = L('М\'яч = 5 центів', 'Ball = 5 cents');
  }
  btns[0].addEventListener('click', () => { ball = 10; text(); });
  btns[1].addEventListener('click', () => { ball = 5; text(); });
  document.addEventListener('langchange', text);
  text();
})();
