
(() => {
  const root = document.getElementById('tz-benford-law');
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const grid = root.querySelector('[aria-hidden]'), msg = root.querySelector('.tz-msg'), btns = root.querySelectorAll('.tz-btn');
  const BEN = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => Math.log10(1 + 1 / d)), TOP = 0.4;
  const cols = BEN.map((_, i) => {
    const c = document.createElement('div');
    c.style.cssText = 'display:grid;gap:4px;justify-items:center';
    c.innerHTML = '<div style="position:relative;width:100%;height:110px;border-bottom:1.5px solid var(--ink)"><i style="position:absolute;left:18%;right:18%;bottom:0;height:0;border-radius:4px 4px 0 0;transition:height .25s"></i><s style="position:absolute;left:4%;right:4%;height:0;border-top:2px dashed var(--ink);display:none"></s></div><b style="font-size:.85rem">' + (i + 1) + '</b>';
    grid.appendChild(c);
    return { bar: c.querySelector('i'), ref: c.querySelector('s') };
  });
  let n = 0, p = 1n, last = '', c = Array(9).fill(0);
  function add(k) {
    for (let i = 0; i < k; i++) {
      if (n >= 1000) { n = 0; p = 1n; c = Array(9).fill(0); }
      p *= 2n; n++; last = p.toString(); c[last.charCodeAt(0) - 49]++;
    }
    draw(); text();
  }
  function draw() {
    cols.forEach((col, i) => {
      const s = n ? c[i] / n : 0;
      col.bar.style.height = Math.min(100, s / TOP * 100) + '%';
      col.bar.style.background = i === 0 ? 'var(--signal)' : 'var(--ink)';
      col.bar.style.opacity = i === 0 ? '1' : '.3';
      col.ref.style.display = n ? 'block' : 'none';
      col.ref.style.bottom = (BEN[i] / TOP * 100) + '%';
    });
  }
  function text() {
    btns[1].hidden = !n;
    if (!n) {
      msg.textContent = L('Натисніть «Наступний степінь» і стежте за першими цифрами чисел 2, 4, 8, 16, …', 'Press "Next power" and watch the first digits of 2, 4, 8, 16, …');
      btns[0].textContent = L('Наступний степінь', 'Next power');
      return;
    }
    const d = s => en() ? s : s.replace('.', ',');
    const k = last.length, a = k % 10, b = k % 100, w = a === 1 && b !== 11 ? 'цифра' : a >= 2 && a <= 4 && (b < 12 || b > 14) ? 'цифри' : 'цифр';
    const shown = k > 12 ? last.slice(0, 10) + '… (' + k + ' ' + L(w, 'digits') + ')' : last;
    const ex = String(n).replace(/./g, ch => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+ch]);
    msg.textContent = L('2' + ex + ' = ' + shown + '. З одиниці: ' + c[0] + ' з ' + n + ' (' + d((100 * c[0] / n).toFixed(1)) + '%). Пунктир: закон Бенфорда, 30,1% для одиниці.',
      '2' + ex + ' = ' + shown + '. ' + c[0] + ' of ' + n + ' start with 1 (' + (100 * c[0] / n).toFixed(1) + '%). Dashed lines: Benford\'s law, 30.1% for 1.');
    btns[0].textContent = L('Наступний степінь', 'Next power');
    btns[1].textContent = L('+50 степенів', '+50 powers');
  }
  btns.forEach(b => b.addEventListener('click', () => add(+b.dataset.k)));
  document.addEventListener('langchange', text);
  draw(); text();
})();
