[English](../../README.md)

# PSOrvia Klangvergleich

**Slyšte a vizte rozdíl mezi dvěma zvuky – pro váš web**

PSOrvia · [psorvia.io](https://psorvia.io)

### ▶ [Živá ukázka](https://h-peterseim.github.io/psorvia-klangvergleich/)

Dvě verze zvuku hrají synchronně a přepíná se mezi nimi bez kliknutí. Spektrum je vykresleno jako plochy, změna je označena, křivka se při přepnutí plynule převádí a při přehrávání se nad ní pohybuje skutečné spektrum. Čistý JavaScript a CSS bez závislostí.

## Použití

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

Volitelná další zobrazení, volí se pomocí `views` (výchozí: jen spektrum): `wipe` (dělicí čára nad dvěma spektrogramy), `diff` (přidaná a ubraná energie), `level` (úroveň v čase s pozicí přehrávání), `stereo` (mračna bodů s korelací) a `glow` (spektrum naživo s jemným doznívajícím světlem). Kreslí se v canvasu v plném rozlišení zařízení; s `--ansichten` je `tools/vorrechner.py` předem spočítá.

Další zobrazení a nástroje: `waterfall` (trojrozměrná krajina spektra v čase) a `radial` (pulzující kruhy; s `hero: true` samostatně a bez ovládacích prvků jako vizuální akcent). Posuvník prolínání plynule mísí zvuk i obraz od „před“ k „po“, i během přehrávání. Najetí nebo fokus na pásmo v shrnutí ho zvýrazní v grafu; lupa ukazuje frekvenci, úroveň a čas; kliknutí do spektrogramu, vodopádu nebo úrovně skočí na dané místo a přehraje. Animace se zastaví, když prvek není vidět nebo je karta skrytá, a při omezeném pohybu zůstávají klidné.

`tools/vorrechner.py before.wav after.wav --gipfel 5 --png media/x --out data.json` předem vypočítá křivky, popisky vrcholů, shrnutí pásem a spektrogramy (Python 3, numpy, Pillow, ffmpeg).

Tlačítka s aria-pressed, živý stav, textové shrnutí změny, ovládání klávesnicí, světlý i tmavý vzhled, omezený pohyb (bez morfování a živé čáry), žádné vložené skripty, text od 13 px.

MIT License · Petit Souris · [psorvia.io](https://psorvia.io)
