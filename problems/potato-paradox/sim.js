// ⟨100 кг картоплі з 99 % води. Випаровуємо воду по граму й зважуємо мішок, доки частка води не стане потрібною.|100 kg of potatoes at 99% water. Evaporate water a gram at a time and weigh the sack until the water share reaches the target.⟩
// ⟨Частки в десятих частках відсотка, маси в грамах: лише цілі числа, без похибок округлення.|Shares in tenths of a percent, masses in grams: whole numbers only, no rounding errors.⟩
const START = 100000, DRY = 1000;                 // ⟨1 % від 100 000 г — суха речовина, вона не випаровується|1% of 100,000 g is dry matter; it does not evaporate⟩
function weigh(target) {                          // ⟨target: частка води, наприклад 980 = 98 %|target: the water share, e.g. 980 = 98%⟩
  let total = START;
  if (1000 * (total - DRY) >= target * total) { while (1000 * (total - DRY) > target * total) total--; }  // ⟨сушимо|dry⟩
  else { while (1000 * (total - DRY) < target * total) total++; }                                          // ⟨замочуємо|soak⟩
  return total;
}
for (const t of [995, 980, 970, 950, 900, 500]) {
  const kg = weigh(t) / 1000, formula = (DRY / 1000) / (1 - t / 1000);   // ⟨суха речовина / частка сухого|dry matter / dry share⟩
  console.log(t / 10 + '% ⟨води|water⟩:', kg.toFixed(3), '⟨кг, формула|kg, formula⟩', formula.toFixed(3), '⟨кг, інтуїція|kg, intuition⟩', (100 - (99 - t / 10)).toFixed(1));
}
