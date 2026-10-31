
(() => {
  const root = document.getElementById('tz-two-children');
  const L = (uk, e) => document.documentElement.dataset.lang === 'en' ? e : uk;
  // the card is [data-spoil]; the theoretical answer stays hidden until it is solved
  const card = root.closest('[data-spoil]');
  const solved = () => card ? card.classList.contains('solved') : !!(window.mpSolved && mpSolved());
  const deck = root.querySelector('.tc-deck'), msg = root.querySelector('.tz-msg');
  const bNew = root.querySelector('[data-a="new"]'), bMode = root.querySelector('[data-a="mode"]');
  const WD = { uk: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'], en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] };
  const kid = () => ({ b: Math.random() < 0.5, d: Math.floor(Math.random() * 7) });
  const MODES = [
    { test: f => f[0].b || f[1].b, exact: '1/3' },
    { test: f => f.some(c => c.b && c.d === 1), exact: '13/27' }
  ];
  let fams = [], mode = 0, tot = [[0, 0], [0, 0]], started = false;
  const pc = x => Math.round(100 * x) + '%';
  function roll() {
    started = true;
    fams = Array.from({ length: 30 }, () => [kid(), kid()]);
    fams.forEach(f => MODES.forEach((m, i) => { if (m.test(f)) { tot[i][0]++; if (f[0].b && f[1].b) tot[i][1]++; } }));
    draw();
  }
  function draw() {
    const lang = document.documentElement.dataset.lang === 'en' ? 'en' : 'uk', M = MODES[mode];
    let kept = 0, bb = 0;
    bNew.textContent = L('30 нових сімей', '30 new families');
    bMode.textContent = mode ? L('Без вівторка', 'Drop Tuesday') : L('Хлопчик у вівторок', 'Tuesday boy');
    if (!started) {
      deck.innerHTML = fams.map(f => '<div style="display:flex;gap:2px;justify-content:center;padding:4px 2px;border-radius:8px;background:#fff;border:1.5px solid var(--line)">' + f.map(c => '<i style="width:20px;height:20px;display:grid;place-items:center;font-style:normal;font-size:.5rem;font-weight:700;line-height:1;' +
        (c.b ? 'background:var(--ink);color:#fff;border-radius:5px;' : 'background:#fff;color:var(--ink);border:1.5px solid var(--ink);border-radius:50%;') + '">' + WD[lang][c.d] + '</i>').join('') + '</div>').join('');
      msg.textContent = mode ? L('Натисніть «30 нових сімей»: залишимо лише сім\'ї, де є хлопчик, народжений у вівторок, і порахуємо, у скількох із них двоє хлопчиків.', 'Press "30 new families": we keep only families with a boy born on a Tuesday and count how many of them have two boys.')
        : L('Натисніть «30 нових сімей»: залишимо лише сім\'ї, де є хоча б один хлопчик, і порахуємо, у скількох із них двоє хлопчиків.', 'Press "30 new families": we keep only families with at least one boy and count how many of them have two boys.');
      return;
    }
    deck.innerHTML = fams.map(f => {
      const k = M.test(f), two = f[0].b && f[1].b;
      if (k) { kept++; if (two) bb++; }
      const box = 'display:flex;gap:2px;justify-content:center;padding:4px 2px;border-radius:8px;transition:opacity .25s;background:' + (k && two ? 'var(--signal-soft)' : '#fff') + ';border:1.5px solid ' + (k && two ? 'var(--signal)' : 'var(--line)') + ';opacity:' + (k ? 1 : .15);
      return '<div style="' + box + '">' + f.map(c => '<i style="width:20px;height:20px;display:grid;place-items:center;font-style:normal;font-size:.5rem;font-weight:700;line-height:1;' +
        (c.b ? 'background:var(--ink);color:#fff;border-radius:5px;' : 'background:#fff;color:var(--ink);border:1.5px solid var(--ink);border-radius:50%;') +
        (mode === 1 && c.b && c.d === 1 ? 'box-shadow:0 0 0 2px var(--signal);' : '') + '">' + WD[lang][c.d] + '</i>').join('') + '</div>';
    }).join('');
    const t = tot[mode];
    msg.textContent = (mode ? L('Хоча б один хлопчик у вівторок: ', 'At least one Tuesday boy: ') : L('Хоча б один хлопчик: ', 'At least one boy: ')) +
      L('лишилось ' + kept + ', з них двоє хлопчиків у ' + bb + '. За всі спроби ' + (t[0] ? pc(t[1] / t[0]) : '–') + '. ',
        kept + ' kept, ' + bb + ' with two boys. All rolls so far ' + (t[0] ? pc(t[1] / t[0]) : '–') + '. ') +
      (solved() ? L('Теорія ' + M.exact + '.', 'Theory ' + M.exact + '.') : L('Як гадаєте, яка частка буде на довгій дистанції?', 'What share do you expect in the long run?'));
  }
  bNew.addEventListener('click', roll);
  bMode.addEventListener('click', () => { mode = 1 - mode; draw(); });
  document.addEventListener('langchange', draw);
  if (card) new MutationObserver(draw).observe(card, { attributes: true, attributeFilter: ['class'] });
  fams = Array.from({ length: 30 }, () => [kid(), kid()]);
  draw();
})();
