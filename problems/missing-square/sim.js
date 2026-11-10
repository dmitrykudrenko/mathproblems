// ⟨Трикутник Каррі: кидаємо випадкові точки в прямокутник 13 × 5 і рахуємо площі під трьома лініями|Curry's triangle: throw random points into a 13 × 5 rectangle and measure the areas under three lines⟩
const N = 1e6;
const fig1 = x => x <= 8 ? 3 * x / 8 : 3 + 2 * (x - 8) / 5;   // ⟨червоний 8 × 3, потім синій 5 × 2|red 8 × 3, then blue 5 × 2⟩
const fig2 = x => x <= 5 ? 2 * x / 5 : 2 + 3 * (x - 5) / 8;   // ⟨синій, потім червоний|blue, then red⟩
const line = x => 5 * x / 13;                                 // ⟨справжня діагональ|the true diagonal⟩
let a1 = 0, a0 = 0, a2 = 0;
for (let i = 0; i < N; i++) {
  const x = Math.random() * 13, y = Math.random() * 5;
  if (y < fig1(x)) a1++;
  if (y < line(x)) a0++;
  if (y < fig2(x)) a2++;
}
const area = k => (65 * k / N).toFixed(3);
console.log('⟨фігура 1|figure 1⟩  ', area(a1), '⟨точно|exact⟩ 32');
console.log('⟨трикутник|triangle⟩ ', area(a0), '⟨точно|exact⟩ 32.5');
console.log('⟨фігура 2|figure 2⟩  ', area(a2), '⟨точно|exact⟩ 33');
console.log('⟨щілина між ними|sliver between them⟩', area(a2 - a1), '⟨точно|exact⟩', 8 * 2 - 3 * 5);
