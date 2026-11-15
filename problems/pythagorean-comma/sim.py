# ⟨Скільки чистих квінт (×3/2) найкраще збігаються з цілою кількістю октав (×2)? Перебираємо n від 1 до 60.|How many pure fifths (×3/2) best match a whole number of octaves (×2)? We try n from 1 to 60.⟩
from fractions import Fraction
from math import log2

best = float("inf")
for n in range(1, 61):
    fifths = Fraction(3, 2) ** n                           # ⟨n квінт угору, точний дріб|n fifths up, an exact fraction⟩
    m = round(log2(fifths))                                # ⟨найближча кількість октав|the nearest number of octaves⟩
    miss = fifths / 2 ** m - 1                             # ⟨промах: + перелет, − недолет|the miss: + over, − under⟩
    if abs(miss) < best:                                   # ⟨рекорд: ближче, ніж усі менші n|a record: closer than every smaller n⟩
        best = abs(miss)
        print("⟨квінт:|fifths:⟩", n, "≈ ⟨октав:|octaves:⟩", m, "· ⟨промах|miss⟩", f"{100 * float(miss):.3f}%")

# ⟨Точно: 12 квінт / 7 октав = 3^12 / 2^19|Exactly: 12 fifths / 7 octaves = 3^12 / 2^19⟩
comma = Fraction(3, 2) ** 12 / 2 ** 7
print("⟨Піфагорова кома|Pythagorean comma⟩", comma, "=", f"{float(comma):.5f}")
