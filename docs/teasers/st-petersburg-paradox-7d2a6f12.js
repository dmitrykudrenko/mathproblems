
(() => {
  const root = document.getElementById('tz-st-petersburg-paradox');
  const L = (uk, e) => document.documentElement.dataset.lang === 'en' ? e : uk;
  const row = root.querySelector('[aria-hidden]'), msg = root.querySelector('.tz-msg'), b = root.querySelector('.tz-btn');
  const fmt = n => n.toLocaleString(L('uk-UA', 'en-US'), { maximumFractionDigits: 2, minimumFractionDigits: n % 1 ? 2 : 0 });
  let k = 0, n = 0, sum = 0, best = 0;
  function coins() {
    row.innerHTML = '';
    for (let i = 0; i < k; i++) {
      const t = i === k - 1, c = document.createElement('i');
      c.textContent = t ? L('Р', 'T') : L('О', 'H');
      c.style.cssText = 'width:30px;height:30px;border-radius:50%;display:inline-grid;place-items:center;font-style:normal;font-weight:700;font-size:.8rem;border:2px solid var(--ink);' + (t ? 'background:var(--paper);color:var(--ink)' : 'background:var(--ink);color:var(--paper)');
      row.appendChild(c);
    }
  }
  function play() {
    k = 1; while (Math.random() < 0.5) k++;
    const w = 2 ** k; n++; sum += w; if (w > best) best = w;
    coins(); text();
  }
  function text() {
    if (!n) { msg.textContent = L('Натисніть «Зіграти», щоб підкидати монету до першої решки.', 'Press "Play" to flip the coin until the first tails.'); b.textContent = L('Зіграти', 'Play'); return; }
    coins();
    msg.textContent = L('Решка на ' + k + '-му кидку: виграш $' + fmt(2 ** k) + '. Ігор: ' + n + ', середній виграш $' + fmt(Math.round(sum / n * 100) / 100) + ', найбільший $' + fmt(best) + '.',
      'Tails on flip ' + k + ': you win $' + fmt(2 ** k) + '. ' + n + ' ' + (n === 1 ? 'game' : 'games') + ', mean win $' + fmt(Math.round(sum / n * 100) / 100) + ', biggest $' + fmt(best) + '.');
    b.textContent = L('Ще одна гра', 'Play again');
  }
  b.addEventListener('click', play);
  document.addEventListener('langchange', text);
  text();
})();
