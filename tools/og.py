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
TINT = {"monty-hall": "#EEEAFF", "birthday": "#E6F8D8", "false-positive": "#FFEEDD", "secretary-problem": "#E3F1FF", "simpson-paradox": "#E8F6F3", "two-children": "#FCE4EC", "buffon-needle": "#FFF6CC", "friendship-paradox": "#F5E6F0", "duckweed-lake": "#EAF0D8", "rope-around-earth": "#D9F2F5", "hundred-prisoners": "#F0E6DC", "cognitive-reflection": "#FFE3D3", "coupon-collector": "#E2F5E9", "regression-to-mean": "#EDEDF7", "two-envelopes": "#FDF0DE", "coin-streaks": "#E5EEF0", "bertrand-paradox": "#F3F7D9", "penney-game": "#FBE9E1", "inspection-paradox": "#FCEFC7", "german-tank-problem": "#E6EBDD", "st-petersburg-paradox": "#E9E3F3", "benford-law": "#E0ECF6", "poisoned-wine": "#F3E3EA", "election-poll": "#E2E8F3", "two-eggs": "#FFF3D1", "twelve-coins": "#E6EDF2", "hats-parity": "#EFE3F6", "pirates-gold": "#F9E7C4", "blue-eyed-islanders": "#DDEBFA", "twenty-five-horses": "#E5EFD2", "bridge-and-torch": "#FCE6D2", "braess-paradox": "#E8E0D0", "survivorship-bias": "#DCE6E1", "sleeping-beauty": "#E1E2FA", "gamblers-ruin": "#D8EDE2", "berkson-paradox": "#EAE6DC", "ab-test": "#EAF4E2", "ab-test-peeking": "#F6E7D8", "multiple-testing": "#E3F3EE", "course-ab-testing": "#EAF4E2", "course-ab-basics": "#EEF2E0", "course-ab-testing--check": "#EAF4E2", "course-interview-puzzles": "#E7F0F7", "course-interview-puzzles--trainer": "#E7F0F7", "course-data-traps": "#F2EBDD", "course-feature-impact": "#EFEDE6", "course-feature-impact--trust": "#EFEDE6", "lake-escape": "#D7ECEF", "winners-curse": "#F2E4D9", "small-numbers": "#E4E6EE", "multi-armed-bandit": "#F8E3EC", "will-rogers": "#E6F1EA", "persuadables": "#F4EEDC", "truel": "#F0DCD4", "guess-two-thirds": "#E7DDF0", "dollar-auction": "#DDEADF", "hotelling-beach": "#F6EAD3", "fly-between-trains": "#E6F3F7", "hilbert-hotel": "#DFE4F2", "parrondo-paradox": "#E9DCEC", "axelrod-tournament": "#D6E6F7", "travelers-dilemma": "#E8D9CF", "prosecutors-fallacy": "#F3E8E4", "ant-rubber-rope": "#F5E9DF", "hat-check": "#EDE4D8", "broken-stick": "#F1E9DC", "elevator-paradox": "#F4E9E4", "revenue-equivalence": "#DCE9F0", "hub": "#EEEAFF"}
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
    "gamblers-ruin": {
        "uk": (["РОЗОРЕННЯ", "ГРАВЦЯ"], "$100, по $1 на червоне. Шанс на $200?"),
        "en": (["GAMBLER'S", "RUIN"], "$100, $1 on red. The chance of $200?"),
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
    "berkson-paradox": {
        "uk": (["ПАРАДОКС", "БЕРКСОНА"], "Врода і доброта серед побачень?"),
        "en": (["BERKSON'S", "PARADOX"], "Looks and kindness of your dates?"),
    },
    "ab-test": {
        "uk": (["A/A-ТЕСТ"], "Дві однакові сторінки. Хто переможе?"),
        "en": (["THE A/A TEST"], "Two identical pages. Who wins?"),
    },
    "ab-test-peeking": {
        "uk": (["ПІДГЛЯДАННЯ", "В A/B-ТЕСТ"], "Щодня дивитися на p-value?"),
        "en": (["PEEKING AT", "A/B TESTS"], "Checking p-values every day?"),
    },
    "multiple-testing": {
        "uk": (["20 СЕГМЕНТІВ"], "Ефекту немає. Шанс «відкриття»?"),
        "en": (["20 SEGMENTS"], "No real effect. Odds of a 'discovery'?"),
    },
    "course-ab-testing": {
        "uk": (["КУРС: ПАРАДОКСИ", "A/B-ТЕСТІВ"], "B +17%. Що далі?"),
        "en": (["COURSE: A/B", "TEST PARADOXES"], "B +17%. Now what?"),
    },
    "course-ab-basics": {
        "uk": (["КУРС: A/B-ТЕСТИ", "ПРОСТИМИ СЛОВАМИ"], "B +27% на третій день. Запускати?"),
        "en": (["COURSE: A/B TESTS", "IN PLAIN WORDS"], "B +27% on day three. Ship it?"),
    },
    "course-data-traps": {
        "uk": (["КУРС: ЯК НЕ ОБДУРИТИ", "СЕБЕ ДАНИМИ"], "Середній чек +24%. Чому вірити?"),
        "en": (["COURSE: DON'T FOOL", "YOURSELF WITH DATA"], "Average order +24%. What to trust?"),
    },
    "course-ab-testing--check": {
        "uk": (["ПЕРЕВІРТЕ", "СВІЙ ТЕСТ"], "Ваші числа з дашборда: запускати B?"),
        "en": (["CHECK", "YOUR TEST"], "Your dashboard numbers: ship B?"),
    },
    "course-interview-puzzles": {
        "uk": (["КУРС: СПІВБЕСІДИ", "ІЗ ЗАДАЧАМИ"], "Дві мотузки. Як відміряти 45 хвилин?"),
        "en": (["COURSE: PUZZLE", "INTERVIEWS"], "Two ropes. How to measure 45 minutes?"),
    },
    "course-interview-puzzles--trainer": {
        "uk": (["ТРЕНАЖЕР", "СПІВБЕСІДИ"], "Задача, таймер і три підказки"),
        "en": (["INTERVIEW", "TRAINER"], "A puzzle, a timer and three hints"),
    },
    "course-feature-impact": {
        "uk": (["КУРС: ЧИ ПРАЦЮЄ", "ФІЧА?"], "Утримання ×2. Це фіча?"),
        "en": (["COURSE: DOES THE", "FEATURE WORK?"], "Retention ×2. Is it the feature?"),
    },
    "course-feature-impact--trust": {
        "uk": (["ЧИ МОЖНА", "ДОВІРЯТИ?"], "Ризики звіту і метод оцінки"),
        "en": (["CAN YOU", "TRUST IT?"], "Report risks and a method"),
    },
    "lake-escape": {
        "uk": (["ВТЕЧА", "ЧЕРЕЗ ОЗЕРО"], "Вихователь учетверо швидший. Як утекти?"),
        "en": (["THE LAKE", "ESCAPE"], "The teacher is 4× faster. How to escape?"),
    },
    "winners-curse": {
        "uk": (["ПРОКЛЯТТЯ", "ПЕРЕМОЖЦЯ"], "Банка монет на 100. Скільки виграє переможець?"),
        "en": (["THE WINNER'S", "CURSE"], "A jar worth 100. What does the winner get?"),
    },
    "small-numbers": {
        "uk": (["НАЙНЕБЕЗПЕЧНІШЕ", "РІВНЯННЯ"], "Чому в селах найменше раку?"),
        "en": (["THE MOST DANGEROUS", "EQUATION"], "Why is cancer rarest in rural counties?"),
    },
    "multi-armed-bandit": {
        "uk": (["БАГАТОРУКИЙ", "БАНДИТ"], "10 спроб кожного автомата. Чи вистачить?"),
        "en": (["THE MULTI-ARMED", "BANDIT"], "10 pulls on each machine. Enough?"),
    },
    "will-rogers": {
        "uk": (["ФЕНОМЕН", "ВІЛЛА РОДЖЕРСА"], "Одна людина перейшла. Обидва середні зросли?"),
        "en": (["THE WILL ROGERS", "PHENOMENON"], "One person moves. Both averages rise?"),
    },
    "persuadables": {
        "uk": (["КОМУ ДАТИ", "ЗНИЖКУ?"], "Купони найімовірнішим покупцям. Скільки дадуть?"),
        "en": (["WHO GETS", "THE COUPON?"], "Coupons to the likeliest buyers. What do they add?"),
    },
    "truel": {
        "uk": (["ТРУЕЛЬ"], "Влучність 1/3, 2/3, 1. Хто виживе?"),
        "en": (["THE TRUEL"], "Hit rates 1/3, 2/3, 1. Who survives?"),
    },
    "guess-two-thirds": {
        "uk": (["ВГАДАЙ 2/3", "ВІД СЕРЕДНЬОГО"], "Від 0 до 100. Яке число назвете ви?"),
        "en": (["GUESS 2/3", "OF THE AVERAGE"], "From 0 to 100. Which number do you name?"),
    },
    "dollar-auction": {
        "uk": (["АУКЦІОН", "ЗА ДОЛАР"], "Платять обидва. Скільки збере?"),
        "en": (["THE DOLLAR", "AUCTION"], "Both top bidders pay. How much?"),
    },
    "hotelling-beach": {
        "uk": (["МОРОЗИВО", "НА ПЛЯЖІ"], "Два кіоски. Де стануть продавці?"),
        "en": (["ICE CREAM ON", "THE BEACH"], "Two kiosks. Where will they stand?"),
    },
    "fly-between-trains": {
        "uk": (["МУХА МІЖ", "ПОТЯГАМИ"], "Скільки кілометрів вона пролетить?"),
        "en": (["THE FLY", "AND TWO TRAINS"], "How far does the fly fly?"),
    },
    "hilbert-hotel": {
        "uk": (["ГОТЕЛЬ", "ГІЛЬБЕРТА"], "∞ кімнат, усі зайняті. Місце є?"),
        "en": (["HILBERT'S", "HOTEL"], "∞ rooms, all taken. Room for one more?"),
    },
    "parrondo-paradox": {
        "uk": (["ПАРАДОКС", "ПАРРОНДО"], "Дві програшні гри. А якщо навмання?"),
        "en": (["PARRONDO'S", "PARADOX"], "Two losing games. What if mixed?"),
    },
    "axelrod-tournament": {
        "uk": (["ТУРНІР", "АКСЕЛЬРОДА"], "Дилема в'язня. Хто збере більше?"),
        "en": (["AXELROD'S", "TOURNAMENT"], "Prisoner's dilemma. Who scores most?"),
    },
    "travelers-dilemma": {
        "uk": (["ДИЛЕМА", "МАНДРІВНИКА"], "Ціна від $2 до $100. Що напишете?"),
        "en": (["THE TRAVELER'S", "DILEMMA"], "From $2 to $100. What do you write?"),
    },
    "prosecutors-fallacy": {
        "uk": (["ПОМИЛКА", "ПРОКУРОРА"], "Збіг 1 на 10 000. Він винний?"),
        "en": (["THE PROSECUTOR'S", "FALLACY"], "A 1 in 10,000 match. Guilty?"),
    },
    "ant-rubber-rope": {
        "uk": (["МУРАХА НА", "ГУМОВІЙ МОТУЗЦІ"], "+1 км щосекунди. Чи доповзе?"),
        "en": (["THE ANT ON A", "RUBBER ROPE"], "+1 km every second. Will it get there?"),
    },
    "hat-check": {
        "uk": (["КАПЕЛЮХИ", "В ГАРДЕРОБІ"], "Шанс, що ніхто не отримає свій?"),
        "en": (["THE HAT-CHECK", "PROBLEM"], "Chance that nobody gets their own?"),
    },
    "broken-stick": {
        "uk": (["ЗЛАМАНА", "ПАЛИЧКА"], "Два злами. Чи складеться трикутник?"),
        "en": (["THE BROKEN", "STICK"], "Two breaks. Will it make a triangle?"),
    },
    "elevator-paradox": {
        "uk": (["ПАРАДОКС", "ЛІФТА"], "Ви на 2-му. Ліфт їде вгору чи вниз?"),
        "en": (["THE ELEVATOR", "PARADOX"], "Floor 2. Is the lift going up or down?"),
    },
    "revenue-equivalence": {
        "uk": (["ЧОТИРИ", "АУКЦІОНИ"], "Який принесе продавцю більше?"),
        "en": (["FOUR", "AUCTIONS"], "Which one pays the seller most?"),
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
                # big irises in a bright blue and a near-black brown, so the two read apart even on a small card
                eye = "#1F7AE0" if rnd.random() < .5 else "#5A3214"
                out.append(f'<circle cx="{px}" cy="{py}" r="24" fill="#fff" stroke="{INK}" stroke-width="2"/>')
                for d in (-10, 10):
                    out += [f'<circle cx="{px + d}" cy="{py - 2}" r="8" fill="{eye}"/>',
                            f'<circle cx="{px + d + 2.5}" cy="{py - 4.5}" r="2.2" fill="#fff"/>']
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
    elif kind == "gamblers-ruin":
        # the bankroll wandering from $100 between $0 and $200; where it ends is the answer
        out.append(f'<rect x="{x + 10}" y="{y + 10}" width="360" height="300" rx="16" fill="#fff"/>')
        top, bot = y + 40, y + 280
        for v, yy in ((200, top), (100, (top + bot) / 2), (0, bot)):
            out += [f'<line x1="{x + 80}" y1="{yy}" x2="{x + 350}" y2="{yy}" stroke="#BDBDBD" stroke-width="2"/>',
                    f'<text x="{x + 70}" y="{yy + 8}" text-anchor="end" font-family="{FONT}" font-weight="700" font-size="22" fill="{MUTED}">${v}</text>']
        rw = random.Random(11)
        b, pts = 100, []
        for i in range(160):
            pts.append(f"{x + 80 + i * 1.5:.1f},{(top + bot) / 2 - (b - 100) * 1.2:.1f}")
            b += 1 if rw.random() < .5 else -1
        out.append(f'<polyline points="{" ".join(pts)}" fill="none" stroke="{INK}" stroke-width="3" stroke-linejoin="round"/>')
        out.append(f'<text x="{x + 345}" y="{y + 175}" text-anchor="end" font-family="{FONT}" font-weight="800" font-size="44" fill="{SIGNAL}">?</text>')
    elif kind == "berkson-paradox":
        # a round cloud of independent looks and kindness with the dating bar; the correlation above it is the answer
        out += [f'<rect x="{x + 10}" y="{y + 10}" width="360" height="320" rx="18" fill="#fff"/>']
        cx, cy, k = x + 190, y + 170, 42
        for _ in range(170):
            a, b = rnd.gauss(0, 1), rnd.gauss(0, 1)
            if abs(a) > 3.3 or abs(b) > 3.3:
                continue
            on = a + b > 0.7416
            out.append(f'<circle cx="{cx + a * k:.1f}" cy="{cy - b * k:.1f}" r="{4.2 if on else 3.4}" fill="{INK}" fill-opacity="{.85 if on else .22}"/>')
        out.append(f'<line x1="{cx - 2.6 * k:.1f}" y1="{cy - (0.7416 + 2.6) * k:.1f}" x2="{cx + 3.4 * k:.1f}" y2="{cy - (0.7416 - 3.4) * k:.1f}" stroke="{INK}" stroke-width="3" stroke-dasharray="10 8"/>')
        out.append(f'<text x="{x + 350}" y="{y + 60}" text-anchor="end" font-family="{FONT}" font-weight="800" font-size="34" fill="{SIGNAL}">r = ?</text>')
    elif kind == "ab-test":
        # two identical landing pages with their conversion counts; which one "wins" is the question
        for k, (lab, conv) in enumerate((("A", 52), ("B", 61))):
            px = x + 20 + k * 185
            out += [f'<rect x="{px}" y="{y + 10}" width="160" height="230" rx="14" fill="#fff" stroke="{INK}" stroke-width="3"/>',
                    f'<rect x="{px + 18}" y="{y + 34}" width="124" height="14" rx="7" fill="#D6D6D6"/>',
                    f'<rect x="{px + 18}" y="{y + 60}" width="96" height="10" rx="5" fill="#E4E4E4"/>',
                    f'<rect x="{px + 18}" y="{y + 80}" width="110" height="10" rx="5" fill="#E4E4E4"/>',
                    f'<rect x="{px + 30}" y="{y + 160}" width="100" height="40" rx="10" fill="{INK}"/>',
                    f'<text x="{px + 80}" y="{y + 132}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="44" fill="{INK}">{lab}</text>',
                    f'<text x="{px + 80}" y="{y + 280}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="30" fill="{MUTED}">{conv} / 1000</text>']
        out.append(f'<text x="{x + 360}" y="{y + 325}" text-anchor="end" font-family="{FONT}" font-weight="800" font-size="34" fill="{SIGNAL}">+?%</text>')
    elif kind == "ab-test-peeking":
        # a wandering daily z-score with the significance band; how often it escapes is the answer
        top, bot = y + 30, y + 290
        mid = (top + bot) / 2
        out += [f'<rect x="{x + 10}" y="{y + 10}" width="360" height="300" rx="18" fill="#fff"/>',
                f'<line x1="{x + 30}" y1="{mid - 70}" x2="{x + 350}" y2="{mid - 70}" stroke="{INK}" stroke-width="2" stroke-dasharray="8 7"/>',
                f'<line x1="{x + 30}" y1="{mid + 70}" x2="{x + 350}" y2="{mid + 70}" stroke="{INK}" stroke-width="2" stroke-dasharray="8 7"/>',
                f'<line x1="{x + 30}" y1="{mid}" x2="{x + 350}" y2="{mid}" stroke="#D6D6D6" stroke-width="2"/>']
        for seed, op in ((3, .25), (8, .25), (21, 1)):
            rw = random.Random(seed); s_, pts = 0.0, []
            for d in range(1, 31):
                s_ += rw.gauss(0, 1)
                pts.append(f"{x + 30 + d * 10.6:.1f},{mid - max(-2.8, min(2.8, s_ / d ** .5)) * 40:.1f}")
            out.append(f'<polyline points="{" ".join(pts)}" fill="none" stroke="{INK}" stroke-opacity="{op}" stroke-width="3" stroke-linejoin="round"/>')
        out.append(f'<text x="{x + 360}" y="{y + 345}" text-anchor="end" font-family="{FONT}" font-weight="800" font-size="34" fill="{SIGNAL}">p &lt; 0.05 ?</text>')
    elif kind == "multiple-testing":
        # twenty segment tiles, each with an interval around zero; how many light up is the question
        rw = random.Random(4)
        for i in range(20):
            tx, ty = x + 14 + (i % 4) * 90, y + 10 + (i // 4) * 60
            c = max(-16, min(16, rw.gauss(0, 1) * 9))
            out += [f'<rect x="{tx}" y="{ty}" width="80" height="50" rx="10" fill="#fff"/>',
                    f'<line x1="{tx + 40}" y1="{ty + 8}" x2="{tx + 40}" y2="{ty + 42}" stroke="#D6D6D6" stroke-width="2"/>',
                    f'<line x1="{tx + 40 + c - 20:.1f}" y1="{ty + 25}" x2="{tx + 40 + c + 20:.1f}" y2="{ty + 25}" stroke="{INK}" stroke-width="4" stroke-linecap="round"/>',
                    f'<circle cx="{tx + 40 + c:.1f}" cy="{ty + 25}" r="5" fill="{INK}"/>']
        out.append(f'<text x="{x + 360}" y="{y + 350}" text-anchor="end" font-family="{FONT}" font-weight="800" font-size="34" fill="{SIGNAL}">?</text>')
    elif kind in ("course-ab-testing", "course-ab-testing--check"):
        # a dashboard tile with a big lift and a confidence bar; whether to trust it is the course
        out += [f'<rect x="{x + 10}" y="{y + 20}" width="360" height="250" rx="18" fill="#fff"/>',
                f'<text x="{x + 40}" y="{y + 70}" font-family="{FONT}" font-weight="700" font-size="22" fill="{MUTED}">{'A  5,00%   B  5,85%' if lang == 'uk' else 'A  5.00%   B  5.85%'}</text>',
                f'<text x="{x + 40}" y="{y + 150}" font-family="{FONT}" font-weight="800" font-size="72" fill="{INK}">B +17%</text>',
                f'<rect x="{x + 40}" y="{y + 190}" width="300" height="16" rx="8" fill="#E4E4E4"/>',
                f'<rect x="{x + 40}" y="{y + 190}" width="282" height="16" rx="8" fill="{INK}"/>',
                f'<text x="{x + 40}" y="{y + 240}" font-family="{FONT}" font-weight="700" font-size="22" fill="{MUTED}">94%</text>',
                f'<text x="{x + 360}" y="{y + 330}" text-anchor="end" font-family="{FONT}" font-weight="800" font-size="44" fill="{SIGNAL}">?</text>']
    elif kind == "course-ab-basics":
        # two plain bars of purchases out of 1,000 on day three; whether that is enough is the course
        out += [f'<rect x="{x + 10}" y="{y + 20}" width="360" height="260" rx="18" fill="#fff"/>',
                f'<text x="{x + 40}" y="{y + 64}" font-family="{FONT}" font-weight="700" font-size="18" fill="{MUTED}">{"ДЕНЬ 3 З 14" if lang == "uk" else "DAY 3 OF 14"}</text>',
                f'<text x="{x + 40}" y="{y + 108}" font-family="{FONT}" font-weight="800" font-size="24" fill="{INK}">A</text>',
                f'<rect x="{x + 76}" y="{y + 92}" width="264" height="16" rx="8" fill="#E4E4E4"/>',
                f'<rect x="{x + 76}" y="{y + 92}" width="127" height="16" rx="8" fill="{INK}"/>',
                f'<text x="{x + 40}" y="{y + 150}" font-family="{FONT}" font-weight="800" font-size="24" fill="{INK}">B</text>',
                f'<rect x="{x + 76}" y="{y + 134}" width="264" height="16" rx="8" fill="#E4E4E4"/>',
                f'<rect x="{x + 76}" y="{y + 134}" width="161" height="16" rx="8" fill="{INK}"/>',
                f'<text x="{x + 40}" y="{y + 240}" font-family="{FONT}" font-weight="800" font-size="64" fill="{INK}">B +27%</text>',
                f'<text x="{x + 360}" y="{y + 330}" text-anchor="end" font-family="{FONT}" font-weight="800" font-size="44" fill="{SIGNAL}">?</text>']
    elif kind == "course-data-traps":
        # a quarterly report tile: four lines, each true, each a trap the course explains
        rows = [("Середній чек", "+24%"), ("Задоволені", "92%"), ("Із застосунком", "×2,3"), ("Ретаргетинг", "ROAS 12")] if lang == "uk" else \
               [("Average order", "+24%"), ("Satisfied", "92%"), ("With the app", "×2.3"), ("Retargeting", "ROAS 12")]
        out += [f'<rect x="{x + 10}" y="{y + 20}" width="360" height="270" rx="18" fill="#fff"/>',
                f'<text x="{x + 36}" y="{y + 62}" font-family="{FONT}" font-weight="700" font-size="18" fill="{MUTED}">{"ЗВІТ ЗА III КВАРТАЛ" if lang == "uk" else "Q3 REPORT"}</text>']
        for i, (a, b) in enumerate(rows):
            yy = y + 112 + i * 52
            out += [f'<line x1="{x + 36}" y1="{yy - 32}" x2="{x + 344}" y2="{yy - 32}" stroke="#E4E4E4" stroke-width="2"/>',
                    f'<text x="{x + 36}" y="{yy}" font-family="{FONT}" font-weight="600" font-size="22" fill="{INK}">{a}</text>',
                    f'<text x="{x + 344}" y="{yy}" text-anchor="end" font-family="{FONT}" font-weight="800" font-size="26" fill="{INK}">{b}</text>']
        out.append(f'<text x="{x + 360}" y="{y + 350}" text-anchor="end" font-family="{FONT}" font-weight="800" font-size="44" fill="{SIGNAL}">?</text>')
    elif kind in ("course-interview-puzzles", "course-interview-puzzles--trainer"):
        # a whiteboard with two uneven ropes and a lighter flame; how to get 45 minutes is the course's opening puzzle
        out.append(f'<rect x="{x + 10}" y="{y + 20}" width="360" height="270" rx="18" fill="#fff"/>')
        for k, yy in enumerate((y + 95, y + 185)):
            pts = " ".join(f"{x + 50 + i * 14:.0f},{yy + (9 if i % 2 else -9) * (1 + (i * (k + 3)) % 3) / 2:.1f}" for i in range(21))
            out.append(f'<polyline points="{pts}" fill="none" stroke="{INK}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>')
            out.append(f'<circle cx="{x + 50}" cy="{yy}" r="11" fill="{SIGNAL}"/>')
        out.append(f'<text x="{x + 50}" y="{y + 262}" font-family="{FONT}" font-weight="700" font-size="24" fill="{MUTED}">{"1 год + 1 год" if lang == "uk" else "1 h + 1 h"}</text>')
        out.append(f'<text x="{x + 360}" y="{y + 345}" text-anchor="end" font-family="{FONT}" font-weight="800" font-size="44" fill="{SIGNAL}">{"45 хв?" if lang == "uk" else "45 min?"}</text>')
    elif kind in ("course-feature-impact", "course-feature-impact--trust"):
        # a feature report: two retention bars and "×2"; whether the feature caused it is the course
        out += [f'<rect x="{x + 10}" y="{y + 20}" width="360" height="260" rx="18" fill="#fff"/>',
                f'<text x="{x + 40}" y="{y + 70}" font-family="{FONT}" font-weight="700" font-size="22" fill="{MUTED}">{"З фічею   63%" if lang == "uk" else "With it   63%"}</text>',
                f'<rect x="{x + 40}" y="{y + 86}" width="300" height="16" rx="8" fill="#E4E4E4"/>',
                f'<rect x="{x + 40}" y="{y + 86}" width="189" height="16" rx="8" fill="{INK}"/>',
                f'<text x="{x + 40}" y="{y + 140}" font-family="{FONT}" font-weight="700" font-size="22" fill="{MUTED}">{"Решта   32%" if lang == "uk" else "The rest   32%"}</text>',
                f'<rect x="{x + 40}" y="{y + 156}" width="300" height="16" rx="8" fill="#E4E4E4"/>',
                f'<rect x="{x + 40}" y="{y + 156}" width="96" height="16" rx="8" fill="{INK}"/>',
                f'<text x="{x + 40}" y="{y + 250}" font-family="{FONT}" font-weight="800" font-size="64" fill="{INK}">×2</text>',
                f'<text x="{x + 360}" y="{y + 330}" text-anchor="end" font-family="{FONT}" font-weight="800" font-size="44" fill="{SIGNAL}">?</text>']
    elif kind == "lake-escape":
        # the lake, the swimmer in the middle and the teacher on the shore; the escape route is the answer, so it is not drawn
        cx, cy, R = x + 190, y + 160, 140
        out += [f'<circle cx="{cx}" cy="{cy}" r="{R}" fill="#fff" stroke="{INK}" stroke-width="4"/>',
                f'<circle cx="{cx}" cy="{cy}" r="13" fill="{INK}"/>',
                f'<circle cx="{cx}" cy="{cy - R}" r="17" fill="{MUTED}"/>',
                f'<text x="{cx}" y="{cy + 64}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="40" fill="{SIGNAL}">?</text>',
                f'<text x="{cx + 30}" y="{cy - R - 22}" font-family="{FONT}" font-weight="800" font-size="30" fill="{INK}">×4</text>']
    elif kind == "winners-curse":
        # a jar of coins with ten bid cards; what the top bid earns is the answer
        out += [f'<rect x="{x + 110}" y="{y + 20}" width="160" height="200" rx="34" fill="#fff" stroke="{INK}" stroke-width="4"/>',
                f'<rect x="{x + 135}" y="{y + 4}" width="110" height="26" rx="8" fill="{INK}"/>']
        rw = random.Random(5)
        for _ in range(46):
            out.append(f'<circle cx="{x + 135 + rw.random() * 110:.1f}" cy="{y + 90 + rw.random() * 115:.1f}" r="10" fill="{MUTED}" fill-opacity=".55"/>')
        out.append(f'<text x="{x + 190}" y="{y + 72}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="30" fill="{INK}">100</text>')
        for i, b in enumerate((84, 97, 105, 91, 112, 78, 101, 95, 88, 109)):
            out += [f'<rect x="{x + 12 + (i % 5) * 72}" y="{y + 240 + (i // 5) * 50}" width="62" height="40" rx="8" fill="#fff"/>',
                    f'<text x="{x + 43 + (i % 5) * 72}" y="{y + 268 + (i // 5) * 50}" text-anchor="middle" font-family="{FONT}" font-weight="700" font-size="20" fill="{INK}">{b}</text>']
        out.append(f'<text x="{x + 360}" y="{y + 380}" text-anchor="end" font-family="{FONT}" font-weight="800" font-size="40" fill="{SIGNAL}">?</text>')
    elif kind == "small-numbers":
        # a grid of counties sized by population, the lightest (lowest rate) ones marked; why they are where they are is the question
        rw = random.Random(9)
        out.append(f'<rect x="{x + 10}" y="{y + 10}" width="360" height="300" rx="16" fill="#fff"/>')
        for r_ in range(6):
            for c in range(8):
                big = rw.random() < .3
                low = (not big) and rw.random() < .28
                out.append(f'<rect x="{x + 28 + c * 42}" y="{y + 28 + r_ * 45}" width="36" height="38" rx="6" fill="{INK}" fill-opacity="{.06 if low else .55 if big else .3}" stroke="{INK if low else "none"}" stroke-width="2"/>')
        out.append(f'<text x="{x + 360}" y="{y + 360}" text-anchor="end" font-family="{FONT}" font-weight="800" font-size="40" fill="{SIGNAL}">?</text>')
    elif kind == "multi-armed-bandit":
        # two slot machines with tallies after ten pulls; whether ten is enough is the question
        for k, (lab, tally) in enumerate((("A", "6 / 10"), ("B", "5 / 10"))):
            px = x + 20 + k * 185
            out += [f'<rect x="{px}" y="{y + 30}" width="150" height="220" rx="18" fill="#fff" stroke="{INK}" stroke-width="4"/>',
                    f'<rect x="{px + 22}" y="{y + 60}" width="106" height="62" rx="8" fill="{INK}" fill-opacity=".12"/>',
                    f'<text x="{px + 75}" y="{y + 104}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="36" fill="{INK}">{lab}</text>',
                    f'<line x1="{px + 150}" y1="{y + 110}" x2="{px + 168}" y2="{y + 70}" stroke="{INK}" stroke-width="5" stroke-linecap="round"/>',
                    f'<circle cx="{px + 168}" cy="{y + 66}" r="9" fill="{INK}"/>',
                    f'<text x="{px + 75}" y="{y + 200}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="28" fill="{MUTED}">{tally}</text>']
        out.append(f'<text x="{x + 360}" y="{y + 330}" text-anchor="end" font-family="{FONT}" font-weight="800" font-size="40" fill="{SIGNAL}">?</text>')
    elif kind == "will-rogers":
        # two groups with their means and one person on the way between them; what happens to the means is the question
        for k, (vals, avg) in enumerate((((5, 6, 7, 8, 9), "7"), ((1, 2, 3, 4), "2,5" if lang == "uk" else "2.5"))):
            px = x + 10 + k * 190
            out.append(f'<rect x="{px}" y="{y + 20}" width="170" height="250" rx="18" fill="#fff"/>')
            for i, v in enumerate(vals):
                out += [f'<circle cx="{px + 85}" cy="{y + 50 + i * 40}" r="16" fill="{INK}" fill-opacity="{.25 if v == 5 else .75}"/>',
                        f'<text x="{px + 85}" y="{y + 57 + i * 40}" text-anchor="middle" font-family="{FONT}" font-weight="700" font-size="18" fill="#fff">{v}</text>']
            out.append(f'<text x="{px + 85}" y="{y + 300}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="26" fill="{MUTED}">{"середнє" if lang == "uk" else "mean"} {avg}</text>')
        out.append(f'<path d="M{x + 120},{y + 50} C{x + 190},{y + 0} {x + 230},{y + 0} {x + 270},{y + 40}" fill="none" stroke="{INK}" stroke-width="3" stroke-dasharray="8 7"/>')
        out.append(f'<text x="{x + 360}" y="{y + 360}" text-anchor="end" font-family="{FONT}" font-weight="800" font-size="40" fill="{SIGNAL}">?</text>')
    elif kind == "persuadables":
        # visitor cards with buy chances, coupons on the likeliest buyers; what the coupons add is the question
        chances = (90, 2, 40, 10, 2, 90, 10, 40, 2, 2, 90, 10)
        for i, ch in enumerate(chances):
            cx_, cy_ = x + 14 + (i % 4) * 90, y + 10 + (i // 4) * 100
            top = ch >= 40
            out += [f'<rect x="{cx_}" y="{cy_}" width="80" height="88" rx="12" fill="#fff" stroke="{INK if top else "none"}" stroke-width="3"/>',
                    f'<circle cx="{cx_ + 40}" cy="{cy_ + 28}" r="14" fill="{INK}" fill-opacity=".7"/>',
                    f'<text x="{cx_ + 40}" y="{cy_ + 74}" text-anchor="middle" font-family="{FONT}" font-weight="700" font-size="20" fill="{MUTED}">{ch}%</text>']
            if top:
                out.append(f'<rect x="{cx_ + 52}" y="{cy_ - 8}" width="36" height="22" rx="5" fill="{INK}"/>'
                           f'<text x="{cx_ + 70}" y="{cy_ + 8}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="14" fill="#fff">%</text>')
        out.append(f'<text x="{x + 360}" y="{y + 360}" text-anchor="end" font-family="{FONT}" font-weight="800" font-size="40" fill="{SIGNAL}">+?</text>')
    elif kind == "truel":
        # three shooters in a triangle with their hit rates and every line of fire open; who survives is the question
        names = ("А", "Б", "С") if lang == "uk" else ("A", "B", "S")
        pos = ((x + 70, y + 290), (x + 190, y + 60), (x + 310, y + 290))
        for i in range(3):
            for j in range(i + 1, 3):
                (x1, y1), (x2, y2) = pos[i], pos[j]
                out.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{INK}" stroke-width="4" stroke-dasharray="12 10" stroke-opacity=".55"/>')
        # the ring around each shooter is filled to the hit rate: 120 and 240 degrees clockwise from the top
        for (px, py), t, f, end in zip(pos, names, ("1/3", "2/3", "1"), ((43.3, 25, 0), (-43.3, 25, 1), None)):
            out.append(f'<circle cx="{px}" cy="{py}" r="50" fill="#fff"/>')
            if end:
                out.append(f'<path d="M{px},{py - 50} A50,50 0 {end[2]} 1 {px + end[0]},{py + end[1]}" fill="none" stroke="{INK}" stroke-width="9"/>')
            else:
                out.append(f'<circle cx="{px}" cy="{py}" r="50" fill="none" stroke="{INK}" stroke-width="9"/>')
            out += [f'<text x="{px}" y="{py + 13}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="38" fill="{INK}">{t}</text>',
                    f'<text x="{px}" y="{py + 88}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="26" fill="{MUTED}">{f}</text>']
        out.append(f'<text x="{x + 190}" y="{y + 225}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="56" fill="{SIGNAL}">?</text>')
    elif kind == "guess-two-thirds":
        # twenty face-down number cards over a 0-100 line and the target slot "2/3 of the average"; the number is the question
        for i in range(20):
            cx_, cy_ = x + 14 + (i % 5) * 72, y + 6 + (i // 5) * 62
            out += [f'<rect x="{cx_}" y="{cy_}" width="62" height="52" rx="10" fill="#fff" stroke="{INK}" stroke-width="2"/>',
                    f'<text x="{cx_ + 31}" y="{cy_ + 36}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="24" fill="{INK}">?</text>']
        ly = y + 300
        out.append(f'<line x1="{x + 20}" y1="{ly}" x2="{x + 360}" y2="{ly}" stroke="{INK}" stroke-width="4" stroke-linecap="round"/>')
        for v in (0, 50, 100):
            px = x + 20 + v * 3.4
            out += [f'<line x1="{px}" y1="{ly - 10}" x2="{px}" y2="{ly + 10}" stroke="{INK}" stroke-width="4"/>',
                    f'<text x="{px}" y="{ly + 40}" text-anchor="middle" font-family="{FONT}" font-weight="700" font-size="22" fill="{MUTED}">{v}</text>']
        lab = "2/3 · середнє" if lang == "uk" else "2/3 · average"
        out.append(f'<text x="{x + 190}" y="{ly - 22}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="26" fill="{SIGNAL}">{lab} = ?</text>')
    elif kind == "dollar-auction":
        # a one-dollar bill and two bidders whose bids are unknown; what the seller collects is the question
        out += [f'<rect x="{x + 40}" y="{y + 20}" width="300" height="136" rx="12" fill="#CFE3D2" stroke="#2F5E3B" stroke-width="4"/>',
                f'<rect x="{x + 52}" y="{y + 32}" width="276" height="112" rx="8" fill="none" stroke="#2F5E3B" stroke-width="2"/>',
                f'<ellipse cx="{x + 190}" cy="{y + 88}" rx="34" ry="40" fill="none" stroke="#2F5E3B" stroke-width="3"/>',
                f'<text x="{x + 190}" y="{y + 104}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="46" fill="#2F5E3B">1</text>',
                f'<text x="{x + 72}" y="{y + 70}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="24" fill="#2F5E3B">$</text>',
                f'<text x="{x + 308}" y="{y + 132}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="24" fill="#2F5E3B">$</text>']
        for k in range(2):
            px = x + 20 + k * 190
            out += [f'<rect x="{px}" y="{y + 196}" width="150" height="120" rx="16" fill="#fff"/>',
                    f'<circle cx="{px + 75}" cy="{y + 232}" r="20" fill="{INK}" fill-opacity="{.75 if k == 0 else .4}"/>',
                    f'<text x="{px + 75}" y="{y + 298}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="34" fill="{INK}">$?</text>']
        out.append(f'<text x="{x + 190}" y="{y + 266}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="22" fill="{MUTED}">+5¢</text>')
        out.append(f'<text x="{x + 360}" y="{y + 380}" text-anchor="end" font-family="{FONT}" font-weight="800" font-size="40" fill="{SIGNAL}">?</text>')
    elif kind == "hotelling-beach":
        # a strip of beach with holidaymakers and two kiosks with question marks; where they end up is the answer
        out += [f'<rect x="{x}" y="{y + 20}" width="390" height="40" rx="12" fill="#BFDDEB"/>',
                f'<rect x="{x}" y="{y + 60}" width="390" height="200" fill="#F3E4C3"/>']
        for i in range(36):
            out.append(f'<circle cx="{x + 12 + (i % 18) * 21.5:.1f}" cy="{y + 84 + (i // 18) * 46 + (i * 13) % 24}" r="6" fill="{INK}" fill-opacity=".45"/>')
        for kx, col in ((x + 70, "#2F6FD6"), (x + 320, "#D9762B")):
            out += [f'<rect x="{kx - 22}" y="{y + 196}" width="44" height="54" rx="6" fill="{col}"/>',
                    f'<path d="M{kx - 34},{y + 200} L{kx - 24},{y + 178} L{kx + 24},{y + 178} L{kx + 34},{y + 200} Z" fill="{col}"/>',
                    f'<rect x="{kx - 14}" y="{y + 210}" width="28" height="18" rx="3" fill="#fff" fill-opacity=".85"/>',
                    f'<text x="{kx}" y="{y + 330}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="40" fill="{SIGNAL}">?</text>']
        out += [f'<text x="{x}" y="{y + 290}" font-family="{FONT}" font-weight="700" font-size="20" fill="{MUTED}">0</text>',
                f'<text x="{x + 390}" y="{y + 290}" text-anchor="end" font-family="{FONT}" font-weight="700" font-size="20" fill="{MUTED}">{"1 км" if lang == "uk" else "1 km"}</text>']
    elif kind == "fly-between-trains":
        # two trains facing each other on a track and the fly's zig-zag between them; the fly's path is the answer
        out += [f'<rect x="{x + 10}" y="{y + 10}" width="360" height="320" rx="14" fill="#fff"/>',
                f'<line x1="{x + 22}" y1="{y + 290}" x2="{x + 358}" y2="{y + 290}" stroke="{INK}" stroke-width="4"/>']
        for nose, d, col in ((x + 110, 1, INK), (x + 270, -1, "#9A9A9A")):
            x0 = nose - 80 if d > 0 else nose
            out += [f'<rect x="{x0}" y="{y + 246}" width="80" height="36" rx="8" fill="{col}"/>']
            for k in (12, 30, 54, 70):
                out.append(f'<circle cx="{nose - d * k}" cy="{y + 286}" r="6" fill="{INK}"/>')
            for k in (16, 38, 60):
                out.append(f'<rect x="{nose - d * k - (12 if d > 0 else 0)}" y="{y + 254}" width="12" height="10" rx="2" fill="#fff"/>')
        # the zig-zag in time (downwards), narrowing like the space-time triangle
        pts, lx, rx, top, bot = [], x + 40, x + 340, y + 40, y + 220
        xa, xb, xf, t, toB = 0.0, 100.0, 0.0, 0.0, True
        pts.append((xf, t))
        for _ in range(9):
            dt = (xb - xf) / 125 if toB else (xf - xa) / 125
            t += dt; xa, xb = 50 * t, 100 - 50 * t; xf = xb if toB else xa; toB = not toB
            pts.append((xf, t))
        sx = lambda k: lx + (rx - lx) * k / 100
        sy = lambda tt: top + (bot - top) * tt
        out += [f'<line x1="{sx(0)}" y1="{sy(0)}" x2="{sx(50)}" y2="{sy(1)}" stroke="{INK}" stroke-width="3"/>',
                f'<line x1="{sx(100)}" y1="{sy(0)}" x2="{sx(50)}" y2="{sy(1)}" stroke="#9A9A9A" stroke-width="3"/>',
                '<polyline points="' + " ".join(f"{sx(px):.1f},{sy(pt):.1f}" for px, pt in pts) + f'" fill="none" stroke="{INK}" stroke-width="2"/>']
        fx, fy = sx(pts[0][0]) + 6, sy(0) - 4
        out += [f'<ellipse cx="{fx - 6}" cy="{fy - 8}" rx="8" ry="5" fill="#A0BEE6" transform="rotate(-30 {fx - 6} {fy - 8})"/>',
                f'<ellipse cx="{fx + 6}" cy="{fy - 8}" rx="8" ry="5" fill="#A0BEE6" transform="rotate(30 {fx + 6} {fy - 8})"/>',
                f'<ellipse cx="{fx}" cy="{fy}" rx="5" ry="8" fill="{INK}"/>',
                f'<text x="{x + 350}" y="{y + 160}" text-anchor="end" font-family="{FONT}" font-weight="800" font-size="40" fill="{SIGNAL}">?</text>']
    elif kind == "hilbert-hotel":
        # a corridor of numbered rooms fading out, a guest in each, and one more guest at the door; whether they fit is the answer
        for i in range(6):
            px, op = x + 36 + i * 52, (1, 1, 1, 1, .55, .25)[i]
            out += [f'<g opacity="{op}"><rect x="{px}" y="{y + 70}" width="44" height="110" rx="8" fill="#fff" stroke="{INK}" stroke-width="3"/>',
                    f'<text x="{px + 22}" y="{y + 58}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="22" fill="{INK}">{i + 1}</text>',
                    f'<circle cx="{px + 22}" cy="{y + 112}" r="10" fill="{INK}"/><rect x="{px + 12}" y="{y + 126}" width="20" height="30" rx="7" fill="{INK}"/></g>']
        out.append(f'<text x="{x + 405}" y="{y + 135}" text-anchor="end" font-family="{FONT}" font-weight="800" font-size="40" fill="{MUTED}">…</text>')
        out += [f'<circle cx="{x + 30}" cy="{y + 252}" r="13" fill="{INK}" fill-opacity=".55"/>',
                f'<rect x="{x + 17}" y="{y + 270}" width="26" height="40" rx="9" fill="{INK}" fill-opacity=".55"/>',
                f'<rect x="{x + 48}" y="{y + 286}" width="26" height="22" rx="4" fill="#fff" stroke="{INK}" stroke-width="3"/>']
        out.append(f'<text x="{x + 100}" y="{y + 300}" font-family="{FONT}" font-weight="800" font-size="48" fill="{SIGNAL}">?</text>')
    elif kind == "parrondo-paradox":
        # two coin games and two average-capital lines going down; the mixed line is the answer, so only "?"
        out.append(f'<rect x="{x + 10}" y="{y + 10}" width="360" height="300" rx="16" fill="#fff"/>')
        for k, (lab, col, sub) in enumerate((("A", "#3E7CB1", "49,5%" if lang == "uk" else "49.5%"), ("B", "#B5651D", "9,5% / 74,5%" if lang == "uk" else "9.5% / 74.5%"))):
            cx_ = x + 70 + k * 120
            out += [f'<circle cx="{cx_}" cy="{y + 62}" r="30" fill="{col}"/>',
                    f'<text x="{cx_}" y="{y + 74}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="32" fill="#fff">{lab}</text>',
                    f'<text x="{cx_}" y="{y + 118}" text-anchor="middle" font-family="{FONT}" font-weight="700" font-size="17" fill="{MUTED}">{sub}</text>']
        top, bot = y + 140, y + 290
        out.append(f'<line x1="{x + 40}" y1="{top + 20}" x2="{x + 230}" y2="{top + 20}" stroke="#BDBDBD" stroke-width="2"/>')
        for col, slope in (("#3E7CB1", .3), ("#B5651D", .26)):
            out.append(f'<line x1="{x + 40}" y1="{top + 20}" x2="{x + 230}" y2="{top + 20 + 200 * slope:.1f}" stroke="{col}" stroke-width="5" stroke-linecap="round"/>')
        out.append(f'<text x="{x + 350}" y="{top + 30}" text-anchor="end" font-family="{FONT}" font-weight="800" font-size="34" fill="{SIGNAL}">A+B ?</text>')
    elif kind == "axelrod-tournament":
        # the payoff table of the prisoner's dilemma (you : other) and a strip of moves; which strategy wins the tournament is the question
        coop, defect = ("співпраця", "зрада") if lang == "uk" else ("cooperate", "defect")
        out.append(f'<rect x="{x + 10}" y="{y + 10}" width="370" height="300" rx="16" fill="#fff"/>')
        out += [f'<text x="{x + 177}" y="{y + 44}" text-anchor="middle" font-family="{FONT}" font-weight="700" font-size="17" fill="{MUTED}">{coop}</text>',
                f'<text x="{x + 301}" y="{y + 44}" text-anchor="middle" font-family="{FONT}" font-weight="700" font-size="17" fill="{MUTED}">{defect}</text>']
        for i, (cell, fill) in enumerate((("3 : 3", "#CFE8DA"), ("0 : 5", "#EDEFF5"), ("5 : 0", "#EDEFF5"), ("1 : 1", "#F4D2CB"))):
            cx_, cy_ = x + 120 + (i % 2) * 124, y + 58 + (i // 2) * 72
            out += [f'<rect x="{cx_}" y="{cy_}" width="114" height="62" rx="12" fill="{fill}"/>',
                    f'<text x="{cx_ + 57}" y="{cy_ + 41}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="28" fill="{INK}">{cell}</text>']
        for k, lab in enumerate((coop, defect)):
            out.append(f'<text x="{x + 110}" y="{y + 95 + k * 72}" text-anchor="end" font-family="{FONT}" font-weight="700" font-size="17" fill="{MUTED}">{lab}</text>')
        for r, pair in enumerate(((1, 1), (1, 0), (0, 0), (1, 1), (0, 1), (1, 1), (1, 1))):
            for q, m in enumerate(pair):
                out.append(f'<rect x="{x + 34 + r * 34}" y="{y + 222 + q * 34}" width="28" height="28" rx="6" fill="{"#CFE8DA" if m else "#F4D2CB"}"/>')
        out.append(f'<text x="{x + 365}" y="{y + 268}" text-anchor="end" font-family="{FONT}" font-weight="800" font-size="48" fill="{SIGNAL}">?</text>')
    elif kind == "travelers-dilemma":
        # two broken vases above two price cards with question marks; the number to write is the question
        for k in range(2):
            cx_ = x + 95 + k * 190
            out += [f'<path d="M{cx_ - 14},{y + 20} L{cx_ + 14},{y + 20} C{cx_ + 11},{y + 44} {cx_ + 48},{y + 66} {cx_ + 39},{y + 112} '
                    f'C{cx_ + 33},{y + 140} {cx_ + 20},{y + 150} {cx_ + 17},{y + 150} L{cx_ - 17},{y + 150} '
                    f'C{cx_ - 20},{y + 150} {cx_ - 33},{y + 140} {cx_ - 39},{y + 112} C{cx_ - 48},{y + 66} {cx_ - 11},{y + 44} {cx_ - 14},{y + 20} Z" '
                    f'fill="#BBD3E6" stroke="#2C4A66" stroke-width="4"/>',
                    f'<polyline points="{cx_ + 4},{y + 20} {cx_ - 7},{y + 50} {cx_ + 8},{y + 76} {cx_ - 4},{y + 104} {cx_ + 6},{y + 126}" fill="none" stroke="{INK}" stroke-width="3"/>',
                    f'<rect x="{cx_ - 75}" y="{y + 180}" width="150" height="120" rx="16" fill="#fff"/>',
                    f'<text x="{cx_}" y="{y + 216}" text-anchor="middle" font-family="{FONT}" font-weight="700" font-size="18" fill="{MUTED}">{"2 … 100"}</text>',
                    f'<text x="{cx_}" y="{y + 276}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="44" fill="{INK}">$?</text>']
        out.append(f'<text x="{x + 190}" y="{y + 360}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="24" fill="{MUTED}">{"менша ціна ± $2" if lang == "uk" else "lower price ± $2"}</text>')
    elif kind == "prosecutors-fallacy":
        # a town of dots with one ringed person whose blood matched; how many others match is the answer, so only "?"
        out.append(f'<rect x="{x + 10}" y="{y + 10}" width="380" height="300" rx="16" fill="#fff"/>')
        for i in range(19):
            for j in range(11):
                out.append(f'<circle cx="{x + 34 + i * 18.5}" cy="{y + 34 + j * 18.5}" r="3" fill="#CFC6C2"/>')
        px, py = x + 34 + 11 * 18.5, y + 34 + 5 * 18.5
        out += [f'<circle cx="{px}" cy="{py}" r="7" fill="{INK}"/>', f'<circle cx="{px}" cy="{py}" r="16" fill="none" stroke="{INK}" stroke-width="4"/>']
        out.append(f'<rect x="{x + 40}" y="{y + 250}" width="150" height="44" rx="10" fill="{INK}"/>')
        out.append(f'<text x="{x + 115}" y="{y + 280}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="22" fill="#fff">{"1 : 10 000" if lang == "uk" else "1 : 10,000"}</text>')
        out.append(f'<text x="{x + 365}" y="{y + 290}" text-anchor="end" font-family="{FONT}" font-weight="800" font-size="44" fill="{SIGNAL}">?</text>')
    elif kind == "ant-rubber-rope":
        # a rope tied to a post with km marks, an ant near the post and arrows pulling the far end; whether it arrives is the answer
        out += [f'<rect x="{x + 10}" y="{y + 30}" width="370" height="280" rx="16" fill="#fff"/>',
                f'<rect x="{x + 34}" y="{y + 120}" width="12" height="110" rx="3" fill="{MUTED}"/>',
                f'<line x1="{x + 46}" y1="{y + 200}" x2="{x + 330}" y2="{y + 200}" stroke="#C2703D" stroke-width="10" stroke-linecap="round"/>']
        for k in range(1, 5):
            out.append(f'<line x1="{x + 46 + k * 57}" y1="{y + 192}" x2="{x + 46 + k * 57}" y2="{y + 208}" stroke="#fff" stroke-width="3"/>')
        out += [f'<circle cx="{x + 330}" cy="{y + 200}" r="11" fill="#DB9500"/>',
                f'<path d="M{x + 344},{y + 200} L{x + 372},{y + 200} M{x + 360},{y + 188} L{x + 374},{y + 200} L{x + 360},{y + 212}" fill="none" stroke="{INK}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>',
                f'<text x="{x + 300}" y="{y + 252}" text-anchor="middle" font-family="{FONT}" font-weight="700" font-size="22" fill="{MUTED}">{"+1 км/с" if lang == "uk" else "+1 km/s"}</text>',
                f'<text x="{x + 92}" y="{y + 252}" text-anchor="middle" font-family="{FONT}" font-weight="700" font-size="22" fill="{MUTED}">{"1 см/с" if lang == "uk" else "1 cm/s"}</text>']
        ax, ay = x + 74, y + 188
        out += [f'<ellipse cx="{ax - 14}" cy="{ay}" rx="11" ry="8" fill="{INK}"/>',
                f'<ellipse cx="{ax}" cy="{ay}" rx="6" ry="5" fill="{INK}"/>',
                f'<circle cx="{ax + 11}" cy="{ay - 2}" r="6" fill="{INK}"/>',
                f'<path d="M{ax - 6},{ay + 2} L{ax - 10},{ay + 12} M{ax},{ay + 2} L{ax},{ay + 12} M{ax + 6},{ay + 2} L{ax + 10},{ay + 12} M{ax + 14},{ay - 6} L{ax + 20},{ay - 16}" stroke="{INK}" stroke-width="2.5" stroke-linecap="round"/>',
                f'<text x="{x + 196}" y="{y + 140}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="56" fill="{SIGNAL}">?</text>']
    elif kind == "hat-check":
        # a hat rack above a row of guests, each hat in its owner's colour; who ends up with which hat is the question
        cols = ("#2A3DD1", "#157F51", "#C98A00", "#7A4BC2", "#BF3E28")
        out += [f'<rect x="{x + 10}" y="{y + 10}" width="370" height="320" rx="16" fill="#fff"/>',
                f'<line x1="{x + 30}" y1="{y + 50}" x2="{x + 360}" y2="{y + 50}" stroke="{MUTED}" stroke-width="5" stroke-linecap="round"/>']
        for i, col in enumerate((cols[2], cols[0], cols[4], cols[1], cols[3])):
            hx = x + 60 + i * 68
            out += [f'<line x1="{hx}" y1="{y + 50}" x2="{hx}" y2="{y + 64}" stroke="{MUTED}" stroke-width="3"/>',
                    f'<ellipse cx="{hx}" cy="{y + 104}" rx="29" ry="6" fill="{col}"/>',
                    f'<path d="M {hx - 18} {y + 102} A 18 22 0 0 1 {hx + 18} {y + 102} Z" fill="{col}"/>',
                    f'<rect x="{hx - 18}" y="{y + 94}" width="36" height="5" fill="#000" fill-opacity=".28"/>']
        for i, col in enumerate(cols):
            gx = x + 60 + i * 68
            out += [f'<circle cx="{gx}" cy="{y + 214}" r="17" fill="#fff" stroke="{INK}" stroke-width="3"/>',
                    f'<rect x="{gx - 24}" y="{y + 238}" width="48" height="56" rx="12" fill="{col}"/>',
                    f'<text x="{gx}" y="{y + 274}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="22" fill="#fff">{i + 1}</text>',
                    f'<text x="{gx}" y="{y + 186}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="30" fill="{SIGNAL}">?</text>']
    elif kind == "broken-stick":
        # a wooden stick with two cracks and its three pieces laid out below; whether they close is the answer
        out += [f'<rect x="{x + 10}" y="{y + 10}" width="360" height="320" rx="14" fill="#fff"/>']
        cuts, x0, w = (0.27, 0.68), x + 40, 300
        segs = [(0, cuts[0], "#C8955A"), (cuts[0], cuts[1], INK), (cuts[1], 1, "#8A8FA3")]
        for a, b, col in segs:
            l, r = (4 if a > 0 else 0), (4 if b < 1 else 0)
            out.append(f'<rect x="{x0 + w * a + l:.1f}" y="{y + 60}" width="{w * (b - a) - l - r:.1f}" height="20" rx="8" fill="{col}"/>')
        for c in cuts:
            cx = x0 + w * c
            out.append(f'<polyline points="{cx - 5},{y + 44} {cx + 4},{y + 70} {cx - 4},{y + 96}" fill="none" stroke="{SIGNAL}" stroke-width="3"/>')
        for i, (a, b, col) in enumerate(segs):
            out.append(f'<rect x="{x0}" y="{y + 140 + i * 40}" width="{w * (b - a):.1f}" height="16" rx="7" fill="{col}"/>')
        out.append(f'<text x="{x + 350}" y="{y + 300}" text-anchor="end" font-family="{FONT}" font-weight="800" font-size="48" fill="{SIGNAL}">△ ?</text>')
    elif kind == "elevator-paradox":
        # a 15-floor building, one shaft with a car somewhere in the middle, "you" on floor 2; the direction is the answer, so only "?"
        out.append(f'<rect x="{x + 60}" y="{y + 6}" width="270" height="330" rx="16" fill="#fff"/>')
        top, bot = y + 26, y + 316
        fy = lambda f: bot - (bot - top) * (f - 1) / 14
        for f in range(1, 16):
            out.append(f'<line x1="{x + 100}" y1="{fy(f):.1f}" x2="{x + 316}" y2="{fy(f):.1f}" stroke="#E2E2E2" stroke-width="2"/>')
        for f in (1, 2, 15):
            out.append(f'<text x="{x + 92}" y="{fy(f) + 6:.1f}" text-anchor="end" font-family="{FONT}" font-weight="700" font-size="17" fill="{MUTED}">{f}</text>')
        out.append(f'<line x1="{x + 100}" y1="{fy(2):.1f}" x2="{x + 316}" y2="{fy(2):.1f}" stroke="{INK}" stroke-width="4"/>')
        out.append(f'<rect x="{x + 130}" y="{top - 10}" width="60" height="{bot - top + 20}" fill="none" stroke="{MUTED}" stroke-width="2" stroke-dasharray="5 6"/>')
        cy = fy(9)
        out.append(f'<rect x="{x + 135}" y="{cy - 14:.1f}" width="50" height="28" rx="6" fill="{INK}"/>')
        out.append(f'<text x="{x + 160}" y="{cy + 8:.1f}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="22" fill="#fff">?</text>')
        px, py = x + 240, fy(2)
        out += [f'<circle cx="{px}" cy="{py - 46:.1f}" r="10" fill="{INK}"/>',
                f'<rect x="{px - 11}" y="{py - 34:.1f}" width="22" height="32" rx="7" fill="{INK}"/>',
                f'<text x="{px + 22}" y="{py - 16:.1f}" font-family="{FONT}" font-weight="800" font-size="24" fill="{SIGNAL}">↑ ↓ ?</text>']
    elif kind == "revenue-equivalence":
        # four auction formats as cards (two sealed envelopes, a rising and a falling price), each with "?" for the take
        labels = {"uk": ("1-ША ЦІНА", "2-ГА ЦІНА", "АНГЛІЙСЬКИЙ", "ГОЛЛАНДСЬКИЙ"), "en": ("1ST PRICE", "2ND PRICE", "ENGLISH", "DUTCH")}[lang]
        for i, lab in enumerate(labels):
            cx, cy = x + 100 + (i % 2) * 180, y + 10 + (i // 2) * 175
            out += [f'<rect x="{cx - 80}" y="{cy}" width="160" height="160" rx="18" fill="#fff"/>',
                    f'<text x="{cx}" y="{cy + 150}" text-anchor="middle" font-family="{FONT}" font-weight="700" font-size="15" fill="{MUTED}">{lab}</text>']
            if i < 2:
                out += [f'<rect x="{cx - 34}" y="{cy + 22}" width="68" height="46" rx="5" fill="none" stroke="{INK}" stroke-width="4"/>',
                        f'<polyline points="{cx - 34},{cy + 22} {cx},{cy + 50} {cx + 34},{cy + 22}" fill="none" stroke="{INK}" stroke-width="4"/>']
            else:
                a, b = (cy + 72, cy + 20) if i == 2 else (cy + 20, cy + 72)
                d = -1 if i == 2 else 1
                out += [f'<line x1="{cx}" y1="{a}" x2="{cx}" y2="{b}" stroke="{INK}" stroke-width="5" stroke-linecap="round"/>',
                        f'<polyline points="{cx - 14},{b - d * 14} {cx},{b} {cx + 14},{b - d * 14}" fill="none" stroke="{INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>']
            out.append(f'<text x="{cx}" y="{cy + 122}" text-anchor="middle" font-family="{FONT}" font-weight="800" font-size="40" fill="{SIGNAL}">?</text>')
    return "".join(out)


def svg(kind, lang):
    lines, sub = TEXT[kind][lang]
    big = min(84, int(590 / (max(len(l) for l in lines) * 0.68)))
    parts = [f'<rect width="1200" height="630" fill="#fff"/>',
             f'<rect x="700" y="40" width="460" height="550" rx="36" fill="{TINT[kind]}"/>', dots(700, 40, 460, 550)]
    for i, l in enumerate(lines):
        parts.append(f'<text x="70" y="{190 + i * (big + 4)}" font-family="{FONT}" font-weight="800" font-size="{big}" letter-spacing="-2" fill="{INK}">{l}</text>')
    parts.append(f'<text x="72" y="{190 + len(lines) * (big + 4) + 18}" font-family="{FONT}" font-weight="500" font-size="32" fill="{MUTED}">{sub}</text>')
    if kind != "hub" and not kind.startswith("course-"):
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
                  "twenty-five-horses", "bridge-and-torch", "braess-paradox", "survivorship-bias", "sleeping-beauty", "gamblers-ruin", "berkson-paradox",
                  "ab-test", "ab-test-peeking", "multiple-testing", "course-ab-testing", "course-ab-testing--check", "course-ab-basics", "course-interview-puzzles", "course-interview-puzzles--trainer", "course-data-traps", "course-feature-impact", "course-feature-impact--trust", "lake-escape",
                  "winners-curse", "small-numbers", "multi-armed-bandit", "will-rogers", "persuadables", "truel", "guess-two-thirds", "dollar-auction", "hotelling-beach", "fly-between-trains", "hilbert-hotel", "parrondo-paradox", "axelrod-tournament", "travelers-dilemma", "prosecutors-fallacy", "ant-rubber-rope", "hat-check", "broken-stick", "elevator-paradox", "revenue-equivalence"):
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
        folder = ROOT / ("hub" if kind == "hub" else f"courses/{kind[7:].replace('--', '/')}" if kind.startswith("course-") else f"problems/{kind}") / "assets"
        folder.mkdir(parents=True, exist_ok=True)
        for old in folder.glob("og-src-*.svg"):
            old.unlink()
        for lang in ("uk", "en"):
            render(kind, lang, folder / f"og-{lang}.png")
