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
  data: /* JSON from tools/vorrechner.py */ {},
  views: ['spectrum', 'wipe', 'diff', 'level', 'stereo', 'waterfall', 'glow', 'radial'] // optional; hero: true shows only the rings
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

Optionele extra weergaven, te kiezen met de optie `views` (standaard: alleen spectrum): `wipe` (een scheidingslijn over twee spectrogrammen), `diff` (toegevoegde en verdwenen energie), `level` (niveau over de tijd met de afspeelpositie), `stereo` (puntenwolken met correlatie) en `glow` (live spectrum met zachte nagloed). Ze worden in canvas getekend op de volledige resolutie van het apparaat; met `--ansichten` berekent `tools/vorrechner.py` hun gegevens vooraf.

Meer weergaven en hulpmiddelen: `waterfall` (een driedimensionaal landschap van het spectrum over de tijd) en `radial` (pulserende ringen; met `hero: true` los en zonder bediening als blikvanger). Een overvloeiregelaar mengt geluid en beeld traploos van voor naar na, ook tijdens het afspelen. Zweven of focus op een band in de samenvatting markeert die in de grafiek; een vergrootglas toont frequentie, niveau en tijd; een klik in het spectrogram, de waterval of het niveau springt daarheen en speelt af. Animaties pauzeren als het element niet in beeld is of het tabblad verborgen is en blijven rustig bij verminderde beweging.

`tools/vorrechner.py before.wav after.wav --gipfel 5 --png media/x --out data.json` berekent curven, pieketiketten, bandsamenvatting en spectrogrammen vooraf (Python 3, numpy, Pillow, ffmpeg).

Knoppen met aria-pressed, live status, tekstsamenvatting van de wijziging, toetsenbordbediening, licht en donker, beperkte beweging (geen morph, geen live lijn), geen inline scripts, tekst vanaf 13 px.

MIT License · Petit Souris · [psorvia.io](https://psorvia.io)
