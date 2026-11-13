// ⟨Випадкові таблиці 2×2: усіх пацієнтів ділимо між 8 клітинками (група × метод × успіх чи ні) рівномірно випадково.|Random 2×2 tables: all patients are split among 8 cells (group × treatment × success or not) uniformly at random.⟩
// ⟨Рахуємо частку таблиць, де один метод кращий в обох групах, а інший загалом.|We count the share of tables where one treatment wins in both groups and the other wins overall.⟩
const TABLES = 1000000;

function table() {
  const e = [];
  for (let i = 0; i < 8; i++) e.push(-Math.log(1 - Math.random()));  // ⟨нормовані експоненти дають рівномірні частки|normalised exponentials give uniform shares⟩
  // ⟨[успіхи, пацієнти] для A і B у групах 1 і 2; загальна сума не важлива|[successes, patients] for A and B in groups 1 and 2; the grand total does not matter⟩
  return [[[e[0], e[0] + e[1]], [e[2], e[2] + e[3]]], [[e[4], e[4] + e[5]], [e[6], e[6] + e[7]]]];
}

let hits = 0;
for (let i = 0; i < TABLES; i++) {
  const [[A1, B1], [A2, B2]] = table();
  const a1 = A1[0] / A1[1], b1 = B1[0] / B1[1], a2 = A2[0] / A2[1], b2 = B2[0] / B2[1];
  const A = (A1[0] + A2[0]) / (A1[1] + A2[1]), B = (B1[0] + B2[0]) / (B1[1] + B2[1]);  // ⟨загалом: зважене середнє груп|overall: a weighted average of the groups⟩
  if ((a1 > b1 && a2 > b2 && A < B) || (a1 < b1 && a2 < b2 && A > B)) hits++;
}
console.log(`⟨Таблиць з парадоксом|Tables with the paradox⟩: ${(100 * hits / TABLES).toFixed(2)}%`);
console.log(`⟨Точно (Pavlides і Perlman, 2009)|Exact (Pavlides and Perlman, 2009)⟩: 1/60 = ${(100 / 60).toFixed(2)}%`);
