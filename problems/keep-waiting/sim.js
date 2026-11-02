// ⟨Три очікування, у кожному в середньому 10. Скільки лишилося тим, хто вже прочекав t?|Three waits, each 10 on average. How long is left for those who have already waited t?⟩
const N = 400000;
const waits = {
  '⟨розклад|timetable⟩': () => 20 * Math.random(),                             // ⟨автобус кожні 20 хв: від 0 до 20|a bus every 20 min: 0 to 20⟩
  '⟨без розкладу|random bus⟩': () => -10 * Math.log(1 - Math.random()),        // ⟨експоненційний, середнє 10|exponential, mean 10⟩
  '⟨заявка|job reply⟩': () => 20 * (Math.pow(1 - Math.random(), -1 / 3) - 1)   // ⟨Ломакс α = 3, λ = 20, середнє 10|Lomax α = 3, λ = 20, mean 10⟩
};

for (const [name, draw] of Object.entries(waits)) {
  const xs = Array.from({ length: N }, draw);
  const out = [0, 10, 20].map(t => {
    const left = xs.filter(x => x > t);                                       // ⟨лише ті, хто ще чекає|only those still waiting⟩
    if (!left.length) return `t=${t}: –`;
    const avg = left.reduce((s, x) => s + x - t, 0) / left.length;
    return `t=${t}: ${avg.toFixed(2)}`;
  });
  console.log(name.padEnd(14), out.join('   '));
}
