
(() => {
  const root = document.getElementById('tz-bingo-paradox');
  if (!root) return;
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const grid = root.querySelector('div'), msg = root.querySelector('.tz-msg'), btn = root.querySelector('.tz-btn');
  const COL = ['#2F5BD3', '#C9472A', '#7A4FB5', '#168050', '#B07A00'], LET = 'BINGO';
  const card = () => { const a = []; for (let c = 0; c < 5; c++) { const p = Array.from({ length: 15 }, (_, i) => 15 * c + 1 + i); for (let r = 0; r < 5; r++) { const j = r + Math.floor(Math.random() * (15 - r)); [p[r], p[j]] = [p[j], p[r]]; a[r * 5 + c] = p[r]; } } a[12] = 0; return a; };
  // one game: 500 cards, one ball order; show the first winning card and the ball it won on, nothing more
  let shown = null, tries = 0;
  function game() {
    const ord = Array.from({ length: 75 }, (_, i) => i + 1);
    for (let i = 74; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [ord[i], ord[j]] = [ord[j], ord[i]]; }
    const w = [0]; ord.forEach((b, i) => { w[b] = i + 1; });
    let best = null;
    for (let k = 0; k < 500; k++) {
      const a = card(), rt = [0, 0, 0, 0, 0], ct = [0, 0, 0, 0, 0];
      a.forEach((v, i) => { const t = w[v], r = Math.floor(i / 5), c = i % 5; if (t > rt[r]) rt[r] = t; if (t > ct[c]) ct[c] = t; });
      const t = Math.min(...rt, ...ct);
      if (!best || t < best.t) best = { t, a, w, k, row: rt.indexOf(t), col: ct.indexOf(t) };
    }
    return best;
  }
  function draw() {
    let s = '';
    for (let c = 0; c < 5; c++) s += '<span style="text-align:center;font-weight:800;color:' + COL[c] + '">' + LET[c] + '</span>';
    for (let i = 0; i < 25; i++) {
      const r = Math.floor(i / 5), c = i % 5, v = shown ? shown.a[i] : null;
      const on = shown && (v === 0 || shown.w[v] <= shown.t), line = shown && (r === shown.row || c === shown.col);
      s += '<span style="aspect-ratio:1;display:grid;place-items:center;border-radius:5px;font:600 11px ui-monospace,Menlo,monospace;border:1.5px solid ' + (on ? COL[c] : '#D3D8E5') +
        ';background:' + (on ? COL[c] + '33' : '#fff') + (line ? ';box-shadow:0 0 0 2px #141A30' : '') + '">' + (v === null ? '?' : v === 0 ? '★' : v) + '</span>';
    }
    grid.innerHTML = s;
    btn.textContent = tries ? L('Ще одна гра', 'Another game') : L('Зіграти гру на 500 карток', 'Play a game with 500 cards');
    msg.textContent = !shown ? L('Ведучий тягне кулі, 500 гравців закривають числа. Хто перший і з якою лінією?', 'The caller draws balls, 500 players mark their numbers. Who is first, and with which line?')
      : L('Перша переможна картка №' + (shown.k + 1) + ', «Бінго!» на ' + shown.t + '-й кулі. Ігор: ' + tries + '.', 'First winning card #' + (shown.k + 1) + ', "Bingo!" on ball ' + shown.t + '. Games: ' + tries + '.');
  }
  btn.addEventListener('click', () => { shown = game(); tries++; draw(); });
  document.addEventListener('langchange', draw);
  draw();
})();
