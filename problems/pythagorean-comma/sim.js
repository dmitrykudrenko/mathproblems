// ⟨Скільки чистих квінт (×3/2) найкраще збігаються з цілою кількістю октав (×2)? Перебираємо n від 1 до 60.|How many pure fifths (×3/2) best match a whole number of octaves (×2)? We try n from 1 to 60.⟩
let best = Infinity;
for (let n = 1; n <= 60; n++) {
  const fifths = Math.pow(1.5, n);                         // ⟨n квінт угору|n fifths up⟩
  const m = Math.round(Math.log2(fifths));                 // ⟨найближча кількість октав|the nearest number of octaves⟩
  const miss = fifths / Math.pow(2, m) - 1;                // ⟨промах: + перелет, − недолет|the miss: + over, − under⟩
  if (Math.abs(miss) < best) {                             // ⟨рекорд: ближче, ніж усі менші n|a record: closer than every smaller n⟩
    best = Math.abs(miss);
    console.log('⟨квінт:|fifths:⟩', n, '≈ ⟨октав:|octaves:⟩', m, '· ⟨промах|miss⟩', (100 * miss).toFixed(3) + '%');
  }
}
// ⟨Точно: 12 квінт / 7 октав = 3^12 / 2^19|Exactly: 12 fifths / 7 octaves = 3^12 / 2^19⟩
console.log('⟨Піфагорова кома|Pythagorean comma⟩', 3 ** 12, '/', 2 ** 19, '=', (3 ** 12 / 2 ** 19).toFixed(5));
