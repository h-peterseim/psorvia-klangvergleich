[English](../../README.md)

# PSOrvia Klangvergleich

**İki ses arasındaki farkı duyun ve görün – web siteniz için**

PSOrvia · [psorvia.io](https://psorvia.io)

### ▶ [Canlı demo](https://h-peterseim.github.io/psorvia-klangvergleich/)

Bir sesin iki sürümü eşzamanlı çalar ve aralarında tıklamadan geçilir. Spektrum alanlar olarak çizilir, değişen yer işaretlenir, eğri geçişte yumuşakça dönüşür ve çalarken gerçek spektrum üzerinde hareket eder. Bağımlılıksız saf JavaScript ve CSS.

## Kullanım

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

`tools/vorrechner.py before.wav after.wav --gipfel 5 --png media/x --out data.json` eğrileri, tepe etiketlerini, bant özetini ve spektrogramları önceden hesaplar (Python 3, numpy, Pillow, ffmpeg).

aria-pressed’li düğmeler, canlı durum, değişikliğin metin özeti, klavye kullanımı, açık ve koyu, azaltılmış hareket (dönüşüm ve canlı çizgi yok), satır içi betik yok, 13 px ve üzeri metin.

MIT License · Petit Souris · [psorvia.io](https://psorvia.io)
