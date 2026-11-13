# ⟨Сім'ї з двома дітьми: стать і день тижня кожної дитини випадкові (0 = понеділок, 1 = вівторок, …).|Two-child families: each child's sex and weekday are random (0 = Monday, 1 = Tuesday, …).⟩
import random

FAMILIES = 1_000_000

def kid():
    return random.random() < 0.5, random.randrange(7)   # ⟨(хлопчик?, день)|(boy?, day)⟩

def tue_boy(c):
    return c[0] and c[1] == 1

asked = asked_bb = met = met_bb = 0
for _ in range(FAMILIES):
    a, b = kid(), kid()
    bb = a[0] and b[0]
    # ⟨1) Ви спитали: «Є син, народжений у вівторок?» Батьки сказали «так».|1) You asked: "Do you have a son born on a Tuesday?" The parents said yes.⟩
    if tue_boy(a) or tue_boy(b):
        asked += 1
        asked_bb += bb
    # ⟨2) Ви зустріли одну випадкову дитину, і це хлопчик, народжений у вівторок.|2) You met one random child, and it is a boy born on a Tuesday.⟩
    seen = random.choice((a, b))
    if tue_boy(seen):
        met += 1
        met_bb += bb

print(f"⟨Спитали батьків: двоє синів у|Asked the parents: two sons in⟩ {100 * asked_bb / asked:.2f}% (⟨точно|exact⟩ 13/27 = {100 * 13 / 27:.2f}%)")
print(f"⟨Зустріли дитину: двоє синів у|Met a child: two sons in⟩ {100 * met_bb / met:.2f}% (⟨точно|exact⟩ 1/2 = 50.00%)")
