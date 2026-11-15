# ⟨Колода з 52 карт і одного джокера. Джокер стає будь-якою картою, і власник робить з нього найсильнішу руку. Що трапляється частіше: трійка чи дві пари?|A 52-card deck plus one joker. The joker becomes any card, and its holder makes the strongest hand. Which turns up more often: three of a kind or two pair?⟩
import random
from collections import Counter

N = 1_000_000                                            # ⟨роздач по 5 карт|five-card deals⟩
JOKER = 52                                               # ⟨карти 0–51: ранг c // 4, масть c % 4|cards 0–51: rank c // 4, suit c % 4⟩

# ⟨0 старша карта, 1 пара, 2 дві пари, 3 трійка, 4 стрит, 5 флеш, 6 фул-хаус, 7 каре, 8 стрит-флеш, 9 п'ять однакових|0 high card, 1 pair, 2 two pair, 3 three of a kind, 4 straight, 5 flush, 6 full house, 7 four of a kind, 8 straight flush, 9 five of a kind⟩
def kind(h):
    k = sorted(Counter(c // 4 for c in h).values(), reverse=True)
    flush = len({c % 4 for c in h}) == 1
    r = sorted(c // 4 for c in h)
    straight = len(k) == 5 and (r[4] - r[0] == 4 or r == [0, 1, 2, 3, 12])
    if k[0] == 5: return 9
    if straight and flush: return 8
    if k[0] == 4: return 7
    if k[:2] == [3, 2]: return 6
    if flush: return 5
    if straight: return 4
    if k[0] == 3: return 3
    if k[:2] == [2, 2]: return 2
    return 1 if k[0] == 2 else 0

ORDERS = {"⟨звичайний порядок|usual order⟩": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], "⟨дві пари вище за трійку|two pair above three of a kind⟩": [0, 1, 3, 2, 4, 5, 6, 7, 8, 9]}
count = {o: Counter() for o in ORDERS}
for _ in range(N):
    hand = random.sample(range(53), 5)
    rest = [c for c in hand if c != JOKER]
    # ⟨усі руки, які може дати джокер (він може повторити карту з руки)|every hand the joker can make (it may copy a card in the hand)⟩
    can = {kind(rest)} if len(rest) == 5 else {kind(rest + [c]) for c in range(52)}
    for o, order in ORDERS.items():
        count[o][max(can, key=order.index)] += 1

for o in ORDERS:
    print(o + ": ⟨дві пари|two pair⟩", f"{100 * count[o][2] / N:.2f}%", "· ⟨трійка|three of a kind⟩", f"{100 * count[o][3] / N:.2f}%")
print("⟨точно|exact⟩: 4.31% · 4.78% ⟨і|and⟩ 7.18% · 1.91%")
