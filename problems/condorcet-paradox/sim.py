# ⟨Кожен виборець ранжує m варіантів випадково й чесно. Як часто жоден варіант не перемагає всі інші в парних голосуваннях?|Each voter ranks m options at random and votes honestly. How often does no option beat every other one head to head?⟩
import math, random

def no_winner(m, n, trials):
    cycles = 0
    for _ in range(trials):
        wins = [[0] * m for _ in range(m)]   # ⟨wins[i][j]: скільки людей ставлять i вище за j|wins[i][j]: how many people put i above j⟩
        for _ in range(n):
            order = random.sample(range(m), m)
            for a in range(m):
                for b in range(a + 1, m):
                    wins[order[a]][order[b]] += 1
        # ⟨переможець Кондорсе має більшість проти кожного суперника|a Condorcet winner has a majority against every rival⟩
        has_winner = any(all(j == i or 2 * wins[i][j] > n for j in range(m)) for i in range(m))
        if not has_winner:
            cycles += 1
    return cycles / trials

exact3 = {3: 1 / 18, 5: 5 / 72, 7: 875 / 11664, 101: 0.086901}
for n in [3, 5, 7, 101]:
    print("⟨варіантів: 3, виборців:|options: 3, voters:⟩", n, "⟨→ без переможця|→ no winner in⟩", f"{100 * no_winner(3, n, 20000):.2f}%", "⟨точно|exact⟩", f"{100 * exact3[n]:.2f}%")
print("⟨Межа для безлічі виборців (Ґільбо):|Limit for very many voters (Guilbaud):⟩", f"{100 * (1 / 4 - 3 / (2 * math.pi) * math.asin(1 / 3)):.2f}%")
for m in [4, 5, 10]:
    print("⟨варіантів:|options:⟩", f"{m},", "⟨виборців: 101 → без переможця|voters: 101 → no winner in⟩", f"{100 * no_winner(m, 101, 4000):.1f}%")
