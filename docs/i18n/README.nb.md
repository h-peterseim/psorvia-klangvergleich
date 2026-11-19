[English](../../README.md)

# PSOrvia Klangvergleich

**Hør og se forskjellen mellom to lyder – for nettstedet ditt**

PSOrvia · [psorvia.io](https://psorvia.io)

### ▶ [Live-demo](https://h-peterseim.github.io/psorvia-klangvergleich/)

To versjoner av en lyd spilles synkront, og du bytter mellom dem uten klikk. Spekteret tegnes som flater, det som er endret er markert, kurven morfer ved byttet, og under avspilling beveger det ekte spekteret seg over. Ren JavaScript og CSS uten avhengigheter.

## Bruk

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

Valgfrie ekstra visninger, velges med alternativet `views` (standard: bare spekter): `wipe` (en skillelinje over to spektrogrammer), `diff` (tilført og fjernet energi), `level` (nivå over tid med avspillingsposisjon), `stereo` (punktskyer med korrelasjon) og `glow` (live-spekter med myk etterglød). De tegnes i canvas i enhetens full oppløsning; med `--ansichten` beregner `tools/vorrechner.py` dataene på forhånd.

Flere visninger og verktøy: `waterfall` (et tredimensjonalt landskap av spekteret over tid) og `radial` (pulserende ringer; med `hero: true` vises den alene og uten kontroller som blikkfang). En kryssfade-skyver blander lyd og bilde trinnløst fra før til etter, også under avspilling. Hover eller fokus på et bånd i sammendraget fremhever det i grafikken; et forstørrelsesglass viser frekvens, nivå og tid; et klikk i spektrogrammet, fossen eller nivået hopper dit og spiller av. Animasjoner pauser når elementet ikke er synlig eller fanen er skjult, og forblir rolige ved redusert bevegelse.

`tools/vorrechner.py before.wav after.wav --gipfel 5 --png media/x --out data.json` beregner kurver, toppetiketter, båndoppsummering og spektrogrammer på forhånd (Python 3, numpy, Pillow, ffmpeg).

Knapper med aria-pressed, live-status, tekstoppsummering av endringen, tastaturbruk, lys og mørk, redusert bevegelse (ingen morfing, ingen live-linje), ingen innebygde skript, tekst fra 13 px.

MIT License · Petit Souris · [psorvia.io](https://psorvia.io)
