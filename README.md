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

## Структура

```
hub/
  page.html    головна (обидві мови); у <!--PROBLEMS--> збірка вставляє тизери задач
  meta.json    SEO головної
  assets/      og-uk.png, og-en.png
problems/<slug>/
  page.html    сторінка задачі; обидві мови поруч (class="uk" / class="en")
  teaser.html  блок задачі на головній: умова, «інтуїція / насправді», міні-гра
  meta.json    order, about (Wikipedia), title, description, FAQ, картка — для кожної мови
  assets/      og-uk.png, og-en.png (1200×630)
site.css       спільний вигляд усіх сторінок (підключається після стилів сторінки)
tools/og.py    малює картинки для соцмереж (macOS: qlmanage + sips)
brand/         логотип: mark.svg (знак), lockup-uk/en(-dark).svg; favicon.svg у корені — той самий знак
build.py       збирає сайт у docs/
docs/          готовий сайт (GitHub Pages публікує з main:/docs)
```

## Збірка

```bash
python3 build.py
```

Без залежностей, потрібен лише Python 3. Сайт живе на https://mathparadoxes.com (файл `docs/CNAME` пише збірка).
Для іншого домену: `python3 build.py --base-url https://example.com/`.
Після змін у `problems/` перезберіть сайт і закомітьте `docs/` разом з ними.

## Нова задача

1. Створіть `problems/<slug>/` з `page.html`, `teaser.html` і `meta.json` (поле `order` задає місце на головній).
2. Додайте тексти задачі в `tools/og.py` і запустіть `python3 tools/og.py`.
3. `python3 build.py` додасть сторінки, тизер на головну і записи в sitemap.

## Без спойлерів

Відповідь не видно, доки відвідувач не відповів сам або не попросив її показати.

- `class="sp-before"` видно лише до відповіді, `class="sp-after"` лише після. Сторінка задачі має `<html data-spoil>`, картка на головній `<article data-spoil>`.
- Елемент з атрибутом `data-solve` відкриває відповідь кліком. У скрипті сторінки `mpSolve()` позначає задачу розв'язаною (подія `solved` на `document`), `mpSolved()` перевіряє стан. Вибір запам'ятовується в localStorage, тож картка і сторінка відкриваються разом.
- Перший екран сторінки містить лише умову й питання, відповідь показує перший раунд з вгадуванням. Міні-гра на картці нічого не показує до першого кліку.
- `share` у `meta.json` (назва й питання) іде в og:/twitter:-теги, щоб превʼю посилання не видавало відповідь. `<title>` і description лишаються з відповіддю для пошуку. OG-картинки (`tools/og.py`) теж без відповідей.

## Обговорення (giscus)

На кожній сторінці задачі перед розсилкою є блок «Обговорення» на [giscus](https://giscus.app):
коментарі зберігаються в GitHub Discussions цього репозиторію, категорія Announcements
(нові теми створює лише giscus). Одна тема на задачу, спільна для обох мов (`data-term` = slug).
Налаштування — `GISCUS` і `DISCUSS_TEXT` у `build.py`; `giscus.json` дозволяє вбудовування лише
на mathparadoxes.com, dmitrykudrenko.github.io і localhost. Модерація — у вкладці Discussions на GitHub.

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
- Мова: обраний вручну мовний варіант зберігається в cookie `mp_lang` на рік. Без cookie перша мова браузера
  uk/ru/be дає українську, en — англійську, інакше вирішує часовий пояс. Боти й прев'ю-краулери не перенаправляються.
- Відео YouTube вантажиться лише після кліку по обкладинці (швидке перше завантаження).

Після публікації: додати сайт у Google Search Console і надіслати `https://mathparadoxes.com/sitemap.xml`.
`robots.txt` на GitHub Pages для project-сайту не діє (його читають лише з кореня домену), тому sitemap варто надіслати вручну.
