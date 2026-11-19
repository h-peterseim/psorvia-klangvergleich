[English](../../README.md)

# PSOrvia Klangvergleich

**Isma’ u ara d-differenza bejn żewġ ħsejjes – għas-sit tiegħek**

PSOrvia · [psorvia.io](https://psorvia.io)

### ▶ [Dimostrazzjoni diretta](https://h-peterseim.github.io/psorvia-klangvergleich/)

Żewġ verżjonijiet ta’ ħoss jindaqqu fl-istess ħin u tbiddel bejniethom mingħajr klikk. L-ispettru jitfassal bħala żoni, dak li nbidel huwa mmarkat, il-kurva titbiddel b’mod bil-mod waqt il-bidla, u waqt it-tħaddim l-ispettru reali jimxi fuqha. JavaScript u CSS pur mingħajr dipendenzi.

## Użu

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

Għażliet addizzjonali ta’ veduti, magħżula bl-għażla `views` (awtomatika: spettru biss): `wipe` (diviżur fuq żewġ spettrogrammi), `diff` (enerġija miżjuda u mneħħija), `level` (livell maż-żmien bil-pożizzjoni tal-ipplejjar), `stereo` (sħab ta’ punti b’korrelazzjoni) u `glow` (spettru ħaj b’tleqqija sfumata wara). Jitfasslu fil-canvas bir-riżoluzzjoni sħiħa tal-apparat; b’`--ansichten`, `tools/vorrechner.py` jikkalkula d-dejta tagħhom minn qabel.

`tools/vorrechner.py before.wav after.wav --gipfel 5 --png media/x --out data.json` jikkalkula minn qabel il-kurvi, it-tikketti tal-quċċati, is-sommarju tal-faxxi u l-ispettrogrammi (Python 3, numpy, Pillow, ffmpeg).

Buttuni b’aria-pressed, status dirett, sommarju bit-test tal-bidla, użu bit-tastiera, ċar u skur, moviment imnaqqas (mingħajr bidla gradwali u linja diretta), mingħajr skripts inline, test minn 13 px.

MIT License · Petit Souris · [psorvia.io](https://psorvia.io)
