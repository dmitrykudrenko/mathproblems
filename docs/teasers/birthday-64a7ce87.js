
(() => {
  const root = document.getElementById('tz-bday');
  const L = (uk, e) => document.documentElement.dataset.lang === 'en' ? e : uk;
  const DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const cal = root.querySelector('.bd-cal'), msg = root.querySelector('.tz-msg'), b = root.querySelector('.tz-btn');
  const cells = [];
  DAYS.forEach(n => { for (let d = 0; d < 31; d++) { const c = document.createElement('i'); if (d >= n) c.className = 'x'; else cells.push(c); cal.appendChild(c); } });
  let rooms = 0, total = 0, n = 0, phase = 'idle', timer = null;
  const fast = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function roll() {
    if (phase === 'run') return;
    const cnt = new Uint8Array(365);
    cells.forEach(c => c.className = '');
    n = 0; phase = 'run'; b.disabled = true;
    const step = () => {
      const d = Math.floor(Math.random() * 365);
      cnt[d]++; n++;
      cells[d].className = cnt[d] > 1 ? 'h' : 'p';
      if (cnt[d] > 1) { phase = 'done'; rooms++; total += n; b.disabled = false; text(); return true; }
      text(); return false;
    };
    if (fast()) { while (!step()); return; }
    timer = setInterval(() => { if (step()) clearInterval(timer); }, 60);
  }
  const ukRooms = k => { const a = k % 10, h = k % 100; return a === 1 && h !== 11 ? 'кімнату' : a >= 2 && a <= 4 && (h < 12 || h > 14) ? 'кімнати' : 'кімнат'; };
  function text() {
    if (phase === 'idle') msg.textContent = L('Натисніть «Зібрати кімнату»: люди заходитимуть по одному, доки двоє не виявляться з одним днем народження.', 'Press "Fill a room": people walk in one by one until two of them share a birthday.');
    else if (phase === 'run') msg.textContent = L('Людей у кімнаті: ' + n, 'People in the room: ' + n);
    else msg.textContent = L('Є збіг! Людей у кімнаті: ' + n + '. Середнє за ' + rooms + ' ' + ukRooms(rooms) + ': ' + (total / rooms).toFixed(1).replace('.', ',') + '.', 'A match! People in the room: ' + n + '. Average over ' + rooms + ' room' + (rooms === 1 ? '' : 's') + ': ' + (total / rooms).toFixed(1) + '.');
    b.textContent = L('Зібрати кімнату', 'Fill a room');
  }
  b.addEventListener('click', roll);
  document.addEventListener('langchange', text);
  text();
})();
