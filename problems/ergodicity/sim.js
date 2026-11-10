// ⟨Гра з монеткою: 10 000 гравців по 100 раундів, орел +50%, решка −40%|The coin game: 10,000 players, 100 rounds each, heads +50%, tails −40%⟩
const N = 10000, T = 100;
const money = [];
for (let i = 0; i < N; i++) {
  let w = 100;                                                   // ⟨у кожного $100|everyone starts with $100⟩
  for (let t = 0; t < T; t++) w *= Math.random() < 0.5 ? 1.5 : 0.6;
  money.push(w);
}
money.sort((a, b) => a - b);
const mean = money.reduce((s, w) => s + w, 0) / N;

// ⟨точно: треба щонайменше 56 орлів зі 100|exact: it takes at least 56 heads out of 100⟩
let exact = 0, c = 1;                                            // c = C(100, k)
for (let k = 0; k <= T; k++) { if (k >= 56) exact += c / 2 ** T; c = c * (T - k) / (k + 1); }

console.log(`⟨у плюсі|in profit⟩:  ${(100 * money.filter(w => w > 100).length / N).toFixed(1)}%   ⟨точно|exact⟩ ${(100 * exact).toFixed(2)}%`);
console.log(`⟨медіана|median⟩:   $${money[N / 2].toFixed(2)}   ⟨точно|exact⟩ $${(100 * 0.9 ** 50).toFixed(2)}`);
console.log(`⟨середнє|average⟩:  $${mean.toFixed(0)}   ⟨сподівання|expected⟩ $${(100 * 1.05 ** T).toFixed(0)} ⟨(середнє 10 000 гравців зазвичай нижче: його тримають кілька щасливців)|(the average of 10,000 players is usually lower: a few lucky ones hold it up)⟩`);
