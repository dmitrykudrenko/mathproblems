# ⟨Бінго на 75 куль: 500 карток у залі, виграє перший повний рядок або стовпець. Якою лінією частіше виграє перша картка?|75-ball bingo: 500 cards in the hall, the first full row or column wins. Which line does the first winning card have more often?⟩
import random

CARDS, GAMES = 500, 2000                                   # ⟨Python повільніший, тож ігор менше: похибка близько 1 п. п.|Python is slower, so fewer games: about 1 point of noise⟩


def card():
    # ⟨5 стовпців B I N G O, у кожному 5 чисел зі свого п'ятнадцятка; центр вільний (0 = вже закрито)|5 columns B I N G O, each with 5 numbers from its own fifteen; the centre is free (0 = already marked)⟩
    cols = [random.sample(range(15 * c + 1, 15 * c + 16), 5) for c in range(5)]
    cols[2][2] = 0
    return cols


only_h = only_v = both = 0
for _ in range(GAMES):
    order = random.sample(range(1, 76), 75)
    when = {b: i + 1 for i, b in enumerate(order)}         # ⟨на якій кулі назвали число|which ball called each number⟩
    when[0] = 0
    first, h, v = 99, False, False
    for _ in range(CARDS):
        t = [[when[x] for x in col] for col in card()]     # t[c][r]
        col = min(max(c) for c in t)                       # ⟨перший повний стовпець|first full column⟩
        row = min(max(c[r] for c in t) for r in range(5))  # ⟨перший повний рядок|first full row⟩
        m = min(row, col)
        if m < first:
            first, h, v = m, row == m, col == m
        elif m == first:                                   # ⟨кілька карток на одній кулі|several cards on the same ball⟩
            h, v = h or row == m, v or col == m
    if h and v:
        both += 1
    elif h:
        only_h += 1
    else:
        only_v += 1

p = lambda x: f"{100 * x / GAMES:.1f}%"
print("⟨Лише горизонтальна|Only horizontal⟩:", p(only_h), "· ⟨лише вертикальна|only vertical⟩:", p(only_v), "· ⟨обидві на одній кулі|both on the same ball⟩:", p(both))
print("⟨Для порівняння, 200 000 ігор|For comparison, 200,000 games⟩: 62.6% · 34.7% · 2.7%")
