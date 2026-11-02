// ⟨Троє мандрівників: кроки 1/2ⁿ⁻¹, 1/n² і 1/n км. Куди вони дійдуть за 10 мільйонів кроків?|Three walkers: steps of 1/2ⁿ⁻¹, 1/n² and 1/n km. Where do they get in 10 million steps?⟩
const N = 1e7, GAMMA = 0.5772156649015329;
let a = 0, b = 0, c = 0, step = 1, cross = 0;
for (let n = 1; n <= N; n++) {
  a += step; step /= 2;                    // ⟨A: кожен крок удвічі коротший|A: each step half the one before⟩
  b += 1 / (n * n);                        // ⟨B: крок 1/n²|B: a step of 1/n²⟩
  c += 1 / n;                              // ⟨C: крок 1/n|C: a step of 1/n⟩
  if (!cross && c > 10) cross = n;         // ⟨перший крок за стовпом 10 км|the first step past the 10 km milestone⟩
}
console.log('A', a.toFixed(10), '⟨межа|limit⟩ 2');
console.log('B', b.toFixed(10), '⟨межа|limit⟩ π²/6 =', (Math.PI ** 2 / 6).toFixed(10));
console.log('C', c.toFixed(10), 'ln n + γ =', (Math.log(N) + GAMMA).toFixed(10), '⟨і росте далі|and still growing⟩');
console.log('⟨C минає 10 км на кроці|C passes 10 km at step⟩', cross);
