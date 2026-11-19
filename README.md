# PSOrvia Klangvergleich

**Hear and see the difference between two sounds – for your website**

PSOrvia · [psorvia.io](https://psorvia.io)

### ▶ [Live demo](https://h-peterseim.github.io/psorvia-klangvergleich/)

Two versions of a sound play in sync and you switch between them without a click. The spectrum is drawn as areas, what changed is marked, the curve morphs with the switch, and while playing the real spectrum moves over it. Plain JavaScript and CSS without dependencies.

Translations: [de](docs/i18n/README.de.md) · [bg](docs/i18n/README.bg.md) · [cs](docs/i18n/README.cs.md) · [da](docs/i18n/README.da.md) · [el](docs/i18n/README.el.md) · [es](docs/i18n/README.es.md) · [et](docs/i18n/README.et.md) · [fi](docs/i18n/README.fi.md) · [fr](docs/i18n/README.fr.md) · [ga](docs/i18n/README.ga.md) · [hr](docs/i18n/README.hr.md) · [hu](docs/i18n/README.hu.md) · [id](docs/i18n/README.id.md) · [it](docs/i18n/README.it.md) · [lt](docs/i18n/README.lt.md) · [lv](docs/i18n/README.lv.md) · [mt](docs/i18n/README.mt.md) · [nb](docs/i18n/README.nb.md) · [nl](docs/i18n/README.nl.md) · [pl](docs/i18n/README.pl.md) · [pt](docs/i18n/README.pt.md) · [pt-BR](docs/i18n/README.pt-BR.md) · [ro](docs/i18n/README.ro.md) · [sk](docs/i18n/README.sk.md) · [sl](docs/i18n/README.sl.md) · [sv](docs/i18n/README.sv.md) · [tr](docs/i18n/README.tr.md) · [uk](docs/i18n/README.uk.md)

## Usage

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

`tools/vorrechner.py before.wav after.wav --gipfel 5 --png media/x --out data.json` computes the curves, peak labels, band summary and spectrograms in advance (Python 3, numpy, Pillow, ffmpeg).

Buttons with aria-pressed, live status, a text summary of the change, keyboard use, light and dark, reduced motion (no morph, no live line), no inline scripts, text at 13 px or more.

MIT License · Petit Souris · [psorvia.io](https://psorvia.io)
