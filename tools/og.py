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
TINT = {"monty-hall": "#EEEAFF", "birthday": "#E6F8D8", "false-positive": "#FFEEDD", "secretary-problem": "#E3F1FF", "simpson-paradox": "#E8F6F3", "two-children": "#FCE4EC", "buffon-needle": "#FFF6CC", "friendship-paradox": "#F5E6F0", "duckweed-lake": "#EAF0D8", "rope-around-earth": "#D9F2F5", "hundred-prisoners": "#F0E6DC", "cognitive-reflection": "#FFE3D3", "coupon-collector": "#E2F5E9", "regression-to-mean": "#EDEDF7", "two-envelopes": "#FDF0DE", "coin-streaks": "#E5EEF0", "bertrand-paradox": "#F3F7D9", "hub": "#EEEAFF"}
FONT = "Helvetica Neue, Arial, sans-serif"

TEXT = {
    "monty-hall": {
        "uk": (["ПАРАДОКС", "МОНТІ ГОЛЛА"], "Змінювати вибір?", ("50/50", "2/3")),
        "en": (["THE MONTY", "HALL PROBLEM"], "Should you switch?", ("50/50", "2/3")),
    },
    "birthday": {
        "uk": (["ПАРАДОКС ДНІВ", "НАРОДЖЕННЯ"], "Скільки людей потрібно?", ("183", "23")),
        "en": (["THE BIRTHDAY", "PARADOX"], "How many people does it take?", ("183", "23")),
    },
    "false-positive": {
        "uk": (["ПАРАДОКС", "ХИБНОГО ТЕСТУ"], "Тест точний на 99%. Ви хворі?", ("99%", "50%")),
        "en": (["THE FALSE", "POSITIVE PARADOX"], "The test is 99% accurate. Are you sick?", ("99%", "50%")),
    },
    "secretary-problem": {
        "uk": (["ПРАВИЛО 37%"], "Як обрати найкращого з сотні?", ("1%", "37%")),
        "en": (["THE 37% RULE"], "How to pick the best of a hundred", ("1%", "37%")),
    },
    "simpson-paradox": {
        "uk": (["ПАРАДОКС", "СІМПСОНА"], "Краще в кожній групі, гірше загалом", None),
        "en": (["SIMPSON'S", "PARADOX"], "Better in every group, worse overall", None),
    },
    "two-children": {
        "uk": (["ПАРАДОКС", "ДВОХ ДІТЕЙ"], "Хоча б один хлопчик. Обидва?", ("1/2", "1/3")),
        "en": (["THE TWO-CHILD", "PARADOX"], "At least one is a boy. Both?", ("1/2", "1/3")),
    },
    "buffon-needle": {
        "uk": (["ГОЛКА", "БЮФФОНА"], "Знайти π, кидаючи сірники", None),
        "en": (["BUFFON'S", "NEEDLE"], "Find π by dropping matches", None),
    },
    "friendship-paradox": {
        "uk": (["ПАРАДОКС", "ДРУЖБИ"], "У ваших друзів більше друзів, ніж у вас", None),
        "en": (["THE FRIENDSHIP", "PARADOX"], "Your friends have more friends than you", None),
    },
    "duckweed-lake": {
        "uk": (["РЯСКА", "В ОЗЕРІ"], "1 ряска: 30 днів. 2 ряски: ?", ("15", "29")),
        "en": (["THE DUCKWEED", "LAKE"], "1 plant: 30 days. 2 plants: ?", ("15", "29")),
    },
    "rope-around-earth": {
        "uk": (["МОТУЗКА", "НАВКОЛО ЗЕМЛІ"], "+1 метр. Наскільки вона підніметься?", ("1 мм", "16 см")),
        "en": (["THE ROPE AROUND", "THE EARTH"], "+1 metre. How high does it rise?", ("1 mm", "16 cm")),
    },
    "hundred-prisoners": {
        "uk": (["100 В'ЯЗНІВ"], "Кожен може відкрити 50 коробок", ("≈ 0%", "31%")),
        "en": (["100 PRISONERS"], "Each may open 50 boxes", ("≈ 0%", "31%")),
    },
    "cognitive-reflection": {
        "uk": (["М'ЯЧ І БИТА"], "Разом $1.10. Скільки коштує м'яч?", ("10¢", "5¢")),
        "en": (["BAT AND BALL"], "$1.10 together. What does the ball cost?", ("10¢", "5¢")),
    },
    "coupon-collector": {
        "uk": (["АЛЬБОМ", "НАЛІПОК"], "50 наліпок. Скільки треба купити?", ("50", "225")),
        "en": (["THE STICKER", "ALBUM"], "50 stickers. How many to buy?", ("50", "225")),
    },
    "regression-to-mean": {
        "uk": (["РЕГРЕСІЯ ДО", "СЕРЕДНЬОГО"], "Чому похвала нібито шкодить", None),
        "en": (["REGRESSION TO", "THE MEAN"], "Why praise seems to backfire", None),
    },
    "two-envelopes": {
        "uk": (["ДВА", "КОНВЕРТИ"], "В одному вдвічі більше. Міняти?", None),
        "en": (["TWO", "ENVELOPES"], "One holds twice the other. Switch?", None),
    },
    "coin-streaks": {
        "uk": (["СЕРІЇ", "МОНЕТИ"], "Найдовша серія зі 100 підкидань", ("3", "7")),
        "en": (["COIN", "STREAKS"], "Longest streak in 100 flips", ("3", "7")),
    },
    "bertrand-paradox": {
        "uk": (["ПАРАДОКС", "БЕРТРАНА"], "Три правильні відповіді", None),
        "en": (["BERTRAND'S", "PARADOX"], "Three right answers", None),
    },
    "hub": {
        "uk": (["МАТЕМАТИЧНІ", "ПАРАДОКСИ"], "Задачі, у яких інтуїція помиляється", None),
        "en": (["MATH", "PARADOXES"], "Puzzles where intuition gets it wrong", None),
    },
}
LABELS = {"uk": ("інтуїція", "насправді"), "en": ("intuition", "actually")}


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
    # 10x10 grid: one true positive (filled signal), one false positive (signal ring)
    out = []
    for r in range(10):
        for c in range(10):
            cx, cy = x + c * 34, y + r * 34
            if (r, c) == (2, 6):
                out.append(f'<circle cx="{cx}" cy="{cy}" r="11" fill="{SIGNAL}"/>')
            elif (r, c) == (7, 2):
                out.append(f'<circle cx="{cx}" cy="{cy}" r="9.5" fill="#fff" stroke="{SIGNAL}" stroke-width="3"/>')
            else:
                out.append(f'<circle cx="{cx}" cy="{cy}" r="11" fill="{INK}" fill-opacity=".85"/>')
    return "".join(out)


def candidates(x, y):
    rnd = random.Random(7)
    hs = [rnd.randint(40, 200) for _ in range(20)]
    best_seen = max(hs[:7])
    pick = next(i for i in range(7, 20) if hs[i] > best_seen)
    out = [f'<line x1="{x + 7 * 19 - 4}" y1="{y - 10}" x2="{x + 7 * 19 - 4}" y2="{y + 215}" stroke="{INK}" stroke-width="2" stroke-dasharray="6 5"/>']
    for i, h in enumerate(hs):
        fill = SIGNAL if i == pick else ("#BDBDBD" if i < 7 else INK)
        out.append(f'<rect x="{x + i * 19}" y="{y + 210 - h}" width="13" height="{h}" rx="3" fill="{fill}"/>')
    out.append(f'<text x="{x + 7 * 19 + 4}" y="{y + 2}" font-family="{FONT}" font-weight="800" font-size="22" fill="{INK}">37%</text>')
    return "".join(out)


def simpson(x, y, lang):
    names = {"uk": ("малі", "великі", "разом"), "en": ("small", "large", "total")}[lang]
    groups = [("93", "87"), ("73", "69"), ("78", "83")]
    out = []
    for g, (a, b) in enumerate(groups):
        gx = x + g * 120
        for k, v in enumerate((a, b)):
            h = int(v) * 2.2
            fill = INK if k == 0 else SIGNAL
            if g == 2:
                fill = SIGNAL if k == 1 else INK
            out.append(f'<rect x="{gx + k * 42}" y="{y + 220 - h}" width="34" height="{h}" rx="5" fill="{fill}"/>')
        out.append(f'<text x="{gx + 38}" y="{y + 250}" text-anchor="middle" font-family="{FONT}" font-weight="700" font-size="18" fill="{MUTED}">{names[g]}</text>')
        if g == 2:
            out.append(f'<line x1="{gx - 16}" y1="{y}" x2="{gx - 16}" y2="{y + 222}" stroke="#BDBDBD" stroke-width="2"/>')
    return "".join(out)


def kids(x, y):
    out = []
    for i, pair in enumerate(("BB", "BG", "GB", "GG")):
        cx, cy = x + (i % 2) * 180, y + (i // 2) * 150
        box = SIGNAL if pair == "BB" else INK
        out.append(f'<rect x="{cx}" y="{cy}" width="160" height="128" rx="18" fill="#fff" stroke="{box}" stroke-width="{4 if pair == "BB" else 0}"/>')
        for k, ch in enumerate(pair):
            px = cx + 52 + k * 56
            col = INK if ch == "B" else "#BDBDBD"
            out.append(f'<circle cx="{px}" cy="{cy + 46}" r="16" fill="{col}"/><rect x="{px - 18}" y="{cy + 66}" width="36" height="40" rx="12" fill="{col}"/>')
        if pair == "GG":
            out.append(f'<line x1="{cx + 14}" y1="{cy + 114}" x2="{cx + 146}" y2="{cy + 14}" stroke="{SIGNAL}" stroke-width="6" stroke-linecap="round"/>')
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
    for p in pts:
        out.append(f'<circle cx="{p[0]:.1f}" cy="{p[1]:.1f}" r="14" fill="{INK}"/>')
    out.append(f'<circle cx="{hub[0]}" cy="{hub[1]}" r="30" fill="{SIGNAL}"/>')
    return "".join(out)


def lake(x, y):
    import math
    rnd = random.Random(29)
    cx, cy, r = x + 190, y + 150, 140
    out = [f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#fff"/>',
           f'<clipPath id="lake"><circle cx="{cx}" cy="{cy}" r="{r}"/></clipPath><g clip-path="url(#lake)">']
    # day 29: exactly half the lake is covered, as a ragged patch on the left
    for _ in range(900):
        a, d = rnd.random() * 2 * math.pi, r * math.sqrt(rnd.random())
        px, py = cx + d * math.cos(a), cy + d * math.sin(a)
        if px < cx + 10 * math.sin(py / 9):
            out.append(f'<circle cx="{px:.1f}" cy="{py:.1f}" r="{rnd.uniform(5, 9):.1f}" fill="{INK}" fill-opacity="{rnd.uniform(.75, 1):.2f}"/>')
    out.append(f'</g><circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{SIGNAL}" stroke-width="5"/>')
    out.append(f'<text x="{cx}" y="{y + 330}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="24" fill="{INK}">29 → 50%</text>')
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
        # a permutation drawn as its cycles: no loop longer than half the boxes, so everyone succeeds
        for (ccx, ccy, rr, n, col) in ((x + 120, y + 110, 80, 14, SIGNAL), (x + 285, y + 95, 58, 9, INK), (x + 255, y + 245, 52, 8, INK), (x + 105, y + 255, 34, 5, INK)):
            pts = [(ccx + rr * math.cos(2 * math.pi * i / n - math.pi / 2), ccy + rr * math.sin(2 * math.pi * i / n - math.pi / 2)) for i in range(n)]
            out.append(f'<circle cx="{ccx}" cy="{ccy}" r="{rr}" fill="none" stroke="{col}" stroke-width="3" stroke-opacity=".5"/>')
            for px, py in pts:
                out.append(f'<rect x="{px - 11:.1f}" y="{py - 11:.1f}" width="22" height="22" rx="4" fill="{col}"/>')
    elif kind == "cognitive-reflection":
        out += [f'<rect x="{x + 20}" y="{y + 90}" width="300" height="56" rx="10" fill="{INK}"/>',
                f'<rect x="{x + 320}" y="{y + 90}" width="15" height="56" rx="4" fill="{SIGNAL}"/>',
                f'<rect x="{x + 20}" y="{y + 170}" width="15" height="56" rx="4" fill="{SIGNAL}"/>',
                f'<text x="{x + 170}" y="{y + 127}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="26" fill="#fff">$1.00</text>',
                f'<text x="{x + 50}" y="{y + 207}" font-family="{FONT}" font-weight="800" font-size="24" fill="{INK}">5¢</text>',
                f'<text x="{x + 20}" y="{y + 60}" font-family="{FONT}" font-weight="800" font-size="28" fill="{INK}">$1.10</text>']
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
        seq[23:30] = [True] * 7
        for i, h in enumerate(seq):
            px, py = x + 30 + (i % 10) * 33, y + 30 + (i // 10) * 40
            run = 23 <= i < 30
            out.append(f'<circle cx="{px + 13}" cy="{py + 13}" r="13" fill="{SIGNAL if run else (INK if h else "#fff")}" stroke="{INK}" stroke-width="2"/>')
    elif kind == "bertrand-paradox":
        cx, cy, r = x + 190, y + 150, 130
        out += [f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#fff" stroke="{INK}" stroke-width="4"/>']
        tri = [(cx + r * math.cos(a), cy + r * math.sin(a)) for a in (-math.pi / 2, math.pi / 6, 5 * math.pi / 6)]
        out.append('<polygon points="' + " ".join(f"{px:.1f},{py:.1f}" for px, py in tri) + f'" fill="none" stroke="{INK}" stroke-width="3"/>')
        for _ in range(16):
            a, b = rnd.random() * 2 * math.pi, rnd.random() * 2 * math.pi
            long_ = abs(math.sin((a - b) / 2)) * 2 * r > r * math.sqrt(3)
            out.append(f'<line x1="{cx + r * math.cos(a):.1f}" y1="{cy + r * math.sin(a):.1f}" x2="{cx + r * math.cos(b):.1f}" y2="{cy + r * math.sin(b):.1f}" stroke="{SIGNAL if long_ else "#9A9A9A"}" stroke-width="3"/>')
    return "".join(out)


def svg(kind, lang):
    lines, sub, ans = TEXT[kind][lang]
    big = min(84, int(590 / (max(len(l) for l in lines) * 0.68)))
    parts = [f'<rect width="1200" height="630" fill="#fff"/>',
             f'<rect x="700" y="40" width="460" height="550" rx="36" fill="{TINT[kind]}"/>', dots(700, 40, 460, 550)]
    for i, l in enumerate(lines):
        parts.append(f'<text x="70" y="{190 + i * (big + 4)}" font-family="{FONT}" font-weight="800" font-size="{big}" letter-spacing="-2" fill="{INK}">{l}</text>')
    parts.append(f'<text x="72" y="{190 + len(lines) * (big + 4) + 18}" font-family="{FONT}" font-weight="500" font-size="32" fill="{MUTED}">{sub}</text>')
    if ans:
        lo, hi = LABELS[lang]
        y = 500
        parts.append(f'<text x="72" y="{y}" font-family="{FONT}" font-weight="800" font-size="56" fill="#A3A3A3" text-decoration="line-through">{ans[0]}</text>')
        parts.append(f'<text x="72" y="{y + 36}" font-family="{FONT}" font-weight="700" font-size="20" fill="{MUTED}">{lo.upper()}</text>')
        parts.append(f'<text x="300" y="{y}" font-family="{FONT}" font-weight="800" font-size="56" fill="{SIGNAL}">{ans[1]}</text>')
        parts.append(f'<text x="300" y="{y + 36}" font-family="{FONT}" font-weight="700" font-size="20" fill="{MUTED}">{hi.upper()}</text>')
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
                  "regression-to-mean", "two-envelopes", "coin-streaks", "bertrand-paradox"):
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
