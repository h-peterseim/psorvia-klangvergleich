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

İsteğe bağlı ek görünümler, `views` seçeneğiyle seçilir (varsayılan: yalnızca spektrum): `wipe` (iki spektrogramın üzerinde ayırıcı), `diff` (eklenen ve çıkan enerji), `level` (oynatma konumuyla zaman içinde seviye), `stereo` (korelasyonlu nokta bulutları) ve `glow` (yumuşak art ışımalı canlı spektrum). Cihazın tam çözünürlüğünde canvas içinde çizilirler; `--ansichten` ile `tools/vorrechner.py` verilerini önceden hesaplar.

Daha fazla görünüm ve araç: `waterfall` (spektrumun zaman içindeki üç boyutlu manzarası) ve `radial` (nabız gibi atan halkalar; `hero: true` ile tek başına ve denetimsiz, dikkat çekici bir öğe olarak gösterilir). Bir geçiş kaydırıcısı sesi ve görüntüyü önceden sonraya kademesiz karıştırır, çalma sırasında da. Özetteki bir banda gelmek veya odaklanmak onu grafikte vurgular; bir büyüteç frekansı, seviyeyi ve zamanı gösterir; spektrograma, şelaleye veya seviyeye tıklamak oraya atlar ve çalar. Öğe görünmediğinde veya sekme gizlendiğinde animasyonlar durur, azaltılmış harekette sakin kalır.

`tools/vorrechner.py before.wav after.wav --gipfel 5 --png media/x --out data.json` eğrileri, tepe etiketlerini, bant özetini ve spektrogramları önceden hesaplar (Python 3, numpy, Pillow, ffmpeg).

aria-pressed’li düğmeler, canlı durum, değişikliğin metin özeti, klavye kullanımı, açık ve koyu, azaltılmış hareket (dönüşüm ve canlı çizgi yok), satır içi betik yok, 13 px ve üzeri metin.

MIT License · Petit Souris · [psorvia.io](https://psorvia.io)
