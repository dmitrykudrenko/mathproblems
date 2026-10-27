
(() => {
  const root = document.getElementById('tz-monty');
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const doors = [...root.querySelectorAll('.mh-door')], msg = root.querySelector('.tz-msg'), acts = root.querySelector('.tz-acts');
  const goat = '<svg viewBox="0 0 48 36" aria-hidden="true"><g fill="currentColor"><ellipse cx="21" cy="19" rx="13" ry="7.5"/><rect x="10" y="22" width="3" height="12" rx="1.5"/><rect x="15.5" y="23" width="3" height="11" rx="1.5"/><rect x="24" y="23" width="3" height="11" rx="1.5"/><rect x="29.5" y="22" width="3" height="12" rx="1.5"/><path d="M30 15l5-7 4 2-4 9z"/><ellipse cx="39.5" cy="11.5" rx="5.5" ry="4" transform="rotate(25 39.5 11.5)"/></g></svg>';
  const car = '<svg viewBox="0 0 48 28" aria-hidden="true"><path fill="currentColor" d="M3 21v-5c0-2 1.5-3.5 3.5-3.5H11l5.5-7c.7-.9 1.7-1.5 2.9-1.5h11.2c1.2 0 2.2.6 2.9 1.5l5 7h3c2.2 0 3.5 1.6 3.5 3.5v5z"/><circle cx="13" cy="21.5" r="4.5" fill="currentColor"/><circle cx="36" cy="21.5" r="4.5" fill="currentColor"/></svg>';
  let s;
  const btn = (t, f) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'tz-btn'; b.textContent = t; b.onclick = f; acts.appendChild(b); };
  function reset() {
    s = { car: Math.floor(Math.random() * 3), pick: null, open: null, phase: 'pick' };
    doors.forEach((d, i) => { d.className = 'mh-door'; d.querySelector('.mh-behind').innerHTML = i === s.car ? car : goat; d.querySelector('.mh-behind').classList.toggle('car', i === s.car); });
    text();
  }
  function text() {
    acts.innerHTML = '';
    if (s.phase === 'pick') msg.textContent = L('Оберіть двері.', 'Pick a door.');
    else if (s.phase === 'decide') {
      const other = 3 - s.pick - s.open;
      msg.textContent = L('Ведучий відчинив №' + (s.open + 1) + ': коза. Змінити на №' + (other + 1) + '?', 'The host opened #' + (s.open + 1) + ': a goat. Switch to #' + (other + 1) + '?');
      btn(L('Залишитись', 'Stay'), () => finish(s.pick));
      btn(L('Змінити', 'Switch'), () => finish(other));
    } else if (s.phase === 'done') {
      msg.textContent = (s.final === s.car ? L('Авто ваше!', 'You won the car!') : L('Коза. Авто було за №' + (s.car + 1) + '.', 'A goat. The car was behind #' + (s.car + 1) + '.')) +
        ' ' + (s.final === s.pick ? L('Ви залишились.', 'You stayed.') : L('Ви змінили вибір.', 'You switched.'));
      btn(L('Ще раз', 'Again'), reset);
    }
  }
  function finish(f) {
    s.final = f; s.phase = 'done';
    doors.forEach(d => d.classList.add('open'));
    doors.forEach((d, i) => d.classList.toggle('picked', i === f));
    text();
  }
  doors.forEach((d, i) => d.addEventListener('click', () => {
    if (s.phase !== 'pick') return;
    s.pick = i; s.phase = 'wait'; d.classList.add('picked');
    const c = [0, 1, 2].filter(j => j !== i && j !== s.car);
    s.open = c[Math.floor(Math.random() * c.length)];
    setTimeout(() => { doors[s.open].classList.add('open'); s.phase = 'decide'; text(); }, 350);
  }));
  document.addEventListener('langchange', () => s.phase !== 'wait' && text());
  reset();
})();
