[English](../../README.md)

# PSOrvia Klangvergleich

**Čujte i vidite razliku između dva zvuka – za vašu web-stranicu**

PSOrvia · [psorvia.io](https://psorvia.io)

### ▶ [Demo uživo](https://h-peterseim.github.io/psorvia-klangvergleich/)

Dvije verzije zvuka sviraju sinkronizirano, a među njima se prebacuje bez klika. Spektar je nacrtan kao površine, promjena je označena, krivulja se pri prebacivanju glatko preobražava, a tijekom reprodukcije stvarni spektar kreće se iznad nje. Čisti JavaScript i CSS bez ovisnosti.

## Uporaba

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

`tools/vorrechner.py before.wav after.wav --gipfel 5 --png media/x --out data.json` unaprijed izračunava krivulje, oznake vrhova, sažetak po pojasevima i spektrograme (Python 3, numpy, Pillow, ffmpeg).

Gumbi s aria-pressed, status uživo, tekstualni sažetak promjene, upravljanje tipkovnicom, svijetla i tamna tema, smanjeno kretanje (bez preobrazbe i žive linije), bez ugrađenih skripti, tekst od 13 px.

MIT License · Petit Souris · [psorvia.io](https://psorvia.io)
