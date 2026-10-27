
(() => {
  const root = document.getElementById('tz-twenty-five-horses');
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const grid = root.querySelector('div[style]'), msg = root.querySelector('.tz-msg'), btn = root.querySelector('.tz-btn');
  const H = 'ABCDE';
  // stage 0: nothing shown; 1: after the five heats and the winners' race; 2: true speeds revealed
  let stage = 0, sp = [], rows = [], right = 0, days = 0;
  function newDay() {
    sp = [...Array(25).keys()];
    for (let i = 24; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [sp[i], sp[j]] = [sp[j], sp[i]]; }
    rows = [0, 1, 2, 3, 4].map(h => [0, 1, 2, 3, 4].map(i => h * 5 + i).sort((x, y) => sp[x] - sp[y])).sort((a, b) => sp[a[0]] - sp[b[0]]);
  }
  function draw() {
    grid.innerHTML = '';
    for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) {
      const h = rows.length ? rows[i][j] : i * 5 + j, d = document.createElement('div');
      const win = stage >= 1 && j === 0 && i < 3, top = stage === 2 && sp[h] < 3;
      d.style.cssText = 'display:grid;justify-items:center;gap:1px;padding:5px 0;border-radius:9px;font:600 .8rem/1.2 ui-monospace,Menlo,monospace;border:1.5px solid ' + (top ? 'var(--signal)' : win ? 'var(--ink)' : '#D3D8E5') + ';background:' + (top ? 'var(--signal)' : '#fff') + ';color:' + (top ? '#fff' : 'var(--ink)');
      d.innerHTML = '<span>' + (stage >= 1 ? H[i] + (j + 1) : '?') + '</span><span style="font-weight:400;font-size:.66rem;opacity:.8">' + (stage === 2 ? '#' + (sp[h] + 1) : stage === 1 && win ? L('топ-', 'top ') + (i + 1) : '&nbsp;') + '</span>';
      grid.appendChild(d);
    }
  }
  function text() {
    draw();
    btn.textContent = stage === 0 ? L('Провести 6 забігів', 'Run 6 races') : stage === 1 ? L('Показати справжні швидкості', 'Reveal the true speeds') : L('Новий день перегонів', 'New race day');
    if (stage === 0) msg.textContent = L('25 коней із прихованими швидкостями. Натисніть кнопку: п\'ять забігів по п\'ятеро і забіг переможців.', '25 horses with hidden speeds. Press the button: five races of five and a race of the winners.');
    else if (stage === 1) msg.textContent = L('Рядок означає забіг, A найшвидший. Забіг переможців каже: трійка це A1, B1, C1. Чи правда?', 'Each row is a heat, A the fastest. The winners\' race says the top 3 is A1, B1, C1. Is it true?');
    else {
      const top = [0, 1, 2].map(r => { for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) if (sp[rows[i][j]] === r) return H[i] + (j + 1); });
      const ok = top[1] === 'B1' && top[2] === 'C1';
      msg.textContent = (ok ? L('Так, цього разу збіглося. ', 'Yes, this time it matched. ') : L('Ні! Справжня трійка: ' + top.join(', ') + '. ', 'No! The true top 3 is ' + top.join(', ') + '. ')) +
        L('Забіг переможців вгадав ' + right + ' з ' + days + '.', 'The winners\' race was right ' + right + ' of ' + days + ' times.');
    }
  }
  btn.addEventListener('click', () => {
    if (stage === 1) { stage = 2; days++; if (sp[rows[1][0]] === 1 && sp[rows[2][0]] === 2) right++; }
    else { newDay(); stage = 1; }
    text();
  });
  document.addEventListener('langchange', text);
  text();
})();
