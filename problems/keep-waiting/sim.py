# ⟨Три очікування, у кожному в середньому 10. Скільки лишилося тим, хто вже прочекав t?|Three waits, each 10 on average. How long is left for those who have already waited t?⟩
import random

N = 400_000
waits = {
    "⟨розклад|timetable⟩": lambda: 20 * random.random(),                        # ⟨автобус кожні 20 хв: від 0 до 20|a bus every 20 min: 0 to 20⟩
    "⟨без розкладу|random bus⟩": lambda: random.expovariate(1 / 10),              # ⟨експоненційний, середнє 10|exponential, mean 10⟩
    "⟨заявка|job reply⟩": lambda: 20 * ((1 - random.random()) ** (-1 / 3) - 1),  # ⟨Ломакс α = 3, λ = 20, середнє 10|Lomax α = 3, λ = 20, mean 10⟩
}

for name, draw in waits.items():
    xs = [draw() for _ in range(N)]
    out = []
    for t in (0, 10, 20):
        left = [x - t for x in xs if x > t]                                       # ⟨лише ті, хто ще чекає|only those still waiting⟩
        out.append(f"t={t}: {sum(left) / len(left):.2f}" if left else f"t={t}: –")
    print(f"{name:14}", "   ".join(out))
