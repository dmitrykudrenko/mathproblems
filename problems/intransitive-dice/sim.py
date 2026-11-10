# ⟨Чотири кості Ефрона. Ви обираєте кість першим, суперник бере одну з решти, і виграє більше число. Який ваш шанс, якщо суперник обирає найкращу відповідь?|Efron's four dice. You choose a die first, your opponent takes one of the rest, and the higher roll wins. What is your chance if your opponent picks the best reply?⟩
import random

DICE = {"A": [4, 4, 4, 4, 0, 0], "B": [3, 3, 3, 3, 3, 3], "C": [6, 6, 2, 2, 2, 2], "D": [5, 5, 5, 1, 1, 1]}
N = 100_000                                                # ⟨кидків на кожну пару|rolls per pair⟩

win = {}
for x in DICE:
    for y in DICE:
        if x != y:
            # ⟨нічиїх у цих костях не буває|these dice never tie⟩
            w = sum(random.choice(DICE[x]) > random.choice(DICE[y]) for _ in range(N))
            win[x + y] = w / N                             # ⟨частка кидків, де x більше за y|share of rolls where x is higher than y⟩

for me in DICE:
    # ⟨суперник бере ту кість, яка найчастіше б'є вашу|the opponent takes the die that beats yours most often⟩
    reply = max((y for y in DICE if y != me), key=lambda y: win[y + me])
    print("⟨Ви|You⟩", me, "· ⟨суперник|opponent⟩", reply, "· ⟨ваш шанс|your chance⟩", f"{1 - win[reply + me]:.3f}", "⟨точно|exact⟩ 1/3 = 0.333")
