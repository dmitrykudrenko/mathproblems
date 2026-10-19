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
TINT = {"monty-hall": "#EEEAFF", "birthday": "#E6F8D8", "hub": "#EEEAFF"}
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


def svg(kind, lang):
    lines, sub, ans = TEXT[kind][lang]
    big = min(84, int(590 / (max(len(l) for l in lines) * 0.68)))
    parts = [f'<rect width="1200" height="630" fill="#fff"/>',
             f'<rect x="700" y="40" width="460" height="550" rx="36" fill="{TINT[kind]}"/>', dots(700, 40, 460, 550)]
    for i, l in enumerate(lines):
        parts.append(f'<text x="70" y="{190 + i * (big + 4)}" font-family="{FONT}" font-weight="800" font-size="{big}" letter-spacing="-2" fill="{INK}">{l}</text>')
    parts.append(f'<text x="72" y="{190 + 2 * (big + 4) + 18}" font-family="{FONT}" font-weight="500" font-size="32" fill="{MUTED}">{sub}</text>')
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
