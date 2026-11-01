# ⟨100 в'язнів, стратегія петлі: кожен відкриває свою коробку, потім коробку з номером, який знайшов, і так 50 разів.|100 prisoners, the loop strategy: each opens their own box, then the box with the number found inside, up to 50 times.⟩
import random

N, TRIES, TRIALS = 100, 50, 100_000


def all_free():
    box = list(range(N))                  # ⟨box[i] — номер у коробці i|box[i] is the number in box i⟩
    random.shuffle(box)
    for p in range(N):                    # ⟨в'язень p|prisoner p⟩
        b = p
        for _ in range(TRIES):
            if box[b] == p:
                break
            b = box[b]                    # ⟨далі коробка з номером, що всередині|next: the box with the number inside⟩
        else:
            return False                  # ⟨50 спроб, а свого номера немає|50 tries and no own number⟩
    return True


wins = sum(all_free() for _ in range(TRIALS))
exact = 1 - sum(1 / k for k in range(TRIES + 1, N + 1))
print(f"⟨усі на волі: симуляція|all go free: simulation⟩ {100 * wins / TRIALS:.2f}%, ⟨точно|exact⟩ {100 * exact:.2f}%")
