
(() => {
  const root = document.getElementById('tz-intransitive-dice');
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const pick = root.querySelector('div[style]'), msg = root.querySelector('.tz-msg'), btn = root.querySelector('.tz-btn');
  const DICE = { A: [4, 4, 4, 4, 0, 0], B: [3, 3, 3, 3, 3, 3], C: [6, 6, 2, 2, 2, 2], D: [5, 5, 5, 1, 1, 1] };
  const COL = { A: '#2F5BD3', B: '#B07A00', C: '#168050', D: '#C9472A' };
  const NAMES = ['A', 'B', 'C', 'D'];
  // the computer's reply: the die that beats yours most often, counted over all 36 face pairs
  const wins = (x, y) => DICE[x].reduce((s, a) => s + DICE[y].filter(b => a > b).length, 0);
  const reply = x => NAMES.filter(y => y !== x).reduce((a, b) => wins(b, x) > wins(a, x) ? b : a);
  let me = null, cp = null, w = 0, l = 0, n = 0;
  const kidky = k => { const a = k % 10, b = k % 100; return a === 1 && b !== 11 ? 'кидок' : a >= 2 && a <= 4 && (b < 12 || b > 14) ? 'кидки' : 'кидків'; };
  function buttons() {
    pick.innerHTML = '';
    NAMES.forEach(k => {
      const b = document.createElement('button'); b.type = 'button';
      const on = k === me, c = k === cp;
      b.innerHTML = '<b style="font:800 1rem/1 system-ui">' + k + '</b><br><span style="font:600 .66rem/1.4 ui-monospace,Menlo,monospace;letter-spacing:.04em">' + DICE[k].join(' ') + '</span>';
      b.style.cssText = 'padding:8px 2px;border-radius:10px;cursor:pointer;border:1.5px ' + (c ? 'dashed ' : 'solid ') + (on || c ? COL[k] : '#D3D8E5') + ';background:' + (on ? COL[k] : '#fff') + ';color:' + (on ? '#fff' : COL[k]);
      b.addEventListener('click', () => play(k));
      pick.appendChild(b);
    });
  }
  function text() {
    buttons();
    btn.hidden = !me;
    btn.textContent = L('Ще 20 кидків', '20 more rolls');
    if (!me) { msg.textContent = L('Оберіть кубик. Комп\'ютер візьме свій після вас, і ви кинете 20 разів.', 'Pick a die. The computer takes its own after you, and you roll 20 times.'); return; }
    msg.textContent = L('Ви: ' + me + ' · комп\'ютер: ' + cp + '. Ви виграли ' + w + ' з ' + n + ' ' + kidky(n) + ', комп\'ютер ' + l + '. Спробуйте інший кубик.',
      'You: ' + me + ' · computer: ' + cp + '. You won ' + w + ' of ' + n + ' rolls, the computer ' + l + '. Try another die.');
  }
  function roll(times) {
    for (let i = 0; i < times; i++) {
      const a = DICE[me][Math.floor(Math.random() * 6)], b = DICE[cp][Math.floor(Math.random() * 6)];
      n++; if (a > b) w++; else l++;
    }
    text();
  }
  function play(k) {
    if (k !== me) { me = k; cp = reply(k); w = l = n = 0; }
    roll(20);
  }
  btn.addEventListener('click', () => roll(20));
  document.addEventListener('langchange', text);
  text();
})();
