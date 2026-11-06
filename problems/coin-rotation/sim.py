# ⟨Монета радіуса 1 котиться без ковзання навколо нерухомої монети радіуса R, зовні та всередині кільця. Скільки обертів зробить стрілка на ній?|A coin of radius 1 rolls without slipping around a fixed coin of radius R, outside it and inside a ring. How many turns does the arrow on it make?⟩
# ⟨Коло замінено 3600-кутником: на сторонах монета котиться, на кутах повертається навколо вершини.|The circle is replaced by a 3600-gon: on the sides the coin rolls, at the corners it pivots about the vertex.⟩
import math

N, r = 3600, 1.0

def roll(R, inside):
    side = 2 * R * math.sin(math.pi / N)                    # ⟨сторона многокутника|a side of the polygon⟩
    # ⟨всередині монета котиться по зсунутому на r многокутнику, а кутів не торкається|inside, the coin rolls along the polygon shifted in by r and never touches the corners⟩
    track = 2 * (R * math.cos(math.pi / N) - r) * math.tan(math.pi / N) if inside else side
    angle = prev = turns = 0.0                              # ⟨кут стрілки відносно стола|the arrow's angle relative to the table⟩
    for _ in range(N):
        angle += (-1 if inside else 1) * track / r          # ⟨прокотилася на track: поворот track / r|rolled a distance track: a turn of track / r⟩
        if not inside:
            angle += 2 * math.pi / N                        # ⟨поворот навколо вершини|the pivot about the vertex⟩
        # ⟨рахуємо оберти так, як рахувала б камера над столом: за кутом стрілки|count turns as a camera above the table would: from the arrow's angle⟩
        a = math.atan2(math.sin(angle), math.cos(angle))
        d = (a - prev + math.pi) % (2 * math.pi) - math.pi
        turns += d / (2 * math.pi)
        prev = a
    return abs(turns)

for R in [1, 2, 3, 4, 6]:
    print("R/r =", R, "⟨зовні|outside⟩", f"{roll(R, False):.4f}", "⟨формула|formula⟩", R + 1,
          "· ⟨всередині|inside⟩", f"{roll(R, True):.4f}", "⟨формула|formula⟩", R - 1)
