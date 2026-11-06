# ⟨Гра з монеткою: 10 000 гравців по 100 раундів, орел +50%, решка −40%|The coin game: 10,000 players, 100 rounds each, heads +50%, tails −40%⟩
import random
from math import comb

N, T = 10_000, 100
money = []
for _ in range(N):
    w = 100                                                      # ⟨у кожного $100|everyone starts with $100⟩
    for _ in range(T):
        w *= 1.5 if random.random() < 0.5 else 0.6
    money.append(w)
money.sort()
mean = sum(money) / N

# ⟨точно: треба щонайменше 56 орлів зі 100|exact: it takes at least 56 heads out of 100⟩
exact = sum(comb(T, k) for k in range(56, T + 1)) / 2 ** T

print(f"⟨у плюсі|in profit⟩:  {100 * sum(w > 100 for w in money) / N:.1f}%   ⟨точно|exact⟩ {100 * exact:.2f}%")
print(f"⟨медіана|median⟩:   ${money[N // 2]:.2f}   ⟨точно|exact⟩ ${100 * 0.9 ** 50:.2f}")
print(f"⟨середнє|average⟩:  ${mean:.0f}   ⟨сподівання|expected⟩ ${100 * 1.05 ** T:.0f} ⟨(середнє 10 000 гравців зазвичай нижче: його тримають кілька щасливців)|(the average of 10,000 players is usually lower: a few lucky ones hold it up)⟩")
