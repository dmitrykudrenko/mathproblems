// ⟨Частка чисел, що починаються з 1, у чотирьох наборах і за законом Бенфорда|Share of numbers starting with 1 in four sets and by Benford's law⟩
const share1 = nums => nums.filter(s => s[0] === '1').length / nums.length;

const pow2 = [];                                  // ⟨2¹…2¹⁰⁰⁰ точно, великими цілими|2¹…2¹⁰⁰⁰ exactly, as big integers⟩
for (let n = 1, p = 1n; n <= 1000; n++) { p *= 2n; pow2.push(p.toString()); }

const fib = [];                                   // ⟨числа Фібоначчі F₁…F₁₀₀₀|Fibonacci numbers F₁…F₁₀₀₀⟩
for (let n = 1, a = 1n, b = 1n; n <= 1000; n++) { fib.push(a.toString()); [a, b] = [b, a + b]; }

const prods = [];                                 // ⟨добуток 10 випадкових чисел від 1 до 10, 100 000 разів|product of 10 random numbers from 1 to 10, 100,000 times⟩
for (let i = 0; i < 100000; i++) {
  let x = 1;
  for (let j = 0; j < 10; j++) x *= 1 + 9 * Math.random();
  prods.push(x.toExponential());                  // ⟨запис 1.234e+7: перша цифра стоїть першою|written as 1.234e+7: the first digit comes first⟩
}

const whole = Array.from({ length: 999 }, (_, i) => String(i + 1));  // ⟨контрприклад: цілі від 1 до 999|counterexample: whole numbers 1 to 999⟩

const show = p => (100 * p).toFixed(1) + '%';
console.log(`⟨Степені двійки|Powers of two⟩: ${show(share1(pow2))}`);
console.log(`⟨Числа Фібоначчі|Fibonacci numbers⟩: ${show(share1(fib))}`);
console.log(`⟨Добутки 10 чисел|Products of 10 numbers⟩: ${show(share1(prods))}`);
console.log(`⟨Цілі 1…999|Whole numbers 1…999⟩: ${show(share1(whole))}`);
console.log(`⟨Закон Бенфорда, log₁₀ 2|Benford's law, log₁₀ 2⟩: ${show(Math.log10(2))}`);
