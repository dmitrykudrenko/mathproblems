// ⟨Випадкові ради: від 2 до 12 районів з населенням від 1 до 100 тисяч, від 10 до 40 місць. Додаємо одне місце: чи втрачає хтось місце?|Random councils: 2 to 12 districts of 1 to 100 thousand people, 10 to 40 seats. Add one seat: does anyone lose a seat?⟩
function largestRemainder(p, h) {
  const P = p.reduce((a, b) => a + b, 0), q = p.map(x => x * h / P), s = q.map(Math.floor);
  const order = p.map((_, i) => i).sort((a, b) => (q[b] - s[b]) - (q[a] - s[a]));
  const left = h - s.reduce((a, b) => a + b, 0);
  for (let k = 0; k < left; k++) s[order[k]]++;            // ⟨зайві місця — найбільшим залишкам|leftover seats go to the largest remainders⟩
  return s;
}
function dHondt(p, h) {                                    // ⟨наступне місце — найбільшому p / (s + 1)|the next seat goes to the largest p / (s + 1)⟩
  const s = p.map(() => 0);
  for (let k = 0; k < h; k++) { let b = 0; p.forEach((x, i) => { if (x / (s[i] + 1) > p[b] / (s[b] + 1)) b = i; }); s[b]++; }
  return s;
}
console.log('6·6·2 ⟨тис.|thousand⟩: 10 ⟨місць|seats⟩', largestRemainder([6, 6, 2], 10), '11 ⟨місць|seats⟩', largestRemainder([6, 6, 2], 11));
const loses = (f, p, h) => { const a = f(p, h), b = f(p, h + 1); return a.some((x, i) => b[i] < x); };
const T = 20000;
for (const n of [2, 3, 4, 6, 8, 12]) {
  let ham = 0, dh = 0;
  for (let t = 0; t < T; t++) {
    const p = Array.from({ length: n }, () => 1 + 99 * Math.random()), h = 10 + Math.floor(31 * Math.random());
    if (loses(largestRemainder, p, h)) ham++;
    if (loses(dHondt, p, h)) dh++;
  }
  console.log('⟨районів|districts⟩', n, '· ⟨найбільші залишки|largest remainders⟩', (100 * ham / T).toFixed(1) + '%', '· ⟨д\'Ондт|D\'Hondt⟩', dh);
}
