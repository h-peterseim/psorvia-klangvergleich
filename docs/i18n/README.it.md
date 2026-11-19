[English](../../README.md)

# PSOrvia Klangvergleich

**Ascolta e vedi la differenza tra due suoni – per il tuo sito web**

PSOrvia · [psorvia.io](https://psorvia.io)

### ▶ [Demo dal vivo](https://h-peterseim.github.io/psorvia-klangvergleich/)

Due versioni di un suono vengono riprodotte in sincrono e si passa dall’una all’altra senza clic. Lo spettro è disegnato come aree, ciò che cambia è evidenziato, la curva si trasforma al passaggio e durante la riproduzione lo spettro reale si muove sopra di essa. JavaScript e CSS puri, senza dipendenze.

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

Viste aggiuntive facoltative, scelte con l’opzione `views` (predefinito: solo spettro): `wipe` (un divisore su due spettrogrammi), `diff` (energia aggiunta e rimossa), `level` (livello nel tempo con la posizione di riproduzione), `stereo` (nuvole di punti con correlazione) e `glow` (spettro dal vivo con un morbido alone residuo). Sono disegnate in canvas alla piena risoluzione del dispositivo; con `--ansichten`, `tools/vorrechner.py` ne calcola i dati in anticipo.

`tools/vorrechner.py before.wav after.wav --gipfel 5 --png media/x --out data.json` calcola in anticipo curve, etichette dei picchi, riepilogo per bande e spettrogrammi (Python 3, numpy, Pillow, ffmpeg).

Pulsanti con aria-pressed, stato in tempo reale, riepilogo testuale della modifica, uso da tastiera, chiaro e scuro, movimento ridotto (nessuna trasformazione né linea dal vivo), nessuno script inline, testo da 13 px.

MIT License · Petit Souris · [psorvia.io](https://psorvia.io)
