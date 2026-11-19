[English](../../README.md)

# PSOrvia Klangvergleich

**Dzirdiet un redziet atšķirību starp divām skaņām – savai vietnei**

PSOrvia · [psorvia.io](https://psorvia.io)

### ▶ [Demonstrācija tiešsaistē](https://h-peterseim.github.io/psorvia-klangvergleich/)

Divas skaņas versijas skan sinhroni, un starp tām pārslēdzas bez klikšķa. Spektrs ir zīmēts kā laukumi, izmaiņas ir atzīmētas, līkne pārslēdzot plūstoši pārveidojas, un atskaņošanas laikā virs tās kustas īstais spektrs. Tīrs JavaScript un CSS bez atkarībām.

## Lietošana

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

Neobligāti papildu skati, izvēlas ar opciju `views` (noklusējums: tikai spektrs): `wipe` (atdalītājs virs divām spektrogrammām), `diff` (pievienotā un noņemtā enerģija), `level` (līmenis laikā ar atskaņošanas pozīciju), `stereo` (punktu mākoņi ar korelāciju) un `glow` (spektrs tiešraidē ar maigu pēcspīdumu). Tie tiek zīmēti canvas ar pilnu ierīces izšķirtspēju; ar `--ansichten` `tools/vorrechner.py` to datus aprēķina iepriekš.

`tools/vorrechner.py before.wav after.wav --gipfel 5 --png media/x --out data.json` iepriekš aprēķina līknes, virsotņu etiķetes, joslu kopsavilkumu un spektrogrammas (Python 3, numpy, Pillow, ffmpeg).

Pogas ar aria-pressed, tiešais statuss, izmaiņu teksta kopsavilkums, vadība ar tastatūru, gaišs un tumšs, samazināta kustība (bez pārveides un tiešās līnijas), bez iegultiem skriptiem, teksts no 13 px.

MIT License · Petit Souris · [psorvia.io](https://psorvia.io)
