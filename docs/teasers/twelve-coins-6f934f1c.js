
(() => {
  const root = document.getElementById('tz-twelve-coins');
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const svg = root.querySelector('svg'), [wrow, arow] = root.querySelectorAll('div[style]'), msg = root.querySelector('.tz-msg'), btn = root.querySelector('.tz-btn');
  // three coins, one fake (heavy or light), two weighings; the visitor names the coin and its direction
  const PAIRS = [[1, 2], [1, 3], [2, 3]];
  let fake = 1, heavy = true, log = [], pick = null, tries = 0, right = 0, last = [0, 0, 0];
  const out = (a, b) => { const d = heavy ? 1 : -1; return a === fake ? d : b === fake ? -d : 0; };
  const word = o => o > 0 ? L('ліва чаша вниз', 'left pan down') : o < 0 ? L('права чаша вниз', 'right pan down') : L('рівновага', 'balance');
  function draw() {
    const [a, b, o] = last, ang = o * 0.16, cx = 110, py = 26, B = 72;
    const lx = cx - B * Math.cos(ang), ly = py + B * Math.sin(ang), rx = cx + B * Math.cos(ang), ry = py - B * Math.sin(ang);
    const pan = (x, y, n) => '<path d="M' + (x - 26) + ' ' + (y + 46) + 'L' + x + ' ' + y + 'L' + (x + 26) + ' ' + (y + 46) + '" fill="none" stroke="#9A9A9A" stroke-width="1"/>' +
      '<path d="M' + (x - 30) + ' ' + (y + 46) + 'Q' + x + ' ' + (y + 62) + ' ' + (x + 30) + ' ' + (y + 46) + 'Z" fill="#E4E4E4" stroke="var(--ink)" stroke-width="1.6"/>' +
      (n ? '<circle cx="' + x + '" cy="' + (y + 36) + '" r="10" fill="#fff" stroke="var(--ink)" stroke-width="1.4"/><text x="' + x + '" y="' + (y + 40) + '" text-anchor="middle" font-size="11" font-weight="600" fill="var(--ink)" font-family="ui-monospace,Menlo,monospace">' + n + '</text>' : '');
    svg.innerHTML = '<path d="M110 26V102M86 104H134" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/>' +
      '<line x1="' + lx + '" y1="' + ly + '" x2="' + rx + '" y2="' + ry + '" stroke="var(--ink)" stroke-width="3.5" stroke-linecap="round"/><circle cx="110" cy="26" r="4" fill="var(--ink)"/>' +
      pan(lx, ly, a) + pan(rx, ry, b);
  }
  function text() {
    const over = pick !== null;
    wrow.innerHTML = PAIRS.map(([a, b], i) => '<button type="button" data-w="' + i + '" style="font:600 .82rem/1 ui-monospace,Menlo,monospace;padding:9px 12px;border-radius:999px;border:1.5px solid #D3D8E5;background:#fff;color:var(--ink);cursor:pointer"' + (log.length >= 2 || over ? ' disabled' : '') + '>' + a + ' : ' + b + '</button>').join('');
    arow.innerHTML = [1, 2, 3].flatMap(c => [true, false].map(h => {
      const truth = over && c === fake && h === heavy, mine = over && pick[0] === c && pick[1] === h;
      return '<button type="button" data-c="' + c + '" data-h="' + (h ? 1 : 0) + '" style="font:600 .8rem/1.2 system-ui,sans-serif;padding:7px 4px;border-radius:10px;cursor:' + (over ? 'default' : 'pointer') + ';border:1.5px solid ' + (truth ? 'var(--signal)' : mine ? 'var(--ink)' : '#D3D8E5') + ';background:' + (truth ? 'var(--signal)' : '#fff') + ';color:' + (truth ? '#fff' : 'var(--ink)') + '"' + (over ? ' disabled' : '') + '>' + c + (h ? L(' важча', ' heavy') : L(' легша', ' light')) + '</button>';
    })).join('');
    btn.textContent = L('Нові монети', 'New coins');
    if (over) msg.textContent = (pick[0] === fake && pick[1] === heavy ? L('Так! ', 'Yes! ') : L('Ні. ', 'No. ')) + L('Фальшива монета ' + fake + (heavy ? ', вона важча. ' : ', вона легша. '), 'The fake is coin ' + fake + (heavy ? ', and it is heavy. ' : ', and it is light. ')) + L('Влучань: ' + right + ' з ' + tries + '.', 'Hits: ' + right + ' of ' + tries + '.');
    else if (!log.length) msg.textContent = L('Розминка: 3 монети, одна фальшива, легша чи важча. У вас 2 зважування. Оберіть пару для терезів.', 'Warm-up: 3 coins, one fake, lighter or heavier. You have 2 weighings. Pick a pair for the balance.');
    else msg.textContent = log.map(([a, b, o], i) => (i + 1) + '. ' + a + ' : ' + b + ' → ' + word(o)).join('; ') + '. ' + (log.length < 2 ? L('Ще одне зважування або відповідь нижче.', 'One more weighing, or answer below.') : L('Яка монета фальшива?', 'Which coin is fake?'));
    draw();
  }
  wrow.addEventListener('click', e => { const b = e.target.closest('button'); if (!b || b.disabled) return; const [x, y] = PAIRS[+b.dataset.w], o = out(x, y); log.push([x, y, o]); last = [x, y, o]; text(); });
  arow.addEventListener('click', e => { const b = e.target.closest('button'); if (!b || b.disabled) return; pick = [+b.dataset.c, b.dataset.h === '1']; tries++; if (pick[0] === fake && pick[1] === heavy) right++; text(); });
  btn.addEventListener('click', () => { fake = 1 + Math.floor(Math.random() * 3); heavy = Math.random() < .5; log = []; pick = null; last = [0, 0, 0]; text(); });
  document.addEventListener('langchange', text);
  fake = 1 + Math.floor(Math.random() * 3); heavy = Math.random() < .5;
  text();
})();
