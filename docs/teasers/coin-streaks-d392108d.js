
(() => {
  const root = document.getElementById('tz-coin-streaks');
  const L = (uk, e) => document.documentElement.dataset.lang === 'en' ? e : uk;
  // the theoretical share is the answer, so it shows only once the card is solved
  const card = root.closest('[data-spoil]'), solved = () => !!card && card.classList.contains('solved');
  const grid = root.querySelector('[aria-hidden]'), msg = root.querySelector('.tz-msg'), b = root.querySelector('.tz-btn');
  const cells = Array.from({ length: 100 }, () => { const c = document.createElement('i'); c.style.cssText = 'aspect-ratio:1;border-radius:50%;border:2px solid var(--ink)'; grid.appendChild(c); return c; });
  const pl = (n, a, f, m) => { const x = n % 10, y = n % 100; return x === 1 && y !== 11 ? a : x >= 2 && x <= 4 && (y < 12 || y > 14) ? f : m; };
  let seq = [], best = 0, start = 0, rounds = 0, six = 0;
  function roll() {
    seq = Array.from({ length: 100 }, () => Math.random() < 0.5 ? 1 : 0);
    best = 1; start = 0; let cur = 1;
    for (let i = 1; i < 100; i++) { cur = seq[i] === seq[i - 1] ? cur + 1 : 1; if (cur > best) { best = cur; start = i - cur + 1; } }
    cells.forEach((c, i) => {
      const run = i >= start && i < start + best, h = seq[i];
      c.style.background = run ? (h ? 'var(--signal)' : 'var(--signal-soft)') : (h ? 'var(--ink)' : 'var(--paper)');
      c.style.borderColor = run ? 'var(--signal)' : 'var(--ink)';
    });
    rounds++; if (best >= 6) six++;
    text();
  }
  function text() {
    if (!rounds) { msg.textContent = L('Натисніть «Кинути 100 разів» і подивіться, якою буде найдовша серія.', 'Press "Flip 100 times" and see how long the longest run is.'); b.textContent = L('Кинути 100 разів', 'Flip 100 times'); return; }
    const h = seq[start];
    msg.textContent = L('Найдовша серія: ' + best + ' ' + (h ? pl(best, 'орел', 'орли', 'орлів') : pl(best, 'решка', 'решки', 'решок')) + ' поспіль. Серія з 6+ була в ' + six + ' з ' + rounds + ' ' + pl(rounds, 'спроби', 'спроб', 'спроб') + (solved() ? ' (теорія 81%).' : '.'),
      'Longest run: ' + best + ' ' + (h ? 'heads' : 'tails') + ' in a row. A run of 6+ in ' + six + ' of ' + rounds + (rounds === 1 ? ' try' : ' tries') + (solved() ? ' (theory 81%).' : '.'));
    b.textContent = L('Ще 100 кидків', 'Another 100 flips');
  }
  b.addEventListener('click', roll);
  document.addEventListener('langchange', text);
  if (card) new MutationObserver(text).observe(card, { attributes: true, attributeFilter: ['class'] });
  text();
})();
