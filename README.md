# mathproblems

Інтерактивні пояснення математичних задач, у яких інтуїція помиляється. Українською та англійською.

Сайт: https://dmitrykudrenko.github.io/mathproblems/

| Задача | UA | EN |
|---|---|---|
| Парадокс днів народження | [/birthday/](https://dmitrykudrenko.github.io/mathproblems/birthday/) | [/birthday/en/](https://dmitrykudrenko.github.io/mathproblems/birthday/en/) |
| Парадокс Монті Голла | [/monty-hall/](https://dmitrykudrenko.github.io/mathproblems/monty-hall/) | [/monty-hall/en/](https://dmitrykudrenko.github.io/mathproblems/monty-hall/en/) |

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
build.py       збирає сайт у docs/
docs/          готовий сайт (GitHub Pages публікує з main:/docs)
```

## Збірка

```bash
python3 build.py
```

Без залежностей, потрібен лише Python 3. Для іншого домену: `python3 build.py --base-url https://example.com/`.
Після змін у `problems/` перезберіть сайт і закомітьте `docs/` разом з ними.

## Нова задача

1. Створіть `problems/<slug>/` з `page.html`, `teaser.html` і `meta.json` (поле `order` задає місце на головній).
2. Додайте тексти задачі в `tools/og.py` і запустіть `python3 tools/og.py`.
3. `python3 build.py` додасть сторінки, тизер на головну і записи в sitemap.

## SEO

- Окрема URL-адреса для кожної мови, у сторінці лише її текст; `hreflang` (uk, en, x-default) і `canonical`.
- Title, description, H1 з ключовою фразою; Open Graph і Twitter Card з картинкою 1200×630.
- JSON-LD: `WebPage` + `LearningResource`, `FAQPage`, `BreadcrumbList`; на головній `WebSite` + `CollectionPage` з `ItemList` задач.
- Головна містить унікальний текст про кожну задачу, H2 з її назвою і описові посилання на сторінку задачі.
- `sitemap.xml` з альтернативними мовами.
- Мова: обраний вручну мовний варіант зберігається в cookie `mp_lang` на рік. Без cookie перша мова браузера
  uk/ru/be дає українську, en — англійську, інакше вирішує часовий пояс. Боти й прев'ю-краулери не перенаправляються.
- Відео YouTube вантажиться лише після кліку по обкладинці (швидке перше завантаження).

Після публікації: додати сайт у Google Search Console і надіслати `https://dmitrykudrenko.github.io/mathproblems/sitemap.xml`.
`robots.txt` на GitHub Pages для project-сайту не діє (його читають лише з кореня домену), тому sitemap варто надіслати вручну.
