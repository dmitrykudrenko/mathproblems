
(() => {
  const root = document.getElementById('tz-axelrod-tournament');
  if (!root) return;
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const box = root.querySelector('div[style]'), msg = root.querySelector('.tz-msg'), btns = root.querySelectorAll('.tz-btn');
  // six rounds against a hidden bot; each bot is a tiny rule: chance to cooperate given the visitor's last move and whether they ever defected
  const BOTS = {
    allc: [() => 1, 'Добряк: співпрацює завжди', 'Dove: always cooperates'],
    alld: [() => 0, 'Зрадник: зраджує завжди', 'Defector: always defects'],
    tft: [(last) => last === null ? 1 : last, '«Око за око»: повторює ваш попередній хід', 'Tit for Tat: repeats your last move'],
    grim: [(last, ever) => ever ? 0 : 1, 'Злопам\'ятний: після вашої першої зради зраджує до кінця', 'Grudger: after your first defection, defects to the end'],
    rand: [() => .5, 'Монетка: щоразу навмання', 'Random: a coin toss every time']
  };
  const KEYS = Object.keys(BOTS), N = 6;
  const pay = (a, b) => a ? (b ? 3 : 0) : (b ? 5 : 1);
  let bot, h, ever;
  function reset() { bot = KEYS[Math.floor(Math.random() * KEYS.length)]; h = []; ever = false; }
  function draw() {
    const c = 36;
    let s = '<svg viewBox="0 0 300 96" width="100%" aria-hidden="true" style="display:block">';
    [L('Ви', 'You'), L('Бот', 'Bot')].forEach((t, p) => {
      s += '<text x="0" y="' + (26 + p * 40) + '" font-family="ui-monospace,Menlo,monospace" font-size="12" font-weight="600" fill="var(--ink)">' + t + '</text>';
      for (let r = 0; r < N; r++) {
        const x = 46 + r * (c + 4), y = 6 + p * 40, mv = r < h.length ? h[r][p] : null;
        s += '<rect x="' + x + '" y="' + y + '" width="' + c + '" height="' + c + '" rx="7" fill="' + (mv === null ? '#fff' : mv ? '#CFE8DA' : '#F4D2CB') + '" stroke="' + (mv === null ? '#C9C9C9' : 'none') + '" stroke-dasharray="4 4"/>';
        if (mv !== null) s += '<text x="' + (x + c / 2) + '" y="' + (y + 23) + '" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-size="14" font-weight="700" fill="var(--ink)">' + (mv ? L('С', 'C') : L('З', 'D')) + '</text>';
      }
    });
    box.innerHTML = s + '</svg>';
  }
  function text() {
    draw();
    const done = h.length >= N, me = h.reduce((s, [a, b]) => s + pay(a, b), 0), it = h.reduce((s, [a, b]) => s + pay(b, a), 0);
    btns[0].textContent = done ? L('Ще раз', 'Again') : L('Співпрацювати', 'Cooperate');
    btns[1].textContent = L('Зрадити', 'Defect');
    btns[1].style.display = done ? 'none' : '';
    if (!h.length) msg.textContent = L('Шість раундів проти бота з таємною стратегією. Ваш хід?', 'Six rounds against a bot with a secret strategy. Your move?');
    else if (!done) msg.textContent = L('Ви ' + me + ' : ' + it + ' бот. Раунд ' + (h.length + 1) + ' з ' + N + '.', 'You ' + me + ' : ' + it + ' bot. Round ' + (h.length + 1) + ' of ' + N + '.');
    else msg.textContent = L('Ви ' + me + ' : ' + it + ' бот. Стратегія бота — ' + BOTS[bot][1] + '. А хто збере найбільше в турнірі?', 'You ' + me + ' : ' + it + ' bot. The bot\'s strategy: ' + BOTS[bot][2] + '. So who collects the most in a tournament?');
  }
  function move(m) {
    const last = h.length ? h[h.length - 1][0] : null, b = Math.random() < BOTS[bot][0](last, ever) ? 1 : 0;
    h.push([m, b]); if (!m) ever = true;
    text();
  }
  btns[0].addEventListener('click', () => { if (h.length >= N) reset(); else move(1); text(); });
  btns[1].addEventListener('click', () => { if (h.length < N) move(0); });
  document.addEventListener('langchange', text);
  reset(); text();
})();
