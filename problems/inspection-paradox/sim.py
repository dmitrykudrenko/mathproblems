# ⟨Автобуси без розкладу, в середньому раз на 10 хвилин. Пасажири приходять у випадкові моменти.|Buses with no timetable, one every 10 minutes on average. Riders arrive at random moments.⟩
import bisect
import random

MEAN, BUSES, RIDERS = 10, 100_000, 100_000

bus = [0.0]                               # ⟨моменти приходу автобусів, хвилини|bus arrival times, minutes⟩
for _ in range(BUSES):
    bus.append(bus[-1] + random.expovariate(1 / MEAN))  # ⟨випадкові інтервали; MEAN замість них дасть розклад і очікування 5|random gaps; MEAN instead gives a timetable and a wait of 5⟩
end = bus[-1]

wait = gap = 0.0
for _ in range(RIDERS):
    x = random.random() * end             # ⟨пасажир приходить|a rider arrives⟩
    hi = bisect.bisect_right(bus, x)      # ⟨перший автобус після x (двійковий пошук)|the first bus after x (binary search)⟩
    wait += bus[hi] - x
    gap += bus[hi] - bus[hi - 1]

print(f"⟨Звичайний інтервал між автобусами|An ordinary gap between buses⟩: {end / BUSES:.2f} ⟨хв|min⟩")
print(f"⟨Пасажир чекав у середньому|Average wait⟩: {wait / RIDERS:.2f} ⟨хв|min⟩")
print(f"⟨Інтервал, у який він потрапив|The gap the rider landed in⟩: {gap / RIDERS:.2f} ⟨хв|min⟩")
