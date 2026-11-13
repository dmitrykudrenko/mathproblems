// ⟨Три двері: за одними авто. Ведучий знає, де авто, і завжди відчиняє двері з козою.|Three doors, a car behind one. The host knows where it is and always opens a goat door.⟩
const GAMES = 1000000, P = 0.5;                   // ⟨P: частка ігор, у яких гравець міняє вибір|P: the share of games in which the player switches⟩
const rnd = n => Math.floor(Math.random() * n);

let stay = 0, sw = 0, mix = 0, kept = 0, keptStay = 0;
for (let g = 0; g < GAMES; g++) {
  const car = rnd(3), pick = rnd(3);
  let host;
  do host = rnd(3); while (host === pick || host === car);   // ⟨коза, і не ваші двері|a goat, and not your door⟩
  const other = 3 - pick - host;                  // ⟨двері, на які можна змінити вибір|the door you can switch to⟩
  if (pick === car) stay++;
  if (other === car) sw++;
  if ((Math.random() < P ? other : pick) === car) mix++;
  if (pick === 0 && host === 2) { kept++; if (pick === car) keptStay++; }   // ⟨лише ігри «обрали 1, відчинено 3»|only games "picked 1, host opened 3"⟩
}
const pc = x => (100 * x).toFixed(1) + '%';
console.log(`⟨Залишатися|Stay⟩: ${pc(stay / GAMES)} (⟨теорія|theory⟩ 33.3%)   ⟨Міняти|Switch⟩: ${pc(sw / GAMES)} (⟨теорія|theory⟩ 66.7%)`);
console.log(`⟨Лише «обрали 1, відчинено 3»|Only "picked 1, host opened 3"⟩ (${kept} ⟨ігор|games⟩): ⟨залишатися|stay⟩ ${pc(keptStay / kept)}, ⟨міняти|switch⟩ ${pc(1 - keptStay / kept)}`);
console.log(`⟨Міняти в|Switch in⟩ ${pc(P)} ⟨ігор|of games⟩: ${pc(mix / GAMES)} (⟨теорія|theory⟩ (1 + P)/3 = ${pc((1 + P) / 3)})`);
