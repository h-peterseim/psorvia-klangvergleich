[English](../../README.md)

# PSOrvia Klangvergleich

**Hoor en zie het verschil tussen twee geluiden – voor je website**

PSOrvia · [psorvia.io](https://psorvia.io)

### ▶ [Live demo](https://h-peterseim.github.io/psorvia-klangvergleich/)

Twee versies van een geluid spelen synchroon en je schakelt zonder klik tussen beide. Het spectrum wordt als vlakken getekend, wat is veranderd is gemarkeerd, de curve morpht bij het omschakelen en tijdens het afspelen beweegt het echte spectrum erover. Puur JavaScript en CSS zonder afhankelijkheden.

## Gebruik

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

`tools/vorrechner.py before.wav after.wav --gipfel 5 --png media/x --out data.json` berekent curven, pieketiketten, bandsamenvatting en spectrogrammen vooraf (Python 3, numpy, Pillow, ffmpeg).

Knoppen met aria-pressed, live status, tekstsamenvatting van de wijziging, toetsenbordbediening, licht en donker, beperkte beweging (geen morph, geen live lijn), geen inline scripts, tekst vanaf 13 px.

MIT License · Petit Souris · [psorvia.io](https://psorvia.io)
