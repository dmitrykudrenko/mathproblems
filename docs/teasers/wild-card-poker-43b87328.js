
(() => {
  const root = document.getElementById('tz-wild-card-poker');
  const en = () => document.documentElement.dataset.lang === 'en';
  const L = (uk, e) => en() ? e : uk;
  const row = root.querySelector('div[style]'), msg = root.querySelector('.tz-msg'), btn = root.querySelector('.tz-btn');
  // cards 0–51: rank c >> 2, suit c & 3; 52 is the joker, which becomes the card giving the strongest hand
  const RK = () => en() ? ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'] : ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'В', 'Д', 'К', 'Т'];
  const SU = ['♠', '♥', '♦', '♣'];
  const NM = () => en() ? ['high card', 'one pair', 'two pair', 'three of a kind', 'straight', 'flush', 'full house', 'four of a kind', 'straight flush', 'five of a kind']
    : ['старша карта', 'пара', 'дві пари', 'трійка', 'стрит', 'флеш', 'фул-хаус', 'каре', 'стрит-флеш', 'п\'ять однакових'];
  function kind(h) {
    const n = Array(13).fill(0); h.forEach(c => n[c >> 2]++);
    const k = n.filter(x => x).sort((a, b) => b - a), fl = h.every(c => (c & 3) === (h[0] & 3));
    const r = h.map(c => c >> 2).sort((a, b) => a - b), st = k.length === 5 && (r[4] - r[0] === 4 || r.join() === '0,1,2,3,12');
    return k[0] === 5 ? 9 : st && fl ? 8 : k[0] === 4 ? 7 : k[0] === 3 && k[1] === 2 ? 6 : fl ? 5 : st ? 4 : k[0] === 3 ? 3 : k[0] === 2 && k[1] === 2 ? 2 : k[0] === 2 ? 1 : 0;
  }
  let hand = null, as = null, best = 0, n = 0, joker = 0;
  function deal() {
    const d = Array.from({ length: 53 }, (_, i) => i);
    for (let j = 0; j < 5; j++) { const k = j + Math.floor(Math.random() * (53 - j)); [d[j], d[k]] = [d[k], d[j]]; }
    hand = d.slice(0, 5); const rest = hand.filter(c => c !== 52);
    as = null; best = rest.length === 5 ? kind(rest) : -1;
    if (rest.length < 5) for (let c = 0; c < 52; c++) { const k = kind([...rest, c]); if (k > best) { best = k; as = c; } }
    n++; if (as !== null) joker++;
    text();
  }
  function card(c, j) {
    const red = c !== 52 && ((c & 3) === 1 || (c & 3) === 2);
    const st = 'width:40px;height:56px;border-radius:7px;display:grid;place-items:center;align-content:center;gap:1px;font:600 .95rem/1 ui-monospace,Menlo,monospace;border:1.5px solid ' + (j ? '#6B3FA0' : '#D3D8E5') + ';background:' + (c === 52 ? '#6B3FA0' : '#fff') + ';color:' + (c === 52 ? '#fff' : red ? '#C8322B' : '#141A30');
    return '<span style="' + st + '">' + (c === 52 ? '★' : RK()[c >> 2] + '<br>' + SU[c & 3]) + '</span>';
  }
  function text() {
    btn.textContent = hand ? L('Ще роздача', 'Deal again') : L('Роздати', 'Deal');
    if (!hand) { row.innerHTML = ''; msg.textContent = L('Колода з 52 карт і джокера. Роздайте руку: джокер приходить приблизно раз на десять роздач.', 'A 52-card deck plus a joker. Deal a hand: the joker comes about once in ten deals.'); return; }
    row.innerHTML = hand.map(c => c === 52 && as !== null ? card(as, true) : card(c)).join('');
    msg.textContent = (as !== null ? L('Джокер став ' + RK()[as >> 2] + SU[as & 3] + ': ', 'The joker became ' + RK()[as >> 2] + SU[as & 3] + ': ') : '') + NM()[best] + '. ' +
      L('Роздач: ' + n + ', з джокером: ' + joker + '.', 'Deals: ' + n + ', with the joker: ' + joker + '.');
  }
  btn.addEventListener('click', deal);
  document.addEventListener('langchange', text);
  text();
})();
