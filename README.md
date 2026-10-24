# mathproblems

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
  meta.json    order, published, updated, topics, about (Wikipedia); title, description, FAQ, картка — для кожної мови
  assets/      og-uk.png, og-en.png (1200×630)
books.json     книжки для блоку «Що почитати» (автор uk/en, назва, рік, ISBN, українське видання)
site.css       спільний вигляд усіх сторінок (підключається після стилів сторінки)
tools/og.py    малює картинки для соцмереж (macOS: qlmanage + sips)
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

## Нова задача

1. Створіть `problems/<slug>/` з `page.html`, `teaser.html` і `meta.json` (поле `order` задає місце на головній, `published` і `updated` — дати у форматі `YYYY-MM-DD`, `topics` — теми для фільтрів на головній: один чи кілька ключів із `TOPICS` у build.py: interview, conditional, chance, stats, games, quick).
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
- `sitemap.xml` з альтернативними мовами.
- RSS задач для розсилок і читалок: https://mathparadoxes.com/feed.xml (uk) і https://mathparadoxes.com/en/feed.xml, нові зверху за `published`.
  У пункті лише `share` (назва й питання), OG-картинка й теги картки, без відповіді. Сторінки посилаються на фід через `<link rel="alternate">`.
- Мова: обраний вручну мовний варіант зберігається в cookie `mp_lang` на рік. Без cookie перша мова браузера
  uk/ru/be дає українську, en — англійську, інакше вирішує часовий пояс. Боти й прев'ю-краулери не перенаправляються.
- Відео YouTube вантажиться лише після кліку по обкладинці (швидке перше завантаження).

Після публікації: додати сайт у Google Search Console і надіслати `https://mathparadoxes.com/sitemap.xml`.
`robots.txt` на GitHub Pages для project-сайту не діє (його читають лише з кореня домену), тому sitemap варто надіслати вручну.
