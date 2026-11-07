// ⟨Чотири кості Ефрона. Ви обираєте кість першим, суперник бере одну з решти, і виграє більше число. Який ваш шанс, якщо суперник обирає найкращу відповідь?|Efron's four dice. You choose a die first, your opponent takes one of the rest, and the higher roll wins. What is your chance if your opponent picks the best reply?⟩
const DICE = { A: [4, 4, 4, 4, 0, 0], B: [3, 3, 3, 3, 3, 3], C: [6, 6, 2, 2, 2, 2], D: [5, 5, 5, 1, 1, 1] };
const N = 100000;                                          // ⟨кидків на кожну пару|rolls per pair⟩
const roll = d => d[Math.floor(Math.random() * 6)];
const names = Object.keys(DICE), win = {};
for (const x of names) for (const y of names) if (x !== y) {
  let w = 0;
  for (let i = 0; i < N; i++) if (roll(DICE[x]) > roll(DICE[y])) w++;   // ⟨нічиїх у цих костях не буває|these dice never tie⟩
  win[x + y] = w / N;                                      // ⟨частка кидків, де x більше за y|share of rolls where x is higher than y⟩
}
for (const me of names) {
  // ⟨суперник бере ту кість, яка найчастіше б'є вашу|the opponent takes the die that beats yours most often⟩
  const reply = names.filter(y => y !== me).reduce((a, b) => win[b + me] > win[a + me] ? b : a);
  console.log('⟨Ви|You⟩', me, '· ⟨суперник|opponent⟩', reply, '· ⟨ваш шанс|your chance⟩', (1 - win[reply + me]).toFixed(3), '⟨точно|exact⟩ 1/3 = 0.333');
}
