# mathproblems

**English.** The source of https://mathparadoxes.com/en/: interactive explainers of maths puzzles where intuition gives the wrong answer, in English and Ukrainian. There are 60 puzzles (the 100 prisoners, the German tank problem, the bus paradox, Monty Hall…), a glossary of 22 terms and 6 themed courses.

Every puzzle page follows the same path: you lock in a guess first (the answer stays hidden until you do), play a small version by hand, run thousands of simulations in the browser, then read why in layers: plain words, then tables, charts and formulas, then some theory and history. Harder variants come last. Some pages also offer the simulation as a short JavaScript and Python snippet to run yourself.

How it's built:
- A static site with no frameworks, libraries or npm. `python3 build.py` turns `problems/`, `glossary/`, `courses/` and `hub/` into `docs/`, which GitHub Pages serves. Each source page has one `<style>` and one `<script>`; the build strips the other language from every page.
- `python3 tools/check.py` builds into a temporary folder and checks that `docs/` is up to date, every inline script parses, no page leaks the other language, and titles and descriptions fit. CI runs the same script.
- Every answer is checked independently, with an exact calculation in Python and a simulation in Node, before a page goes live.
- Answer statistics ("how many people guessed right") come from a tiny Cloudflare Worker with D1 (`stats/`) that stores only anonymous counts per answer.
- I built the first puzzles together with AI to test the idea, and kept going.

The rest of this README is in Ukrainian and documents the build in detail. Author: Dmytro Kudrenko.

---

Інтерактивні пояснення математичних задач, у яких інтуїція помиляється. Українською та англійською.

Сайт: https://mathparadoxes.com/

| Задача | UA | EN |
|---|---|---|
| Парадокс Монті Голла | [/monty-hall/](https://mathparadoxes.com/monty-hall/) | [/monty-hall/en/](https://mathparadoxes.com/monty-hall/en/) |
| Задача про ряску в озері | [/duckweed-lake/](https://mathparadoxes.com/duckweed-lake/) | [/duckweed-lake/en/](https://mathparadoxes.com/duckweed-lake/en/) |
| Парадокс днів народження | [/birthday/](https://mathparadoxes.com/birthday/) | [/birthday/en/](https://mathparadoxes.com/birthday/en/) |
| Парадокс хибнопозитивного тесту | [/false-positive/](https://mathparadoxes.com/false-positive/) | [/false-positive/en/](https://mathparadoxes.com/false-positive/en/) |
| Правило 37%: задача про секретаря | [/secretary-problem/](https://mathparadoxes.com/secretary-problem/) | [/secretary-problem/en/](https://mathparadoxes.com/secretary-problem/en/) |
| Парадокс Сімпсона | [/simpson-paradox/](https://mathparadoxes.com/simpson-paradox/) | [/simpson-paradox/en/](https://mathparadoxes.com/simpson-paradox/en/) |
| Парадокс двох дітей | [/two-children/](https://mathparadoxes.com/two-children/) | [/two-children/en/](https://mathparadoxes.com/two-children/en/) |
| Голка Бюффона | [/buffon-needle/](https://mathparadoxes.com/buffon-needle/) | [/buffon-needle/en/](https://mathparadoxes.com/buffon-needle/en/) |
| Парадокс дружби | [/friendship-paradox/](https://mathparadoxes.com/friendship-paradox/) | [/friendship-paradox/en/](https://mathparadoxes.com/friendship-paradox/en/) |
| Мотузка навколо Землі | [/rope-around-earth/](https://mathparadoxes.com/rope-around-earth/) | [/rope-around-earth/en/](https://mathparadoxes.com/rope-around-earth/en/) |
| 100 в'язнів і 100 коробок | [/hundred-prisoners/](https://mathparadoxes.com/hundred-prisoners/) | [/hundred-prisoners/en/](https://mathparadoxes.com/hundred-prisoners/en/) |
| Тест когнітивної рефлексії | [/cognitive-reflection/](https://mathparadoxes.com/cognitive-reflection/) | [/cognitive-reflection/en/](https://mathparadoxes.com/cognitive-reflection/en/) |
| Скільки наліпок на альбом | [/coupon-collector/](https://mathparadoxes.com/coupon-collector/) | [/coupon-collector/en/](https://mathparadoxes.com/coupon-collector/en/) |
| Регресія до середнього | [/regression-to-mean/](https://mathparadoxes.com/regression-to-mean/) | [/regression-to-mean/en/](https://mathparadoxes.com/regression-to-mean/en/) |
| Парадокс двох конвертів | [/two-envelopes/](https://mathparadoxes.com/two-envelopes/) | [/two-envelopes/en/](https://mathparadoxes.com/two-envelopes/en/) |
| Серії в підкиданні монети | [/coin-streaks/](https://mathparadoxes.com/coin-streaks/) | [/coin-streaks/en/](https://mathparadoxes.com/coin-streaks/en/) |
| Парадокс Бертрана | [/bertrand-paradox/](https://mathparadoxes.com/bertrand-paradox/) | [/bertrand-paradox/en/](https://mathparadoxes.com/bertrand-paradox/en/) |
| Гра Пенні | [/penney-game/](https://mathparadoxes.com/penney-game/) | [/penney-game/en/](https://mathparadoxes.com/penney-game/en/) |
| Парадокс автобуса | [/inspection-paradox/](https://mathparadoxes.com/inspection-paradox/) | [/inspection-paradox/en/](https://mathparadoxes.com/inspection-paradox/en/) |
| Задача про німецькі танки | [/german-tank-problem/](https://mathparadoxes.com/german-tank-problem/) | [/german-tank-problem/en/](https://mathparadoxes.com/german-tank-problem/en/) |
| Санкт-Петербурзький парадокс | [/st-petersburg-paradox/](https://mathparadoxes.com/st-petersburg-paradox/) | [/st-petersburg-paradox/en/](https://mathparadoxes.com/st-petersburg-paradox/en/) |
| Закон Бенфорда | [/benford-law/](https://mathparadoxes.com/benford-law/) | [/benford-law/en/](https://mathparadoxes.com/benford-law/en/) |
| Отруєне вино і щури | [/poisoned-wine/](https://mathparadoxes.com/poisoned-wine/) | [/poisoned-wine/en/](https://mathparadoxes.com/poisoned-wine/en/) |

## Структура

```
hub/
  page.html    головна (обидві мови); у <!--PROBLEMS--> збірка вставляє тизери задач
  meta.json    SEO головної
  assets/      og-uk.png, og-en.png
problems/<slug>/
  page.html    сторінка задачі; обидві мови поруч (class="uk" / class="en")
  teaser.html  блок задачі на головній: умова, «інтуїція / насправді», міні-гра
  meta.json    order, published, updated, topics, level, about (Wikipedia); title, description, FAQ, картка — для кожної мови
  assets/      og-uk.png, og-en.png (1200×630)
books.json     книжки для блоку «Що почитати» (автор uk/en, назва, рік, ISBN, українське видання)
site.css       спільний вигляд усіх сторінок (підключається після стилів сторінки)
tools/og.py    малює картинки для соцмереж (macOS: qlmanage + sips)
tools/check.py перевірки перед комітом (їх же запускає GitHub Actions на кожен PR)
brand/         логотип: mark.svg (знак), lockup-uk/en(-dark).svg; favicon.svg у корені — той самий знак
build.py       збирає сайт у docs/
docs/          готовий сайт (GitHub Pages публікує з main:/docs)
```

## Сторінка після підтвердження підписки

`pages/subscribed/` → https://mathparadoxes.com/subscribed/ (англійська: `/subscribed/en/`). Сюди веде посилання «Підтвердити підписку» з листа розсилки. Сторінка не індексується і не потрапляє в sitemap; `picks` у `meta.json` задає три задачі, які вона пропонує.

## Збірка

```bash
python3 build.py
```

Без залежностей, потрібен лише Python 3. Сайт живе на https://mathparadoxes.com (файл `docs/CNAME` пише збірка).
Для іншого домену: `python3 build.py --base-url https://example.com/`.
Після змін у `problems/` перезберіть сайт і закомітьте `docs/` разом з ними.
Скрипт тизера (`<script>` у `teaser.html`) збірка виносить у `docs/teasers/<slug>-<hash>.js`, а головна завантажує його, лише коли картка наближається до екрана (IntersectionObserver). Тож тизер має бути самодостатнім: шукати свій корінь за id і не чекати `DOMContentLoaded`.

```bash
python3 tools/check.py
```

Перевіряє, що збірка проходить і `docs/` з нею збігається, що вбудовані скрипти й JSON-LD без синтаксичних помилок,
що на uk-сторінках немає `class="en"` (і навпаки), що `<title>` ≤ 70 символів, а description ≤ 160,
і що в робочій теці немає дублікатів iCloud на кшталт `index 2.html`. Потрібен Node.js. Ширину 375px і консоль браузера
перевіряйте вручну.

## Нова задача

1. Створіть `problems/<slug>/` з `page.html`, `teaser.html` і `meta.json` (поле `order` задає місце на головній, `published` і `updated` — дати у форматі `YYYY-MM-DD`, `topics` — теми для фільтрів на головній: один чи кілька ключів із `TOPICS` у build.py: interview, conditional, chance, stats, games, quick; `level` — скільки математики потрібно читачеві: 1 — для всіх, 2 — шкільна математика, 3 — поглиблено (сподівання, дисперсія, кореляція, логарифми, ряди). Оцінюємо те, що видно в основному шляху: шапку, умову, раунди 1–4 з графіками; картка «Для тих, хто любить формули», блоки «Підтеорія» і раунд 5 не рахуються. Рівень не каже, наскільки задача підступна. Він показується маленьким значком на картці на головній і в шапці сторінки; клік по значку відкриває підказку з посиланням «Усі задачі цього рівня», яке фільтрує головну (`?l=1`, над списком рядок «Показано задачі рівня…» з кнопкою «Показати всі»). Окремого ряду фільтрів за рівнем навмисно немає. Рівень також дає `educationalLevel` у JSON-LD).
2. Додайте тексти задачі в `tools/og.py` і запустіть `python3 tools/og.py`.
3. `python3 build.py` додасть сторінки, тизер на головну, записи в sitemap і RSS.

Після помітної правки задачі оновіть `updated` у її `meta.json`: дата йде в `dateModified`, `lastmod` у sitemap і `atom:updated` у RSS.

## Без спойлерів

Відповідь не видно, доки відвідувач не відповів сам або не попросив її показати.

- `class="sp-before"` видно лише до відповіді, `class="sp-after"` лише після. Сторінка задачі має `<html data-spoil>`, картка на головній `<article data-spoil>`.
- Кнопка «Сховати відповідь» (атрибут `data-unsolve`) знову ховає відповідь, щоб показати сайт комусь зі свого екрана: на сторінці під кнопками першого екрана, на кожній картці під відповіддю, а «Сховати всі відповіді» над списком задач. Ці кнопки додає спільний скрипт сам.
- Елемент з атрибутом `data-solve` відкриває відповідь кліком. У скрипті сторінки `mpSolve()` позначає задачу розв'язаною (подія `solved` на `document`), `mpSolved()` перевіряє стан. Вибір запам'ятовується в localStorage, тож картка і сторінка відкриваються разом.
- Перший екран сторінки містить лише умову й питання, відповідь показує перший раунд з вгадуванням. Міні-гра на картці нічого не показує до першого кліку.
- `share` у `meta.json` (назва й питання) іде в og:/twitter:-теги, щоб превʼю посилання не видавало відповідь. `<title>` і description лишаються з відповіддю для пошуку. OG-картинки (`tools/og.py`) теж без відповідей.

## Поле відповіді в першому раунді

Числову відповідь вводять через спільний елемент `<mp-guess id="guess-n" min="0" max="100" value="50" unit="%"></mp-guess>` (скрипт `GUESS_SCRIPT` у build.py, стилі в site.css). Велике число — це поле: його можна набрати точно (кома або крапка), −/+ крокують на `step`, повзунок лишається для грубого вибору. Для скрипту сторінки він поводиться як `<input>`: `guessed = +guessIn.value`, події `input` і `change`, `.min`, `.max`, `.disabled`. Окремий `.val` і рядок `.scale` під ним не потрібні.

- `fine` — точність набраного числа (типово дорівнює `step`).
- `scale="p"` — шкала 0–100 % з дрібнішими краями: 0–5 і 95–100 займають по п'ятій частині повзунка, тож 0,5% чи 99% легко поставити. `scale="log"` — логарифмічна між `min` і `max`, повзунок тримає дві значущі цифри.
- `zones="chance"` (майже ніколи · рідко · навпіл · часто · майже напевно) або `zones="share"` (майже ніхто · меншість · близько половини · більшість · майже всі) — підписані смуги під повзунком на межах 5, 35, 65, 95 %. Вони однакові на всіх сторінках, тож не підказують відповідь жодної задачі. Для шкал не у відсотках зон немає, лише числа.
- `ticks="1,10,100"` — числа під повзунком (типово п'ять рівних кроків або межі зон); `0.1:1 мм|1 mm` дає підпис. `unit` і підписи можуть бути `uk|en`; одиниця з пробілом на початку (`" см| cm"`) стоїть окремим словом.
- Клас `mp-g-sm` — менший варіант для кількох питань поспіль (two-children).

## Статистика відповідей

Наприкінці першого раунду, коли відповідь уже відкрита, блок «Як відповідають інші» показує, скільки людей відповіло і яка частка відповіла правильно. Поки відповідей менше 30 (`POLL_MIN` у build.py), блоку немає зовсім: кілька голосів лише вводили б в оману. Ігри без правильної відповіді (`crowd`) до 30 голосів грають проти ботів і не називають кількість голосів.

- Сторінка передає відповідь відвідувача в `mpSolve(guessed)`. Рахується лише перша відповідь із браузера, і лише якщо до неї розв'язок не відкривали (`mp-voted:<slug>` у localStorage; «Сховати відповідь» його не скидає). Браузери з `?notrack=1` не голосують.
- `poll` у `meta.json` визначає, що вважати правильним: `"right"` — діапазони `[від, до]` для числа і точні рядки для решти, `"each"` — діапазон на кожну частину відповіді-масиву (ключ `a|b|c`), `"round"` — id розділу, якщо це не `guess`. Значення беруться в тих самих одиницях, що й `guessed` у скрипті сторінки.
- Бекенд — Cloudflare Worker з D1 у теці `stats/`. Він зберігає лише лічильник на трійку (задача, ключ відповіді, скільки підказок було відкрито перед відповіддю): без IP, cookies і часу. Приймає POST лише з mathparadoxes.com і localhost.
- Під вступом до обговорення є питання «Рівень «…» відповідає задачі?» з кнопками «Ні, складніше / Так / Ні, простіше». Голос іде в той самий воркер як окрема задача `<slug>-lvl` із ключем `<голос>.<рівень>` (`harder.2`, `right.2`, `easier.2`), тож у статистику відповідей він не змішується, а після зміни рівня старі голоси видно окремо. Один голос із браузера (`mp-lvote:<slug>-lvl`), назад показується лише подяка. Подивитися:
  `npx wrangler d1 execute mathparadoxes-stats --remote --command "SELECT slug, k, SUM(n) AS n FROM votes WHERE slug LIKE '%-lvl' GROUP BY slug, k ORDER BY slug, k"`
- `STATS_API` у `build.py` — адреса воркера. Порожній рядок вимикає блок. Для локальної перевірки: `python3 build.py --out /tmp/site --stats-api http://localhost:8787/`.

### Словник

Підпроєкт у теці `glossary/`: терміни з пояснень (медіана, середнє, математичне сподівання, кореляція…), пояснені через парадокси й симуляції, у дусі решти сайту.

- `glossary/terms.json` — по запису на термін: `id`, стаття `page`, і для кожної мови `name`, `forms` (усі словоформи, за якими термін шукається в тексті, для української всі відмінки), `short` (визначення одним реченням) і `hook` (маленький парадокс навколо терміна). Гачок ніколи не розкриває відповідь задачі сайту.
- `glossary/<page>/page.html` і `meta.json` — статтею: гачок у шапці, визначення, симуляція, «коли що брати», цікаві наслідки. `meta.json` має `name`, `title`, `description`, `og_alt`, `published`, `updated` і `problems` — задачі, де термін важливий (показуються з питанням, без відповіді). У сторінці `<!--PROBLEMS-->` і `<!--TERMS-->` замінюються на ці задачі й інші терміни.
- `glossary/index.html` і `index.json` — сторінка-зміст `/glossary/` з картками всіх термінів.
- На сторінках задач збірка робить першу появу кожного терміна в абзацах раундів 4 і 5 посиланням на статтю (не в посиланнях, кнопках і скриптах). Клік відкриває картку з визначенням, гачком і посиланням на статтю, а пошуковики бачать звичайне посилання. У статтях словника перша згадка інших термінів теж стає посиланням.
- «Словник →» стоїть поруч з «Усі задачі →» під блоком «Ще задачі» на кожній сторінці задачі, а також у підвалі головної, «Що почитати» і на сторінці 404.
- Статті потрапляють у sitemap.

### Мітки варіантів

Окремі латинські A, B, C у тексті сторінок (варіант B, гравці A і B) збірка обгортає в `<span class="vl">` — тонку рамку з `site.css`, щоб мітку не читали як «а» чи «в». Скрипти, формули (`.formula`, `.fx`, MathML), `sub`/`sup`, назви книжок на кшталт «A Case Study» та ініціали не чіпаються; в англійській артикль «A» на початку речення лишається як є. Кириличні мітки (кандидати А і Б, міста А і Б) треба позначати вручну: `<span class="vl">А</span>`. Текст, який пише JavaScript, рамки не отримує.

Тим самим проходом збірка склеює числа нерозривним пробілом, щоб рядок не розривався всередині числа: групи розрядів (10 000), число з одиницею (75 км, 10 $, 3 млн, 5 km), а в українській ще й пробіл перед тире, щоб рядок не починався з «—». У джерелах можна писати звичайні пробіли. Числа, які виводить JavaScript, `toLocaleString("uk-UA")` уже склеює сам.

### Курси

Підпроєкт у теці `courses/`: тематичні шляхи для певних читачів, наприклад «Парадокси A/B-тестування» для маркетологів. Курс розповідає одну історію розділами, перекладає класичні задачі мовою аудиторії в коротких інтерактивних кейсах, веде на задачі з каталогу й терміни зі словника і закінчується чеклістом. Класичну задачу не дублюють окремою сторінкою: курс адаптує її кейсом і посилається на неї.

- `courses/<name>/meta.json`: `order` (місце серед курсів: не дата додавання, а групування зі спорідненими курсами, логічна послідовність від основ до того, що на них спирається, і популярність за статистикою `open`; щоразу, як додаємо курс, переглядаємо порядок усіх), `published`, `updated`, `level`, `audience` (для кого, по мовах), `chapters` (`id`, назви, `problems` — задачі каталогу, на які веде розділ), і для кожної мови `name`, `title`, `description`, `og_alt`, `card`.
- `courses/<name>/page.html`: один `<style>`, розмітка, один `<script>`. Збірка підставляє `<!--PROBLEM:slug-->` (картка з питанням задачі й позначкою «розв'язано»), `<!--TERMS:id,id-->` (картки словника), `<!--PROGRESS-->` (скільки задач курсу розв'язано), `<!--MORE-->`, `{{P:slug}}`, `{{HOME}}`, `{{BRAND}}`, `{{COURSES}}`, `{{GLOSSARY}}`. Перша згадка терміна в абзацах розділів стає посиланням на словник. Блок `<div class="cs-after" data-after="slug">` прихований, доки задачу не розв'язано (кнопка «Показати висновок» відкриває лише його).
- Розділи курсу: `chapters` у `meta.json` мають `id`, назви, `problems`, `part` (частина курсу, складність зростає від частини до частини), `needs` (розділи, без яких цей не зрозуміти: якщо читач їх не пройшов, збірка показує під заголовком рожеву примітку з посиланнями) і `check` (`false` для розділів без питання, наприклад чеклісту).
- Кожен розділ починається з питання «спершу вгадайте» (`.cs-quiz`), відповідь позначає розділ пройденим (`mpCourseDone(id)`, `localStorage` `mp-course:<name>`). Прогрес угорі рахує пройдені розділи й розв'язані задачі з каталогу, кнопка «Почати курс спочатку» скидає його. Висновок `<div class="cs-after" data-after-ch="ch-3">` відкривається після відповіді в розділі.
- Підсторінки курсу: `courses/<name>/<sub>/page.html` + `meta.json` (`published`, `updated`, для кожної мови `name`, `title`, `description`, `og_alt`) збираються в `/courses/<name>/<sub>/`, наприклад інструмент «Перевірте свій тест» (`courses/ab-testing/check/`). Плейсхолдери ті самі, плюс `{{COURSE}}` (адреса курсу) і `{{CH:ch-N}}` (посилання на розділ); зі сторінки курсу на підсторінку веде `{{SUB:check}}`. На інший курс чи його підсторінку веде `{{C:ab-testing}}` (`{{C:ab-testing}}#ch-5`, `{{C:ab-testing/check}}`): збірка перевіряє, що такий курс є. У скрипті підсторінки `/*PUZZLES:slug,slug*/` стає JSON-списком задач каталогу (адреса, назва й питання з `share`, рівень і три підказки з `hints`), так працює «Тренажер співбесіди» (`courses/interview-puzzles/trainer/`). `{{BOOKS}}` веде на полицю книжок. Картинка для соцмереж: ключ `course-<name>--<sub>` у `tools/og.py`.
- Статистика проходження без cookies: той самий воркер рахує для задачі `course-<name>` один раз із браузера ключі `open`, `<розділ>.r` / `<розділ>.w` (перша відповідь у розділі правильна чи ні) і події сторінки (`mpCourseEvent`, наприклад `exam.5`, `plan.copy`, `share`). Де читачі відпадають, видно так:
  `npx wrangler d1 execute mathparadoxes-stats --remote --command "SELECT k, SUM(n) AS n FROM votes WHERE slug = 'course-ab-testing' GROUP BY k ORDER BY k"`
  Посилання «Продовжити з розділу N» у блоці прогресу веде до першого розділу без відповіді.
- Збірка додає блок «Курси» під списком задач на головній, сторінку `/courses/` (`courses/index.html`, `index.json`), посилання «Курси» в підвалі, плашку «Курс «…» · розділ k з N» на сторінках задач курсу, JSON-LD `Course` і записи в sitemap. Спільні стилі `.cs-*` і `.mp-course*` лежать у `site.css`.
- Картинку для соцмереж малює `tools/og.py` (ключ `course-<name>`), вона лягає в `courses/<name>/assets/`.

### Шари в 4-му раунді

Пояснення 4-го раунду можна розкласти на три шари, від простого до складного: `<div class="mp-layer" data-layer="easy">` («На пальцях»: картинки, аналогії, маленькі числа), `strict` («Строго»: таблиці, графіки, формули), `deep` («Глибше»: узагальнення, теорія, історія), саме в такому порядку, кожен зі своїм `<div class="why-grid">` усередині. Усі шари видно одразу; заголовки, кнопку «Сховати на всіх задачах» і рядок «Шар … приховано · Показати» додає збірка. Приховані шари пам'ятаються в `mp-layers-hidden` для всіх сторінок, а кожне «сховати» і «показати» рахує той самий воркер як задачу `<slug>-layer` з ключем `hide.<шар>` або `show.<шар>`:
  `npx wrangler d1 execute mathparadoxes-stats --remote --command "SELECT slug, k, SUM(n) AS n FROM votes WHERE slug LIKE '%-layer' GROUP BY slug, k ORDER BY slug, k"`
Шари є на всіх сторінках; «Глибше» лише там, де для нього є змістовні картки.

### Код симуляції для розробників

Якщо в папці задачі є `sim.js` і `sim.py` (лише парою), збірка додає в кінець 3-го раунду (`id="sim"`) згорнутий блок «Перевірте самі в коді» з обома файлами й кнопками «Копіювати». Код короткий, без бібліотек: JavaScript для консолі браузера чи Node, Python лише зі стандартною бібліотекою; він повторює симуляцію сторінки й друкує результат поряд із точним значенням. Коментарі й надруковані слова пишуться як `⟨українською|англійською⟩`, збірка лишає одну мову. Блок має `sp-after`, бо код друкує відповідь; до відповіді на його місці один рядок, що код з'явиться. Числа, які друкує код, перевіряються так само, як математика задачі: запустіть обидві мовні версії в node і python. Відкриття блоку й копіювання рахує воркер як задачу `mp-code` з ключами `<slug>.open`, `<slug>.copy.js`, `<slug>.copy.py`:
  `npx wrangler d1 execute mathparadoxes-stats --remote --command "SELECT k, SUM(n) AS n FROM votes WHERE slug = 'mp-code' GROUP BY k ORDER BY k"`
Зараз код є в задачах про 100 в'язнів, німецькі танки й парадокс автобуса.

Розгортання (одноразово, потрібен акаунт Cloudflare):

```
cd stats
npx wrangler login
npx wrangler d1 create mathparadoxes-stats      # вставте database_id у wrangler.toml
npx wrangler d1 execute mathparadoxes-stats --remote --file schema.sql
npx wrangler deploy                             # друкує адресу *.workers.dev
```

Потім впишіть адресу в `STATS_API`, запустіть `python3 build.py` і закомітьте `docs/`. Цифри для поста можна взяти так: `npx wrangler d1 execute mathparadoxes-stats --remote --command "SELECT slug, SUM(n) FROM votes GROUP BY slug"`, а розбивку за підказками — `... --command "SELECT slug, h, SUM(n) FROM votes GROUP BY slug, h"` (частку правильних рахує правило `poll` з `meta.json`).

## Обговорення (giscus)

На кожній сторінці задачі перед розсилкою є блок «Обговорення» на [giscus](https://giscus.app):
коментарі зберігаються в GitHub Discussions цього репозиторію, категорія Announcements
(нові теми створює лише giscus). Одна тема на задачу, спільна для обох мов (`data-term` = slug).
Налаштування — `GISCUS` і `DISCUSS_TEXT` у `build.py`; `giscus.json` дозволяє вбудовування лише
на mathparadoxes.com, dmitrykudrenko.github.io і localhost. Модерація — у вкладці Discussions на GitHub.

## Що почитати

Під фактами кожної задачі збірка ставить блок «Що почитати» (перед «Ще задачі»). Книжки описані
один раз у `books.json`; у `meta.json` задачі — `"books": [{"id": "kahneman-tfs", "ch": 17}]`
(або `"where": {"uk": "с. 29", "en": "p. 29"}` замість `ch`). Українська сторінка показує український
переклад, якщо є поле `ua`, і ставить такі книжки першими. Лише номери розділів, без назв (спойлери).
До блоку потрапляє книжка, лише якщо джерело (зміст, пошук у тексті, рецензія) показує, що задача там є;
нотатки перевірки — поза репозиторієм. Ті самі книжки йдуть у JSON-LD як `citation`.
Сторінка-полиця `/books/` (`pages/books/`) збирається з того самого `books.json`: кожна книжка з
задачами й розділами; українською — спершу книжки з перекладом. Книжка, на яку не посилається жодна
задача, зупиняє збірку. Посилання на полицю — у блоці «Що почитати» і в підвалі головної.

## Розсилка (Claspo)

Перед футером кожної сторінки є блок «Розсилка» з порожнім контейнером `#mp-subscribe`.
Форму підписки робимо в Claspo як Inline-віджет і розміщуємо всередині `#mp-subscribe`.
Блок видно завжди; поки Claspo не вставив форму, у контейнері стоїть примітка «Форма підписки
з'явиться тут найближчим часом», яка зникає сама, щойно форма з'являється. Якщо скрипт Claspo
заблоковано (наприклад, розширенням браузера) або форма не з'явилась за 10 секунд (правила показу
Claspo пропустили цього відвідувача), блок ховається повністю.
Тексти блоку — `SUBSCRIBE_TEXT` у `build.py`.

## SEO

- Окрема URL-адреса для кожної мови, у сторінці лише її текст; `hreflang` (uk, en, x-default) і `canonical`.
- Title, description, H1 з ключовою фразою; Open Graph і Twitter Card з картинкою 1200×630.
- JSON-LD: `WebPage` + `LearningResource`, `FAQPage`, `BreadcrumbList`; на головній `WebSite` + `CollectionPage` з `ItemList` задач.
- Головна містить унікальний текст про кожну задачу, H2 з її назвою і описові посилання на сторінку задачі.
- Внутрішні посилання: блок «Ще задачі» під кожною задачею має 6 карток, підібраних за спільними темами (`topics`),
  тегами картки й рівнем. На кожну задачу ведуть щонайменше 3 і зазвичай не більше 8–9 таких блоків, щоб жодна сторінка не лишилася без посилань.
- `sitemap.xml` з альтернативними мовами.
- RSS задач для розсилок і читалок: https://mathparadoxes.com/feed.xml (uk) і https://mathparadoxes.com/en/feed.xml, нові зверху за `published`.
  У пункті лише `share` (назва й питання), OG-картинка й теги картки, без відповіді. Сторінки посилаються на фід через `<link rel="alternate">`.
- Мова: обраний вручну мовний варіант зберігається в cookie `mp_lang` на рік. Без cookie перша мова браузера
  uk/ru/be дає українську, en — англійську, інакше вирішує часовий пояс. Боти й прев'ю-краулери не перенаправляються.
- Відео YouTube вантажиться лише після кліку по обкладинці (швидке перше завантаження).

Після публікації: додати сайт у Google Search Console і надіслати `https://mathparadoxes.com/sitemap.xml`.
`robots.txt` на GitHub Pages для project-сайту не діє (його читають лише з кореня домену), тому sitemap варто надіслати вручну.
