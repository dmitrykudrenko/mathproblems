# ⟨Частка чисел, що починаються з 1, у чотирьох наборах і за законом Бенфорда|Share of numbers starting with 1 in four sets and by Benford's law⟩
import math
import random


def share1(nums):
    return sum(s[0] == "1" for s in nums) / len(nums)


pow2 = [str(2 ** n) for n in range(1, 1001)]       # ⟨2¹…2¹⁰⁰⁰ точно: цілі в Python не мають межі|2¹…2¹⁰⁰⁰ exactly: Python integers have no limit⟩

fib, a, b = [], 1, 1                               # ⟨числа Фібоначчі F₁…F₁₀₀₀|Fibonacci numbers F₁…F₁₀₀₀⟩
for _ in range(1000):
    fib.append(str(a))
    a, b = b, a + b

prods = []                                         # ⟨добуток 10 випадкових чисел від 1 до 10, 100 000 разів|product of 10 random numbers from 1 to 10, 100,000 times⟩
for _ in range(100_000):
    x = math.prod(random.uniform(1, 10) for _ in range(10))
    prods.append(f"{x:e}")                         # ⟨запис 1.234e+07: перша цифра стоїть першою|written as 1.234e+07: the first digit comes first⟩

whole = [str(n) for n in range(1, 1000)]           # ⟨контрприклад: цілі від 1 до 999|counterexample: whole numbers 1 to 999⟩

print(f"⟨Степені двійки|Powers of two⟩: {share1(pow2):.1%}")
print(f"⟨Числа Фібоначчі|Fibonacci numbers⟩: {share1(fib):.1%}")
print(f"⟨Добутки 10 чисел|Products of 10 numbers⟩: {share1(prods):.1%}")
print(f"⟨Цілі 1…999|Whole numbers 1…999⟩: {share1(whole):.1%}")
print(f"⟨Закон Бенфорда, log₁₀ 2|Benford's law, log₁₀ 2⟩: {math.log10(2):.1%}")
