
(() => {
  const root = document.getElementById('tz-gamblers-ruin');
  const L = (uk, e) => document.documentElement.dataset.lang === 'en' ? e : uk;
  const cv = root.querySelector('canvas'), msg = root.querySelector('.tz-msg'), b = root.querySelector('.tz-btn');
  const fmt = n => n.toLocaleString(L('uk-UA', 'en-US'));
  const st = k => { const a = k % 10, h = k % 100; return a === 1 && h !== 11 ? 'ставку' : a >= 2 && a <= 4 && (h < 12 || h > 14) ? 'ставки' : 'ставок'; };
  const st2 = k => k % 10 === 1 && k % 100 !== 11 ? 'ставки' : 'ставок';
  const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  let path = null, n = 0, wins = 0, timer = null;
  function draw(upto) {
    const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight;
    if (!W) return;
    cv.width = W * dpr; cv.height = H * dpr;
    const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
    const l = 40, r = 10, t = 12, bt = 12, nMax = Math.max(4000, path ? path.length : 0);
    const x = i => l + i / nMax * (W - l - r), y = v => t + (1 - v / 200) * (H - t - bt);
    c.font = '11px ' + (css('--f') || 'sans-serif'); c.fillStyle = '#9A9A9A'; c.strokeStyle = '#E4E4E4'; c.textAlign = 'right'; c.textBaseline = 'middle';
    [0, 100, 200].forEach(v => { c.beginPath(); c.moveTo(l, y(v)); c.lineTo(W - r, y(v)); c.stroke(); c.fillText('$' + v, l - 6, y(v)); });
    if (!path) return;
    const end = Math.min(upto, path.length - 1), won = path[path.length - 1] >= 200 && end === path.length - 1;
    c.strokeStyle = won ? (css('--signal') || '#D9318F') : (css('--ink') || '#151515'); c.lineWidth = 1.6; c.beginPath();
    const k = Math.max(1, Math.floor(end / 800));
    for (let i = 0; i <= end; i += k) i ? c.lineTo(x(i), y(path[i])) : c.moveTo(x(0), y(path[0]));
    c.lineTo(x(end), y(path[end])); c.stroke();
  }
  function play() {
    clearInterval(timer);
    path = [100]; let m = 100;
    while (m > 0 && m < 200) { m += Math.random() < 18 / 37 ? 1 : -1; path.push(m); }
    let i = 0; b.disabled = true; msg.textContent = L('Ставка за ставкою…', 'Bet after bet…');
    const done = () => { n++; if (m >= 200) wins++; b.disabled = false; draw(path.length); text(); };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { done(); return; }
    timer = setInterval(() => { i += Math.max(40, Math.ceil(path.length / 50)); if (i >= path.length - 1) { clearInterval(timer); done(); } else draw(i); }, 30);
  }
  function text() {
    if (!n) { msg.textContent = L('Натисніть «Зіграти», щоб ставити по $1 на червоне до $200 або нуля.', 'Press "Play" to bet $1 on red until $200 or zero.'); b.textContent = L('Зіграти', 'Play'); return; }
    const last = path[path.length - 1], len = path.length - 1;
    msg.textContent = (last >= 200 ? L('$200 за ' + fmt(len) + ' ' + st(len) + '! ', '$200 in ' + fmt(len) + ' bets! ') : L('Гроші скінчилися після ' + fmt(len) + ' ' + st2(len) + '. ', 'Broke after ' + fmt(len) + ' bets. ')) +
      L('Сесій: ' + n + ', до $200 дійшли: ' + wins + '.', n + ' ' + (n === 1 ? 'session' : 'sessions') + ', ' + wins + ' reached $200.');
    b.textContent = L('Ще одна сесія', 'Play again');
  }
  b.addEventListener('click', play);
  document.addEventListener('langchange', text);
  window.addEventListener('resize', () => draw(path ? path.length : 0));
  draw(0); text();
})();
