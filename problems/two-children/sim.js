// ⟨Сім'ї з двома дітьми: стать і день тижня кожної дитини випадкові (0 = понеділок, 1 = вівторок, …).|Two-child families: each child's sex and weekday are random (0 = Monday, 1 = Tuesday, …).⟩
const FAMILIES = 1000000;
const kid = () => ({ boy: Math.random() < 0.5, day: Math.floor(Math.random() * 7) });
const tueBoy = c => c.boy && c.day === 1;

let asked = 0, askedBB = 0, met = 0, metBB = 0;
for (let i = 0; i < FAMILIES; i++) {
  const a = kid(), b = kid(), bb = a.boy && b.boy;
  // ⟨1) Ви спитали: «Є син, народжений у вівторок?» Батьки сказали «так».|1) You asked: "Do you have a son born on a Tuesday?" The parents said yes.⟩
  if (tueBoy(a) || tueBoy(b)) { asked++; if (bb) askedBB++; }
  // ⟨2) Ви зустріли одну випадкову дитину, і це хлопчик, народжений у вівторок.|2) You met one random child, and it is a boy born on a Tuesday.⟩
  const seen = Math.random() < 0.5 ? a : b;
  if (tueBoy(seen)) { met++; if (bb) metBB++; }
}
console.log(`⟨Спитали батьків: двоє синів у|Asked the parents: two sons in⟩ ${(100 * askedBB / asked).toFixed(2)}% (⟨точно|exact⟩ 13/27 = ${(100 * 13 / 27).toFixed(2)}%)`);
console.log(`⟨Зустріли дитину: двоє синів у|Met a child: two sons in⟩ ${(100 * metBB / met).toFixed(2)}% (⟨точно|exact⟩ 1/2 = 50.00%)`);
