
(() => {
  const root = document.getElementById('tz-braess-paradox');
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const box = root.querySelector('div[style]'), msg = root.querySelector('.tz-msg'), [b1, b2] = root.querySelectorAll('.tz-btn');
  // stage 0: ask; 1: drivers move to the shortcut 500 at a time; 2: done
  let stage = 0, z = 0, said = '', timer = null;
  const fmt = n => n.toLocaleString(en() ? 'en-US' : 'uk-UA');
  const dec = x => { const s = String(+x.toFixed(2)); return en() ? s : s.replace('.', ','); };
  function draw() {
    const side = (4000 - z) / 2, sa = (side + z) / 100, w = n => (2 + 9 * n / 4000).toFixed(1), m = L(' хв', ' min');
    const ln = (x1, y1, x2, y2, n, c, d) => '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + c + '" stroke-width="' + w(n) + '" stroke-linecap="round"' + (d ? ' stroke-dasharray="5 5"' : '') + '/>';
    const tx = (x, y, a, t) => '<text x="' + x + '" y="' + y + '" text-anchor="' + a + '" font-family="ui-monospace,Menlo,monospace" font-size="11" font-weight="600" fill="var(--ink)">' + t + '</text>';
    let h = '<svg viewBox="0 0 340 200" width="100%" aria-hidden="true" style="display:block">';
    h += ln(30, 100, 170, 26, side + z, 'var(--ink)') + ln(170, 26, 310, 100, side, '#9A9A9A') + ln(30, 100, 170, 174, side, '#9A9A9A') + ln(170, 174, 310, 100, side + z, 'var(--ink)');
    h += stage ? ln(170, 44, 170, 156, z, 'var(--signal)') : ln(170, 44, 170, 156, 0, '#C9C9C9', 1);
    h += tx(92, 44, 'end', dec(sa) + m) + tx(248, 44, 'start', '45' + m) + tx(92, 166, 'end', '45' + m) + tx(248, 166, 'start', dec(sa) + m);
    h += tx(180, 104, 'start', stage ? '0' + m + ' · ' + fmt(z) : '?');
    [[30, 100, L('С', 'S')], [170, 26, 'A'], [170, 174, 'B'], [310, 100, L('Ф', 'F')]].forEach(([x, y, t]) => {
      h += '<circle cx="' + x + '" cy="' + y + '" r="12" fill="var(--ink)"/><text x="' + x + '" y="' + (y + 4) + '" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-size="11" font-weight="700" fill="#fff">' + t + '</text>';
    });
    box.innerHTML = h + '</svg>';
  }
  function text() {
    draw();
    const side = (4000 - z) / 2, tz = (side + z) / 50, to = (side + z) / 100 + 45;
    b2.style.display = stage === 0 ? '' : 'none';
    if (stage === 0) {
      b1.textContent = L('Стане швидше', 'Faster'); b2.textContent = L('Стане повільніше', 'Slower');
      msg.textContent = L('По 2000 машин на кожному маршруті: 20 + 45 = 65 хвилин. Відкриваємо перемичку A → B за 0 хвилин. Як зміниться поїздка?', '2,000 cars on each route: 20 + 45 = 65 minutes. We open a shortcut A → B that takes 0 minutes. How will the trip change?');
    } else if (stage === 1) {
      b1.textContent = L('Водії пересідають…', 'Drivers are switching…');
      msg.textContent = L('Перемичкою: ' + dec(tz) + ' хв, старими маршрутами: ' + dec(to) + ' хв. Перемичка швидша, тож на неї переходять ще 500 водіїв.', 'Via the shortcut: ' + dec(tz) + ' min, old routes: ' + dec(to) + ' min. The shortcut is faster, so 500 more drivers move to it.');
    } else {
      b1.textContent = L('Ще раз', 'Again');
      msg.textContent = L('Усі 4000 на перемичці: 40 + 0 + 40 = 80 хвилин замість 65. Старий маршрут тепер 85, тож ніхто не повертається. ', 'All 4,000 on the shortcut: 40 + 0 + 40 = 80 minutes instead of 65. An old route is now 85, so nobody goes back. ') +
        (said === 'slow' ? L('Ви вгадали: стало повільніше.', 'You were right: it got slower.') : L('Нова дорога сповільнила всіх.', 'The new road slowed everyone down.'));
    }
    b1.disabled = stage === 1;
  }
  function run(choice) {
    clearTimeout(timer);
    if (stage === 2) { stage = 0; z = 0; said = ''; text(); return; }
    said = choice; stage = 1; z = 0;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { z = 4000; stage = 2; text(); return; }
    text();
    (function tick() { timer = setTimeout(() => { z += 500; if (z >= 4000) { z = 4000; stage = 2; } text(); if (stage === 1) tick(); }, 650); })();
  }
  b1.addEventListener('click', () => run('fast'));
  b2.addEventListener('click', () => run('slow'));
  document.addEventListener('langchange', text);
  text();
})();
