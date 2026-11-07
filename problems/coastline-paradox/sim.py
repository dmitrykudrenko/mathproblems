# ⟨Випадкові острови з фрактальною розмірністю D: кожна сторона стає 4 копіями довжини r з горбом у море чи в суходіл, 4 · r^D = 1.|Random islands with fractal dimension D: every side becomes 4 copies of length r with a bump into the sea or the land, 4 · r^D = 1.⟩
# ⟨Кожен острів проходимо циркулем із різними кроками й порівнюємо приріст довжини із законом Річардсона 2^(D−1).|Each island is walked with dividers at several steps, and the growth in length is compared with Richardson's law 2^(D−1).⟩
import math, random

KM, D, ISLANDS, STEPS = 400, 1.25, 100, [100, 50, 25, 12.5]

def island(D):
    r = 4 ** (-1 / D)
    hb = (1 - 2 * r) / 2
    h = math.sqrt(r * r - hb * hb)
    P = []
    for i in range(7):
        a = 2 * math.pi * i / 7 + (random.random() - .5) * .5
        rad = 1 + (random.random() - .5) * .45
        P.append((math.cos(a) * rad, math.sin(a) * rad))
    for _ in range(5):
        Q = []
        for i, A in enumerate(P):
            B = P[(i + 1) % len(P)]
            ux, uy = B[0] - A[0], B[1] - A[1]
            s = 1 if random.random() < .5 else -1
            Q += [A, (A[0] + r * ux, A[1] + r * uy), (A[0] + .5 * ux + s * h * uy, A[1] + .5 * uy - s * h * ux),
                  (A[0] + (1 - r) * ux, A[1] + (1 - r) * uy)]
        P = Q
    return P

# ⟨циркуль: наступна ніжка стає туди, де берег уперше виходить з кола радіуса eps навколо попередньої|dividers: the next leg lands where the coast first leaves the circle of radius eps around the last one⟩
def measure(P, eps):
    n = len(P)
    cx, cy = P[0]
    i = steps = 0
    while True:
        k = i
        while k < n:
            B = P[(k + 1) % n]
            if (B[0] - cx) ** 2 + (B[1] - cy) ** 2 >= eps * eps:
                break
            k += 1
        if k == n:
            return steps * eps + math.hypot(P[0][0] - cx, P[0][1] - cy)
        A = (cx, cy) if k == i else P[k]
        B = P[(k + 1) % n]
        ex, ey, fx, fy = B[0] - A[0], B[1] - A[1], A[0] - cx, A[1] - cy
        a, b, c = ex * ex + ey * ey, 2 * (ex * fx + ey * fy), fx * fx + fy * fy - eps * eps
        t = (-b + math.sqrt(max(0, b * b - 4 * a * c))) / (2 * a)
        cx, cy = A[0] + t * ex, A[1] + t * ey
        i, steps = k, steps + 1

logs = [0.0] * len(STEPS)
for _ in range(ISLANDS):
    P = island(D)
    for i, e in enumerate(STEPS):
        logs[i] += math.log(measure(P, e / KM) * KM) / ISLANDS
for i, e in enumerate(STEPS):
    grow = f"⟨, приріст|, growth⟩ +{100 * (math.exp(logs[i] - logs[i - 1]) - 1):.1f}%" if i else ""
    print("⟨крок|step⟩", e, "⟨км: середня довжина|km: average length⟩", f"{math.exp(logs[i]):.0f}", grow)
per = math.exp((logs[-1] - logs[0]) / (len(STEPS) - 1))
print("⟨Удвічі коротший крок, у середньому:|Step halved, on average:⟩", f"×{per:.3f}", "⟨закон Річардсона 2^(D−1) =|Richardson's law 2^(D−1) =⟩", f"{2 ** (D - 1):.3f}")
# ⟨для порівняння коло радіуса 400 км: довжина виходить на 2πr|for comparison, a circle of radius 400 km: the length settles at 2πr⟩
C = [(math.cos(2 * math.pi * i / 4096), math.sin(2 * math.pi * i / 4096)) for i in range(4096)]
print("⟨Коло, кроки 100 і 50 км:|Circle, steps of 100 and 50 km:⟩", f"{measure(C, 100 / KM) * KM:.1f}", f"{measure(C, 50 / KM) * KM:.1f}", "2πr =", f"{2 * math.pi * KM:.1f}")
