
(() => {
  const root = document.getElementById('tz-german-tank-problem');
  const L = (uk, e) => document.documentElement.dataset.lang === 'en' ? e : uk;
  const box = root.querySelector('[aria-live]'), msg = root.querySelector('.tz-msg'), b = root.querySelector('.tz-btn');
  let N = 0, seen = [], shown = false, games = 0, closer = 0;
  const K = 4;
  function fresh() { N = 80 + Math.floor(Math.random() * 521); seen = []; shown = false; }
  function plate(v, dark, col) {
    const s = document.createElement('span');
    s.textContent = v;
    s.style.cssText = 'font-weight:700;font-variant-numeric:tabular-nums;border:2px solid ' + (col || 'var(--ink)') + ';border-radius:6px;padding:4px 10px;min-width:52px;text-align:center;background:' + (dark ? (col || 'var(--ink)') : 'var(--paper)') + ';color:' + (dark ? '#fff' : 'var(--ink)');
    return s;
  }
  function draw() {
    box.textContent = '';
    seen.forEach((v, i) => box.appendChild(plate(v, i === seen.length - 1 && !shown)));
    if (shown) box.appendChild(plate('N = ' + N, true, 'var(--signal)'));
  }
  function step() {
    if (!N || shown) fresh();
    if (seen.length < K) {
      let x; do { x = 1 + Math.floor(Math.random() * N); } while (seen.includes(x));
      seen.push(x);
    } else {
      shown = true; games++;
      const m = Math.max(...seen), f = Math.round(m + m / K - 1);
      if (Math.abs(f - N) < Math.abs(m - N)) closer++;
    }
    draw(); text();
  }
  function text() {
    if (!N) { msg.textContent = L('Завод випустив невідому кількість танків. Захопіть кілька й подумайте, скільки їх усього.', 'A factory built an unknown number of tanks. Capture a few and think how many there are in all.'); b.textContent = L('Захопити танк', 'Capture a tank'); return; }
    const k = seen.length, m = Math.max(...seen), f = Math.round(m + m / K - 1);
    if (shown) {
      msg.textContent = L('Справжнє N = ' + N + '. Найбільший номер ' + m + ' (помилка ' + Math.abs(N - m) + '), формула ' + f + ' (помилка ' + Math.abs(N - f) + '). Формула ближча за максимум: ' + closer + ' з ' + games + '.',
        'The true N = ' + N + '. Largest number ' + m + ' (off by ' + Math.abs(N - m) + '), formula ' + f + ' (off by ' + Math.abs(N - f) + '). Formula closer than the maximum: ' + closer + ' of ' + games + '.');
      b.textContent = L('Новий завод', 'New factory');
    } else if (k < K) {
      msg.textContent = L('Номер ' + seen[k - 1] + '. Захоплено ' + k + ' з ' + K + '.', 'Number ' + seen[k - 1] + '. Captured ' + k + ' of ' + K + '.');
      b.textContent = L('Захопити ще', 'Capture another');
    } else {
      msg.textContent = L('Найбільший номер m = ' + m + '. Оцінка за формулою m + m/4 − 1 = ' + f + '.', 'Largest number m = ' + m + '. The formula m + m/4 − 1 gives ' + f + '.');
      b.textContent = L('Показати справжнє N', 'Reveal the true N');
    }
  }
  b.addEventListener('click', step);
  document.addEventListener('langchange', text);
  text();
})();
