# ⟨Випадкові ради: від 2 до 12 районів з населенням від 1 до 100 тисяч, від 10 до 40 місць. Додаємо одне місце: чи втрачає хтось місце?|Random councils: 2 to 12 districts of 1 to 100 thousand people, 10 to 40 seats. Add one seat: does anyone lose a seat?⟩
import math, random

def largest_remainder(p, h):
    P = sum(p)
    q = [x * h / P for x in p]
    s = [math.floor(x) for x in q]
    order = sorted(range(len(p)), key=lambda i: q[i] - s[i], reverse=True)
    for i in order[:h - sum(s)]:                            # ⟨зайві місця — найбільшим залишкам|leftover seats go to the largest remainders⟩
        s[i] += 1
    return s

def d_hondt(p, h):                                          # ⟨наступне місце — найбільшому p / (s + 1)|the next seat goes to the largest p / (s + 1)⟩
    s = [0] * len(p)
    for _ in range(h):
        s[max(range(len(p)), key=lambda i: p[i] / (s[i] + 1))] += 1
    return s

print("6·6·2 ⟨тис.|thousand⟩: 10 ⟨місць|seats⟩", largest_remainder([6, 6, 2], 10), "11 ⟨місць|seats⟩", largest_remainder([6, 6, 2], 11))

def loses(f, p, h):
    a, b = f(p, h), f(p, h + 1)
    return any(y < x for x, y in zip(a, b))

T = 20000
for n in [2, 3, 4, 6, 8, 12]:
    ham = dh = 0
    for _ in range(T):
        p = [1 + 99 * random.random() for _ in range(n)]
        h = random.randint(10, 40)
        ham += loses(largest_remainder, p, h)
        dh += loses(d_hondt, p, h)
    print("⟨районів|districts⟩", n, "· ⟨найбільші залишки|largest remainders⟩", f"{100 * ham / T:.1f}%", "· ⟨д'Ондт|D'Hondt⟩", dh)
