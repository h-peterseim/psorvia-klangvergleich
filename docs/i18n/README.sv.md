[English](../../README.md)

# PSOrvia Klangvergleich

**Hör och se skillnaden mellan två ljud – för din webbplats**

PSOrvia · [psorvia.io](https://psorvia.io)

### ▶ [Livedemo](https://h-peterseim.github.io/psorvia-klangvergleich/)

Två versioner av ett ljud spelas synkront och du växlar mellan dem utan klick. Spektrumet ritas som ytor, det som ändrats är markerat, kurvan morfar vid växlingen och under uppspelning rör sig det verkliga spektrumet över den. Ren JavaScript och CSS utan beroenden.

## Användning

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

Valfria extra vyer, väljs med alternativet `views` (standard: bara spektrum): `wipe` (en avdelare över två spektrogram), `diff` (tillagd och borttagen energi), `level` (nivå över tid med uppspelningsposition), `stereo` (punktmoln med korrelation) och `glow` (live-spektrum med mjuk efterglöd). De ritas i canvas med enhetens fulla upplösning; med `--ansichten` räknar `tools/vorrechner.py` ut deras data i förväg.

Fler vyer och verktyg: `waterfall` (ett tredimensionellt landskap av spektrumet över tid) och `radial` (pulserande ringar; med `hero: true` visas den ensam och utan kontroller som blickfång). Ett övertoningsreglage blandar ljud och bild steglöst från före till efter, även under uppspelning. Hovring eller fokus på ett band i sammanfattningen framhäver det i grafiken; ett förstoringsglas visar frekvens, nivå och tid; ett klick i spektrogrammet, vattenfallet eller nivån hoppar dit och spelar upp. Animationer pausas när elementet inte syns eller fliken är dold och förblir lugna vid reducerad rörelse.

`tools/vorrechner.py before.wav after.wav --gipfel 5 --png media/x --out data.json` beräknar kurvor, toppetiketter, bandsammanfattning och spektrogram i förväg (Python 3, numpy, Pillow, ffmpeg).

Knappar med aria-pressed, livestatus, textsammanfattning av ändringen, tangentbordsstyrning, ljust och mörkt, minskad rörelse (ingen morfning, ingen livelinje), inga inbäddade skript, text från 13 px.

MIT License · Petit Souris · [psorvia.io](https://psorvia.io)
