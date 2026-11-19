[English](../../README.md)

# PSOrvia Klangvergleich

**Kuule ja näe erinevust kahe heli vahel – oma veebilehele**

PSOrvia · [psorvia.io](https://psorvia.io)

### ▶ [Live-demo](https://h-peterseim.github.io/psorvia-klangvergleich/)

Heli kaks versiooni mängivad sünkroonis ja vahetuvad ilma klõpsuta. Spekter joonistatakse pindadena, muutus on märgitud, kõver muutub sujuvalt ümberlülitamisel ja esitamise ajal liigub selle kohal tegelik spekter. Puhas JavaScript ja CSS ilma sõltuvusteta.

## Kasutus

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

`tools/vorrechner.py before.wav after.wav --gipfel 5 --png media/x --out data.json` arvutab kõverad, tippude sildid, ribakokkuvõtte ja spektrogrammid ette (Python 3, numpy, Pillow, ffmpeg).

Nupud aria-pressed-iga, reaalajas olek, muutuse tekstiline kokkuvõte, klaviatuurikasutus, hele ja tume, vähendatud liikumine (ilma morfita ja reaalajajooneta), ilma sisseehitatud skriptideta, tekst alates 13 px.

MIT License · Petit Souris · [psorvia.io](https://psorvia.io)
