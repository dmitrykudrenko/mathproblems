
(() => {
  const root = document.getElementById('tz-bridge-and-torch');
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const scene = root.querySelector('div[style]'), msg = root.querySelector('.tz-msg'), [go, again] = root.querySelectorAll('.tz-btn');
  const T = [1, 2, 5, 10];
  let left = 15, side = 0, sel = [], time = 0, moves = 0;
  const pl = (k, one, few, many) => { const a = k % 10, b = k % 100; return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many; };
  function bank(s) {
    let h = '<div style="display:grid;gap:5px;align-content:start;border-radius:12px;padding:8px 6px;min-height:178px;background:' + (s === side && left ? '#FFF3DD' : '#F4F4F4') + '">';
    h += '<span style="font:600 .66rem/1.2 system-ui,sans-serif;text-transform:uppercase;letter-spacing:.06em;color:#5F5F5F;text-align:center">' + (s ? L('Той бік', 'Far side') : L('Старт', 'Start')) + '</span>';
    T.forEach((t, i) => {
      const here = s ? !(left >> i & 1) : !!(left >> i & 1);
      if (!here) return;
      const on = sel.includes(i), can = s === side && left;
      h += '<button type="button" data-i="' + i + '"' + (can ? '' : ' disabled') + ' style="font:600 .9rem/1 ui-monospace,Menlo,monospace;height:34px;border-radius:9px;cursor:' + (can ? 'pointer' : 'default') + ';border:1.5px solid ' + (on ? 'var(--ink)' : '#D3D8E5') + ';background:' + (on ? 'var(--ink)' : '#fff') + ';color:' + (on ? '#fff' : 'var(--ink)') + ';opacity:' + (can ? 1 : .6) + '">' + t + ' ' + L('хв', 'min') + '</button>';
    });
    return h + '</div>';
  }
  function draw() {
    scene.innerHTML = bank(0) + '<div style="display:grid;align-content:center;justify-items:center;gap:4px;font:600 .8rem/1 ui-monospace,Menlo,monospace;color:#5F5F5F"><svg viewBox="0 0 34 46" width="24" height="32" aria-hidden="true"><rect x="14" y="20" width="6" height="24" rx="2" fill="#6E5238"/><path d="M17 3c5 6 8 9 8 13a8 8 0 0 1-16 0c0-4 3-7 8-13z" fill="#F2A33A"/></svg><span>' + (left ? (side ? '←' : '→') : '✓') + '</span></div>' + bank(1);
    go.textContent = side ? L('← Назад', '← Back') : L('Перейти →', 'Cross →');
    go.disabled = !sel.length || !left;
    again.textContent = L('Спочатку', 'Restart');
    if (!moves) msg.textContent = L('Оберіть одного чи двох на боці з ліхтариком і перейдіть. Годинник: 0 хв.', 'Pick one or two on the torch side and cross. Clock: 0 min.');
    else if (left) msg.textContent = L('Минуло ' + time + ' ' + pl(time, 'хвилина', 'хвилини', 'хвилин') + '. ', time + (time === 1 ? ' minute' : ' minutes') + ' so far. ') + (side ? L('Хтось має принести ліхтарик назад.', 'Someone has to bring the torch back.') : L('Хто йде далі?', 'Who goes next?'));
    else msg.textContent = L('Усі на тому боці за ' + time + ' ' + pl(time, 'хвилину', 'хвилини', 'хвилин') + '. ', 'Everyone is across in ' + time + ' minutes. ') + (time <= 17 ? L('Швидше не можна.', 'You cannot do it faster.') : L('А можна швидше?', 'Can you do it faster?'));
  }
  scene.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || b.disabled) return;
    const i = +b.dataset.i;
    if (sel.includes(i)) sel = sel.filter(v => v !== i); else { sel.push(i); if (sel.length > 2) sel.shift(); }
    draw();
  });
  go.addEventListener('click', () => {
    if (!sel.length) return;
    sel.forEach(i => { left ^= 1 << i; }); time += Math.max(...sel.map(i => T[i])); side ^= 1; sel = []; moves++; draw();
  });
  again.addEventListener('click', () => { left = 15; side = 0; sel = []; time = 0; moves = 0; draw(); });
  document.addEventListener('langchange', draw);
  draw();
})();
