#!/usr/bin/env python3
"""Draw the 1200x630 social-preview images (og-uk.png / og-en.png) for the hub and every problem.

macOS only: renders SVG with Quick Look (qlmanage) and crops with sips.
Usage:  python3 tools/og.py
"""
import random
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INK, SIGNAL, SOFT, MUTED = "#151515", "#D9318F", "#FBE3F0", "#6B6B6B"
TINT = {"monty-hall": "#EEEAFF", "birthday": "#E6F8D8", "false-positive": "#FFEEDD", "secretary-problem": "#E3F1FF", "simpson-paradox": "#E8F6F3", "two-children": "#FCE4EC", "buffon-needle": "#FFF6CC", "friendship-paradox": "#F5E6F0", "duckweed-lake": "#EAF0D8", "rope-around-earth": "#D9F2F5", "hundred-prisoners": "#F0E6DC", "cognitive-reflection": "#FFE3D3", "coupon-collector": "#E2F5E9", "regression-to-mean": "#EDEDF7", "two-envelopes": "#FDF0DE", "coin-streaks": "#E5EEF0", "bertrand-paradox": "#F3F7D9", "penney-game": "#FBE9E1", "inspection-paradox": "#FCEFC7", "german-tank-problem": "#E6EBDD", "st-petersburg-paradox": "#E9E3F3", "benford-law": "#E0ECF6", "poisoned-wine": "#F3E3EA", "election-poll": "#E2E8F3", "two-eggs": "#FFF3D1", "twelve-coins": "#E6EDF2", "hats-parity": "#EFE3F6", "pirates-gold": "#F9E7C4", "blue-eyed-islanders": "#DDEBFA", "twenty-five-horses": "#E5EFD2", "bridge-and-torch": "#FCE6D2", "braess-paradox": "#E8E0D0", "survivorship-bias": "#DCE6E1", "sleeping-beauty": "#E1E2FA", "hub": "#EEEAFF"}
FONT = "Helvetica Neue, Arial, sans-serif"

TEXT = {
    "monty-hall": {
        "uk": (["ПАРАДОКС", "МОНТІ ГОЛЛА"], "Змінювати вибір?"),
        "en": (["THE MONTY", "HALL PROBLEM"], "Should you switch?"),
    },
    "birthday": {
        "uk": (["ПАРАДОКС ДНІВ", "НАРОДЖЕННЯ"], "Скільки людей потрібно?"),
        "en": (["THE BIRTHDAY", "PARADOX"], "How many people does it take?"),
    },
    "false-positive": {
        "uk": (["ПАРАДОКС", "ХИБНОГО ТЕСТУ"], "Тест точний на 99%. Ви хворі?"),
        "en": (["THE FALSE", "POSITIVE PARADOX"], "The test is 99% accurate. Are you ill?"),
    },
    "secretary-problem": {
        "uk": (["ЗАДАЧА ПРО", "СЕКРЕТАРЯ"], "Як обрати найкращого з сотні?"),
        "en": (["THE SECRETARY", "PROBLEM"], "How to pick the best of a hundred?"),
    },
    "simpson-paradox": {
        "uk": (["ПАРАДОКС", "СІМПСОНА"], "Який метод лікування кращий?"),
        "en": (["SIMPSON'S", "PARADOX"], "Which treatment is better?"),
    },
    "two-children": {
        "uk": (["ПАРАДОКС", "ДВОХ ДІТЕЙ"], "Хоча б один хлопчик. Обидва?"),
        "en": (["THE TWO-CHILD", "PARADOX"], "At least one is a boy. Both?"),
    },
    "buffon-needle": {
        "uk": (["ГОЛКА", "БЮФФОНА"], "Який шанс, що сірник перетне лінію?"),
        "en": (["BUFFON'S", "NEEDLE"], "Will a dropped match cross a line?"),
    },
    "friendship-paradox": {
        "uk": (["ПАРАДОКС", "ДРУЖБИ"], "У кого більше друзів: у вас чи в них?"),
        "en": (["THE FRIENDSHIP", "PARADOX"], "Who has more friends: you or them?"),
    },
    "duckweed-lake": {
        "uk": (["РЯСКА", "В ОЗЕРІ"], "1 рослина: 30 днів. 2 рослини: ?"),
        "en": (["THE DUCKWEED", "LAKE"], "1 plant: 30 days. 2 plants: ?"),
    },
    "rope-around-earth": {
        "uk": (["МОТУЗКА", "НАВКОЛО ЗЕМЛІ"], "+1 метр. Наскільки вона підніметься?"),
        "en": (["THE ROPE AROUND", "THE EARTH"], "+1 metre. How high does it rise?"),
    },
    "hundred-prisoners": {
        "uk": (["100 В'ЯЗНІВ"], "Кожен може відкрити 50 коробок. Шанс?"),
        "en": (["100 PRISONERS"], "Each may open 50 boxes. The odds?"),
    },
    "cognitive-reflection": {
        "uk": (["М'ЯЧ І БИТА"], "Разом 1,10 $. Скільки коштує м'яч?"),
        "en": (["BAT AND BALL"], "$1.10 together. How much is the ball?"),
    },
    "coupon-collector": {
        "uk": (["АЛЬБОМ", "НАЛІПОК"], "50 наліпок. Скільки треба купити?"),
        "en": (["THE STICKER", "ALBUM"], "50 stickers. How many to buy?"),
    },
    "regression-to-mean": {
        "uk": (["РЕГРЕСІЯ ДО", "СЕРЕДНЬОГО"], "Похвала шкодить, а критика допомагає?"),
        "en": (["REGRESSION TO", "THE MEAN"], "Does praise hurt and criticism help?"),
    },
    "two-envelopes": {
        "uk": (["ДВА", "КОНВЕРТИ"], "В одному вдвічі більше. Міняти?"),
        "en": (["TWO", "ENVELOPES"], "One holds twice as much. Switch?"),
    },
    "coin-streaks": {
        "uk": (["СЕРІЇ", "МОНЕТИ"], "Найдовша серія зі 100 підкидань?"),
        "en": (["COIN", "STREAKS"], "The longest streak in 100 flips?"),
    },
    "bertrand-paradox": {
        "uk": (["ПАРАДОКС", "БЕРТРАНА"], "Який шанс, що випадкова хорда довга?"),
        "en": (["BERTRAND'S", "PARADOX"], "Is a random chord long?"),
    },
    "penney-game": {
        "uk": (["ГРА", "ПЕННІ"], "ООО проти РОО: хто виграє?"),
        "en": (["PENNEY'S", "GAME"], "HHH against THH: who wins?"),
    },
    "inspection-paradox": {
        "uk": (["ПАРАДОКС", "АВТОБУСА"], "Автобус раз на 10 хв. Скільки чекати?"),
        "en": (["THE BUS", "PARADOX"], "A bus every 10 min. Your wait?"),
    },
    "german-tank-problem": {
        "uk": (["НІМЕЦЬКІ", "ТАНКИ"], "Номери 4, 10, 15, 60. Скільки танків?"),
        "en": (["THE GERMAN", "TANK PROBLEM"], "Serials 4, 10, 15, 60. How many?"),
    },
    "st-petersburg-paradox": {
        "uk": (["САНКТ-", "ПЕТЕРБУРЗЬКИЙ", "ПАРАДОКС"], "Скільки варто заплатити за гру?"),
        "en": (["ST. PETERSBURG", "PARADOX"], "How much would you pay to play?"),
    },
    "benford-law": {
        "uk": (["ЗАКОН", "БЕНФОРДА"], "Яка частка чисел починається з 1?"),
        "en": (["BENFORD'S", "LAW"], "What share of numbers start with 1?"),
    },
    "poisoned-wine": {
        "uk": (["ОТРУЄНЕ", "ВИНО"], "1000 пляшок. Скільки треба щурів?"),
        "en": (["THE POISONED", "WINE"], "1000 bottles. How many rats?"),
    },
    "election-poll": {
        "uk": (["СКІЛЬКИ", "ОПИТАТИ?"], "30 млн виборців, похибка ±3%"),
        "en": (["HOW MANY", "TO POLL?"], "30M voters, a ±3% margin"),
    },
    "two-eggs": {
        "uk": (["ДВА ЯЙЦЯ", "І 100 ПОВЕРХІВ"], "Скільки кидків у найгіршому разі?"),
        "en": (["TWO EGGS,", "100 FLOORS"], "How many drops in the worst case?"),
    },
    "twelve-coins": {
        "uk": (["12 МОНЕТ", "І ТЕРЕЗИ"], "Одна фальшива. Скільки зважувань?"),
        "en": (["12 COINS AND", "A BALANCE"], "One is fake. How many weighings?"),
    },
    "hats-parity": {
        "uk": (["КАПЕЛЮХИ", "В РЯД"], "100 людей. Скільки точно вгадають?"),
        "en": (["HATS", "IN A LINE"], "100 people. How many are sure to win?"),
    },
    "pirates-gold": {
        "uk": (["ПІРАТИ", "І ЗОЛОТО"], "5 піратів, 100 монет. Який поділ?"),
        "en": (["PIRATES", "AND GOLD"], "5 pirates, 100 coins. What split?"),
    },
    "blue-eyed-islanders": {
        "uk": (["ОСТРІВ", "БЛАКИТНООКИХ"], "Що зміниться після однієї фрази?"),
        "en": (["THE BLUE-EYED", "ISLANDERS"], "What does one sentence change?"),
    },
    "twenty-five-horses": {
        "uk": (["25 КОНЕЙ,", "5 ДОРІЖОК"], "Скільки забігів, щоб знайти трійку?"),
        "en": (["25 HORSES,", "5 LANES"], "How many races to find the top 3?"),
    },
    "bridge-and-torch": {
        "uk": (["МІСТ І", "ЛІХТАРИК"], "1, 2, 5, 10 хв. Скільки на всіх?"),
        "en": (["THE BRIDGE", "AND THE TORCH"], "1, 2, 5, 10 min. How long for all?"),
    },
    "braess-paradox": {
        "uk": (["ПАРАДОКС", "БРАЕСА"], "Нова дорога. Швидше чи повільніше?"),
        "en": (["BRAESS'S", "PARADOX"], "A new road. Faster or slower?"),
    },
    "survivorship-bias": {
        "uk": (["ПОМИЛКА ТИХ,", "ХТО ВИЖИВ"], "Куди ставити броню на літак?"),
        "en": (["SURVIVORSHIP", "BIAS"], "Where should the armour go?"),
    },
    "sleeping-beauty": {
        "uk": (["СПЛЯЧА", "КРАСУНЯ"], "Прокинулася. Шанс, що випав орел?"),
        "en": (["SLEEPING", "BEAUTY"], "She wakes. What is the chance of heads?"),
    },
    "hub": {
        "uk": (["МАТЕМАТИЧНІ", "ПАРАДОКСИ"], "Задачі, у яких інтуїція помиляється"),
        "en": (["MATH", "PARADOXES"], "Puzzles where intuition gets it wrong"),
    },
}
# no answers on the previews: a shared link must not spoil the puzzle, so every problem ends with a question mark slot
ASK = {"uk": "ваша відповідь", "en": "your answer"}


def dots(x, y, w, h):
    return "".join(f'<circle cx="{x + i}" cy="{y + j}" r="1.3" fill="#151515" fill-opacity=".12"/>'
                   for i in range(8, w, 18) for j in range(8, h, 18))


def doors(x, y):
    out = []
    for i in range(3):
        dx = x + i * 118
        if i == 2:
            out.append(f'<rect x="{dx}" y="{y}" width="96" height="148" rx="10" fill="#fff" stroke="#C9C9C9" stroke-width="2" stroke-dasharray="7 6"/>')
            out.append(f'<g transform="translate({dx + 18},{y + 52}) scale(1.25)" fill="{MUTED}"><ellipse cx="21" cy="19" rx="13" ry="7.5"/>'
                       '<rect x="10" y="22" width="3" height="12" rx="1.5"/><rect x="15.5" y="23" width="3" height="11" rx="1.5"/>'
                       '<rect x="24" y="23" width="3" height="11" rx="1.5"/><rect x="29.5" y="22" width="3" height="12" rx="1.5"/>'
                       '<path d="M30 15l5-7 4 2-4 9z"/><ellipse cx="39.5" cy="11.5" rx="5.5" ry="4" transform="rotate(25 39.5 11.5)"/></g>')
        else:
            out.append(f'<rect x="{dx}" y="{y}" width="96" height="148" rx="10" fill="{INK}"/>')
            out.append(f'<text x="{dx + 48}" y="{y + 90}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="44" fill="#fff">{i + 1}</text>')
            out.append(f'<circle cx="{dx + 80}" cy="{y + 78}" r="5" fill="{SIGNAL}"/>')
        if i == 0:
            out.append(f'<rect x="{dx - 7}" y="{y - 7}" width="110" height="162" rx="14" fill="none" stroke="{SIGNAL}" stroke-width="5"/>')
    return "".join(out)


def calendar(x, y):
    rnd = random.Random(23)
    days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    picks = rnd.sample(range(365), 22)
    picks.append(picks[5])
    out, s, idx = [], 12, 0
    for m in range(12):
        for d in range(31):
            if d >= days[m]:
                continue
            c = picks.count(idx)
            fill = SIGNAL if c > 1 else (INK if c else "#E6E6E6")
            out.append(f'<rect x="{x + d * s}" y="{y + m * s}" width="{s - 3}" height="{s - 3}" rx="2" fill="{fill}"/>')
            idx += 1
    return "".join(out)


def people(x, y):
    # 10x10 grid: two positive results, with no hint which of them is really sick
    out = []
    for r in range(10):
        for c in range(10):
            cx, cy = x + c * 34, y + r * 34
            if (r, c) in ((2, 6), (7, 2)):
                out.append(f'<circle cx="{cx}" cy="{cy}" r="9.5" fill="#fff" stroke="{SIGNAL}" stroke-width="3"/>')
            else:
                out.append(f'<circle cx="{cx}" cy="{cy}" r="11" fill="{INK}" fill-opacity=".85"/>')
    return "".join(out)


def candidates(x, y):
    rnd = random.Random(7)
    hs = [rnd.randint(40, 200) for _ in range(20)]
    best_seen = max(hs[:7])
    pick = next(i for i in range(7, 20) if hs[i] > best_seen)
    # candidates in order of arrival, no cut-off line: the 37% is the answer
    out = []
    for i, h in enumerate(hs):
        fill = SIGNAL if i == pick else INK
        out.append(f'<rect x="{x + i * 19}" y="{y + 210 - h}" width="13" height="{h}" rx="3" fill="{fill}"/>')
    return "".join(out)


def simpson(x, y, lang):
    # only the overall results the visitor picks from; the per-group reversal is the answer
    names = {"uk": ("метод A", "метод B"), "en": ("method A", "method B")}[lang]
    out = []
    for k, v in enumerate((78, 83)):
        bx, h = x + 40 + k * 150, v * 2.4
        out.append(f'<rect x="{bx}" y="{y + 220 - h}" width="90" height="{h}" rx="8" fill="{INK if k == 0 else SIGNAL}"/>')
        out.append(f'<text x="{bx + 45}" y="{y + 210 - h}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="26" fill="{INK}">{v}%</text>')
        out.append(f'<text x="{bx + 45}" y="{y + 252}" text-anchor="middle" font-family="{FONT}" font-weight="700" font-size="18" fill="{MUTED}">{names[k]}</text>')
    return "".join(out)


def kids(x, y):
    out = []
    for i, pair in enumerate(("BB", "BG", "GB", "GG")):
        cx, cy = x + (i % 2) * 180, y + (i // 2) * 150
        out.append(f'<rect x="{cx}" y="{cy}" width="160" height="128" rx="18" fill="#fff"/>')
        for k, ch in enumerate(pair):
            px = cx + 52 + k * 56
            col = INK if ch == "B" else "#BDBDBD"
            out.append(f'<circle cx="{px}" cy="{cy + 46}" r="16" fill="{col}"/><rect x="{px - 18}" y="{cy + 66}" width="36" height="40" rx="12" fill="{col}"/>')
    return "".join(out)


def needles(x, y):
    import math
    rnd = random.Random(3)
    out = [f'<clipPath id="board"><rect x="{x}" y="{y}" width="380" height="300" rx="16"/></clipPath>',
           f'<rect x="{x}" y="{y}" width="380" height="300" rx="16" fill="#fff"/><g clip-path="url(#board)">']
    for k in range(1, 5):
        out.append(f'<line x1="{x}" y1="{y + k * 60}" x2="{x + 380}" y2="{y + k * 60}" stroke="#C9C9C9" stroke-width="2"/>')
    for _ in range(26):
        cx, cy, a = x + 30 + rnd.random() * 320, y + 20 + rnd.random() * 260, rnd.random() * math.pi
        dx, dy = 30 * math.cos(a), 30 * math.sin(a)
        y1, y2 = cy - dy, cy + dy
        cross = any(min(y1, y2) <= y + k * 60 <= max(y1, y2) for k in range(1, 5))
        out.append(f'<line x1="{cx - dx:.1f}" y1="{y1:.1f}" x2="{cx + dx:.1f}" y2="{y2:.1f}" stroke="{SIGNAL if cross else INK}" stroke-width="5" stroke-linecap="round"/>')
    return "".join(out) + "</g>"


def network(x, y):
    import math
    rnd = random.Random(11)
    hub = (x + 190, y + 150)
    pts = [(x + 190 + 140 * math.cos(t) * (0.75 + 0.3 * rnd.random()), y + 150 + 120 * math.sin(t) * (0.75 + 0.3 * rnd.random()))
           for t in [i * 2 * math.pi / 11 for i in range(11)]]
    out = []
    for p in pts:
        out.append(f'<line x1="{hub[0]}" y1="{hub[1]}" x2="{p[0]:.1f}" y2="{p[1]:.1f}" stroke="#BDBDBD" stroke-width="2.5"/>')
    for i in range(0, 11, 3):
        a, b = pts[i], pts[(i + 1) % 11]
        out.append(f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}" stroke="#BDBDBD" stroke-width="2.5"/>')
    for i, p in enumerate(pts):
        out.append(f'<circle cx="{p[0]:.1f}" cy="{p[1]:.1f}" r="14" fill="{SIGNAL if i == 4 else INK}"/>')
    out.append(f'<circle cx="{hub[0]}" cy="{hub[1]}" r="14" fill="{INK}"/>')
    return "".join(out)


def lake(x, y):
    import math
    rnd = random.Random(29)
    cx, cy, r = x + 190, y + 150, 140
    out = [f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#fff"/>',
           f'<clipPath id="lake"><circle cx="{cx}" cy="{cy}" r="{r}"/></clipPath><g clip-path="url(#lake)">']
    # a few plants on a clean lake; how fast it fills is the puzzle
    for _ in range(14):
        a, d = rnd.random() * 2 * math.pi, 28 * math.sqrt(rnd.random())
        px, py = cx - 30 + d * math.cos(a), cy + 10 + d * math.sin(a)
        out.append(f'<circle cx="{px:.1f}" cy="{py:.1f}" r="{rnd.uniform(5, 9):.1f}" fill="{INK}" fill-opacity="{rnd.uniform(.75, 1):.2f}"/>')
    out.append(f'</g><circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{SIGNAL}" stroke-width="5"/>')
    return "".join(out)


def extra_visual(kind, x, y, lang="en"):
    import math
    rnd = random.Random(5)
    out = []
    if kind == "rope-around-earth":
        cx, cy = x + 190, y + 160
        out += [f'<circle cx="{cx}" cy="{cy}" r="120" fill="{INK}"/>',
                f'<circle cx="{cx}" cy="{cy}" r="134" fill="none" stroke="{SIGNAL}" stroke-width="5"/>',
                f'<line x1="{cx}" y1="{cy - 120}" x2="{cx}" y2="{cy - 134}" stroke="{SIGNAL}" stroke-width="3"/>',
                f'<text x="{cx}" y="{cy + 8}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="34" fill="#fff">{"+1 м" if lang == "uk" else "+1 m"}</text>']
    elif kind == "hundred-prisoners":
        # 100 numbered closed boxes; the loop strategy is the answer, so it is not drawn
        for i in range(100):
            px, py = x + 22 + (i % 10) * 34, y + 6 + (i // 10) * 29
            out.append(f'<rect x="{px}" y="{py}" width="28" height="23" rx="4" fill="{SIGNAL if i == 36 else INK}"/>')
            out.append(f'<text x="{px + 14}" y="{py + 16}" text-anchor="middle" font-family="{FONT}" font-weight="700" font-size="11" fill="#fff">{i + 1}</text>')
    elif kind == "cognitive-reflection":
        out += [f'<rect x="{x + 20}" y="{y + 90}" width="300" height="56" rx="10" fill="{INK}"/>',
                f'<rect x="{x + 320}" y="{y + 90}" width="15" height="56" rx="4" fill="{SIGNAL}"/>',
                f'<rect x="{x + 20}" y="{y + 170}" width="15" height="56" rx="4" fill="{SIGNAL}"/>',
                f'<text x="{x + 170}" y="{y + 127}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="26" fill="#fff">{"+ 1,00 $" if lang == "uk" else "+ $1.00"}</text>',
                f'<text x="{x + 50}" y="{y + 207}" font-family="{FONT}" font-weight="800" font-size="24" fill="{SIGNAL}">?</text>',
                f'<text x="{x + 20}" y="{y + 60}" font-family="{FONT}" font-weight="800" font-size="28" fill="{INK}">{"1,10 $" if lang == "uk" else "$1.10"}</text>']
    elif kind == "coupon-collector":
        for i in range(50):
            px, py = x + 30 + (i % 10) * 33, y + 40 + (i // 10) * 44
            have = rnd.random() < 0.86
            out.append(f'<rect x="{px}" y="{py}" width="26" height="36" rx="4" fill="{INK if have else "#fff"}" stroke="{INK if have else SIGNAL}" stroke-width="2" stroke-dasharray="{"0" if have else "4 3"}"/>')
    elif kind == "regression-to-mean":
        out.append(f'<rect x="{x + 20}" y="{y + 10}" width="340" height="280" rx="12" fill="#fff"/>')
        for _ in range(140):
            s1 = rnd.gauss(0, 1); s2 = 0.5 * s1 + rnd.gauss(0, 0.85)
            out.append(f'<circle cx="{x + 190 + s1 * 55:.1f}" cy="{y + 150 - s2 * 55:.1f}" r="4" fill="{INK}" fill-opacity=".75"/>')
        out += [f'<line x1="{x + 50}" y1="{y + 270}" x2="{x + 330}" y2="{y + 30}" stroke="#BDBDBD" stroke-width="3" stroke-dasharray="8 6"/>',
                f'<line x1="{x + 50}" y1="{y + 220}" x2="{x + 330}" y2="{y + 80}" stroke="{SIGNAL}" stroke-width="5"/>']
    elif kind == "two-envelopes":
        for i, (lab, col) in enumerate((("x", INK), ("2x", SIGNAL))):
            ex = x + 30 + i * 175
            out += [f'<rect x="{ex}" y="{y + 70}" width="150" height="104" rx="10" fill="{col}"/>',
                    f'<path d="M{ex} {y + 74} L{ex + 75} {y + 130} L{ex + 150} {y + 74}" fill="none" stroke="#fff" stroke-width="4" stroke-opacity=".6"/>',
                    f'<text x="{ex + 75}" y="{y + 225}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="40" fill="{col}">{lab}</text>']
    elif kind == "coin-streaks":
        seq = [rnd.random() < .5 for _ in range(60)]
        for i, h in enumerate(seq):
            px, py = x + 30 + (i % 10) * 33, y + 30 + (i // 10) * 40
            out.append(f'<circle cx="{px + 13}" cy="{py + 13}" r="13" fill="{INK if h else "#fff"}" stroke="{INK}" stroke-width="2"/>')
    elif kind == "bertrand-paradox":
        cx, cy, r = x + 190, y + 150, 130
        out += [f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#fff" stroke="{INK}" stroke-width="4"/>']
        tri = [(cx + r * math.cos(a), cy + r * math.sin(a)) for a in (-math.pi / 2, math.pi / 6, 5 * math.pi / 6)]
        out.append('<polygon points="' + " ".join(f"{px:.1f},{py:.1f}" for px, py in tri) + f'" fill="none" stroke="{INK}" stroke-width="3"/>')
        for _ in range(16):
            a, b = rnd.random() * 2 * math.pi, rnd.random() * 2 * math.pi
            long_ = abs(math.sin((a - b) / 2)) * 2 * r > r * math.sqrt(3)
            out.append(f'<line x1="{cx + r * math.cos(a):.1f}" y1="{cy + r * math.sin(a):.1f}" x2="{cx + r * math.cos(b):.1f}" y2="{cy + r * math.sin(b):.1f}" stroke="{SIGNAL if long_ else "#9A9A9A"}" stroke-width="3"/>')
    elif kind == "penney-game":
        # the two picks side by side and a run of flips; who wins is the answer, so nothing is marked
        pat = {"uk": ("ООО", "РОО"), "en": ("HHH", "THH")}[lang]
        for i, p in enumerate(pat):
            bx = x + 30 + i * 180
            out += [f'<rect x="{bx}" y="{y + 20}" width="150" height="90" rx="14" fill="{INK}"/>',
                    f'<text x="{bx + 75}" y="{y + 80}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="44" letter-spacing="4" fill="#fff">{p}</text>']
        side = {"uk": ("О", "Р"), "en": ("H", "T")}[lang]
        for i in range(30):
            h = rnd.random() < .5
            px, py = x + 30 + (i % 10) * 33, y + 150 + (i // 10) * 40
            out += [f'<circle cx="{px + 13}" cy="{py + 13}" r="14" fill="{INK if h else "#fff"}" stroke="{INK}" stroke-width="2"/>',
                    f'<text x="{px + 13}" y="{py + 19}" text-anchor="middle" font-family="{FONT}" font-weight="700" font-size="15" fill="{"#fff" if h else INK}">{side[0 if h else 1]}</text>']
    elif kind == "inspection-paradox":
        # a road with irregular buses and one waiting passenger; the wait is the answer
        out.append(f'<rect x="{x + 10}" y="{y + 40}" width="360" height="220" rx="16" fill="#fff"/>')
        out.append(f'<line x1="{x + 30}" y1="{y + 150}" x2="{x + 350}" y2="{y + 150}" stroke="#BDBDBD" stroke-width="4" stroke-linecap="round"/>')
        for t in (24, 70, 160, 205, 330):
            out += [f'<rect x="{x + 20 + t - 14}" y="{y + 108}" width="28" height="30" rx="6" fill="{INK}"/>',
                    f'<rect x="{x + 20 + t - 9}" y="{y + 114}" width="18" height="9" rx="2" fill="#fff"/>']
        px = x + 290
        out += [f'<circle cx="{px}" cy="{y + 180}" r="9" fill="{INK}"/>', f'<rect x="{px - 9}" y="{y + 192}" width="18" height="30" rx="7" fill="{INK}"/>',
                f'<text x="{px + 22}" y="{y + 210}" font-family="{FONT}" font-weight="800" font-size="30" fill="{SIGNAL}">?</text>']
    elif kind == "german-tank-problem":
        # four captured serial plates and the unknown total
        for i, n in enumerate((4, 10, 15, 60)):
            px, py = x + 30 + (i % 2) * 170, y + 20 + (i // 2) * 100
            out += [f'<rect x="{px}" y="{py}" width="150" height="76" rx="10" fill="{INK}"/>',
                    f'<text x="{px + 75}" y="{py + 52}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="40" fill="#fff">№ {n}</text>']
        out += [f'<rect x="{x + 30}" y="{y + 225}" width="320" height="76" rx="10" fill="#fff" stroke="{INK}" stroke-width="3" stroke-dasharray="9 7"/>',
                f'<text x="{x + 190}" y="{y + 277}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="40" fill="{INK}">N = ?</text>']
    elif kind == "st-petersburg-paradox":
        # the payout ladder: the price of the game is the question
        side = {"uk": ("О", "Р"), "en": ("H", "T")}[lang]
        for k in range(1, 6):
            py = y + 10 + (k - 1) * 58
            for j in range(k):
                h = j < k - 1
                cx = x + 30 + j * 34
                out += [f'<circle cx="{cx + 14}" cy="{py + 24}" r="14" fill="{INK if h else "#fff"}" stroke="{INK}" stroke-width="2"/>',
                        f'<text x="{cx + 14}" y="{py + 30}" text-anchor="middle" font-family="{FONT}" font-weight="700" font-size="15" fill="{"#fff" if h else INK}">{side[0 if h else 1]}</text>']
            out.append(f'<text x="{x + 360}" y="{py + 34}" text-anchor="end" font-family="{FONT}" font-weight="800" font-size="30" fill="{INK}">${2 ** k}</text>')
    elif kind == "benford-law":
        # powers of two, first digit in bold; how often it is 1 is the answer
        nums = [2 ** n for n in range(1, 25)]
        for i, v in enumerate(nums):
            s = str(v)
            px, py = x + 20 + (i % 3) * 125, y + 30 + (i // 3) * 36
            out.append(f'<text x="{px}" y="{py}" font-family="{FONT}" font-size="26" fill="{MUTED}"><tspan font-weight="800" fill="{INK}">{s[0]}</tspan>{s[1:]}</text>')
    elif kind == "poisoned-wine":
        # a rack of identical bottles and a row of rats; how few rats suffice is the answer
        for i in range(30):
            bx, by = x + 34 + (i % 10) * 32, y + 10 + (i // 10) * 72
            out += [f'<rect x="{bx + 8}" y="{by}" width="8" height="16" rx="2" fill="{INK}"/>',
                    f'<rect x="{bx}" y="{by + 14}" width="24" height="44" rx="7" fill="{INK}"/>',
                    f'<rect x="{bx + 4}" y="{by + 30}" width="16" height="14" rx="2" fill="#fff" fill-opacity=".85"/>']
        for i in range(4):
            mx, my = x + 60 + i * 80, y + 262
            out += [f'<ellipse cx="{mx}" cy="{my}" rx="22" ry="13" fill="{MUTED}"/>',
                    f'<circle cx="{mx + 20}" cy="{my - 6}" r="9" fill="{MUTED}"/>',
                    f'<circle cx="{mx + 16}" cy="{my - 15}" r="5" fill="{MUTED}"/>',
                    f'<path d="M{mx - 22} {my + 2} q -14 4 -18 -10" fill="none" stroke="{MUTED}" stroke-width="3" stroke-linecap="round"/>']
        out.append(f'<text x="{x + 360}" y="{y + 270}" text-anchor="end" font-family="{FONT}" font-weight="800" font-size="34" fill="{SIGNAL}">?</text>')
    elif kind == "election-poll":
        # a field of voters with a few of them asked; how many it takes is the answer
        rnd = random.Random(5)
        for j in range(9):
            for i in range(14):
                asked = rnd.random() < .13
                fill = (INK if rnd.random() < .52 else "#9A9A9A") if asked else "#D6D6D6"
                out.append(f'<circle cx="{x + 22 + i * 26}" cy="{y + 14 + j * 26}" r="{8 if asked else 6}" fill="{fill}"/>')
        out.append(f'<text x="{x + 360}" y="{y + 300}" text-anchor="end" font-family="{FONT}" font-weight="800" font-size="34" fill="{SIGNAL}">n = ?</text>')
    elif kind == "two-eggs":
        # a tall building with numbered floors and two eggs beside it; the number of drops is the answer
        bx, bw = x + 40, 150
        out.append(f'<rect x="{bx}" y="{y}" width="{bw}" height="320" rx="6" fill="{INK}"/>')
        for i in range(10):
            fy = y + 8 + i * 31
            out += [f'<rect x="{bx + 12}" y="{fy}" width="{bw - 24}" height="22" rx="3" fill="#fff" fill-opacity=".85"/>',
                    f'<text x="{bx - 10}" y="{fy + 17}" text-anchor="end" font-family="{FONT}" font-weight="700" font-size="15" fill="{MUTED}">{100 - i * 10}</text>']
        out += [f'<line x1="{x + 250}" y1="{y + 30}" x2="{x + 250}" y2="{y + 120}" stroke="{MUTED}" stroke-width="3" stroke-dasharray="6 8"/>',
                f'<ellipse cx="{x + 250}" cy="{y + 160}" rx="30" ry="40" fill="#fff" stroke="{INK}" stroke-width="4"/>',
                f'<ellipse cx="{x + 325}" cy="{y + 278}" rx="30" ry="40" fill="#fff" stroke="{INK}" stroke-width="4"/>',
                f'<text x="{x + 250}" y="{y + 300}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="44" fill="{SIGNAL}">?</text>']
    elif kind == "twelve-coins":
        # a balance and twelve numbered coins; the number of weighings is the answer
        cx = x + 190
        out += [f'<rect x="{cx - 5}" y="{y + 30}" width="10" height="150" fill="{INK}"/>',
                f'<rect x="{cx - 60}" y="{y + 176}" width="120" height="12" rx="6" fill="{INK}"/>',
                f'<rect x="{cx - 150}" y="{y + 26}" width="300" height="8" rx="4" fill="{INK}"/>',
                f'<path d="M{cx - 190} {y + 100} h 80 l -40 -66 z" fill="none" stroke="{INK}" stroke-width="3"/>',
                f'<path d="M{cx + 110} {y + 100} h 80 l -40 -66 z" fill="none" stroke="{INK}" stroke-width="3"/>',
                f'<text x="{cx}" y="{y + 20}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="34" fill="{SIGNAL}">?</text>']
        for i in range(12):
            px, py = x + 40 + (i % 6) * 62, y + 228 + (i // 6) * 58
            out += [f'<circle cx="{px}" cy="{py}" r="24" fill="#fff" stroke="{INK}" stroke-width="3"/>',
                    f'<text x="{px}" y="{py + 8}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="20" fill="{INK}">{i + 1}</text>']
    elif kind == "hats-parity":
        # a line of people in black and white hats, the last one unsure of their own
        for i in range(7):
            px, py = x + 30 + i * 52, y + 120 + i * 18
            black = rnd.random() < .5
            out += [f'<circle cx="{px}" cy="{py + 34}" r="17" fill="{MUTED}"/>',
                    f'<rect x="{px - 18}" y="{py + 54}" width="36" height="60" rx="14" fill="{MUTED}"/>',
                    f'<path d="M{px - 22} {py + 22} h 44 l -8 -26 h -28 z" fill="{INK if black else "#fff"}" stroke="{INK}" stroke-width="3"/>']
        out.append(f'<text x="{x + 30}" y="{y + 110}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="36" fill="{SIGNAL}">?</text>')
    elif kind == "pirates-gold":
        # five ranked pirates and a chest of 100 coins; the split is the answer
        for i in range(5):
            px, py = x + 40 + i * 76, y + 40
            out += [f'<circle cx="{px}" cy="{py + 40}" r="22" fill="{MUTED}"/>',
                    f'<path d="M{px - 30} {py + 22} q 30 -30 60 0 z" fill="{INK}"/>',
                    f'<rect x="{px - 22}" y="{py + 66}" width="44" height="70" rx="14" fill="{MUTED}"/>',
                    f'<text x="{px}" y="{py + 112}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="22" fill="#fff">{i + 1}</text>']
        out += [f'<rect x="{x + 110}" y="{y + 210}" width="160" height="96" rx="10" fill="{INK}"/>',
                f'<rect x="{x + 110}" y="{y + 210}" width="160" height="26" rx="10" fill="#9A9A9A"/>',
                f'<text x="{x + 190}" y="{y + 285}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="36" fill="#fff">100</text>',
                f'<text x="{x + 330}" y="{y + 280}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="40" fill="{SIGNAL}">?</text>']
    elif kind == "blue-eyed-islanders":
        # a crowd of faces, some blue-eyed and some brown-eyed, nobody knowing their own
        for j in range(4):
            for i in range(6):
                px, py = x + 40 + i * 62, y + 30 + j * 72
                eye = "#3B7DD8" if rnd.random() < .5 else "#7A4A2A"
                out += [f'<circle cx="{px}" cy="{py}" r="24" fill="#fff" stroke="{INK}" stroke-width="2"/>',
                        f'<circle cx="{px - 9}" cy="{py - 3}" r="5" fill="{eye}"/>',
                        f'<circle cx="{px + 9}" cy="{py - 3}" r="5" fill="{eye}"/>']
        out.append(f'<text x="{x + 360}" y="{y + 320}" text-anchor="end" font-family="{FONT}" font-weight="800" font-size="40" fill="{SIGNAL}">?</text>')
    elif kind == "twenty-five-horses":
        # five lanes of five numbered horses; the number of races is the answer
        for j in range(5):
            ly = y + 10 + j * 60
            out.append(f'<rect x="{x + 10}" y="{ly}" width="360" height="50" rx="8" fill="#fff"/>')
            for i in range(5):
                px = x + 50 + i * 66
                out += [f'<circle cx="{px}" cy="{ly + 25}" r="19" fill="{INK}"/>',
                        f'<text x="{px}" y="{ly + 32}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="16" fill="#fff">{"ABCDE"[j]}{i + 1}</text>']
        out.append(f'<text x="{x + 360}" y="{y + 340}" text-anchor="end" font-family="{FONT}" font-weight="800" font-size="34" fill="{SIGNAL}">?</text>')
    elif kind == "bridge-and-torch":
        # a narrow bridge at night, four walkers with their times and one torch; the total is the answer
        out += [f'<rect x="{x + 10}" y="{y + 10}" width="360" height="320" rx="14" fill="{INK}"/>',
                f'<path d="M{x + 30} {y + 200} q 160 -70 320 0" fill="none" stroke="#fff" stroke-width="6"/>',
                f'<circle cx="{x + 60}" cy="{y + 120}" r="34" fill="#FFD66B" fill-opacity=".35"/>',
                f'<rect x="{x + 56}" y="{y + 118}" width="8" height="34" fill="#C9A15A"/>',
                f'<circle cx="{x + 60}" cy="{y + 114}" r="9" fill="#FFD66B"/>']
        for i, t in enumerate((1, 2, 5, 10)):
            px = x + 50 + i * 80
            out += [f'<rect x="{px - 30}" y="{y + 240}" width="60" height="44" rx="10" fill="#fff"/>',
                    f'<text x="{px}" y="{y + 271}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="22" fill="{INK}">{t}</text>']
        out.append(f'<text x="{x + 350}" y="{y + 70}" text-anchor="end" font-family="{FONT}" font-weight="800" font-size="40" fill="{SIGNAL}">?</text>')
    elif kind == "braess-paradox":
        # two routes with the new dashed shortcut A -> B; whether it helps is the answer
        S, A, B, F = (x + 30, y + 160), (x + 190, y + 30), (x + 190, y + 290), (x + 350, y + 160)
        def road(p, q, col, w):
            return f'<line x1="{p[0]}" y1="{p[1]}" x2="{q[0]}" y2="{q[1]}" stroke="{col}" stroke-width="{w}" stroke-linecap="round"/>'
        out += [road(S, A, INK, 12), road(B, F, INK, 12), road(A, F, "#9A9A9A", 12), road(S, B, "#9A9A9A", 12),
                f'<line x1="{A[0]}" y1="{A[1] + 30}" x2="{B[0]}" y2="{B[1] - 30}" stroke="{SIGNAL}" stroke-width="6" stroke-dasharray="14 10"/>']
        for (px, py), t in ((S, "S" if lang == "en" else "С"), (A, "A"), (B, "B"), (F, "F" if lang == "en" else "Ф")):
            out += [f'<circle cx="{px}" cy="{py}" r="24" fill="{INK}"/>',
                    f'<text x="{px}" y="{py + 8}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="22" fill="#fff">{t}</text>']
        out.append(f'<text x="{x + 214}" y="{y + 176}" font-family="{FONT}" font-weight="800" font-size="44" fill="{SIGNAL}">?</text>')
    elif kind == "survivorship-bias":
        # a bomber from above with the holes found on returning planes; where the armour goes is the answer
        s, ox, oy = 1.95, x - 5, y - 30
        parts = {"eng": [(34, 70, 46, 96), (60, 70, 72, 96), (128, 70, 140, 96), (154, 70, 166, 96)], "cock": [(89, 16, 111, 40)],
                 "fus": [(89, 40, 111, 186)], "wing": [(14, 78, 89, 104), (111, 78, 186, 104)], "tail": [(62, 164, 89, 180), (111, 164, 138, 180)]}
        for kid in ("wing", "tail", "fus", "cock", "eng"):
            for (x0, y0, x1, y1) in parts[kid]:
                out.append(f'<rect x="{ox + x0 * s:.1f}" y="{oy + y0 * s:.1f}" width="{(x1 - x0) * s:.1f}" height="{(y1 - y0) * s:.1f}" rx="5" fill="#fff" stroke="{INK}" stroke-width="3"/>')
        for kid, n in (("fus", 22), ("wing", 22), ("tail", 5), ("eng", 1), ("cock", 1)):
            for _ in range(n):
                while True:
                    x0, y0, x1, y1 = rnd.choice(parts[kid])
                    px, py = rnd.uniform(x0 + 3, x1 - 3), rnd.uniform(y0 + 3, y1 - 3)
                    if kid != "wing" or not any(a <= px <= c and b <= py <= d for a, b, c, d in parts["eng"]):
                        break
                out.append(f'<circle cx="{ox + px * s:.1f}" cy="{oy + py * s:.1f}" r="4.5" fill="{INK}"/>')
        out.append(f'<text x="{x + 395}" y="{y + 20}" text-anchor="end" font-family="{FONT}" font-weight="800" font-size="44" fill="{SIGNAL}">?</text>')
    elif kind == "sleeping-beauty":
        # a coin and two nights, Monday and Tuesday, with a sleeper; the chance of heads is the answer
        days = ("Пн", "Вт") if lang == "uk" else ("Mon", "Tue")
        out += [f'<circle cx="{x + 70}" cy="{y + 60}" r="46" fill="#fff" stroke="{INK}" stroke-width="5" stroke-dasharray="12 8"/>',
                f'<text x="{x + 70}" y="{y + 76}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="44" fill="{INK}">?</text>',
                f'<path d="M{x + 330} {y + 22} a 40 40 0 1 0 22 70 a 32 32 0 1 1 -22 -70 z" fill="{INK}"/>']
        for i, d in enumerate(days):
            px = x + 10 + i * 185
            out += [f'<rect x="{px}" y="{y + 140}" width="170" height="170" rx="18" fill="#fff" stroke="{INK}" stroke-width="4" stroke-dasharray="{"0" if i == 0 else "10 8"}"/>',
                    f'<text x="{px + 85}" y="{y + 196}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="36" fill="{INK}">{d}</text>',
                    f'<text x="{px + 85}" y="{y + 270}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="44" fill="{MUTED}">{"?" if i else "z z"}</text>']
    return "".join(out)


def svg(kind, lang):
    lines, sub = TEXT[kind][lang]
    big = min(84, int(590 / (max(len(l) for l in lines) * 0.68)))
    parts = [f'<rect width="1200" height="630" fill="#fff"/>',
             f'<rect x="700" y="40" width="460" height="550" rx="36" fill="{TINT[kind]}"/>', dots(700, 40, 460, 550)]
    for i, l in enumerate(lines):
        parts.append(f'<text x="70" y="{190 + i * (big + 4)}" font-family="{FONT}" font-weight="800" font-size="{big}" letter-spacing="-2" fill="{INK}">{l}</text>')
    parts.append(f'<text x="72" y="{190 + len(lines) * (big + 4) + 18}" font-family="{FONT}" font-weight="500" font-size="32" fill="{MUTED}">{sub}</text>')
    if kind != "hub":
        y = 500
        parts.append(f'<rect x="72" y="{y - 62}" width="112" height="78" rx="16" fill="#fff" stroke="{SIGNAL}" stroke-width="3" stroke-dasharray="9 7"/>')
        parts.append(f'<text x="128" y="{y}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="56" fill="{SIGNAL}">?</text>')
        parts.append(f'<text x="206" y="{y - 12}" font-family="{FONT}" font-weight="700" font-size="22" fill="{MUTED}">{ASK[lang].upper()}</text>')
    if kind == "monty-hall":
        parts.append(f'<rect x="752" y="150" width="356" height="330" rx="24" fill="none"/>' + doors(760, 240))
    elif kind == "birthday":
        parts.append(f'<rect x="740" y="220" width="390" height="190" rx="18" fill="#fff"/>' + calendar(752, 232))
    elif kind == "false-positive":
        parts.append(people(780, 160))
    elif kind == "secretary-problem":
        parts.append(f'<rect x="740" y="190" width="390" height="260" rx="18" fill="#fff"/>' + candidates(752, 215))
    elif kind == "simpson-paradox":
        parts.append(f'<rect x="740" y="160" width="390" height="300" rx="18" fill="#fff"/>' + simpson(775, 190, lang))
    elif kind == "two-children":
        parts.append(kids(762, 170))
    elif kind == "buffon-needle":
        parts.append(needles(740, 165))
    elif kind in ("rope-around-earth", "hundred-prisoners", "cognitive-reflection", "coupon-collector",
                  "regression-to-mean", "two-envelopes", "coin-streaks", "bertrand-paradox", "penney-game",
                  "inspection-paradox", "german-tank-problem", "st-petersburg-paradox", "benford-law", "poisoned-wine", "election-poll",
                  "two-eggs", "twelve-coins", "hats-parity", "pirates-gold", "blue-eyed-islanders",
                  "twenty-five-horses", "bridge-and-torch", "braess-paradox", "survivorship-bias", "sleeping-beauty"):
        parts.append(extra_visual(kind, 740, 165, lang))
    elif kind == "duckweed-lake":
        parts.append(lake(740, 130))
    elif kind == "friendship-paradox":
        parts.append(network(740, 165))
    else:
        parts.append(f'<g transform="translate(-6,-80) scale(.92)">{doors(800, 180)}</g>')
        parts.append(f'<rect x="740" y="330" width="390" height="190" rx="18" fill="#fff"/>' + calendar(752, 342))
    body = "".join(parts)
    # Quick Look renders square thumbnails, so draw on a 1200x1200 canvas and crop the middle band
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">'
            f'<rect width="1200" height="1200" fill="#fff"/><g transform="translate(0,285)">{body}</g></svg>')


def render(kind, lang, out):
    with tempfile.TemporaryDirectory() as tmp:
        src = Path(tmp) / f"og-{kind}-{lang}.svg"
        src.write_text(svg(kind, lang), encoding="utf-8")
        subprocess.run(["qlmanage", "-t", "-s", "1200", "-o", tmp, str(src)], check=True, capture_output=True)
        subprocess.run(["sips", "--cropToHeightWidth", "630", "1200", str(src) + ".png", "--out", str(out)], check=True, capture_output=True)
    print(out.relative_to(ROOT))


if __name__ == "__main__":
    for kind in TEXT:
        folder = ROOT / ("hub" if kind == "hub" else f"problems/{kind}") / "assets"
        folder.mkdir(parents=True, exist_ok=True)
        for old in folder.glob("og-src-*.svg"):
            old.unlink()
        for lang in ("uk", "en"):
            render(kind, lang, folder / f"og-{lang}.png")
