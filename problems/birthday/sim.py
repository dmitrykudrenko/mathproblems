# ⟨Кімнати по 23 людини з випадковими днями народження (365 днів, усі однаково ймовірні).|Rooms of 23 people with random birthdays (365 equally likely days).⟩
import random

N, DAYS, ROOMS = 23, 365, 100_000

hits = 0
for _ in range(ROOMS):
    days = [random.randrange(DAYS) for _ in range(N)]
    if len(set(days)) < N:                # ⟨збіг: двоє в один день|a match: two people on one day⟩
        hits += 1

all_diff = 1.0                            # ⟨точно: усі N днів різні|exact: all N days different⟩
for i in range(N):
    all_diff *= (DAYS - i) / DAYS
print(f"⟨Кімнат зі збігом (симуляція)|Rooms with a match (simulation)⟩: {100 * hits / ROOMS:.1f}%")
print(f"⟨Точна формула 1 − 365·364·…·343 / 365²³|Exact formula 1 − 365·364·…·343 / 365²³⟩: {100 * (1 - all_diff):.1f}%")
