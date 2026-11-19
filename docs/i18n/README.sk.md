[English](../../README.md)

# PSOrvia Klangvergleich

**Počujte a pozrite si rozdiel medzi dvoma zvukmi – pre váš web**

PSOrvia · [psorvia.io](https://psorvia.io)

### ▶ [Živá ukážka](https://h-peterseim.github.io/psorvia-klangvergleich/)

Dve verzie zvuku hrajú synchrónne a prepína sa medzi nimi bez kliknutia. Spektrum je vykreslené ako plochy, zmena je označená, krivka sa pri prepnutí plynulo premieňa a pri prehrávaní sa nad ňou pohybuje skutočné spektrum. Čistý JavaScript a CSS bez závislostí.

## Použitie

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

Voliteľné ďalšie zobrazenia, volia sa možnosťou `views` (predvolene: iba spektrum): `wipe` (deliaca čiara nad dvoma spektrogramami), `diff` (pridaná a ubratá energia), `level` (úroveň v čase s pozíciou prehrávania), `stereo` (oblaky bodov s koreláciou) a `glow` (spektrum naživo s jemným dosvitom). Kreslia sa v canvase v plnom rozlíšení zariadenia; s `--ansichten` ich údaje vopred vypočíta `tools/vorrechner.py`.

Ďalšie zobrazenia a nástroje: `waterfall` (trojrozmerná krajina spektra v čase) a `radial` (pulzujúce kruhy; s `hero: true` sa zobrazí samostatne a bez ovládacích prvkov ako pútač). Posuvník prelínania plynule mieša zvuk aj obraz od „pred“ po „po“, aj počas prehrávania. Prejdenie myšou alebo fokus na pásmo v zhrnutí ho zvýrazní v grafe; lupa ukazuje frekvenciu, úroveň a čas; kliknutie do spektrogramu, vodopádu alebo úrovne skočí na dané miesto a prehrá. Animácie sa pozastavia, keď prvok nie je vidieť alebo je karta skrytá, a pri obmedzenom pohybe zostávajú pokojné.

`tools/vorrechner.py before.wav after.wav --gipfel 5 --png media/x --out data.json` vopred vypočíta krivky, popisky vrcholov, zhrnutie pásiem a spektrogramy (Python 3, numpy, Pillow, ffmpeg).

Tlačidlá s aria-pressed, živý stav, textové zhrnutie zmeny, ovládanie klávesnicou, svetlý a tmavý vzhľad, obmedzený pohyb (bez morfovania a živej čiary), žiadne vložené skripty, text od 13 px.

MIT License · Petit Souris · [psorvia.io](https://psorvia.io)
