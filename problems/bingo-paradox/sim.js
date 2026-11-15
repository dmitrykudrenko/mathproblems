// ⟨Бінго на 75 куль: 500 карток у залі, виграє перший повний рядок або стовпець. Якою лінією частіше виграє перша картка?|75-ball bingo: 500 cards in the hall, the first full row or column wins. Which line does the first winning card have more often?⟩
const CARDS = 500, GAMES = 20000;
// ⟨k різних чисел з n поспіль, починаючи з from, у випадковому порядку|k different numbers out of n in a row starting at from, in random order⟩
function pick(from, n, k) {
  const a = Array.from({ length: n }, (_, i) => from + i);
  for (let i = 0; i < k; i++) { const j = i + Math.floor(Math.random() * (n - i)); [a[i], a[j]] = [a[j], a[i]]; }
  return a.slice(0, k);
}
// ⟨картка: 5 стовпців B I N G O, у кожному 5 чисел зі свого п'ятнадцятка; центр вільний (0 = вже закрито)|a card: 5 columns B I N G O, each with 5 numbers from its own fifteen; the centre is free (0 = already marked)⟩
const card = () => [0, 1, 2, 3, 4].map(c => { const col = pick(15 * c + 1, 15, 5); if (c === 2) col[2] = 0; return col; });
let onlyH = 0, onlyV = 0, both = 0;
for (let g = 0; g < GAMES; g++) {
  const when = [0];                                                    // ⟨на якій кулі назвали число|which ball called each number⟩
  pick(1, 75, 75).forEach((b, i) => { when[b] = i + 1; });
  let first = 99, h = false, v = false;
  for (let k = 0; k < CARDS; k++) {
    const t = card().map(col => col.map(x => when[x]));               // t[c][r]
    const col = Math.min(...t.map(c => Math.max(...c)));               // ⟨перший повний стовпець|first full column⟩
    const row = Math.min(...[0, 1, 2, 3, 4].map(r => Math.max(...t.map(c => c[r]))));  // ⟨перший повний рядок|first full row⟩
    const m = Math.min(row, col);
    if (m < first) { first = m; h = row === m; v = col === m; }
    else if (m === first) { h = h || row === m; v = v || col === m; }  // ⟨кілька карток на одній кулі|several cards on the same ball⟩
  }
  if (h && v) both++; else if (h) onlyH++; else onlyV++;
}
const p = x => (100 * x / GAMES).toFixed(1) + '%';
console.log('⟨Лише горизонтальна|Only horizontal⟩:', p(onlyH), '· ⟨лише вертикальна|only vertical⟩:', p(onlyV), '· ⟨обидві на одній кулі|both on the same ball⟩:', p(both));
console.log('⟨Для порівняння, 200 000 ігор|For comparison, 200,000 games⟩: 62.6% · 34.7% · 2.7%');
