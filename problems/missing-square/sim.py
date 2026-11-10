# ⟨Трикутник Каррі: кидаємо випадкові точки в прямокутник 13 × 5 і рахуємо площі під трьома лініями|Curry's triangle: throw random points into a 13 × 5 rectangle and measure the areas under three lines⟩
import random

N = 1_000_000
fig1 = lambda x: 3 * x / 8 if x <= 8 else 3 + 2 * (x - 8) / 5   # ⟨червоний 8 × 3, потім синій 5 × 2|red 8 × 3, then blue 5 × 2⟩
fig2 = lambda x: 2 * x / 5 if x <= 5 else 2 + 3 * (x - 5) / 8   # ⟨синій, потім червоний|blue, then red⟩
line = lambda x: 5 * x / 13                                     # ⟨справжня діагональ|the true diagonal⟩
a1 = a0 = a2 = 0
for _ in range(N):
    x, y = random.random() * 13, random.random() * 5
    a1 += y < fig1(x)
    a0 += y < line(x)
    a2 += y < fig2(x)
area = lambda k: f"{65 * k / N:.3f}"
print("⟨фігура 1|figure 1⟩  ", area(a1), "⟨точно|exact⟩ 32")
print("⟨трикутник|triangle⟩ ", area(a0), "⟨точно|exact⟩ 32.5")
print("⟨фігура 2|figure 2⟩  ", area(a2), "⟨точно|exact⟩ 33")
print("⟨щілина між ними|sliver between them⟩", area(a2 - a1), "⟨точно|exact⟩", 8 * 2 - 3 * 5)
