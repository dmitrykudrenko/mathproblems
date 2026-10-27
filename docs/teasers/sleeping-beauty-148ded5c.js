
(() => {
  const root = document.getElementById('tz-sleeping-beauty');
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const box = root.querySelector('div'), msg = root.querySelector('.tz-msg'), btns = root.querySelectorAll('.tz-btn');
  // one experiment: heads → 1 awakening, tails → 2; you bet at each awakening
  let heads, n, i, picks, done, A = 0, ok = 0, okT = 0;
  function start() { heads = Math.random() < 0.5; n = heads ? 1 : 2; i = 0; picks = []; done = false; draw(); text(); }
  function cell(label, st, on, col) {
    return '<div style="flex:1 1 0;min-width:0;border-radius:10px;padding:8px;text-align:center;font-weight:700;font-size:.85rem;background:' + (on ? '#fff' : 'transparent') + ';border:1.5px ' + (on ? 'solid' : 'dashed') + ' ' + (col || (on ? 'var(--ink)' : 'var(--line, #ccc)')) + '">' + label + '<div style="font-size:.72rem;font-weight:600;color:' + (col || 'var(--muted)') + '">' + st + '</div></div>';
  }
  function draw() {
    const HT = h => h ? L('О', 'H') : L('Р', 'T');
    const coin = '<div style="flex:0 0 44px;height:44px;border-radius:50%;display:grid;place-items:center;font-weight:800;border:2px ' + (done ? 'solid' : 'dashed') + ' var(--ink);' + (done && heads ? 'background:var(--ink);color:#fff' : 'background:#fff') + '">' + (done ? HT(heads) : '?') + '</div>';
    let days;
    if (!done) days = cell(L('Сьогодні?', 'Today?'), L('прокинулась', 'awake'), true) + cell('?', '', false);
    else days = [0, 1].map(d => d >= n ? cell(L('Вт', 'Tue'), 'zz', false)
      : cell(d ? L('Вт', 'Tue') : L('Пн', 'Mon'), L('ставка ', 'bet ') + HT(picks[d]), true, picks[d] === heads ? '#157F51' : '#BF3E28')).join('');
    box.innerHTML = coin + days;
  }
  function play(h) {
    if (done) { start(); return; }
    picks.push(h); i++; A++; if (h === heads) ok++; if (!heads) okT++;
    if (i >= n) done = true;
    draw(); text();
  }
  function text() {
    let head;
    if (!done) head = i ? L('Ви знову прокинулися і нічого не пам\'ятаєте. На що ставите?', 'You wake again and remember nothing. What do you bet on?')
      : L('Ви прокинулися. Монета впала орлом чи решкою?', 'You wake up. Did the coin land heads or tails?');
    else head = (heads ? L('Орел: вас будили один раз. ', 'Heads: you were woken once. ') : L('Решка: вас будили двічі. ', 'Tails: you were woken twice. '));
    msg.textContent = head + (A && done ? L('Пробуджень: ' + A + ', ви вгадали ' + ok + ', «завжди решка» вгадала б ' + okT + '.', 'Awakenings: ' + A + ', you were right ' + ok + ' times, "always tails" would have been right ' + okT + '.') : '');
    btns[0].textContent = done ? L('Новий експеримент', 'New experiment') : L('Орел', 'Heads');
    btns[1].textContent = done ? L('Новий експеримент', 'New experiment') : L('Решка', 'Tails');
  }
  btns[0].addEventListener('click', () => play(true));
  btns[1].addEventListener('click', () => play(false));
  document.addEventListener('langchange', () => { draw(); text(); });
  start();
})();
