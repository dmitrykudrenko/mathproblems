// ⟨Підлога з дощок шириною d = 1, сірник такої самої довжини. Кидаємо його DROPS разів і рахуємо перетини швів.|A floor of boards of width d = 1 and a match of the same length. Drop it DROPS times and count seam crossings.⟩
const DROPS = 1000000;

// ⟨Випадковий напрям без π: точка в прямокутнику, яку лишаємо, лише якщо вона в півкрузі.|A random direction without π: a point in a rectangle, kept only if it is inside a half-disc.⟩
function direction() {
  for (;;) {
    const u = 2 * Math.random() - 1, v = Math.random(), r = Math.hypot(u, v);
    if (r > 0 && r <= 1) return u / r;            // ⟨косинус кута до напряму поперек дощок|cosine of the angle across the boards⟩
  }
}

let crossings = 0;
for (let i = 0; i < DROPS; i++) {
  const centre = Math.random();                   // ⟨де впав центр сірника, шви на x = 0, 1, 2…|where the match's centre lands, seams at x = 0, 1, 2…⟩
  const reach = direction() / 2;                  // ⟨наскільки половина сірника сягає поперек дощок|how far half the match reaches across the boards⟩
  if (Math.floor(centre + reach) !== Math.floor(centre - reach)) crossings++;
}
const estimate = 2 * DROPS / crossings;           // ⟨частка перетинів дорівнює 2/π, тож π ≈ 2 · кидки / перетини|the share of crossings is 2/π, so π ≈ 2 · drops / crossings⟩
console.log(`⟨Кидків|Drops⟩: ${DROPS}, ⟨перетинів|crossings⟩: ${crossings} (${(100 * crossings / DROPS).toFixed(2)}%, ⟨теорія|theory⟩ ${(200 / Math.PI).toFixed(2)}%)`);
console.log(`⟨Оцінка π|π estimate⟩: ${estimate.toFixed(4)}, ⟨справжнє|true⟩ ${Math.PI.toFixed(4)}, ⟨типова похибка|typical error⟩ ±${(2.37 / Math.sqrt(DROPS)).toFixed(4)}`);
