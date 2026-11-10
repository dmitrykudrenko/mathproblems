# ⟨Несподівана контрольна: 100 000 тижнів. Учень може один раз зранку сказати «сьогодні!»|The surprise test: 100,000 weeks. The student may say "today!" one morning⟩
import random

N = 100_000
DAYS = ["⟨Пн|Mon⟩", "⟨Вт|Tue⟩", "⟨Ср|Wed⟩", "⟨Чт|Thu⟩", "⟨Пт|Fri⟩"]


def weeks(teacher, call):                # call(): ⟨день, на який учень каже «сьогодні!», або -1|the day the student calls, or -1⟩
    surprise = 0
    by_day = [[0, 0] for _ in DAYS]      # ⟨[контрольних, несподіваних] за днями|[tests, surprises] per day⟩
    for _ in range(N):
        t = random.choices(range(5), weights=teacher)[0]
        c = call()
        s = t != c and t != 4            # ⟨несподівано: не вгадав і це не п'ятниця|a surprise: not called and not Friday⟩
        by_day[t][0] += 1
        if s:
            by_day[t][1] += 1
            surprise += 1
    return surprise / N, by_day


even4, even5 = [1, 1, 1, 1, 0], [1, 1, 1, 1, 1]
r1, _ = weeks(even4, lambda: random.randrange(4))
print("⟨Вчителька: жереб Пн–Чт; учень: жереб Пн–Чт|Teacher: lot over Mon–Thu; student: lot over Mon–Thu⟩", f"{r1:.1%}", "⟨точно|exact⟩ 75%")
r2, _ = weeks(even4, lambda: 0)
print("⟨Те саме, учень завжди каже в понеділок|Same, the student always calls Monday⟩", f"{r2:.1%}", "⟨точно|exact⟩ 75%")
r3, _ = weeks(even5, lambda: 0)
print("⟨Вчителька: жереб Пн–Пт; учень каже в понеділок|Teacher: lot over Mon–Fri; student calls Monday⟩", f"{r3:.1%}", "⟨точно|exact⟩ 60%")
r4, by_day = weeks(even5, lambda: -1)
print("⟨Жереб Пн–Пт, учень вірить, що контрольної не буде|Lot over Mon–Fri, the student believes there is no test⟩", f"{r4:.1%}", "⟨точно|exact⟩ 80%")
print("⟨Частка несподіваних за днями (останній рядок)|Share of surprises per day (last line)⟩:",
      "  ".join(f"{DAYS[d]} {100 * s / n if n else 0:.0f}%" for d, (n, s) in enumerate(by_day)))
