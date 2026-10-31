
(() => {
  const root = document.getElementById('tz-simpson-paradox');
  const L = (uk, e) => document.documentElement.dataset.lang === 'en' ? e : uk;
  const P = p => { const s = Math.round(100 * p) + '%'; return s; };
  const bars = root.querySelector('.sp-bars'), msg = root.querySelector('.tz-msg'), acts = root.querySelector('.tz-acts');
  // kidney stones, Charig et al. 1986: [successes, patients] for A and B
  const G = [
    { uk: 'Малі камені', en: 'Small stones', a: [81, 87], b: [234, 270] },
    { uk: 'Великі камені', en: 'Large stones', a: [192, 263], b: [55, 80] },
    { uk: 'Усі разом', en: 'All together', a: [273, 350], b: [289, 350] }
  ];
  let picked = null;
  function row(name, [k, n], win) {
    const p = k / n, c = win ? 'var(--signal)' : 'var(--ink)';
    return '<div style="display:grid;grid-template-columns:22px 1fr 44px;gap:8px;align-items:center;font-size:.86rem">' +
      '<b>' + name + '</b><span style="height:12px;border-radius:6px;background:#ECECEC;overflow:hidden;display:block"><span style="display:block;height:100%;width:' + (100 * p) + '%;background:' + c + ';border-radius:6px"></span></span>' +
      '<b style="text-align:right;color:' + c + '">' + P(p) + '</b></div>';
  }
  function group(g) {
    const a = g.a[0] / g.a[1], b = g.b[0] / g.b[1];
    return '<div style="display:grid;gap:5px"><span style="font-size:.74rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--muted)">' + L(g.uk, g.en) + '</span>' + row('A', g.a, a > b) + row('B', g.b, b > a) + '</div>';
  }
  function text() {
    if (picked === null) {
      bars.innerHTML = group(G[2]);
      msg.textContent = L('Загальні результати двох методів, по 350 пацієнтів. Який оберете?', 'Overall results of two treatments, 350 patients each. Which do you pick?');
      acts.innerHTML = '<button type="button" class="tz-btn" data-t="0" data-solve>' + L('Обрати A', 'Pick A') + '</button><button type="button" class="tz-btn" data-t="1" data-solve>' + L('Обрати B', 'Pick B') + '</button>';
    } else {
      bars.innerHTML = G.map(group).join('');
      msg.textContent = (picked ? L('Ви обрали B. ', 'You picked B. ') : L('Ви обрали A. ', 'You picked A. ')) +
        L('Але A кращий і для малих, і для великих каменів. Просто A частіше отримували складні випадки.', 'Yet A wins for small stones and for large ones. A simply got the hard cases more often.');
      acts.innerHTML = '<button type="button" class="tz-btn" data-t="r">' + L('Спочатку', 'Start over') + '</button>';
    }
  }
  // picking a treatment is the visitor's answer, so the buttons carry data-solve and open the card's answer
  acts.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    // redraw after the click has reached the shared spoiler handler, which needs the button still in the card
    picked = b.dataset.t === 'r' ? null : +b.dataset.t; setTimeout(text);
  });
  document.addEventListener('langchange', text);
  text();
})();
