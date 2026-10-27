
(() => {
  const root = document.getElementById('tz-two-eggs');
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const [tower, eggBox] = root.querySelectorAll('div[style] > div'), msg = root.querySelector('.tz-msg'), btn = root.querySelector('.tz-btn');
  const N = 10;
  // fewest drops that settle n floors with e eggs: two eggs cover 1 + 2 + … + d floors
  const W = (e, n) => { if (n <= 0) return 0; if (e <= 0) return Infinity; if (e === 1) return n; let d = 0; while (d * (d + 1) / 2 < n) d++; return d; };
  let lo = 0, hi = N, eggs = 2, log = [];
  const egg = broken => '<svg viewBox="0 0 30 38" width="26" height="33">' + (broken
    ? '<ellipse cx="15" cy="32" rx="13" ry="4" fill="#F2B300"/><path d="M4 26C4 33 9 35 13 35L13 27L10 24L7 27Z" fill="#FFF9EE" stroke="var(--ink)" stroke-width="1.4"/><path d="M26 26C26 33 21 35 17 35L17 26L20 23L23 26Z" fill="#FFF9EE" stroke="var(--ink)" stroke-width="1.4"/>'
    : '<path d="M15 3C23 3 26 20 26 24C26 31 21 35 15 35C9 35 4 31 4 24C4 20 7 3 15 3Z" fill="#FFF9EE" stroke="var(--ink)" stroke-width="1.6"/>') + '</svg>';
  function drop(x) {
    // the building answers whatever leaves the player more work, consistent with earlier drops
    const broke = W(eggs - 1, x - 1 - lo) > W(eggs, hi - x);
    log.push([x, broke]);
    if (broke) { hi = x - 1; eggs--; } else lo = x;
    draw();
  }
  function draw() {
    const done = lo >= hi, last = log.length ? log[log.length - 1] : null;
    tower.innerHTML = '';
    for (let f = N; f >= 1; f--) {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = f;
      const can = !done && f > lo && f <= hi && (eggs === 2 || f === lo + 1);
      const mark = log.find(d => d[0] === f);
      b.disabled = !can;
      b.style.cssText = 'height:22px;border-radius:4px;font:600 .72rem/1 ui-monospace,Menlo,monospace;cursor:' + (can ? 'pointer' : 'default') + ';border:1px solid ' + (last && last[0] === f ? 'var(--ink)' : '#D3D8E5') +
        ';background:' + (done && f === lo ? 'var(--ink)' : f <= lo ? '#E3F2EA' : f > hi ? '#9A9A9A' : '#fff') + ';color:' + (done && f === lo ? '#fff' : 'var(--ink)') +
        (mark ? ';box-shadow:inset 0 -3px 0 ' + (mark[1] ? '#CC2F2B' : '#13823B') : '');
      b.addEventListener('click', () => drop(f));
      tower.appendChild(b);
    }
    eggBox.innerHTML = egg(eggs < 2) + egg(eggs < 1);
    btn.textContent = L('Почати знову', 'Start over');
    btn.hidden = !log.length;
    if (!log.length) msg.textContent = L('Будинок на 10 поверхів, два яйця. Клацніть поверх, щоб кинути яйце. Будинок відповідає так, щоб вам довелося кидати якомога більше.', 'A 10-floor building, two eggs. Click a floor to drop an egg. The building answers so that you have to drop as many times as possible.');
    else {
      const [x, b] = last, k = log.length;
      let m = L('Кидок ' + k + ' з ' + x + '-го: ' + (b ? 'розбилося. ' : 'ціле. '), 'Drop ' + k + ' from floor ' + x + ': ' + (b ? 'it broke. ' : 'still whole. '));
      if (done) m += L('Найвищий безпечний поверх ' + lo + ', кидків ' + k + '. Чи можна менше? А на 100 поверхах?', 'Highest safe floor: ' + lo + ', drops: ' + k + '. Can you do better? And with 100 floors?');
      else if (eggs === 1) m += L('Лишилося одне яйце: тепер тільки по одному поверху, з ' + (lo + 1) + '-го.', 'One egg left: now only one floor at a time, from floor ' + (lo + 1) + '.');
      else m += L('Відповідь між ' + lo + ' і ' + hi + '.', 'The answer is between ' + lo + ' and ' + hi + '.');
      msg.textContent = m;
    }
  }
  btn.addEventListener('click', () => { lo = 0; hi = N; eggs = 2; log = []; draw(); });
  document.addEventListener('langchange', draw);
  draw();
})();
