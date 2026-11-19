[English](../../README.md)

# PSOrvia Klangvergleich

**Auzi și vezi diferența dintre două sunete – pentru site-ul tău**

PSOrvia · [psorvia.io](https://psorvia.io)

### ▶ [Demo live](https://h-peterseim.github.io/psorvia-klangvergleich/)

Două versiuni ale unui sunet rulează sincronizat, iar între ele se trece fără clic. Spectrul este desenat ca suprafețe, ce s-a schimbat este marcat, curba se transformă la comutare, iar în timpul redării spectrul real se mișcă deasupra. JavaScript și CSS pur, fără dependențe.

## Utilizare

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

`tools/vorrechner.py before.wav after.wav --gipfel 5 --png media/x --out data.json` calculează în avans curbele, etichetele vârfurilor, rezumatul pe benzi și spectrogramele (Python 3, numpy, Pillow, ffmpeg).

Butoane cu aria-pressed, stare live, rezumat text al schimbării, utilizare cu tastatura, luminos și întunecat, mișcare redusă (fără transformare și linie live), fără scripturi inline, text de la 13 px.

MIT License · Petit Souris · [psorvia.io](https://psorvia.io)
