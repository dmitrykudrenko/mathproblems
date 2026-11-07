# ⟨100 кг картоплі з 99 % води. Випаровуємо воду по граму й зважуємо мішок, доки частка води не стане потрібною.|100 kg of potatoes at 99% water. Evaporate water a gram at a time and weigh the sack until the water share reaches the target.⟩
# ⟨Частки в десятих частках відсотка, маси в грамах: лише цілі числа, без похибок округлення.|Shares in tenths of a percent, masses in grams: whole numbers only, no rounding errors.⟩
START, DRY = 100000, 1000                         # ⟨1 % від 100 000 г — суха речовина, вона не випаровується|1% of 100,000 g is dry matter; it does not evaporate⟩

def weigh(target):                                # ⟨target: частка води, наприклад 980 = 98 %|target: the water share, e.g. 980 = 98%⟩
    total = START
    if 1000 * (total - DRY) >= target * total:
        while 1000 * (total - DRY) > target * total:
            total -= 1                            # ⟨сушимо|dry⟩
    else:
        while 1000 * (total - DRY) < target * total:
            total += 1                            # ⟨замочуємо|soak⟩
    return total

for t in [995, 980, 970, 950, 900, 500]:
    kg = weigh(t) / 1000
    formula = (DRY / 1000) / (1 - t / 1000)       # ⟨суха речовина / частка сухого|dry matter / dry share⟩
    print(f"{t / 10:g}% ⟨води|water⟩: {kg:.3f} ⟨кг, формула|kg, formula⟩ {formula:.3f} ⟨кг, інтуїція|kg, intuition⟩ {100 - (99 - t / 10):.1f}")
