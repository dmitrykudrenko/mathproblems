
(() => {
  const root = document.getElementById('tz-secretary-problem');
  const L = (uk, e) => document.documentElement.dataset.lang === 'en' ? e : uk;
  // the card is [data-spoil]; the rule's win rate stays hidden until it is solved
  const card = root.closest('[data-spoil]');
  const solved = () => card ? card.classList.contains('solved') : !!(window.mpSolved && mpSolved());
  const N = 10, line = root.querySelector('.sp-line'), msg = root.querySelector('.tz-msg');
  const [bNext, bHire] = root.querySelectorAll('.tz-btn');
  const bars = [];
  for (let i = 0; i < N; i++) {
    const b = document.createElement('i');
    b.style.cssText = 'flex:1;min-width:0;border-radius:4px 4px 2px 2px;transition:height .3s';
    line.appendChild(b); bars.push(b);
  }
  let ranks, pos, hired, games = 0, wins = 0;
  function start() {
    ranks = Array.from({ length: N }, (_, i) => i + 1);
    for (let i = N - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [ranks[i], ranks[j]] = [ranks[j], ranks[i]]; }
    pos = 0; hired = -1; draw();
  }
  const lead = i => ranks.slice(0, i).every(k => k > ranks[i]);
  function draw() {
    const done = hired >= 0;
    bars.forEach((b, i) => {
      let h = 100, bg = '#ECECEC', op = 1, ring = 'none';
      if (done) { h = 100 * (N + 1 - ranks[i]) / N; bg = ranks[i] === 1 ? 'var(--signal)' : 'var(--ink)'; op = ranks[i] === 1 || i === hired ? 1 : .3; if (i === hired) ring = '0 0 0 2px var(--paper), 0 0 0 4px var(--ink)'; }
      else if (i <= pos) {
        let below = 0; for (let j = 0; j <= pos; j++) if (ranks[j] > ranks[i]) below++;
        h = 100 * (below + 1) / (pos + 1); bg = i === pos && lead(i) ? 'var(--signal)' : 'var(--ink)'; op = i === pos ? 1 : .3;
      }
      b.style.height = Math.max(6, h) + '%'; b.style.background = bg; b.style.opacity = op; b.style.boxShadow = ring;
    });
    text();
  }
  function text() {
    if (hired >= 0) {
      const win = ranks[hired] === 1;
      msg.textContent = (win ? L('Найкращий! ', 'The best! ') : L('Не найкращий: місце ' + ranks[hired] + ' з 10. ', 'Not the best: ranked ' + ranks[hired] + ' of 10. ')) +
        L('Перемог: ' + wins + ' з ' + games + '. ', 'Wins: ' + wins + ' of ' + games + '. ') +
        (solved() ? L('Правило «пропусти 3» виграє приблизно в 40% випадків.', 'The rule "skip 3" wins about 40% of the time.')
          : L('Чи є стратегія, яка вигравала б частіше?', 'Is there a strategy that would win more often?'));
      bNext.textContent = L('Нова черга', 'New lineup'); bHire.style.display = 'none';
      return;
    }
    const last = pos === N - 1;
    msg.textContent = L('Кандидат ' + (pos + 1) + ' з 10. ', 'Candidate ' + (pos + 1) + ' of 10. ') +
      (last ? L('Останній: доведеться брати.', 'The last one: you must hire.') : lead(pos) ? L('Найкращий на цей момент!', 'Best so far!') : L('Хтось раніше був кращим.', 'Someone earlier was better.'));
    bNext.textContent = L('Наступний', 'Next'); bNext.style.display = last ? 'none' : '';
    bHire.textContent = L('Найняти', 'Hire'); bHire.style.display = '';
  }
  bNext.addEventListener('click', () => { if (hired >= 0) start(); else if (pos < N - 1) { pos++; draw(); } });
  bHire.addEventListener('click', () => { if (hired >= 0) return; hired = pos; games++; if (ranks[hired] === 1) wins++; draw(); });
  document.addEventListener('langchange', text);
  if (card) new MutationObserver(text).observe(card, { attributes: true, attributeFilter: ['class'] });
  start();
})();
