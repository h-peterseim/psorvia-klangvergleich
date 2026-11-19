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
  data: /* JSON from tools/vorrechner.py */ {}
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

`tools/vorrechner.py before.wav after.wav --gipfel 5 --png media/x --out data.json` előre kiszámítja a görbéket, a csúcscímkéket, a sávösszegzést és a spektrogramokat (Python 3, numpy, Pillow, ffmpeg).

Gombok aria-pressed-del, élő állapot, a változás szöveges összefoglalója, billentyűzetes használat, világos és sötét, csökkentett mozgás (nincs átalakulás és élő vonal), nincs beágyazott szkript, szöveg 13 px-től.

MIT License · Petit Souris · [psorvia.io](https://psorvia.io)
