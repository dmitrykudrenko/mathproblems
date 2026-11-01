// ⟨Завод випустив N = 300 танків. Беремо K = 4 випадкові різні номери й оцінюємо N трьома способами.|The factory built N = 300 tanks. Take K = 4 random distinct serial numbers and estimate N three ways.⟩
const N = 300, K = 4, TRIALS = 100000;

function sample() {
  const seen = new Set();
  while (seen.size < K) seen.add(1 + Math.floor(Math.random() * N));
  return [...seen];
}

const methods = {
  '⟨найбільший номер m|largest number m⟩': xs => Math.max(...xs),
  '⟨2 · середнє − 1|2 · average − 1⟩': xs => 2 * xs.reduce((a, b) => a + b) / xs.length - 1,
  'm + m/k − 1': xs => { const m = Math.max(...xs); return m + m / xs.length - 1; },
};

const sum = {}, sq = {};
for (const name in methods) { sum[name] = 0; sq[name] = 0; }
for (let t = 0; t < TRIALS; t++) {
  const xs = sample();
  for (const name in methods) {
    const est = methods[name](xs);
    sum[name] += est;
    sq[name] += (est - N) ** 2;                   // ⟨квадрат похибки|squared error⟩
  }
}
for (const name in methods) {
  console.log(`${name}: ⟨в середньому|average⟩ ${(sum[name] / TRIALS).toFixed(1)}, ⟨середньоквадратична похибка|RMSE (typical error)⟩ ±${Math.sqrt(sq[name] / TRIALS).toFixed(1)}`);
}
console.log(`⟨Номери 4, 10, 15, 60: оцінка|Serial numbers 4, 10, 15, 60: estimate⟩ ${methods['m + m/k − 1']([4, 10, 15, 60])}`);
