# ⟨Три двері: за одними авто. Ведучий знає, де авто, і завжди відчиняє двері з козою.|Three doors, a car behind one. The host knows where it is and always opens a goat door.⟩
import random

GAMES, P = 1_000_000, 0.5                 # ⟨P: частка ігор, у яких гравець міняє вибір|P: the share of games in which the player switches⟩

stay = sw = mix = kept = kept_stay = 0
for _ in range(GAMES):
    car, pick = random.randrange(3), random.randrange(3)
    host = random.choice([d for d in range(3) if d != pick and d != car])   # ⟨коза, і не ваші двері|a goat, and not your door⟩
    other = 3 - pick - host               # ⟨двері, на які можна змінити вибір|the door you can switch to⟩
    stay += pick == car
    sw += other == car
    mix += (other if random.random() < P else pick) == car
    if pick == 0 and host == 2:           # ⟨лише ігри «обрали 1, відчинено 3»|only games "picked 1, host opened 3"⟩
        kept += 1
        kept_stay += pick == car

print(f"⟨Залишатися|Stay⟩: {stay / GAMES:.1%} (⟨теорія|theory⟩ 33.3%)   ⟨Міняти|Switch⟩: {sw / GAMES:.1%} (⟨теорія|theory⟩ 66.7%)")
print(f"⟨Лише «обрали 1, відчинено 3»|Only \"picked 1, host opened 3\"⟩ ({kept} ⟨ігор|games⟩): ⟨залишатися|stay⟩ {kept_stay / kept:.1%}, ⟨міняти|switch⟩ {1 - kept_stay / kept:.1%}")
print(f"⟨Міняти в|Switch in⟩ {P:.1%} ⟨ігор|of games⟩: {mix / GAMES:.1%} (⟨теорія|theory⟩ (1 + P)/3 = {(1 + P) / 3:.1%})")
