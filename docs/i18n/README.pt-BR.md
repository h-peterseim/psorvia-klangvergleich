[English](../../README.md)

# PSOrvia Klangvergleich

**Ouça e veja a diferença entre dois sons – para o seu site**

PSOrvia · [psorvia.io](https://psorvia.io)

### ▶ [Demonstração ao vivo](https://h-peterseim.github.io/psorvia-klangvergleich/)

Duas versões de um som tocam em sincronia e você alterna entre elas sem clique. O espectro é desenhado como áreas, o que mudou está marcado, a curva se transforma ao alternar e, durante a reprodução, o espectro real se move por cima. JavaScript e CSS puros, sem dependências.

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

`tools/vorrechner.py before.wav after.wav --gipfel 5 --png media/x --out data.json` calcula antecipadamente as curvas, os rótulos de picos, o resumo por faixas e os espectrogramas (Python 3, numpy, Pillow, ffmpeg).

Botões com aria-pressed, status ao vivo, resumo em texto da mudança, uso com teclado, claro e escuro, movimento reduzido (sem transformação nem linha ao vivo), sem scripts inline, texto a partir de 13 px.

MIT License · Petit Souris · [psorvia.io](https://psorvia.io)
