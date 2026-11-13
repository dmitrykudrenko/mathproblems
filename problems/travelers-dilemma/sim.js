// ⟨Дилема мандрівника: яке число від 2 до 100 найбільше заробляє проти натовпу живих людей?|The traveler's dilemma: which number from 2 to 100 earns the most against a crowd of real people?⟩
const R = 2, TRIPS = 200000;
const pay = (x, y) => x === y ? x : x < y ? x + R : y - R;   // ⟨ви пишете x, інший y|you write x, the other writes y⟩

// ⟨натовп за дослідом Беккера, Картера і Наеве: частка, від, до|the crowd from the Becker, Carter & Naeve experiment: share, from, to⟩
const crowd = [[10 / 45, 100, 100], [23 / 45, 95, 99], [3 / 45, 2, 2], [9 / 45, 3, 94]];
function stranger() {
  let u = Math.random();
  for (const [w, lo, hi] of crowd) {
    if (u < w) return lo + Math.floor(Math.random() * (hi - lo + 1));
    u -= w;
  }
  return 100;
}

const others = Array.from({ length: TRIPS }, stranger);       // ⟨ті самі незнайомці для кожного числа|the same strangers for every number⟩
const avg = x => others.reduce((s, y) => s + pay(x, y), 0) / TRIPS;
let best = 2;
for (let x = 3; x <= 100; x++) if (avg(x) > avg(best)) best = x;

console.log(`⟨Найкраще число|Best number⟩: ${best}, ${avg(best).toFixed(2)} ⟨$ за поїздку (точно: 98 дає 80,59, а 97 майже стільки ж, 80,57)|$ per trip (exact: 98 gives 80.59, and 97 almost as much, 80.57)⟩`);
console.log(`⟨Число 2|The number 2⟩: ${avg(2).toFixed(2)} ⟨$ за поїздку (точно 3,87)|$ per trip (exact 3.87)⟩`);
console.log(`⟨Число 100|The number 100⟩: ${avg(100).toFixed(2)} ⟨$ за поїздку (точно 80,08)|$ per trip (exact 80.08)⟩`);
