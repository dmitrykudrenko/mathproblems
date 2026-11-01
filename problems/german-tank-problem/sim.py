# ⟨Завод випустив N = 300 танків. Беремо K = 4 випадкові різні номери й оцінюємо N трьома способами.|The factory built N = 300 tanks. Take K = 4 random distinct serial numbers and estimate N three ways.⟩
import math
import random

N, K, TRIALS = 300, 4, 100_000

methods = {
    "⟨найбільший номер m|largest number m⟩": lambda xs: max(xs),
    "⟨2 · середнє − 1|2 · average − 1⟩": lambda xs: 2 * sum(xs) / len(xs) - 1,
    "m + m/k − 1": lambda xs: max(xs) + max(xs) / len(xs) - 1,
}

total = dict.fromkeys(methods, 0.0)
sq = dict.fromkeys(methods, 0.0)
for _ in range(TRIALS):
    xs = random.sample(range(1, N + 1), K)
    for name, f in methods.items():
        est = f(xs)
        total[name] += est
        sq[name] += (est - N) ** 2        # ⟨квадрат похибки|squared error⟩

for name in methods:
    print(f"{name}: ⟨в середньому|average⟩ {total[name] / TRIALS:.1f}, "
          f"⟨середньоквадратична похибка|RMSE (typical error)⟩ ±{math.sqrt(sq[name] / TRIALS):.1f}")
print(f"⟨Номери 4, 10, 15, 60: оцінка|Serial numbers 4, 10, 15, 60: estimate⟩ {methods['m + m/k − 1']([4, 10, 15, 60]):g}")
