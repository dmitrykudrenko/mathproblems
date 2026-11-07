// ⟨Випадкові острови з фрактальною розмірністю D: кожна сторона стає 4 копіями довжини r з горбом у море чи в суходіл, 4 · r^D = 1.|Random islands with fractal dimension D: every side becomes 4 copies of length r with a bump into the sea or the land, 4 · r^D = 1.⟩
// ⟨Кожен острів проходимо циркулем із різними кроками й порівнюємо приріст довжини із законом Річардсона 2^(D−1).|Each island is walked with dividers at several steps, and the growth in length is compared with Richardson's law 2^(D−1).⟩
const KM = 400, D = 1.25, ISLANDS = 100, STEPS = [100, 50, 25, 12.5];
function island(D) {
  const r = Math.pow(4, -1 / D), hb = (1 - 2 * r) / 2, h = Math.sqrt(r * r - hb * hb);
  let P = [];
  for (let i = 0; i < 7; i++) { const a = 2 * Math.PI * i / 7 + (Math.random() - .5) * .5, rad = 1 + (Math.random() - .5) * .45; P.push([Math.cos(a) * rad, Math.sin(a) * rad]); }
  for (let d = 0; d < 5; d++) {
    const Q = [];
    for (let i = 0; i < P.length; i++) {
      const A = P[i], B = P[(i + 1) % P.length], ux = B[0] - A[0], uy = B[1] - A[1], s = Math.random() < .5 ? 1 : -1;
      Q.push(A, [A[0] + r * ux, A[1] + r * uy], [A[0] + .5 * ux + s * h * uy, A[1] + .5 * uy - s * h * ux], [A[0] + (1 - r) * ux, A[1] + (1 - r) * uy]);
    }
    P = Q;
  }
  return P;
}
// ⟨циркуль: наступна ніжка стає туди, де берег уперше виходить з кола радіуса eps навколо попередньої|dividers: the next leg lands where the coast first leaves the circle of radius eps around the last one⟩
function measure(P, eps) {
  const n = P.length; let cx = P[0][0], cy = P[0][1], i = 0, steps = 0;
  for (;;) {
    let k = i;
    for (; k < n; k++) { const B = P[(k + 1) % n]; if ((B[0] - cx) ** 2 + (B[1] - cy) ** 2 >= eps * eps) break; }
    if (k === n) return steps * eps + Math.hypot(P[0][0] - cx, P[0][1] - cy);
    const A = k === i ? [cx, cy] : P[k], B = P[(k + 1) % n], ex = B[0] - A[0], ey = B[1] - A[1], fx = A[0] - cx, fy = A[1] - cy;
    const a = ex * ex + ey * ey, b = 2 * (ex * fx + ey * fy), c = fx * fx + fy * fy - eps * eps;
    const t = (-b + Math.sqrt(Math.max(0, b * b - 4 * a * c))) / (2 * a);
    cx = A[0] + t * ex; cy = A[1] + t * ey; i = k; steps++;
  }
}
const logs = STEPS.map(() => 0);
for (let j = 0; j < ISLANDS; j++) {
  const P = island(D);
  STEPS.forEach((e, i) => { logs[i] += Math.log(measure(P, e / KM) * KM) / ISLANDS; });
}
STEPS.forEach((e, i) => console.log('⟨крок|step⟩', e, '⟨км: середня довжина|km: average length⟩', Math.exp(logs[i]).toFixed(0),
  i ? '⟨, приріст|, growth⟩ +' + (100 * (Math.exp(logs[i] - logs[i - 1]) - 1)).toFixed(1) + '%' : ''));
const per = Math.exp((logs[STEPS.length - 1] - logs[0]) / (STEPS.length - 1));
console.log('⟨Удвічі коротший крок, у середньому:|Step halved, on average:⟩ ×' + per.toFixed(3), '⟨закон Річардсона 2^(D−1) =|Richardson\'s law 2^(D−1) =⟩', Math.pow(2, D - 1).toFixed(3));
// ⟨для порівняння коло радіуса 400 км: довжина виходить на 2πr|for comparison, a circle of radius 400 km: the length settles at 2πr⟩
const C = Array.from({ length: 4096 }, (_, i) => [Math.cos(2 * Math.PI * i / 4096), Math.sin(2 * Math.PI * i / 4096)]);
console.log('⟨Коло, кроки 100 і 50 км:|Circle, steps of 100 and 50 km:⟩', (measure(C, 100 / KM) * KM).toFixed(1), (measure(C, 50 / KM) * KM).toFixed(1), '2πr =', (2 * Math.PI * KM).toFixed(1));
