# ⟨Троє мандрівників: кроки 1/2ⁿ⁻¹, 1/n² і 1/n км. Куди вони дійдуть за мільйон кроків?|Three walkers: steps of 1/2ⁿ⁻¹, 1/n² and 1/n km. Where do they get in a million steps?⟩
import math

N = 1_000_000
GAMMA = 0.5772156649015329
a = b = c = 0.0
step, cross = 1.0, 0
for n in range(1, N + 1):
    a += step; step /= 2                   # ⟨A: кожен крок удвічі коротший|A: each step half the one before⟩
    b += 1 / n**2                          # ⟨B: крок 1/n²|B: a step of 1/n²⟩
    c += 1 / n                             # ⟨C: крок 1/n|C: a step of 1/n⟩
    if not cross and c > 10:               # ⟨перший крок за стовпом 10 км|the first step past the 10 km milestone⟩
        cross = n
print("A", f"{a:.10f}", "⟨межа|limit⟩ 2")
print("B", f"{b:.10f}", "⟨межа|limit⟩ π²/6 =", f"{math.pi**2 / 6:.10f}")
print("C", f"{c:.10f}", "ln n + γ =", f"{math.log(N) + GAMMA:.10f}", "⟨і росте далі|and still growing⟩")
print("⟨C минає 10 км на кроці|C passes 10 km at step⟩", cross)
