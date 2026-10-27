
(() => {
  const root = document.getElementById('tz-dollar-auction');
  if (!root) return;
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const cv = root.querySelector('canvas'), msg = root.querySelector('.tz-msg'), [b1, b2] = root.querySelectorAll('.tz-btn');
  const col = (name, fb) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fb;
  const usd = c => (c < 0 ? '−' : '') + '$' + (Math.abs(c) / 100).toFixed(2).replace('.', en() ? '.' : ',');
  const sg = c => (c > 0 ? '+' : '') + usd(c);
  // you against a bot with a secret budget from 30 cents to 3 dollars; it opens at 5 cents, you alternate in 5-cent steps,
  // and after each of your raises it may also give up on its own (5%)
  let B, bot, you, over, res, seq, won;
  function start() { B = 5 * (6 + Math.floor(Math.random() * 55)); bot = 5; you = 0; over = false; won = false; res = 0; seq = [[1, 5]]; }
  function raise() {
    if (over) { start(); show(); return; }
    you = bot + 5; seq.push([0, you]);
    if (you + 5 > B || Math.random() < .05) { over = true; won = true; res = 100 - you; }
    else { bot = you + 5; seq.push([1, bot]); }
    show();
  }
  function quit() { if (over) return; over = true; res = -you; show(); }
  function draw() {
    const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight;
    if (!W) return;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    const ink = col('--ink', '#151515'), mut = col('--muted', '#5F5F5F'), f = col('--f', 'system-ui');
    const top = Math.max(150, ...seq.map(s => s[1])) + 10, n = Math.max(12, seq.length), l = 8, r = 8, t = 8, b = 8;
    const x = i => l + (i + .5) / n * (W - l - r), y = v => t + (1 - v / top) * (H - t - b), bw = Math.max(3, Math.min(16, (W - l - r) / n * .7));
    ctx.strokeStyle = '#2F5E3B'; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(l, y(100)); ctx.lineTo(W - r, y(100)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#2F5E3B'; ctx.font = '600 11px ' + f; ctx.textBaseline = 'bottom'; ctx.textAlign = 'left'; ctx.fillText('$1', l + 2, y(100) - 2);
    seq.forEach((s, i) => { ctx.fillStyle = s[0] ? mut : ink; ctx.globalAlpha = s[0] ? .45 : 1; ctx.fillRect(x(i) - bw / 2, y(s[1]), bw, y(0) - y(s[1])); });
    ctx.globalAlpha = 1;
  }
  function show() {
    if (!over) msg.textContent = you
      ? L('Бот: ' + usd(bot) + ', ви: ' + usd(you) + '. Здатися — втратити ' + usd(you) + '. Підняти до ' + usd(bot + 5) + '?', 'Bot: ' + usd(bot) + ', you: ' + usd(you) + '. Quitting loses ' + usd(you) + '. Raise to ' + usd(bot + 5) + '?')
      : L('Бот відкрив торги: 5 центів. Його бюджет таємний. Вступите?', 'The bot opened at 5 cents. Its budget is secret. Will you come in?');
    else msg.textContent = won
      ? L('Бот здався. Ви купили долар за ' + usd(you) + ': ' + sg(res) + '. Його бюджет був ' + usd(B) + '.', 'The bot gave up. You bought the dollar for ' + usd(you) + ': ' + sg(res) + '. Its budget was ' + usd(B) + '.')
      : you ? L('Ви здалися: ' + usd(res) + '. Бюджет бота був ' + usd(B) + '.', 'You gave up: ' + usd(res) + '. The bot\'s budget was ' + usd(B) + '.')
        : L('Ви не вступили. Бюджет бота був ' + usd(B) + '.', 'You stayed out. The bot\'s budget was ' + usd(B) + '.');
    b1.textContent = over ? L('Ще раз', 'Again') : L('Підняти до ' + usd(bot + 5), 'Raise to ' + usd(bot + 5));
    b2.textContent = you ? L('Здатися', 'Give up') : L('Не вступати', 'Stay out');
    b2.disabled = over;
    draw();
  }
  b1.addEventListener('click', raise);
  b2.addEventListener('click', quit);
  document.addEventListener('langchange', show);
  let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(draw, 100); });
  start(); show();
})();
