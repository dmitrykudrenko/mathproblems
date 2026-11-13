# ⟨Підлога з дощок шириною d = 1, сірник такої самої довжини. Кидаємо його DROPS разів і рахуємо перетини швів.|A floor of boards of width d = 1 and a match of the same length. Drop it DROPS times and count seam crossings.⟩
import math
import random

DROPS = 1_000_000


def direction():
    # ⟨Випадковий напрям без π: точка в прямокутнику, яку лишаємо, лише якщо вона в півкрузі.|A random direction without π: a point in a rectangle, kept only if it is inside a half-disc.⟩
    while True:
        u, v = 2 * random.random() - 1, random.random()
        r = math.hypot(u, v)
        if 0 < r <= 1:
            return u / r                          # ⟨косинус кута до напряму поперек дощок|cosine of the angle across the boards⟩


crossings = 0
for _ in range(DROPS):
    centre = random.random()                      # ⟨де впав центр сірника, шви на x = 0, 1, 2…|where the match's centre lands, seams at x = 0, 1, 2…⟩
    reach = direction() / 2                       # ⟨наскільки половина сірника сягає поперек дощок|how far half the match reaches across the boards⟩
    if math.floor(centre + reach) != math.floor(centre - reach):
        crossings += 1

estimate = 2 * DROPS / crossings                  # ⟨частка перетинів дорівнює 2/π, тож π ≈ 2 · кидки / перетини|the share of crossings is 2/π, so π ≈ 2 · drops / crossings⟩
print(f"⟨Кидків|Drops⟩: {DROPS}, ⟨перетинів|crossings⟩: {crossings} ({100 * crossings / DROPS:.2f}%, ⟨теорія|theory⟩ {200 / math.pi:.2f}%)")
print(f"⟨Оцінка π|π estimate⟩: {estimate:.4f}, ⟨справжнє|true⟩ {math.pi:.4f}, ⟨типова похибка|typical error⟩ ±{2.37 / math.sqrt(DROPS):.4f}")
