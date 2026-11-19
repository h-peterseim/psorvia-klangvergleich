[English](../../README.md)

# PSOrvia Klangvergleich

**Oye y ve la diferencia entre dos sonidos – para tu sitio web**

PSOrvia · [psorvia.io](https://psorvia.io)

### ▶ [Demo en vivo](https://h-peterseim.github.io/psorvia-klangvergleich/)

Dos versiones de un sonido suenan sincronizadas y se alternan sin clic. El espectro se dibuja como áreas, lo que cambia está marcado, la curva se transforma al cambiar y, durante la reproducción, el espectro real se mueve por encima. JavaScript y CSS puros, sin dependencias.

## Uso

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

`tools/vorrechner.py before.wav after.wav --gipfel 5 --png media/x --out data.json` calcula de antemano las curvas, las etiquetas de picos, el resumen por bandas y los espectrogramas (Python 3, numpy, Pillow, ffmpeg).

Botones con aria-pressed, estado en vivo, resumen textual del cambio, uso con teclado, claro y oscuro, movimiento reducido (sin transformación ni línea en vivo), sin scripts en línea, texto desde 13 px.

MIT License · Petit Souris · [psorvia.io](https://psorvia.io)
