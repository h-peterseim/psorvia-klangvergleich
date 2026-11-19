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

Vistas adicionales opcionales, elegidas con la opción `views` (por defecto, solo espectro): `wipe` (un divisor sobre dos espectrogramas), `diff` (energía añadida y eliminada), `level` (nivel a lo largo del tiempo con la posición de reproducción), `stereo` (nubes de puntos con correlación) y `glow` (espectro en vivo con un suave resplandor residual). Se dibujan en canvas a la resolución completa del dispositivo; con `--ansichten`, `tools/vorrechner.py` calcula sus datos de antemano.

Más vistas y herramientas: `waterfall` (un paisaje tridimensional del espectro a lo largo del tiempo) y `radial` (anillos pulsantes; con `hero: true` se muestra solo y sin controles como elemento llamativo). Un control de fundido mezcla sonido e imagen de forma continua de antes a después, incluso durante la reproducción. Pasar el puntero o enfocar una banda del resumen la resalta en el gráfico; una lupa muestra frecuencia, nivel y tiempo; un clic en el espectrograma, la cascada o el nivel salta allí y reproduce. Las animaciones se detienen cuando el elemento no está a la vista o la pestaña está oculta, y se mantienen tranquilas con movimiento reducido.

`tools/vorrechner.py before.wav after.wav --gipfel 5 --png media/x --out data.json` calcula de antemano las curvas, las etiquetas de picos, el resumen por bandas y los espectrogramas (Python 3, numpy, Pillow, ffmpeg).

Botones con aria-pressed, estado en vivo, resumen textual del cambio, uso con teclado, claro y oscuro, movimiento reducido (sin transformación ni línea en vivo), sin scripts en línea, texto desde 13 px.

MIT License · Petit Souris · [psorvia.io](https://psorvia.io)
