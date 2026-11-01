// ⟨Автобуси без розкладу, в середньому раз на 10 хвилин. Пасажири приходять у випадкові моменти.|Buses with no timetable, one every 10 minutes on average. Riders arrive at random moments.⟩
const MEAN = 10, BUSES = 100000, RIDERS = 100000;

const bus = [0];                                  // ⟨моменти приходу автобусів, хвилини|bus arrival times, minutes⟩
for (let i = 0; i < BUSES; i++) bus.push(bus[i] - MEAN * Math.log(1 - Math.random()));  // ⟨випадкові інтервали|random gaps⟩
const end = bus[BUSES];

let wait = 0, gap = 0;
for (let r = 0; r < RIDERS; r++) {
  const x = Math.random() * end;                  // ⟨пасажир приходить|a rider arrives⟩
  let lo = 0, hi = BUSES;                         // ⟨шукаємо автобуси до і після: bus[lo] ≤ x < bus[hi]|find the buses around x: bus[lo] ≤ x < bus[hi]⟩
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (bus[mid] <= x) lo = mid; else hi = mid;
  }
  wait += bus[hi] - x;
  gap += bus[hi] - bus[lo];
}
console.log(`⟨Звичайний інтервал між автобусами|An ordinary gap between buses⟩: ${(end / BUSES).toFixed(2)} ⟨хв|min⟩`);
console.log(`⟨Пасажир чекав у середньому|Average wait⟩: ${(wait / RIDERS).toFixed(2)} ⟨хв|min⟩`);
console.log(`⟨Інтервал, у який він потрапив|The gap the rider landed in⟩: ${(gap / RIDERS).toFixed(2)} ⟨хв|min⟩`);
