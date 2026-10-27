
(() => {
  const root = document.getElementById('tz-prosecutors-fallacy');
  if (!root) return;
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const fmt = n => en() ? n.toLocaleString('en-US') : n.toLocaleString('en-US').replace(/,/g, ' ');
  const cv = root.querySelector('canvas'), msg = root.querySelector('.tz-msg'), btn = root.querySelector('.tz-btn');
  const BATCH = 10000, P = 1 / 10000;
  let tested = 0, matched = 0, last = [];
  // test a batch of random innocent adults: each matches with probability 1/10,000
  function batch() {
    last = [];
    const lq = Math.log(1 - P); let i = -1;
    for (;;) { i += 1 + Math.floor(Math.log(1 - Math.random()) / lq); if (i >= BATCH) break; last.push(i); }
    tested += BATCH; matched += last.length;
  }
  function draw() {
    const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight; if (!W || !H) return;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
    // 400 dots, each 25 people of the latest batch of 10,000
    const cols = 40, rows = 10, sx = (W - 20) / (cols - 1), sy = (H - 30) / (rows - 1);
    for (let k = 0; k < cols * rows; k++) {
      const x = 10 + (k % cols) * sx, y = 10 + Math.floor(k / cols) * sy;
      c.fillStyle = '#CFC6C2'; c.beginPath(); c.arc(x, y, 1.6, 0, 6.3); c.fill();
    }
    c.fillStyle = '#151515';
    for (const i of last) { const k = Math.floor(i / 25), x = 10 + (k % cols) * sx, y = 10 + Math.floor(k / cols) * sy; c.beginPath(); c.arc(x, y, 4, 0, 6.3); c.fill(); }
    c.font = '11px system-ui, sans-serif'; c.fillStyle = '#5F5F5F'; c.textBaseline = 'alphabetic';
    c.fillText(L('10 000 невинних дорослих, 1 точка = 25', '10,000 innocent adults, 1 dot = 25'), 10, H - 5);
  }
  function text() {
    btn.textContent = tested ? L('Ще 10 000', '10,000 more') : L('Перевірити 10 000 невинних', 'Test 10,000 innocent people');
    msg.textContent = !tested ? L('Скільки невинних випадково збігаються зі слідом 1 на 10 000?', 'How many innocent people match a 1 in 10,000 trace by chance?')
      : L('Перевірено ' + fmt(tested) + ' невинних, збіглося ' + matched + '.', 'Tested ' + fmt(tested) + ' innocent people, ' + matched + ' matched.');
  }
  btn.addEventListener('click', () => { batch(); draw(); text(); });
  document.addEventListener('langchange', () => { draw(); text(); });
  draw(); text();
})();
