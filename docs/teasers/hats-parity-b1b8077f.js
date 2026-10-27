
(() => {
  const root = document.getElementById('tz-hats-parity');
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const row = root.querySelector('div[style]'), msg = root.querySelector('.tz-msg'), btn = root.querySelector('.tz-btn');
  const N = 6, INK = '#151515';
  // hats: 0 white, 1 black; index 0 stands at the back and speaks first
  let h = [0, 0, 0, 0, 0, 0], w = null, plays = 0, fewest = N, touched = false;
  // the line's strategy: person 1 names the parity of the black hats they see, the rest work out their own hat from it
  function speak() {
    const out = [];
    let seen0 = 0; for (let i = 1; i < N; i++) seen0 ^= h[i];
    out[0] = seen0;
    for (let i = 1; i < N; i++) { let x = out[0]; for (let j = 1; j < i; j++) x ^= out[j]; for (let j = i + 1; j < N; j++) x ^= h[j]; out[i] = x; }
    return out;
  }
  function person(hat, said, right) {
    const f = hat ? INK : '#fff';
    return '<svg viewBox="0 0 30 44" width="34" height="50" aria-hidden="true"><path d="M4 44v-6a11 9 0 0 1 22 0v6z" fill="#C7CAD3"/>' +
      '<circle cx="15" cy="23" r="7.2" fill="#F1E4D6" stroke="' + INK + '" stroke-width="1.1"/><path d="M21.6 22.4l2.6 1.6-2.4.7" fill="none" stroke="' + INK + '" stroke-width="1.1"/><circle cx="18.6" cy="21.6" r="1" fill="' + INK + '"/>' +
      '<rect x="9" y="4" width="12" height="11" rx="1.6" fill="' + f + '" stroke="' + INK + '" stroke-width="1.2"/><rect x="5" y="14" width="20" height="3.2" rx="1.6" fill="' + f + '" stroke="' + INK + '" stroke-width="1.2"/></svg>' +
      '<span style="display:block;width:18px;height:10px;border-radius:3px;margin:2px auto 0;' + (said === null ? 'border:1px dashed #C9C9C9' : 'border:1px solid ' + INK + ';background:' + (said ? INK : '#fff')) + '"></span>' +
      '<span style="display:block;text-align:center;font:700 .8rem/1.3 ui-monospace,Menlo,monospace;color:' + (right === null ? 'transparent' : right ? '#13823B' : '#CC2F2B') + '">' + (right === null ? '·' : right ? '✓' : '✕') + '</span>';
  }
  function draw() {
    row.innerHTML = '';
    h.forEach((v, i) => {
      const b = document.createElement('button'); b.type = 'button';
      b.style.cssText = 'border:0;background:none;padding:0;cursor:pointer;display:grid;justify-items:center';
      b.setAttribute('aria-label', L('Людина ' + (i + 1) + ', капелюх ' + (v ? 'чорний' : 'білий'), 'Person ' + (i + 1) + ', ' + (v ? 'black' : 'white') + ' hat'));
      b.innerHTML = person(v, w ? w[i] : null, w ? w[i] === v : null);
      b.addEventListener('click', () => { h[i] = 1 - h[i]; w = null; touched = true; text(); });
      row.appendChild(b);
    });
  }
  function text() {
    draw();
    btn.textContent = L('Хай говорять', 'Let them speak');
    if (!w) msg.textContent = touched
      ? L('Капелюхи змінено. Натисніть кнопку, і шестеро по черзі, ззаду наперед, назвуть свій колір.', 'Hats changed. Press the button, and the six will name their colours in turn, from the back to the front.')
      : L('Ви капелюшник. Клацайте капелюхи, щоб змінити колір, а потім дайте людям сказати. Ліворуч стоїть задній: він бачить усіх інших. Спробуйте зробити так, щоб помилилося якнайбільше людей.', 'You are the hat-maker. Click hats to change their colour, then let the people speak. The back person stands on the left and sees everyone else. Try to make as many people as possible wrong.');
    else {
      const r = h.filter((v, i) => v === w[i]).length;
      msg.textContent = L('Вгадали ' + r + ' з ' + N + '. ', r + ' of ' + N + ' got it right. ') +
        (w[0] === h[0] ? L('Навіть задній вгадав, але йому просто пощастило. ', 'Even the back person was right, but that was pure luck. ') : L('Помилився лише задній. ', 'Only the back person was wrong. ')) +
        L('Найменше за ' + plays + ' ' + (plays % 10 === 1 && plays % 100 !== 11 ? 'спробу' : plays % 10 >= 2 && plays % 10 <= 4 && (plays % 100 < 12 || plays % 100 > 14) ? 'спроби' : 'спроб') + ': ' + fewest + '. Підказка: слово заднього стосується не його самого.', 'Fewest in ' + plays + ' ' + (plays === 1 ? 'try' : 'tries') + ': ' + fewest + '. A hint: the back person\'s word is not about themselves.');
    }
  }
  btn.addEventListener('click', () => {
    w = speak(); plays++;
    fewest = Math.min(fewest, h.filter((v, i) => v === w[i]).length);
    text();
  });
  document.addEventListener('langchange', text);
  text();
})();
