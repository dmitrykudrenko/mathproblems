# ⟨Дилема мандрівника: яке число від 2 до 100 найбільше заробляє проти натовпу живих людей?|The traveler's dilemma: which number from 2 to 100 earns the most against a crowd of real people?⟩
import random

R, TRIPS = 2, 200_000


def pay(x, y):  # ⟨ви пишете x, інший y|you write x, the other writes y⟩
    return x if x == y else x + R if x < y else y - R


# ⟨натовп за дослідом Беккера, Картера і Наеве: частка, від, до|the crowd from the Becker, Carter & Naeve experiment: share, from, to⟩
crowd = [(10 / 45, 100, 100), (23 / 45, 95, 99), (3 / 45, 2, 2), (9 / 45, 3, 94)]
others = []                     # ⟨ті самі незнайомці для кожного числа|the same strangers for every number⟩
for _ in range(TRIPS):
    _, lo, hi = random.choices(crowd, weights=[w for w, _, _ in crowd])[0]
    others.append(random.randint(lo, hi))

avg = {x: sum(pay(x, y) for y in others) / TRIPS for x in range(2, 101)}
best = max(avg, key=avg.get)

print(f"⟨Найкраще число|Best number⟩: {best}, {avg[best]:.2f} ⟨$ за поїздку (точно: 98 дає 80,59, а 97 майже стільки ж, 80,57)|$ per trip (exact: 98 gives 80.59, and 97 almost as much, 80.57)⟩")
print(f"⟨Число 2|The number 2⟩: {avg[2]:.2f} ⟨$ за поїздку (точно 3,87)|$ per trip (exact 3.87)⟩")
print(f"⟨Число 100|The number 100⟩: {avg[100]:.2f} ⟨$ за поїздку (точно 80,08)|$ per trip (exact 80.08)⟩")
