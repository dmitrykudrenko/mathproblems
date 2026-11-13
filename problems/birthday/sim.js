// ⟨Кімнати по 23 людини з випадковими днями народження (365 днів, усі однаково ймовірні).|Rooms of 23 people with random birthdays (365 equally likely days).⟩
const N = 23, DAYS = 365, ROOMS = 100000;

let hits = 0;
for (let r = 0; r < ROOMS; r++) {
  const seen = new Set();                         // ⟨дні, які вже зайняті в цій кімнаті|days already taken in this room⟩
  for (let i = 0; i < N; i++) {
    const d = Math.floor(Math.random() * DAYS);
    if (seen.has(d)) { hits++; break; }           // ⟨збіг: двоє в один день|a match: two people on one day⟩
    seen.add(d);
  }
}

let allDiff = 1;                                  // ⟨точно: усі N днів різні|exact: all N days different⟩
for (let i = 0; i < N; i++) allDiff *= (DAYS - i) / DAYS;
console.log(`⟨Кімнат зі збігом (симуляція)|Rooms with a match (simulation)⟩: ${(100 * hits / ROOMS).toFixed(1)}%`);
console.log(`⟨Точна формула 1 − 365·364·…·343 / 365²³|Exact formula 1 − 365·364·…·343 / 365²³⟩: ${(100 * (1 - allDiff)).toFixed(1)}%`);
