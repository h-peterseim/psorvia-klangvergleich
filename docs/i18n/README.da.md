[English](../../README.md)

# PSOrvia Klangvergleich

**Hør og se forskellen mellem to lyde – til din hjemmeside**

PSOrvia · [psorvia.io](https://psorvia.io)

### ▶ [Live-demo](https://h-peterseim.github.io/psorvia-klangvergleich/)

To versioner af en lyd afspilles synkront, og du skifter mellem dem uden et klik. Spektret tegnes som flader, det ændrede er markeret, kurven morfer ved skiftet, og under afspilning bevæger det rigtige spektrum sig henover. Ren JavaScript og CSS uden afhængigheder.

## Brug

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

Valgfrie ekstra visninger, vælges med indstillingen `views` (standard: kun spektrum): `wipe` (en skillelinje over to spektrogrammer), `diff` (tilføjet og fjernet energi), `level` (niveau over tid med afspilningsposition), `stereo` (punktskyer med korrelation) og `glow` (live-spektrum med blød efterglød). De tegnes i canvas i enhedens fulde opløsning; med `--ansichten` beregner `tools/vorrechner.py` deres data på forhånd.

Flere visninger og værktøjer: `waterfall` (et tredimensionelt landskab af spektret over tid) og `radial` (pulserende ringe; med `hero: true` vises den alene og uden betjening som blikfang). En overtoningsskyder blander lyd og billede trinløst fra før til efter, også under afspilning. Hover eller fokus på et bånd i sammenfatningen fremhæver det i grafikken; et forstørrelsesglas viser frekvens, niveau og tid; et klik i spektrogrammet, vandfaldet eller niveauet hopper dertil og afspiller. Animationer holder pause, når elementet er uden for syne eller fanen er skjult, og forbliver rolige ved reduceret bevægelse.

`tools/vorrechner.py before.wav after.wav --gipfel 5 --png media/x --out data.json` beregner kurver, toppe-etiketter, båndopsummering og spektrogrammer på forhånd (Python 3, numpy, Pillow, ffmpeg).

Knapper med aria-pressed, live-status, tekstopsummering af ændringen, tastaturbetjening, lys og mørk, reduceret bevægelse (ingen morf, ingen live-linje), ingen inline-scripts, tekst fra 13 px.

MIT License · Petit Souris · [psorvia.io](https://psorvia.io)
