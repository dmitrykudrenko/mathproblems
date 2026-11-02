// ⟨Парадокс Ньюкомба: 100 000 ігор з провидцем, що вгадує з точністю p|Newcomb's paradox: 100,000 games against a predictor that is right with probability p⟩
const N = 100000, A = 1000, M = 1000000;

for (const p of [0.9, 0.5]) {
  const sum = { one: 0, two: 0 }, cnt = { one: 0, two: 0 };
  let plus = 0;
  for (let i = 0; i < N; i++) {
    const choice = Math.random() < 0.5 ? 'one' : 'two';          // ⟨гравець обирає навмання|the player picks at random⟩
    const right = Math.random() < p;                             // ⟨провидець угадав?|did the predictor guess right?⟩
    const said = right ? choice : (choice === 'one' ? 'two' : 'one');
    const B = said === 'one' ? M : 0;                            // ⟨учора: мільйон у B лише для «лише B»|yesterday: a million in B only for "only B"⟩
    const win = choice === 'one' ? B : A + B;
    sum[choice] += win; cnt[choice]++;
    const gain = (A + B) - B;                                    // ⟨ті самі скриньки: «обидві» мінус «лише B»|same boxes: "both" minus "only B"⟩
    if (gain === A) plus++;
  }
  console.log(`p = ${p * 100}%`);
  console.log(`  ⟨лише B|only B⟩:  ${Math.round(sum.one / cnt.one)}   ⟨точно|exact⟩ ${Math.round(p * M)}`);
  console.log(`  ⟨обидві|both⟩:   ${Math.round(sum.two / cnt.two)}   ⟨точно|exact⟩ ${Math.round(A + (1 - p) * M)}`);
  console.log(`  ⟨ігор, де «обидві» дають рівно +1000 до тих самих скриньок|games where "both" adds exactly +1000 to the same boxes⟩: ${(100 * plus / N).toFixed(1)}%`);
}
