
(() => {
  const root = document.getElementById('tz-penney-game');
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const [pick, strip] = root.querySelectorAll('div[style]'), msg = root.querySelector('.tz-msg'), btn = root.querySelector('.tz-btn');
  const P = ['HHH', 'HHT', 'HTH', 'HTT', 'THH', 'THT', 'TTH', 'TTT'];
  const show = s => en() ? s : s.replace(/H/g, 'О').replace(/T/g, 'Р');
  const opp = c => c === 'H' ? 'T' : 'H';
  let me = null, cp = null, seq = '', winner = null, wins = 0, losses = 0, timer = null;
  function buttons() {
    pick.innerHTML = '';
    P.forEach(p => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = show(p);
      const on = p === me, c = p === cp;
      b.style.cssText = 'font:600 .9rem/1 ui-monospace,Menlo,monospace;letter-spacing:.12em;padding:9px 2px;border-radius:10px;cursor:pointer;border:1.5px solid ' + (c ? 'var(--signal)' : on ? 'var(--ink)' : '#D3D8E5') + ';background:' + (on ? 'var(--ink)' : '#fff') + ';color:' + (on ? '#fff' : c ? 'var(--signal)' : 'var(--ink)');
      b.addEventListener('click', () => play(p));
      pick.appendChild(b);
    });
  }
  function coins() {
    strip.innerHTML = '';
    [...seq].forEach((c, i) => {
      const k = document.createElement('i'), last = winner && i >= seq.length - 3;
      k.textContent = show(c);
      k.style.cssText = 'font:600 .7rem/1 ui-monospace,Menlo,monospace;font-style:normal;width:24px;height:24px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;border:2px solid var(--ink);' +
        (c === 'H' ? 'background:var(--ink);color:#fff;' : 'background:#fff;color:var(--ink);') + (last ? 'box-shadow:0 0 0 2px #fff,0 0 0 4px ' + (winner === 'cp' ? 'var(--signal)' : 'var(--ink)') : '');
      strip.appendChild(k);
    });
  }
  function text() {
    buttons(); coins();
    btn.hidden = !me || !winner;
    btn.textContent = L('Ще раз з ' + (me ? show(me) : ''), 'Again with ' + (me ? show(me) : ''));
    if (!me) { msg.textContent = L('Оберіть свою трійку. Комп\'ютер обере після вас, і монета вирішить, чия трійка випаде першою.', 'Pick your pattern. The computer picks after you, and the coin decides whose pattern comes up first.'); return; }
    if (!winner) { msg.textContent = L('Ви: ' + show(me) + ' · комп\'ютер: ' + show(cp) + ' · кидок ' + seq.length, 'You: ' + show(me) + ' · computer: ' + show(cp) + ' · flip ' + seq.length); return; }
    msg.textContent = (winner === 'me' ? L('Ви виграли! ', 'You win! ') : L('Виграв комп\'ютер з ' + show(cp) + '. ', 'The computer wins with ' + show(cp) + '. ')) +
      L('Рахунок: ви ' + wins + ', комп\'ютер ' + losses + '.', 'Score: you ' + wins + ', computer ' + losses + '.');
  }
  function play(p) {
    clearInterval(timer);
    me = p; cp = opp(p[1]) + p[0] + p[1]; seq = ''; winner = null;
    const step = () => {
      seq += Math.random() < .5 ? 'H' : 'T';
      if (seq.endsWith(me)) winner = 'me'; else if (seq.endsWith(cp)) winner = 'cp';
      if (winner) { clearInterval(timer); if (winner === 'me') wins++; else losses++; }
      text();
    };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { while (!winner) step(); return; }
    text(); timer = setInterval(step, 160);
  }
  btn.addEventListener('click', () => play(me));
  document.addEventListener('langchange', text);
  text();
})();
