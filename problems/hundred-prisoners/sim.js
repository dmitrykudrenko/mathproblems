// ⟨100 в'язнів, стратегія петлі: кожен відкриває свою коробку, потім коробку з номером, який знайшов, і так 50 разів.|100 prisoners, the loop strategy: each opens their own box, then the box with the number found inside, up to 50 times.⟩
const N = 100, TRIES = 50, TRIALS = 100000;

function allFree() {
  const box = [...Array(N).keys()];               // ⟨box[i] — номер у коробці i|box[i] is the number in box i⟩
  for (let i = N - 1; i > 0; i--) {               // ⟨випадково перемішуємо|shuffle at random⟩
    const j = Math.floor(Math.random() * (i + 1));
    [box[i], box[j]] = [box[j], box[i]];
  }
  for (let p = 0; p < N; p++) {                   // ⟨в'язень p|prisoner p⟩
    let b = p, found = false;
    for (let t = 0; t < TRIES && !found; t++) {
      found = box[b] === p;
      b = box[b];                                 // ⟨далі коробка з номером, що всередині|next: the box with the number inside⟩
    }
    if (!found) return false;
  }
  return true;
}

let wins = 0;
for (let i = 0; i < TRIALS; i++) if (allFree()) wins++;
let exact = 1;                                    // ⟨1 − (1/51 + … + 1/100)|1 − (1/51 + … + 1/100)⟩
for (let k = TRIES + 1; k <= N; k++) exact -= 1 / k;
console.log(`⟨усі на волі: симуляція|all go free: simulation⟩ ${(100 * wins / TRIALS).toFixed(2)}%, ⟨точно|exact⟩ ${(100 * exact).toFixed(2)}%`);
