# ⟨Парадокс Ньюкомба: 100 000 ігор з провидцем, що вгадує з точністю p|Newcomb's paradox: 100,000 games against a predictor that is right with probability p⟩
import random

N, A, M = 100_000, 1000, 1_000_000

for p in (0.9, 0.5):
    total = {"one": 0, "two": 0}
    count = {"one": 0, "two": 0}
    plus = 0
    for _ in range(N):
        choice = random.choice(("one", "two"))                   # ⟨гравець обирає навмання|the player picks at random⟩
        right = random.random() < p                              # ⟨провидець угадав?|did the predictor guess right?⟩
        said = choice if right else ("two" if choice == "one" else "one")
        B = M if said == "one" else 0                            # ⟨учора: мільйон у B лише для «лише B»|yesterday: a million in B only for "only B"⟩
        win = B if choice == "one" else A + B
        total[choice] += win
        count[choice] += 1
        if (A + B) - B == A:                                     # ⟨ті самі скриньки: «обидві» мінус «лише B»|same boxes: "both" minus "only B"⟩
            plus += 1
    print(f"p = {p:.0%}")
    print(f"  ⟨лише B|only B⟩:  {total['one'] / count['one']:.0f}   ⟨точно|exact⟩ {p * M:.0f}")
    print(f"  ⟨обидві|both⟩:   {total['two'] / count['two']:.0f}   ⟨точно|exact⟩ {A + (1 - p) * M:.0f}")
    print(f"  ⟨ігор, де «обидві» дають рівно +1000 до тих самих скриньок|games where \"both\" adds exactly +1000 to the same boxes⟩: {100 * plus / N:.1f}%")
