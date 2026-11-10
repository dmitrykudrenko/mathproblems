// ⟨Несподівана контрольна: 100 000 тижнів. Учень може один раз зранку сказати «сьогодні!»|The surprise test: 100,000 weeks. The student may say "today!" one morning⟩
const N = 100000, DAYS = ['⟨Пн|Mon⟩', '⟨Вт|Tue⟩', '⟨Ср|Wed⟩', '⟨Чт|Thu⟩', '⟨Пт|Fri⟩'];
const pick = w => { let r = Math.random() * w.reduce((s, x) => s + x, 0); return w.findIndex(x => (r -= x) < 0); };

function weeks(teacher, call) {           // call(): ⟨день, на який учень каже «сьогодні!», або -1|the day the student calls, or -1⟩
  let surprise = 0;
  const byDay = DAYS.map(() => [0, 0]);   // ⟨[контрольних, несподіваних] за днями|[tests, surprises] per day⟩
  for (let i = 0; i < N; i++) {
    const t = pick(teacher), c = call();
    const s = t !== c && t !== 4;         // ⟨несподівано: не вгадав і це не п'ятниця|a surprise: not called and not Friday⟩
    byDay[t][0]++; if (s) { byDay[t][1]++; surprise++; }
  }
  return { rate: surprise / N, byDay };
}

const even4 = [1, 1, 1, 1, 0], even5 = [1, 1, 1, 1, 1];
const r1 = weeks(even4, () => Math.floor(Math.random() * 4));
console.log('⟨Вчителька: жереб Пн–Чт; учень: жереб Пн–Чт|Teacher: lot over Mon–Thu; student: lot over Mon–Thu⟩', (100 * r1.rate).toFixed(1) + '%', '⟨точно|exact⟩ 75%');
const r2 = weeks(even4, () => 0);
console.log('⟨Те саме, учень завжди каже в понеділок|Same, the student always calls Monday⟩', (100 * r2.rate).toFixed(1) + '%', '⟨точно|exact⟩ 75%');
const r3 = weeks(even5, () => 0);
console.log('⟨Вчителька: жереб Пн–Пт; учень каже в понеділок|Teacher: lot over Mon–Fri; student calls Monday⟩', (100 * r3.rate).toFixed(1) + '%', '⟨точно|exact⟩ 60%');
const r4 = weeks(even5, () => -1);
console.log('⟨Жереб Пн–Пт, учень вірить, що контрольної не буде|Lot over Mon–Fri, the student believes there is no test⟩', (100 * r4.rate).toFixed(1) + '%', '⟨точно|exact⟩ 80%');
console.log('⟨Частка несподіваних за днями (останній рядок)|Share of surprises per day (last line)⟩:',
  r4.byDay.map(([n, s], d) => DAYS[d] + ' ' + (n ? (100 * s / n).toFixed(0) : 0) + '%').join('  '));
