[English](../../README.md)

# PSOrvia Klangvergleich

**Usłysz i zobacz różnicę między dwoma dźwiękami – na swojej stronie**

PSOrvia · [psorvia.io](https://psorvia.io)

### ▶ [Demo na żywo](https://h-peterseim.github.io/psorvia-klangvergleich/)

Dwie wersje dźwięku grają synchronicznie, a przełącza się je bez kliknięcia. Widmo jest rysowane jako pola, zmiana jest zaznaczona, krzywa płynnie się przekształca przy przełączaniu, a podczas odtwarzania nad nią przesuwa się prawdziwe widmo. Czysty JavaScript i CSS bez zależności.

## Użycie

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

`tools/vorrechner.py before.wav after.wav --gipfel 5 --png media/x --out data.json` z góry oblicza krzywe, etykiety szczytów, podsumowanie pasm i spektrogramy (Python 3, numpy, Pillow, ffmpeg).

Przyciski z aria-pressed, status na żywo, tekstowe podsumowanie zmiany, obsługa klawiaturą, jasny i ciemny motyw, ograniczony ruch (bez przekształcenia i linii na żywo), bez skryptów wbudowanych, tekst od 13 px.

MIT License · Petit Souris · [psorvia.io](https://psorvia.io)
