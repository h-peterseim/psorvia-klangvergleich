[English](../../README.md)

# PSOrvia Klangvergleich

**Чуйте й бачте різницю між двома звуками – для вашого вебсайту**

PSOrvia · [psorvia.io](https://psorvia.io)

### ▶ [Демо наживо](https://h-peterseim.github.io/psorvia-klangvergleich/)

Дві версії звуку відтворюються синхронно, а перемикаються без клацання. Спектр намальовано як площі, зміну позначено, крива плавно перетворюється під час перемикання, а під час відтворення над нею рухається справжній спектр. Чистий JavaScript і CSS без залежностей.

## Використання

```html
<link rel="stylesheet" href="klangvergleich.css">
<script src="klangvergleich.js"></script>
<script src="klangvergleich.i18n.js"></script> <!-- 28 languages besides English -->
<div id="kv">
  <audio controls src="before.m4a"></audio> <audio controls src="after.m4a"></audio> <!-- fallback -->
</div>
<script>
PsoKlangvergleich.create(document.getElementById('kv'), {
  lang: 'en',
  before: { src: 'before.m4a', label: 'Before' }, after: { src: 'after.m4a', label: 'After' },
  data: /* JSON from tools/vorrechner.py */ {}
});
</script>
```

```html
<script type="module">
import { create, auto } from './klangvergleich.esm.js';
import './klangvergleich.i18n.esm.js';
auto(); // every [data-klangvergleich] element, options as JSON in the attribute or in an inner <script type="application/json">
</script>
```

`tools/vorrechner.py before.wav after.wav --gipfel 5 --png media/x --out data.json` заздалегідь обчислює криві, підписи піків, підсумок за смугами та спектрограми (Python 3, numpy, Pillow, ffmpeg).

Кнопки з aria-pressed, живий статус, текстовий підсумок зміни, керування клавіатурою, світла й темна тема, зменшений рух (без перетворення й живої лінії), без вбудованих скриптів, текст від 13 px.

MIT License · Petit Souris · [psorvia.io](https://psorvia.io)
