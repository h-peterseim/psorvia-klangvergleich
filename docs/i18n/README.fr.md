[English](../../README.md)

# PSOrvia Klangvergleich

**Entendez et voyez la différence entre deux sons – pour votre site web**

PSOrvia · [psorvia.io](https://psorvia.io)

### ▶ [Démo en direct](https://h-peterseim.github.io/psorvia-klangvergleich/)

Deux versions d’un son jouent en synchronisation et on passe de l’une à l’autre sans clic. Le spectre est dessiné en aires, ce qui change est marqué, la courbe se transforme au changement et, pendant la lecture, le vrai spectre se déplace par-dessus. JavaScript et CSS purs, sans dépendances.

## Utilisation

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

Vues supplémentaires facultatives, choisies avec l’option `views` (par défaut : spectre seul) : `wipe` (un séparateur sur deux spectrogrammes), `diff` (énergie ajoutée et retirée), `level` (niveau au fil du temps avec la position de lecture), `stereo` (nuages de points avec corrélation) et `glow` (spectre en direct avec une douce rémanence). Elles sont dessinées en canvas à la pleine résolution de l’appareil ; avec `--ansichten`, `tools/vorrechner.py` calcule leurs données à l’avance.

`tools/vorrechner.py before.wav after.wav --gipfel 5 --png media/x --out data.json` calcule à l’avance les courbes, les étiquettes de pics, le résumé par bandes et les spectrogrammes (Python 3, numpy, Pillow, ffmpeg).

Boutons avec aria-pressed, état en direct, résumé textuel du changement, utilisation au clavier, clair et sombre, mouvement réduit (ni transformation ni ligne en direct), aucun script en ligne, texte à partir de 13 px.

MIT License · Petit Souris · [psorvia.io](https://psorvia.io)
