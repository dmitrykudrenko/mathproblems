
(() => {
  const root = document.getElementById('tz-poisoned-wine');
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  // the rats' weights are the binary trick behind the answer, so they show only once the card is solved
  const card = root.closest('[data-spoil]'), solved = () => !card || card.classList.contains('solved');
  const [rack, row] = root.querySelectorAll('div[style]'), msg = root.querySelector('.tz-msg'), btn = root.querySelector('.tz-btn');
  // bottle n is read from three rats with weights 1, 2, 4; bottle 8 is 000
  const drinks = r => [1, 2, 3, 4, 5, 6, 7, 8].filter(n => (n % 8) >> r & 1);
  let pois = 0, stage = 0, pick = 0, right = 0, tries = 0, timer = null;
  function rat(dead) {
    const c = dead ? '#9A9A9A' : 'var(--ink)';
    const g = '<path d="M9 17.5C4.5 18.5 3 15.5 4 12" fill="none" stroke="' + c + '" stroke-width="1.6" stroke-linecap="round"/><path d="M15 21v4M22 21v4" stroke="' + c + '" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="18.5" cy="16.5" rx="10" ry="6" fill="' + c + '"/><ellipse cx="28.5" cy="15" rx="5.6" ry="4" fill="' + c + '"/><circle cx="26" cy="10.6" r="2.8" fill="' + c + '"/><circle cx="31.8" cy="14.3" r="1.1" fill="#fff"/>';
    return '<svg viewBox="0 0 38 28" width="44" height="32" aria-hidden="true">' + (dead ? '<g transform="translate(0 30) scale(1 -1)">' + g + '</g>' : g) + '</svg>';
  }
  function draw() {
    rack.innerHTML = '';
    for (let n = 1; n <= 8; n++) {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = n;
      const show = stage === 3 && n === pois, mine = stage === 3 && n === pick;
      b.disabled = stage !== 2;
      b.style.cssText = 'font:600 .85rem/1 ui-monospace,Menlo,monospace;height:52px;border-radius:12px 12px 8px 8px;cursor:' + (stage === 2 ? 'pointer' : 'default') + ';border:1.5px solid ' + (show ? 'var(--signal)' : mine ? 'var(--ink)' : '#D3D8E5') + ';background:' + (show ? 'var(--signal)' : '#fff') + ';color:' + (show ? '#fff' : 'var(--ink)');
      b.addEventListener('click', () => { pick = n; stage = 3; tries++; if (n === pois) right++; text(); });
      rack.appendChild(b);
    }
    row.innerHTML = [0, 1, 2].map(r => {
      const dead = stage >= 2 && (pois % 8) >> r & 1;
      const lab = stage === 0 ? L('щур ', 'rat ') + (r + 1) : drinks(r).join(' ');
      return '<div style="display:grid;justify-items:center;gap:2px;font:500 .72rem/1.3 ui-monospace,Menlo,monospace;color:#5F5F5F;max-width:100px;text-align:center">' + rat(dead) + '<span>' + lab + '</span>' + (stage === 3 && solved() ? '<b style="color:var(--ink)">' + L('вага ', 'weight ') + 2 ** r + '</b>' : '') + '</div>';
    }).join('');
  }
  function text() {
    draw();
    btn.textContent = stage === 0 ? L('Отруїти випадкову пляшку', 'Poison a random bottle') : L('Ще раз', 'Again');
    btn.disabled = stage === 1;
    if (stage === 0) msg.textContent = L('8 пляшок і 3 щури. Натисніть кнопку: одна пляшка стане отруєною, і щури скуштують вино.', '8 bottles and 3 rats. Press the button: one bottle becomes poisoned, and the rats taste the wine.');
    else if (stage === 1) msg.textContent = L('Щури п\'ють… чекаємо 20 годин.', 'The rats drink… waiting 20 hours.');
    else if (stage === 2) msg.textContent = L('Під кожним щуром пляшки, з яких він пив. Хто з них помер? Яка пляшка отруєна? Клацніть її.', 'Under each rat are the bottles it drank from. Which rats died? Which bottle is poisoned? Click it.');
    else {
      const dead = [0, 1, 2].filter(r => (pois % 8) >> r & 1).map(r => 2 ** r);
      msg.textContent = (pick === pois ? L('Так, пляшка ' + pois + '! ', 'Yes, bottle ' + pois + '! ') : L('Ні, отруєна пляшка ' + pois + '. ', 'No, bottle ' + pois + ' is poisoned. ')) +
        (!solved() ? (dead.length === 3 ? L('Лише з неї пили всі три щури. ', 'It is the only bottle all three rats drank from. ') : dead.length ? L('Лише з неї пили всі мертві щури й жоден живий. ', 'It is the only bottle that every dead rat and no live rat drank from. ') : L('Лише з неї не пив жоден щур. ', 'It is the only bottle no rat drank from. ')) :
        dead.length === 1 ? L('Помер лише щур із вагою ' + dead[0] + '. ', 'Only the rat with weight ' + dead[0] + ' died. ') : dead.length ? L('Ваги мертвих щурів: ' + dead.join(' + ') + ' = ' + pois + '. ', 'The dead rats\' weights: ' + dead.join(' + ') + ' = ' + pois + '. ') : L('Ніхто не помер, а таке буває лише з пляшкою 8. ', 'Nobody died, which happens only for bottle 8. ')) +
        L('Влучань: ' + right + ' з ' + tries + '.', 'Hits: ' + right + ' of ' + tries + '.');
    }
  }
  btn.addEventListener('click', () => {
    clearTimeout(timer);
    pois = 1 + Math.floor(Math.random() * 8); pick = 0;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { stage = 2; text(); return; }
    stage = 1; text();
    timer = setTimeout(() => { stage = 2; text(); }, 900);
  });
  document.addEventListener('langchange', text);
  if (card) new MutationObserver(text).observe(card, { attributes: true, attributeFilter: ['class'] });
  text();
})();
