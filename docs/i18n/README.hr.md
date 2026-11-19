[English](../../README.md)

# PSOrvia Klangvergleich

**Čujte i vidite razliku između dva zvuka – za vašu web-stranicu**

PSOrvia · [psorvia.io](https://psorvia.io)

### ▶ [Demo uživo](https://h-peterseim.github.io/psorvia-klangvergleich/)

Dvije verzije zvuka sviraju sinkronizirano, a među njima se prebacuje bez klika. Spektar je nacrtan kao površine, promjena je označena, krivulja se pri prebacivanju glatko preobražava, a tijekom reprodukcije stvarni spektar kreće se iznad nje. Čisti JavaScript i CSS bez ovisnosti.

## Uporaba

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

Neobvezni dodatni prikazi, biraju se opcijom `views` (zadano: samo spektar): `wipe` (razdjelnik preko dva spektrograma), `diff` (dodana i uklonjena energija), `level` (razina kroz vrijeme s pozicijom reprodukcije), `stereo` (oblaci točaka s korelacijom) i `glow` (spektar uživo s mekim naknadnim sjajem). Crtaju se u canvasu u punoj razlučivosti uređaja; s `--ansichten` `tools/vorrechner.py` unaprijed izračunava njihove podatke.

Više prikaza i alata: `waterfall` (trodimenzionalni krajolik spektra kroz vrijeme) i `radial` (pulsirajući prstenovi; s `hero: true` prikazuje se sam i bez kontrola kao privlačan element). Klizač preljeva stupnjevito miješa zvuk i sliku od prije prema poslije, čak i tijekom reprodukcije. Prelazak mišem ili fokus na pojas u sažetku ističe ga u grafici; povećalo prikazuje frekvenciju, razinu i vrijeme; klik u spektrogram, slap ili razinu skače tamo i reproducira. Animacije se pauziraju kad element nije vidljiv ili je kartica skrivena i ostaju mirne uz smanjeno kretanje.

`tools/vorrechner.py before.wav after.wav --gipfel 5 --png media/x --out data.json` unaprijed izračunava krivulje, oznake vrhova, sažetak po pojasevima i spektrograme (Python 3, numpy, Pillow, ffmpeg).

Gumbi s aria-pressed, status uživo, tekstualni sažetak promjene, upravljanje tipkovnicom, svijetla i tamna tema, smanjeno kretanje (bez preobrazbe i žive linije), bez ugrađenih skripti, tekst od 13 px.

MIT License · Petit Souris · [psorvia.io](https://psorvia.io)
