// ⟨Кожен виборець ранжує m варіантів випадково й чесно. Як часто жоден варіант не перемагає всі інші в парних голосуваннях?|Each voter ranks m options at random and votes honestly. How often does no option beat every other one head to head?⟩
function noWinner(m, n, trials) {
  let cycles = 0;
  for (let t = 0; t < trials; t++) {
    const wins = Array.from({ length: m }, () => Array(m).fill(0));   // ⟨wins[i][j]: скільки людей ставлять i вище за j|wins[i][j]: how many people put i above j⟩
    for (let v = 0; v < n; v++) {
      const order = [...Array(m).keys()];
      for (let i = m - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
      for (let a = 0; a < m; a++) for (let b = a + 1; b < m; b++) wins[order[a]][order[b]]++;
    }
    // ⟨переможець Кондорсе має більшість проти кожного суперника|a Condorcet winner has a majority against every rival⟩
    const hasWinner = wins.some((row, i) => row.every((w, j) => j === i || 2 * w > n));
    if (!hasWinner) cycles++;
  }
  return cycles / trials;
}
const exact3 = { 3: 1 / 18, 5: 5 / 72, 7: 875 / 11664, 101: 0.086901 };
for (const n of [3, 5, 7, 101]) {
  console.log('⟨варіантів: 3, виборців:|options: 3, voters:⟩', n, '⟨→ без переможця|→ no winner in⟩', (100 * noWinner(3, n, 20000)).toFixed(2) + '%', '⟨точно|exact⟩', (100 * exact3[n]).toFixed(2) + '%');
}
console.log('⟨Межа для безлічі виборців (Ґільбо):|Limit for very many voters (Guilbaud):⟩', (100 * (1 / 4 - 3 / (2 * Math.PI) * Math.asin(1 / 3))).toFixed(2) + '%');
for (const m of [4, 5, 10]) {
  console.log('⟨варіантів:|options:⟩', m + ',', '⟨виборців: 101 → без переможця|voters: 101 → no winner in⟩', (100 * noWinner(m, 101, 4000)).toFixed(1) + '%');
}
