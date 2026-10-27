
(() => {
  const root = document.getElementById('tz-survivorship-bias');
  const L = (uk, e) => document.documentElement.dataset.lang === 'en' ? e : uk;
  const cv = root.querySelector('canvas'), msg = root.querySelector('.tz-msg'), b = root.querySelector('.tz-btn');
  // a bomber from above in a 200×120 box: [part, kill chance, share of area, rects]
  const P = [
    ['eng', .7, .12, [[34, 30, 46, 52], [60, 30, 72, 52], [128, 30, 140, 52], [154, 30, 166, 52]]],
    ['cock', .6, .08, [[90, 1, 110, 20]]],
    ['fus', .04, .35, [[90, 20, 110, 116]]],
    ['wing', .08, .35, [[12, 36, 90, 58], [110, 36, 188, 58]]],
    ['tail', .2, .10, [[62, 100, 90, 114], [110, 100, 138, 114]]]
  ];
  const SORTIE = 20, MAX = 5;
  let sent = 0, back = 0, holes = [], lostHits = [], showLost = false;
  const inR = (x, y, r) => x >= r[0] && x <= r[2] && y >= r[1] && y <= r[3];
  function spot(p) {
    for (;;) {
      const r = p[3][Math.floor(Math.random() * p[3].length)], x = r[0] + 2 + Math.random() * (r[2] - r[0] - 4), y = r[1] + 2 + Math.random() * (r[3] - r[1] - 4);
      if (p[0] !== 'wing' || !P[0][3].some(e => inR(x, y, e))) return { x, y };
    }
  }
  function fly() {
    for (let i = 0; i < SORTIE; i++) {
      let n = 0, q = Math.random(); const e = Math.exp(-1.2); while (q > e) { n++; q *= Math.random(); }
      const hits = []; let lost = false;
      for (let h = 0; h < n; h++) {
        let u = Math.random(), p = P[0]; for (const c of P) { if (u < c[2]) { p = c; break; } u -= c[2]; }
        const fatal = Math.random() < p[1]; if (fatal) lost = true;
        hits.push(Object.assign(spot(p), { eng: p[0] === 'eng' || p[0] === 'cock', fatal }));
      }
      sent++; if (lost) lostHits.push(...hits.filter(h => h.fatal)); else { back++; holes.push(...hits); }
    }
  }
  function draw() {
    const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight; if (!W) return;
    cv.width = W * dpr; cv.height = H * dpr;
    const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const css = getComputedStyle(document.documentElement), ink = css.getPropertyValue('--ink').trim() || '#151515', sig = css.getPropertyValue('--signal').trim() || '#D9318F';
    const s = Math.min((W - 20) / 200, (H - 16) / 120), ox = (W - 200 * s) / 2, oy = (H - 120 * s) / 2;
    ['wing', 'tail', 'fus', 'cock', 'eng'].forEach(id => P.find(p => p[0] === id)[3].forEach(r => {
      c.fillStyle = '#DADFDC'; c.strokeStyle = '#A3ABA6'; c.lineWidth = 1;
      c.beginPath(); c.rect(ox + r[0] * s, oy + r[1] * s, (r[2] - r[0]) * s, (r[3] - r[1]) * s); c.fill(); c.stroke();
    }));
    const dot = (h, col) => { c.fillStyle = col; c.beginPath(); c.arc(ox + h.x * s, oy + h.y * s, Math.max(1.6, 1.8 * s), 0, 2 * Math.PI); c.fill(); };
    holes.forEach(h => dot(h, ink));
    if (showLost) lostHits.forEach(h => dot(h, sig));
  }
  function text() {
    if (!sent) { msg.textContent = L('Відправте бомбардувальники на завдання і подивіться, де дірки на тих, що повернулися.', 'Send bombers on a mission and see where the holes are on the ones that come back.'); b.textContent = L('Відправити 20 літаків', 'Send 20 planes'); return; }
    const eng = holes.filter(h => h.eng).length;
    msg.textContent = showLost
      ? L('Не повернулися: ' + (sent - back) + '. Рожеві точки — влучання, що їх збили. Ось де бракувало броні.', 'Pink dots are the hits that downed the ' + (sent - back) + ' planes that did not return. That is where armour was missing.')
      : L('Повернулися ' + back + ' з ' + sent + '. Дірок на них ' + holes.length + ', на двигунах і в кабіні лише ' + eng + '.', back + ' of ' + sent + ' came back. They carry ' + holes.length + ' holes, just ' + eng + ' on the engines and cockpit.');
    b.textContent = showLost ? L('Почати знову', 'Start again') : sent >= MAX * SORTIE ? L('Показати збиті літаки', 'Show the lost planes') : L('Відправити ще 20', 'Send 20 more');
  }
  b.addEventListener('click', () => {
    if (showLost) { sent = 0; back = 0; holes = []; lostHits = []; showLost = false; }
    else if (sent >= MAX * SORTIE) showLost = true;
    else fly();
    draw(); text();
  });
  document.addEventListener('langchange', () => { draw(); text(); });
  window.addEventListener('resize', draw);
  draw(); text();
})();
