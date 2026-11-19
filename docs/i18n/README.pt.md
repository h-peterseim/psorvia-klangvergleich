[English](../../README.md)

# PSOrvia Klangvergleich

**Ouça e veja a diferença entre dois sons – para o seu sítio web**

PSOrvia · [psorvia.io](https://psorvia.io)

### ▶ [Demonstração ao vivo](https://h-peterseim.github.io/psorvia-klangvergleich/)

Duas versões de um som tocam em sincronia e alterna-se entre elas sem clique. O espetro é desenhado como áreas, o que mudou está marcado, a curva transforma-se ao alternar e, durante a reprodução, o espetro real move-se por cima. JavaScript e CSS puros, sem dependências.

## Utilização

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

Vistas adicionais opcionais, escolhidas com a opção `views` (por omissão: só espetro): `wipe` (uma divisória sobre dois espetrogramas), `diff` (energia acrescentada e removida), `level` (nível ao longo do tempo com a posição de reprodução), `stereo` (nuvens de pontos com correlação) e `glow` (espetro em direto com um brilho residual suave). São desenhadas em canvas à resolução total do dispositivo; com `--ansichten`, `tools/vorrechner.py` calcula os seus dados previamente.

`tools/vorrechner.py before.wav after.wav --gipfel 5 --png media/x --out data.json` calcula de antemão as curvas, as etiquetas de picos, o resumo por bandas e os espetrogramas (Python 3, numpy, Pillow, ffmpeg).

Botões com aria-pressed, estado em direto, resumo textual da alteração, utilização com teclado, claro e escuro, movimento reduzido (sem transformação nem linha em direto), sem scripts em linha, texto a partir de 13 px.

MIT License · Petit Souris · [psorvia.io](https://psorvia.io)
