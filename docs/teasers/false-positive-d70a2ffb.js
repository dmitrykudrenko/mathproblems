
(() => {
  const root = document.getElementById('tz-false-positive');
  const L = (uk, e) => document.documentElement.dataset.lang === 'en' ? e : uk;
  const grid = root.querySelector('.bd-cal'), msg = root.querySelector('.tz-msg'), [bShow, bNew] = root.querySelectorAll('.tz-btn');
  const cells = Array.from({ length: 1000 }, () => grid.appendChild(document.createElement('i')));
  // each person: ill with chance 1%; the test is right 99% of the time for both ill and healthy people
  let people = [], shown = false, totPos = 0, totIll = 0;
  function roll() {
    people = cells.map(() => { const ill = Math.random() < 0.01; return { ill, pos: Math.random() < (ill ? 0.99 : 0.01) }; });
    shown = false; draw(); text();
  }
  function draw() {
    people.forEach((p, i) => { cells[i].className = !p.pos ? '' : shown && p.ill ? 'h' : 'p'; });
  }
  const counts = () => { let pos = 0, ill = 0; people.forEach(p => { if (p.pos) { pos++; if (p.ill) ill++; } }); return [pos, ill]; };
  const pc = (a, b) => b ? Math.round(100 * a / b) + '%' : '–';
  function text() {
    const [pos, ill] = counts();
    msg.textContent = !shown
      ? L('1 000 людей, тест точний на 99%. Позитивних результатів: ' + pos + '. Скільки з цих людей справді хворі?', '1,000 people, a 99% accurate test. Positive results: ' + pos + '. How many of them are really ill?')
      : L('Хворих серед позитивних: ' + ill + ' з ' + pos + ' (' + pc(ill, pos) + '). За всі спроби: ' + totIll + ' з ' + totPos + ' (' + pc(totIll, totPos) + ').',
          'Ill among positives: ' + ill + ' of ' + pos + ' (' + pc(ill, pos) + '). All tries: ' + totIll + ' of ' + totPos + ' (' + pc(totIll, totPos) + ').');
    bShow.textContent = L('Показати, хто хворий', 'Show who is ill');
    bNew.textContent = L('Нова тисяча людей', 'New 1,000 people');
    bShow.disabled = shown;
    bShow.style.opacity = shown ? '.45' : '';
  }
  bShow.addEventListener('click', () => {
    if (shown) return;
    const [pos, ill] = counts();
    shown = true; totPos += pos; totIll += ill; draw(); text();
  });
  bNew.addEventListener('click', roll);
  document.addEventListener('langchange', text);
  roll();
})();
