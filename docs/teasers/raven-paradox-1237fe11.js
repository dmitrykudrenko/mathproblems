
(() => {
  const root = document.getElementById('tz-raven-paradox');
  if (!root) return;
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const fmt = n => en() ? n.toLocaleString('en-US') : n.toLocaleString('en-US').replace(/,/g, ' ');
  const cv = root.querySelector('canvas'), msg = root.querySelector('.tz-msg'), btn = root.querySelector('.tz-btn');
  const COLS = ['#C8322B', '#3D8B3D', '#E0A100', '#3A78C2'];
  let seen = 0, last = [];
  // look at 100 random non-black things; none of them is a raven (the park's rule is never shown)
  function batch() { last = []; for (let i = 0; i < 100; i++) last.push(COLS[Math.floor(Math.random() * COLS.length)]); seen += 100; }
  function draw() {
    const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight; if (!W || !H) return;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
    const cols = 20, rows = 5, sx = (W - 20) / (cols - 1), sy = (H - 34) / (rows - 1);
    for (let k = 0; k < cols * rows; k++) {
      const x = 10 + (k % cols) * sx, y = 10 + Math.floor(k / cols) * sy;
      c.fillStyle = last[k] || '#CFCFD8'; c.beginPath(); c.arc(x, y, last[k] ? 4 : 2, 0, 6.3); c.fill();
    }
    c.font = '11px system-ui, sans-serif'; c.fillStyle = '#5F5F5F'; c.textBaseline = 'alphabetic';
    c.fillText(L('100 випадкових не-чорних речей', '100 random non-black things'), 10, H - 6);
  }
  function text() {
    btn.textContent = seen ? L('Ще 100 речей', '100 more things') : L('Оглянути 100 не-чорних речей', 'Look at 100 non-black things');
    msg.textContent = !seen ? L('Шукаємо білого ворона серед не-чорних речей парку.', 'Looking for a white raven among the park\'s non-black things.')
      : L('Оглянуто ' + fmt(seen) + ' речей, жодна не ворон. Чи переконує це вас, що всі ворони чорні?', fmt(seen) + ' things seen, none of them a raven. Does that convince you all ravens are black?');
  }
  btn.addEventListener('click', () => { batch(); draw(); text(); });
  document.addEventListener('langchange', () => { draw(); text(); });
  draw(); text();
})();
