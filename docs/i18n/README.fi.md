[English](../../README.md)

# PSOrvia Klangvergleich

**Kuule ja näe ero kahden äänen välillä – verkkosivullesi**

PSOrvia · [psorvia.io](https://psorvia.io)

### ▶ [Live-demo](https://h-peterseim.github.io/psorvia-klangvergleich/)

Äänen kaksi versiota soivat synkronoituna, ja niiden välillä vaihdetaan ilman napsautusta. Spektri piirretään alueina, muutos merkitään, käyrä muuntuu vaihdettaessa ja toiston aikana oikea spektri liikkuu sen päällä. Puhdasta JavaScriptiä ja CSS:ää ilman riippuvuuksia.

## Käyttö

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

`tools/vorrechner.py before.wav after.wav --gipfel 5 --png media/x --out data.json` laskee käyrät, huippujen tunnisteet, kaistayhteenvedon ja spektrogrammit etukäteen (Python 3, numpy, Pillow, ffmpeg).

Painikkeet aria-pressed-tilalla, live-tila, muutoksen tekstiyhteenveto, näppäimistökäyttö, vaalea ja tumma, vähennetty liike (ei muunnosta eikä live-viivaa), ei sisäisiä skriptejä, teksti vähintään 13 px.

MIT License · Petit Souris · [psorvia.io](https://psorvia.io)
