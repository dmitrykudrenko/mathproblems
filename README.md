# mathproblems

Інтерактивні пояснення математичних задач, у яких інтуїція помиляється. Українською та англійською.

Сайт: https://dmitrykudrenko.github.io/mathproblems/

| Задача | UA | EN |
|---|---|---|
| Парадокс днів народження | [/birthday/](https://dmitrykudrenko.github.io/mathproblems/birthday/) | [/birthday/en/](https://dmitrykudrenko.github.io/mathproblems/birthday/en/) |
| Парадокс Монті Голла | [/monty-hall/](https://dmitrykudrenko.github.io/mathproblems/monty-hall/) | [/monty-hall/en/](https://dmitrykudrenko.github.io/mathproblems/monty-hall/en/) |

## Структура

```
problems/<slug>/
  page.html    сторінка задачі; обидві мови поруч (class="uk" / class="en")
  meta.json    SEO: about (Wikipedia), title, description, FAQ, картка для каталогу — для кожної мови
  assets/      og-uk.png, og-en.png (1200×630) та інші файли
build.py       збирає сайт у docs/
docs/          готовий сайт (GitHub Pages публікує з main:/docs)
favicon.svg
```

## Збірка

```bash
python3 build.py
```

Без залежностей, потрібен лише Python 3. Для іншого домену: `python3 build.py --base-url https://example.com/`.
Після змін у `problems/` перезберіть сайт і закомітьте `docs/` разом з ними.

## Нова задача

1. Створіть `problems/<slug>/` з `page.html`, `meta.json` і `assets/og-*.png`.
2. `python3 build.py` додасть її сторінки, картку в каталог і запис у sitemap.

## SEO

- Окрема URL-адреса для кожної мови, у сторінці лише її текст; `hreflang` (uk, en, x-default) і `canonical`.
- Title, description, H1 з ключовою фразою; Open Graph і Twitter Card з картинкою 1200×630.
- JSON-LD: `WebPage` + `LearningResource`, `FAQPage`, `BreadcrumbList`; на головній `CollectionPage`.
- `sitemap.xml` з альтернативними мовами.
- Мова: обраний вручну мовний варіант зберігається в cookie `mp_lang` на рік. Без cookie перша мова браузера
  uk/ru/be дає українську, en — англійську, інакше вирішує часовий пояс. Боти й прев'ю-краулери не перенаправляються.
- Відео YouTube вантажиться лише після кліку по обкладинці (швидке перше завантаження).

Після публікації: додати сайт у Google Search Console і надіслати `https://dmitrykudrenko.github.io/mathproblems/sitemap.xml`.
`robots.txt` на GitHub Pages для project-сайту не діє (його читають лише з кореня домену), тому sitemap варто надіслати вручну.
