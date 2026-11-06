
(() => {
  const root = document.getElementById('tz-unexpected-hanging');
  if (!root) return;
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const svg = root.querySelector('svg'), msg = root.querySelector('.tz-msg'), bs = [...root.querySelectorAll('.tz-btn')];
  const D = () => en() ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] : ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'];
  const DL = () => en() ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] : ['понеділок', 'вівторок', 'середу', 'четвер', 'п\'ятницю'];
  // you are the teacher; the student bot picks one morning to say "today!" before you choose, and on Friday it simply knows
  let day = null, call = null, wins = 0, weeks = 0;
  const seal = () => { call = Math.floor(Math.random() * 4); };
  function draw() {
    let h = '';
    D().forEach((d, i) => {
      const x = 14 + i * 68, test = day === i, said = day !== null && call === i;
      h += '<rect x="' + x + '" y="22" width="60" height="64" rx="10" fill="' + (test ? '#2A3DD1' : '#FFFFFF') + '" stroke="#9AA0B0" stroke-width="1.2"/>';
      h += '<text x="' + (x + 30) + '" y="48" text-anchor="middle" font-size="13" font-weight="700" fill="' + (test ? '#F2F4FF' : '#586079') + '">' + d + '</text>';
      if (test) h += '<text x="' + (x + 30) + '" y="74" text-anchor="middle" font-size="18" font-weight="800" fill="#F2F4FF">A+</text>';
      if (said) h += '<text x="' + (x + 30) + '" y="106" text-anchor="middle" font-size="10" fill="#B8611A" font-family="ui-monospace, monospace">' + L('«сьогодні!»', '"today!"') + '</text>';
    });
    svg.innerHTML = h;
  }
  function text() {
    svg.setAttribute('aria-label', L('Тиждень з понеділка по п\'ятницю', 'A week from Monday to Friday'));
    bs.forEach((b, i) => { b.textContent = D()[i]; });
    if (day === null) { msg.textContent = L('Ви вчителька. Учень уже вирішив, якого ранку скаже «сьогодні контрольна!». Оберіть день.', 'You are the teacher. The student has already decided which morning to say "the test is today!". Pick the day.'); return; }
    const surprise = day !== call && day !== 4;
    msg.textContent = (day === 4
      ? L('П\'ятниця: у четвер увечері учень уже знав. ', 'Friday: by Thursday evening the student already knew. ')
      : surprise ? L('Учень казав «сьогодні» в ' + DL()[call] + '. Контрольна в ' + DL()[day] + ' його заскочила. ', 'The student said "today" on ' + DL()[call] + '. The test on ' + DL()[day] + ' took him by surprise. ')
        : L('Учень угадав: «сьогодні!». ', 'The student guessed it: "today!". ')) +
      L('Несподіванок: ' + wins + ' з ' + weeks + '. Ще тиждень?', 'Surprises: ' + wins + ' of ' + weeks + '. Another week?');
  }
  bs.forEach(b => b.addEventListener('click', () => {
    if (day !== null) seal();
    day = +b.dataset.d; weeks++; if (day !== call && day !== 4) wins++;
    draw(); text();
  }));
  document.addEventListener('langchange', () => { draw(); text(); });
  seal(); draw(); text();
})();
