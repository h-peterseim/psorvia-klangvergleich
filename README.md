# PSOrvia Klangvergleich

**Hear and see the difference between two sounds – for your website**

PSOrvia · [psorvia.io](https://psorvia.io)

### ▶ [Live demo](https://h-peterseim.github.io/psorvia-klangvergleich/)

Two versions of a sound play in sync and you switch between them without a click. The spectrum is drawn as areas, what changed is marked, the curve morphs with the switch, and while playing the real spectrum moves over it. Plain JavaScript and CSS without dependencies.

## Usage

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

Optional extra views, chosen with the `views` option (default: spectrum only): `wipe` (a divider over two spectrograms), `diff` (added and removed energy), `level` (level over time with the playback position), `stereo` (point clouds with correlation) and `glow` (live spectrum with a soft afterglow). They are drawn in canvas at full device resolution; add `--ansichten` to `tools/vorrechner.py` to compute their data in advance.

More views and tools: `waterfall` (a three-dimensional landscape of the spectrum over time) and `radial` (pulsing rings; with `hero: true` it is shown alone and without controls as an eye-catcher). A crossfade slider mixes sound and picture steplessly from before to after, even while playing. Hovering or focusing a band in the summary highlights it in the graphic; a lens shows frequency, level and time; a click in a spectrogram, waterfall or level view jumps there and plays. Animations pause when the element is out of view or the tab is hidden, and stay calm with reduced motion.

`tools/vorrechner.py before.wav after.wav --gipfel 5 --png media/x --out data.json` computes the curves, peak labels, band summary and spectrograms in advance (Python 3, numpy, Pillow, ffmpeg).

Buttons with aria-pressed, live status, a text summary of the change, keyboard use, light and dark, reduced motion (no morph, no live line), no inline scripts, text at 13 px or more.

MIT License · Petit Souris · [psorvia.io](https://psorvia.io)
