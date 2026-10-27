
(() => {
  const root = document.getElementById('tz-multi-armed-bandit');
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const cv = root.querySelector('canvas'), msg = root.querySelector('.tz-msg'), btns = root.querySelectorAll('.tz-btn');
  const col = (name, fb) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fb;
  // one 10 + 10 test: the better machine (60%) is placed left or right at random and revealed only after the test
  let last = null, tests = 0, wrong = 0;
  function test() {
    const best = Math.random() < .5 ? 0 : 1, p = best ? [.5, .6] : [.6, .5], seq = [[], []];
    for (let i = 0; i < 10; i++) [0, 1].forEach(a => seq[a].push(Math.random() < p[a] ? 1 : 0));
    const w = seq.map(s => s.reduce((a, b) => a + b, 0));
    const tie = w[0] === w[1], pick = w[0] > w[1] ? 0 : w[1] > w[0] ? 1 : (Math.random() < .5 ? 0 : 1);
    tests++; if (pick !== best) wrong++;
    last = { best, seq, w, tie, pick };
  }
  function draw() {
    const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight;
    if (!W) return;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    const ink = col('--ink', '#151515'), sig = col('--signal', '#D9318F'), mut = col('--muted', '#5F5F5F'), f = col('--f', 'system-ui');
    const cw = (W - 20) / 2;
    [0, 1].forEach(a => {
      const x0 = 10 + a * cw, cx = x0 + cw / 2;
      ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillStyle = ink; ctx.font = '700 12px ' + f;
      ctx.fillText(a ? L('Правий', 'Right') : L('Лівий', 'Left'), cx, 4);
      for (let i = 0; i < 10; i++) {
        const x = x0 + 14 + (i % 5) * ((cw - 28) / 4), y = 40 + Math.floor(i / 5) * 28;
        ctx.beginPath(); ctx.arc(x, y, 9, 0, 7);
        if (last && last.seq[a][i]) { ctx.fillStyle = ink; ctx.fill(); } else { ctx.strokeStyle = mut; ctx.lineWidth = 1.5; ctx.stroke(); }
      }
      ctx.fillStyle = ink; ctx.font = '800 26px ' + f; ctx.textBaseline = 'middle';
      ctx.fillText(last ? last.w[a] + ' / 10' : '? / 10', cx, 118);
      if (last) {
        ctx.font = '600 12px ' + f;
        ctx.fillStyle = a === last.best ? ink : mut;
        ctx.fillText(a === last.best ? '60%' : '50%', cx, 146);
        if (a === last.pick) {
          const bad = a !== last.best;
          ctx.strokeStyle = bad ? sig : ink; ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x0 + 4, 100, cw - 8, 58, 10) : ctx.rect(x0 + 4, 100, cw - 8, 58); ctx.stroke();
          ctx.fillStyle = bad ? sig : ink; ctx.font = '700 11px ' + f;
          ctx.fillText(L('обрано', 'picked'), cx, 176);
        }
      }
    });
  }
  function text() {
    msg.textContent = !last
      ? L('Смикніть кожен автомат 10 разів і подивіться, котрий план обере.', 'Pull each machine 10 times and see which one the plan picks.')
      : (last.pick === last.best ? L('Обрано кращий. ', 'The better one was picked. ') : L('Обрано гірший! ', 'The worse one was picked! ')) + (last.tie ? L('Була нічия, вирішила монета. ', 'It was a tie; a coin decided. ') : '') +
        L('Гірший обрано в ' + wrong + ' з ' + tests + ' тестів.', 'The worse one was picked in ' + wrong + ' of ' + tests + ' tests.');
    btns[0].textContent = last ? L('Ще один тест', 'Another test') : L('Провести тест 10 + 10', 'Run a 10 + 10 test');
    btns[1].textContent = L('Ще 100 тестів', '100 more tests');
    btns[1].disabled = !last;
  }
  btns[0].addEventListener('click', () => { test(); draw(); text(); });
  btns[1].addEventListener('click', () => { for (let i = 0; i < 100; i++) test(); draw(); text(); });
  document.addEventListener('langchange', () => { draw(); text(); });
  let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(draw, 100); });
  draw(); text();
})();
