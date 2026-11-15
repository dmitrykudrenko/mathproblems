// ⟨Колода з 52 карт і одного джокера. Джокер стає будь-якою картою, і власник робить з нього найсильнішу руку. Що трапляється частіше: трійка чи дві пари?|A 52-card deck plus one joker. The joker becomes any card, and its holder makes the strongest hand. Which turns up more often: three of a kind or two pair?⟩
const N = 1000000;                                      // ⟨роздач по 5 карт|five-card deals⟩
const JOKER = 52;                                       // ⟨карти 0–51: ранг c >> 2, масть c & 3|cards 0–51: rank c >> 2, suit c & 3⟩
// ⟨0 старша карта, 1 пара, 2 дві пари, 3 трійка, 4 стрит, 5 флеш, 6 фул-хаус, 7 каре, 8 стрит-флеш, 9 п'ять однакових|0 high card, 1 pair, 2 two pair, 3 three of a kind, 4 straight, 5 flush, 6 full house, 7 four of a kind, 8 straight flush, 9 five of a kind⟩
function kind(h) {
  const n = Array(13).fill(0); h.forEach(c => n[c >> 2]++);
  const k = n.filter(x => x).sort((a, b) => b - a);
  const flush = h.every(c => (c & 3) === (h[0] & 3));
  const r = h.map(c => c >> 2).sort((a, b) => a - b);
  const straight = k.length === 5 && (r[4] - r[0] === 4 || r.join() === '0,1,2,3,12');
  return k[0] === 5 ? 9 : straight && flush ? 8 : k[0] === 4 ? 7 : k[0] === 3 && k[1] === 2 ? 6 : flush ? 5 : straight ? 4 : k[0] === 3 ? 3 : k[0] === 2 && k[1] === 2 ? 2 : k[0] === 2 ? 1 : 0;
}
const ORDERS = { '⟨звичайний порядок|usual order⟩': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], '⟨дві пари вище за трійку|two pair above three of a kind⟩': [0, 1, 3, 2, 4, 5, 6, 7, 8, 9] };
const count = {}; for (const o in ORDERS) count[o] = Array(10).fill(0);
const deck = [...Array(53).keys()];
for (let i = 0; i < N; i++) {
  for (let j = 0; j < 5; j++) { const k = j + Math.floor(Math.random() * (53 - j)); [deck[j], deck[k]] = [deck[k], deck[j]]; }
  const hand = deck.slice(0, 5), rest = hand.filter(c => c !== JOKER);
  // ⟨усі руки, які може дати джокер (він може повторити карту з руки)|every hand the joker can make (it may copy a card in the hand)⟩
  const can = rest.length === 5 ? [kind(rest)] : [...new Set([...Array(52).keys()].map(c => kind([...rest, c])))];
  for (const o in ORDERS) count[o][can.reduce((a, b) => ORDERS[o].indexOf(b) > ORDERS[o].indexOf(a) ? b : a)]++;
}
const pct = x => (100 * x / N).toFixed(2) + '%';
for (const o in ORDERS) console.log(o + ': ⟨дві пари|two pair⟩', pct(count[o][2]), '· ⟨трійка|three of a kind⟩', pct(count[o][3]));
console.log('⟨точно|exact⟩: 4.31% · 4.78% ⟨і|and⟩ 7.18% · 1.91%');
