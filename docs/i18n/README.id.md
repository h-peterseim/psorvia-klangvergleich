[English](../../README.md)

# PSOrvia Klangvergleich

**Dengar dan lihat perbedaan antara dua suara – untuk situs web Anda**

PSOrvia · [psorvia.io](https://psorvia.io)

### ▶ [Demo langsung](https://h-peterseim.github.io/psorvia-klangvergleich/)

Dua versi suara diputar serempak dan Anda berpindah di antara keduanya tanpa klik. Spektrum digambar sebagai area, perubahan ditandai, kurva berubah halus saat beralih, dan saat memutar spektrum asli bergerak di atasnya. JavaScript dan CSS murni tanpa dependensi.

## Penggunaan

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

Tampilan tambahan opsional, dipilih dengan opsi `views` (bawaan: hanya spektrum): `wipe` (pembagi di atas dua spektrogram), `diff` (energi yang ditambah dan dikurangi), `level` (level menurut waktu dengan posisi pemutaran), `stereo` (awan titik dengan korelasi) dan `glow` (spektrum langsung dengan cahaya susulan yang lembut). Semuanya digambar di canvas pada resolusi penuh perangkat; dengan `--ansichten`, `tools/vorrechner.py` menghitung datanya lebih dulu.

`tools/vorrechner.py before.wav after.wav --gipfel 5 --png media/x --out data.json` menghitung kurva, label puncak, ringkasan pita, dan spektrogram sebelumnya (Python 3, numpy, Pillow, ffmpeg).

Tombol dengan aria-pressed, status langsung, ringkasan teks perubahan, operasi keyboard, terang dan gelap, gerakan dikurangi (tanpa morf dan garis langsung), tanpa skrip inline, teks mulai 13 px.

MIT License · Petit Souris · [psorvia.io](https://psorvia.io)
