
(() => {
  const root = document.getElementById('tz-hilbert-hotel');
  if (!root) return;
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const box = root.querySelector('div[style]'), msg = root.querySelector('.tz-msg'), [b1, b2] = root.querySelectorAll('.tz-btn');
  // stage 0: ask; 1: guests step one room along; 2: done
  let stage = 0, mv = 0, said = '', raf = 0;
  function draw() {
    const cw = 46, x0 = 52, top = 34;
    let h = '<svg viewBox="0 0 340 130" width="100%" aria-hidden="true" style="display:block">';
    for (let r = 1; r <= 7; r++) {
      const x = x0 + (r - 1) * cw, op = r > 5 ? (r === 6 ? .55 : .25) : 1;
      h += '<g opacity="' + op + '"><rect x="' + (x + 3) + '" y="' + top + '" width="' + (cw - 6) + '" height="54" rx="6" fill="#ECECEC" stroke="#C9C9C9"/>' +
        '<text x="' + (x + cw / 2) + '" y="' + (top - 7) + '" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-size="11" font-weight="600" fill="#6B6B6B">' + r + '</text></g>';
    }
    h += '<text x="330" y="66" text-anchor="end" font-family="ui-monospace,Menlo,monospace" font-size="16" font-weight="700" fill="#6B6B6B">…</text>';
    for (let r = 1; r <= 7; r++) {
      const x = x0 + (r - 1 + mv) * cw + cw / 2, op = x > 300 ? Math.max(0, (330 - x) / 30) : 1;
      h += '<circle cx="' + x + '" cy="' + (top + 30) + '" r="12" fill="var(--ink)" opacity="' + op.toFixed(2) + '"/><text x="' + x + '" y="' + (top + 34) + '" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-size="10" font-weight="700" fill="#fff" opacity="' + op.toFixed(2) + '">' + r + '</text>';
    }
    const nx = 24 + (stage ? Math.max(0, mv * 2 - 1) : 0) * (x0 + cw / 2 - 24);
    h += '<circle cx="' + nx + '" cy="' + (top + 30) + '" r="12" fill="#2F6FD6"/><text x="' + nx + '" y="' + (top + 34) + '" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-size="11" font-weight="700" fill="#fff">+</text>';
    if (!stage) h += '<text x="24" y="' + (top + 4) + '" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-size="15" font-weight="800" fill="var(--ink)">?</text>';
    h += '<text x="170" y="120" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-size="11" font-weight="600" fill="#6B6B6B">' + (stage === 2 ? 'n → n + 1' : L('усі кімнати зайняті', 'every room is taken')) + '</text>';
    box.innerHTML = h + '</svg>';
  }
  function text() {
    draw();
    b2.style.display = stage === 0 ? '' : 'none';
    if (stage === 0) {
      b1.textContent = L('Ні, місць немає', 'No, it is full'); b2.textContent = L('Так, знайдеться', 'Yes, there is');
      msg.textContent = L('Кімнати 1, 2, 3, … тягнуться без кінця, і всі зайняті. Біля входу новий гість. Чи знайдеться для нього кімната?', 'Rooms 1, 2, 3, … go on forever, all taken. A new guest waits at the door. Is there a room for them?');
    } else if (stage === 1) {
      b1.textContent = L('Гості переходять…', 'Guests are moving…');
      msg.textContent = L('Менеджер оголошує: «Кожен, перейдіть із кімнати n у кімнату n + 1».', 'The manager announces: "Everyone, please move from room n to room n + 1."');
    } else {
      b1.textContent = L('Ще раз', 'Again');
      msg.textContent = L('Останньої кімнати немає, тож кожен має куди перейти, а кімната 1 звільнилася для новенького. ', 'There is no last room, so everyone has somewhere to go, and room 1 is free for the newcomer. ') +
        (said === 'yes' ? L('Ви вгадали.', 'You were right.') : L('Повний нескінченний готель однаково має місце.', 'A full infinite hotel still has room.'));
    }
    b1.disabled = stage === 1;
  }
  function run(choice) {
    cancelAnimationFrame(raf);
    if (stage === 2) { stage = 0; mv = 0; said = ''; text(); return; }
    said = choice; stage = 1; mv = 0;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { mv = 1; stage = 2; text(); return; }
    const t0 = performance.now();
    text();
    (function tick(now) {
      mv = Math.min(1, (now - t0) / 1800);
      if (mv >= 1) { stage = 2; text(); return; }
      draw(); raf = requestAnimationFrame(tick);
    })(t0);
  }
  b1.addEventListener('click', () => run('no'));
  b2.addEventListener('click', () => run('yes'));
  document.addEventListener('langchange', text);
  text();
})();
