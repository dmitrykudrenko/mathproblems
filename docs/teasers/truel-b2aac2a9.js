
(() => {
  const root = document.getElementById('tz-truel');
  if (!root) return;
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const box = root.querySelector('div[style]'), msg = root.querySelector('.tz-msg'), btns = root.querySelectorAll('.tz-btn');
  const ACC = [1 / 3, 2 / 3, 1], N = 1000;
  // you are Ann and pick her first shot (-1 = into the air, 1 = Bob, 2 = Sam); Bob and Sam shoot at each other, the last two shoot each other
  let pick = null, wins = null;
  function play(first) {
    const w = [0, 0, 0];
    for (let r = 0; r < N; r++) {
      const alive = [1, 1, 1];
      let n = 3, k = 0;
      while (n > 1) {
        const i = k++ % 3;
        if (!alive[i]) continue;
        const t = n === 3 ? (i === 0 ? first : 3 - i) : [0, 1, 2].find(j => j !== i && alive[j]);
        if (t < 0) continue;
        if (Math.random() < ACC[i]) { alive[t] = 0; n--; }
      }
      w[alive.indexOf(1)]++;
    }
    return w;
  }
  const name = i => en() ? ['Ann', 'Bob', 'Sam'][i] : ['Аня', 'Борис', 'Сергій'][i];
  function draw() {
    const fr = ['1/3', '2/3', '1'];
    let h = '<svg viewBox="0 0 300 170" width="100%" aria-hidden="true" style="display:block">';
    const P = [[60, 120], [150, 40], [240, 120]];
    [[0, 1], [1, 2], [0, 2]].forEach(([a, b]) => { h += '<line x1="' + P[a][0] + '" y1="' + P[a][1] + '" x2="' + P[b][0] + '" y2="' + P[b][1] + '" stroke="#C9C9C9" stroke-width="2" stroke-dasharray="5 5"/>'; });
    P.forEach(([x, y], i) => {
      const share = wins ? wins[i] / N : 0;
      h += '<circle cx="' + x + '" cy="' + y + '" r="22" fill="#fff" stroke="var(--ink)" stroke-width="2"/>';
      h += '<text x="' + x + '" y="' + (y + 5) + '" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-size="13" font-weight="700" fill="var(--ink)">' + fr[i] + '</text>';
      h += '<text x="' + x + '" y="' + (y + 40) + '" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-size="11" font-weight="600" fill="var(--ink)">' + name(i) + (wins ? ' ' + Math.round(100 * share) + '%' : '') + '</text>';
    });
    if (pick !== null) {
      const [x, y] = P[0];
      h += pick < 0 ? '<line x1="' + x + '" y1="' + (y - 24) + '" x2="' + x + '" y2="' + (y - 70) + '" stroke="var(--signal)" stroke-width="3" stroke-dasharray="5 4"/>'
        : '<line x1="' + x + '" y1="' + y + '" x2="' + P[pick][0] + '" y2="' + P[pick][1] + '" stroke="var(--signal)" stroke-width="3"/>';
    }
    box.innerHTML = h + '</svg>';
  }
  function text() {
    draw();
    btns[0].textContent = L('У повітря', 'Into the air');
    btns[1].textContent = L('У Бориса', 'At Bob');
    btns[2].textContent = L('У Сергія', 'At Sam');
    if (pick === null) { msg.textContent = L('Ви Аня і стріляєте першою. Куди ваш перший постріл? Розіграємо 1000 труелей.', 'You are Ann and shoot first. Where does your first shot go? We will play 1,000 truels.'); return; }
    const where = pick < 0 ? L('у повітря', 'into the air') : pick === 1 ? L('у Бориса', 'at Bob') : L('у Сергія', 'at Sam');
    msg.textContent = L('Перший постріл ' + where + ': Аня вижила в ' + wins[0] + ' труелях із 1000. Спробуйте інші варіанти.', 'First shot ' + where + ': Ann survived ' + wins[0] + ' truels out of 1,000. Try the other options.');
  }
  btns.forEach((b, k) => b.addEventListener('click', () => { pick = [-1, 1, 2][k]; wins = play(pick); text(); }));
  document.addEventListener('langchange', text);
  text();
})();
