# ⟨Випадкові таблиці 2×2: усіх пацієнтів ділимо між 8 клітинками (група × метод × успіх чи ні) рівномірно випадково.|Random 2×2 tables: all patients are split among 8 cells (group × treatment × success or not) uniformly at random.⟩
# ⟨Рахуємо частку таблиць, де один метод кращий в обох групах, а інший загалом.|We count the share of tables where one treatment wins in both groups and the other wins overall.⟩
import random

TABLES = 1_000_000

hits = 0
for _ in range(TABLES):
    e = [random.expovariate(1) for _ in range(8)]   # ⟨нормовані експоненти дають рівномірні частки|normalised exponentials give uniform shares⟩
    a1, b1 = e[0] / (e[0] + e[1]), e[2] / (e[2] + e[3])   # ⟨група 1: частка успіхів у A і B|group 1: success rate of A and B⟩
    a2, b2 = e[4] / (e[4] + e[5]), e[6] / (e[6] + e[7])   # ⟨група 2|group 2⟩
    A = (e[0] + e[4]) / (e[0] + e[1] + e[4] + e[5])      # ⟨загалом: зважене середнє груп|overall: a weighted average of the groups⟩
    B = (e[2] + e[6]) / (e[2] + e[3] + e[6] + e[7])
    if (a1 > b1 and a2 > b2 and A < B) or (a1 < b1 and a2 < b2 and A > B):
        hits += 1

print(f"⟨Таблиць з парадоксом|Tables with the paradox⟩: {100 * hits / TABLES:.2f}%")
print(f"⟨Точно (Pavlides і Perlman, 2009)|Exact (Pavlides and Perlman, 2009)⟩: 1/60 = {100 / 60:.2f}%")
