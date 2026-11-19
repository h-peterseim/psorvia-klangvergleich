[English](../../README.md)

# PSOrvia Klangvergleich

**Чуйте и виждайте разликата между два звука – за вашия уебсайт**

PSOrvia · [psorvia.io](https://psorvia.io)

### ▶ [Демо на живо](https://h-peterseim.github.io/psorvia-klangvergleich/)

Две версии на един звук се възпроизвеждат синхронно и се превключват без щракване. Спектърът е нарисуван като площи, промененото е маркирано, кривата преминава плавно при превключване, а при възпроизвеждане истинският спектър се движи отгоре. Чист JavaScript и CSS без зависимости.

## Употреба

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

`tools/vorrechner.py before.wav after.wav --gipfel 5 --png media/x --out data.json` изчислява предварително кривите, етикетите на пиковете, обобщението по ленти и спектрограмите (Python 3, numpy, Pillow, ffmpeg).

Бутони с aria-pressed, жив статус, текстово резюме на промяната, работа с клавиатура, светла и тъмна тема, намалено движение (без морфиране и жива линия), без вграден скрипт, текст от 13 px.

MIT License · Petit Souris · [psorvia.io](https://psorvia.io)
