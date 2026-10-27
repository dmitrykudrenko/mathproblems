
(() => {
  const root = document.getElementById('tz-blue-eyed-islanders');
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const row = root.querySelector('div[style]'), msg = root.querySelector('.tz-msg'), btn = root.querySelector('.tz-btn');
  const N = 6;
  let blue = [], k = 0, night = -1, gone = false;
  const ord = n => ['1-шу', '2-гу', '3-тю', '4-ту'][n - 1];
  function deal() {
    k = 1 + Math.floor(Math.random() * 4);
    const idx = [0, 1, 2, 3, 4, 5].sort(() => Math.random() - .5).slice(0, k);
    blue = Array.from({ length: N }, (_, i) => idx.includes(i));
    night = -1; gone = false;
  }
  function face(b, away) {
    const eye = b ? '#2E86DE' : '#7A4B22';
    return '<svg viewBox="-22 -22 44 56" width="44" height="56" style="opacity:' + (away ? .18 : 1) + '"><path d="M-17 34a17 13 0 0 1 34 0z" fill="var(--ink)"/><circle r="15" fill="#E9CDB0" stroke="var(--ink)" stroke-width="1.4"/>' +
      [-1, 1].map(d => '<circle cx="' + d * 5.7 + '" cy="-1" r="4" fill="#fff"/><circle cx="' + d * 5.7 + '" cy="-.6" r="2.8" fill="' + eye + '"/>').join('') + '</svg>';
  }
  function text() {
    row.innerHTML = blue.map(b => face(b, gone && b)).join('');
    if (night < 0) {
      btn.textContent = L('Гість говорить', 'The visitor speaks');
      msg.textContent = L('Острів на 6 людей. Хтось має блакитні очі, хтось карі; кожен бачить усіх, крім себе. Натисніть кнопку, і гість скаже свою фразу.', 'An island of 6. Some have blue eyes, some brown; everyone sees everyone but themselves. Press the button and the visitor says his sentence.');
    } else if (night === 0) {
      btn.textContent = L('Наступна ніч', 'Next night');
      msg.textContent = L('«Я бачу когось із блакитними очима». Блакитнооких тут ' + k + '. Хто і коли поїде?', '"I can see someone with blue eyes." There are ' + k + ' blue-eyed here. Who leaves, and when?');
    } else if (!gone) {
      btn.textContent = L('Наступна ніч', 'Next night');
      msg.textContent = L('Ніч ' + night + ': ніхто не поїхав. Але й це щось повідомляє.', 'Night ' + night + ': nobody left. Yet even that tells them something.');
    } else {
      btn.textContent = L('Інший острів', 'Another island');
      msg.textContent = L('Ніч ' + night + ': ' + (k === 1 ? 'єдиний блакитноокий поїхав' : 'усі ' + k + ' блакитноокі поїхали разом') + '. ' + (k === 1 ? 'Він не бачив блакитних очей, тож гість говорив про нього.' : 'Кожен бачив ' + (k - 1) + ' і чекав, чи поїдуть вони на ' + ord(k - 1) + ' ніч. Не поїхали, отже, блакитноокий і він.') + ' Кароокі лишились.',
        'Night ' + night + ': ' + (k === 1 ? 'the only blue-eyed person left' : 'all ' + k + ' blue-eyed left together') + '. ' + (k === 1 ? 'He saw no blue eyes, so the visitor meant him.' : 'Each saw ' + (k - 1) + ' and waited to see if they would leave on night ' + (k - 1) + '. They did not, so he is blue-eyed too.') + ' The brown-eyed stayed.');
    }
  }
  btn.addEventListener('click', () => {
    if (gone) { deal(); night = 0; text(); return; }
    night++;
    if (night === k) gone = true;
    text();
  });
  document.addEventListener('langchange', text);
  deal(); text();
})();
