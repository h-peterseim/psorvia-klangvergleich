[English](../../README.md)

# PSOrvia Klangvergleich

**Išgirskite ir pamatykite skirtumą tarp dviejų garsų – savo svetainei**

PSOrvia · [psorvia.io](https://psorvia.io)

### ▶ [Gyva demonstracija](https://h-peterseim.github.io/psorvia-klangvergleich/)

Dvi garso versijos groja sinchroniškai, o tarp jų perjungiama be spustelėjimo. Spektras nupieštas kaip plotai, pokytis pažymėtas, kreivė perjungiant sklandžiai keičiasi, o grojant virš jos juda tikrasis spektras. Gryni JavaScript ir CSS be priklausomybių.

## Naudojimas

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

`tools/vorrechner.py before.wav after.wav --gipfel 5 --png media/x --out data.json` iš anksto apskaičiuoja kreives, viršūnių žymes, juostų santrauką ir spektrogramas (Python 3, numpy, Pillow, ffmpeg).

Mygtukai su aria-pressed, gyva būsena, teksto santrauka apie pokytį, valdymas klaviatūra, šviesi ir tamsi tema, sumažintas judesys (be morfinimo ir gyvos linijos), be įterptų skriptų, tekstas nuo 13 px.

MIT License · Petit Souris · [psorvia.io](https://psorvia.io)
