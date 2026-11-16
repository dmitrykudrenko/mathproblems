// ⟨1 000 під 100 % річних. Банк нараховує відсотки n разів на рік, щоразу 1/n ставки: множимо вклад на (1 + 1/n) рівно n разів.|1,000 at 100% a year. The bank pays interest n times a year, each time 1/n of the rate: multiply the deposit by (1 + 1/n) exactly n times.⟩
// ⟨Жодних формул, лише множення, як у банку. Щосекунди — це 31 536 000 множень, приблизно секунда роботи.|No formulas, just multiplying, as a bank would. Every second is 31,536,000 multiplications, about a second of work.⟩
function bank(n) {
  let s = 1000;
  for (let i = 0; i < n; i++) s += s / n;      // ⟨нараховуємо відсотки s/n, тобто множимо на (1 + 1/n)|pay interest s/n, that is multiply by (1 + 1/n)⟩
  return s;
}
const plans = [[1, '⟨раз на рік|once a year⟩'], [2, '⟨двічі на рік|twice a year⟩'], [12, '⟨щомісяця|monthly⟩'], [365, '⟨щодня|daily⟩'],
               [8760, '⟨щогодини|hourly⟩'], [525600, '⟨щохвилини|every minute⟩'], [31536000, '⟨щосекунди|every second⟩']];
for (const [n, name] of plans) console.log(name.padEnd(14), bank(n).toFixed(5));
console.log('⟨стеля 1000 · e:|ceiling 1000 · e:⟩', (1000 * Math.E).toFixed(5));
