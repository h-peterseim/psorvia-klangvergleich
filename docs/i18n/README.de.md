[English](../../README.md)

# PSOrvia Klangvergleich

**Den Unterschied zwischen zwei Klängen hören und sehen – für Ihre Website**

PSOrvia · [psorvia.io](https://psorvia.io)

### ▶ [Live-Demo](https://h-peterseim.github.io/psorvia-klangvergleich/)

Zwei Fassungen eines Klangs laufen synchron, man schaltet ohne Klick um. Das Spektrum wird als Flächen gezeichnet, das Geänderte ist markiert, die Kurve morpht beim Umschalten, und beim Abspielen wandert das echte Spektrum darüber. Reines JavaScript und CSS ohne Abhängigkeiten.

## Verwendung

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
  views: ['spectrum', 'wipe', 'diff', 'level', 'stereo', 'glow'] // optional
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

Optionale Zusatzansichten, gewählt mit der Option `views` (Standard: nur Spektrum): `wipe` (Trennlinie über zwei Spektrogrammen), `diff` (hinzugekommene und weggefallene Energie), `level` (Pegel über die Zeit mit Abspielposition), `stereo` (Punktwolken mit Korrelation) und `glow` (Live-Spektrum mit weichem Nachleuchten). Sie werden im Canvas in voller Geräteauflösung gezeichnet; mit `--ansichten` rechnet `tools/vorrechner.py` ihre Daten vorab.

`tools/vorrechner.py before.wav after.wav --gipfel 5 --png media/x --out data.json` berechnet Kurven, Gipfel-Etiketten, Bandzusammenfassung und Spektrogramme vorab (Python 3, numpy, Pillow, ffmpeg).

Schaltflächen mit aria-pressed, Live-Status, Textzusammenfassung der Änderung, Tastaturbedienung, hell und dunkel, reduzierte Bewegung (kein Morph, keine Live-Linie), keine Inline-Skripte, Text ab 13 px.

MIT License · Petit Souris · [psorvia.io](https://psorvia.io)
