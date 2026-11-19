[English](../../README.md)

# PSOrvia Klangvergleich

**Halld és lásd a különbséget két hang között – a weboldaladhoz**

PSOrvia · [psorvia.io](https://psorvia.io)

### ▶ [Élő bemutató](https://h-peterseim.github.io/psorvia-klangvergleich/)

Egy hang két változata szinkronban szól, és kattintás nélkül lehet váltani közöttük. A spektrum felületként van megrajzolva, a változás jelölve van, a görbe váltáskor átalakul, lejátszás közben pedig a valódi spektrum mozog fölötte. Tiszta JavaScript és CSS, függőségek nélkül.

## Használat

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

Opcionális további nézetek, a `views` beállítással választhatók (alapértelmezés: csak spektrum): `wipe` (elválasztó két spektrogram felett), `diff` (hozzáadott és elvett energia), `level` (szint az idő függvényében a lejátszási pozícióval), `stereo` (pontfelhők korrelációval) és `glow` (élő spektrum lágy utánvilágítással). Canvasban rajzolódnak a készülék teljes felbontásán; az `--ansichten` kapcsolóval a `tools/vorrechner.py` előre kiszámítja az adataikat.

További nézetek és eszközök: `waterfall` (a spektrum háromdimenziós tája az idő mentén) és `radial` (pulzáló gyűrűk; a `hero: true` beállítással egyedül és kezelőelemek nélkül látványelemként jelenik meg). Egy átúsztató csúszka fokozatmentesen keveri a hangot és a képet az előtte-ből az utána felé, lejátszás közben is. Az összefoglalóban egy sáv fölé húzás vagy fókusz kiemeli azt a grafikonon; a nagyító frekvenciát, szintet és időt mutat; a spektrogramra, a vízesésre vagy a szintre kattintva odaugrik és lejátszik. Az animációk szünetelnek, ha az elem nem látszik vagy a lap rejtett, és csökkentett mozgásnál nyugodtak maradnak.

`tools/vorrechner.py before.wav after.wav --gipfel 5 --png media/x --out data.json` előre kiszámítja a görbéket, a csúcscímkéket, a sávösszegzést és a spektrogramokat (Python 3, numpy, Pillow, ffmpeg).

Gombok aria-pressed-del, élő állapot, a változás szöveges összefoglalója, billentyűzetes használat, világos és sötét, csökkentett mozgás (nincs átalakulás és élő vonal), nincs beágyazott szkript, szöveg 13 px-től.

MIT License · Petit Souris · [psorvia.io](https://psorvia.io)
