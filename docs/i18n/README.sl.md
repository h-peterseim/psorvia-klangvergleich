[English](../../README.md)

# PSOrvia Klangvergleich

**Slišite in poglejte razliko med dvema zvokoma – za vašo spletno stran**

PSOrvia · [psorvia.io](https://psorvia.io)

### ▶ [Predstavitev v živo](https://h-peterseim.github.io/psorvia-klangvergleich/)

Dve različici zvoka igrata sinhrono, med njima pa preklapljate brez klika. Spekter je narisan kot ploskve, sprememba je označena, krivulja se ob preklopu gladko preoblikuje, med predvajanjem pa se nad njo premika pravi spekter. Čisti JavaScript in CSS brez odvisnosti.

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

Izbirni dodatni pogledi, izberejo se z možnostjo `views` (privzeto: samo spekter): `wipe` (ločnica čez dva spektrograma), `diff` (dodana in odvzeta energija), `level` (raven skozi čas s položajem predvajanja), `stereo` (oblaki točk s korelacijo) in `glow` (spekter v živo z mehkim posvitom). Rišejo se v canvasu v polni ločljivosti naprave; z `--ansichten` `tools/vorrechner.py` njihove podatke izračuna vnaprej.

`tools/vorrechner.py before.wav after.wav --gipfel 5 --png media/x --out data.json` vnaprej izračuna krivulje, oznake vrhov, povzetek po pasovih in spektrograme (Python 3, numpy, Pillow, ffmpeg).

Gumbi z aria-pressed, stanje v živo, besedilni povzetek spremembe, upravljanje s tipkovnico, svetla in temna tema, zmanjšano gibanje (brez preoblikovanja in žive črte), brez vgrajenih skript, besedilo od 13 px.

MIT License · Petit Souris · [psorvia.io](https://psorvia.io)
