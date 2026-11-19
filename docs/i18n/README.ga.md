[English](../../README.md)

# PSOrvia Klangvergleich

**Éist agus féach ar an difríocht idir dhá fhuaim – do do shuíomh gréasáin**

PSOrvia · [psorvia.io](https://psorvia.io)

### ▶ [Taispeántas beo](https://h-peterseim.github.io/psorvia-klangvergleich/)

Seinneann dhá leagan d’fhuaim i gcomhsheasmhacht agus athraítear eatarthu gan chliceáil. Tarraingítear an speictream mar achair, tá an t-athrú marcáilte, claochlaítear an cuar nuair a athraítear, agus le linn seinnte bogann an speictream fíor os a chionn. JavaScript agus CSS glan gan spleáchais.

## Úsáid

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

Radhairc bhreise roghnacha, roghnaithe leis an rogha `views` (réamhshocrú: speictream amháin): `wipe` (roinnteoir thar dhá speictreagram), `diff` (fuinneamh breise agus fuinneamh a baineadh), `level` (leibhéal thar am le suíomh an athsheinm), `stereo` (scamaill phointí le comhghaol) agus `glow` (speictream beo le hiarsholas boga). Tarraingítear iad i canvas ag lánréiteach na feiste; le `--ansichten` ríomhann `tools/vorrechner.py` a gcuid sonraí roimh ré.

Tuilleadh radharcanna agus uirlisí: `waterfall` (tírdhreach tríthoiseach den speictream thar am) agus `radial` (fáinní buailteacha; le `hero: true` taispeántar ina aonar é gan rialtáin mar mheall súl). Measctar sleamhnán trasdula fuaim agus pictiúr go leanúnach ó roimh go tar éis, fiú le linn athsheinm. Má thaispeánann tú nó má dhírítear ar bhanda sa chlár achoimre aibhsítear sa ghrafaic é; taispeánann formhéadaitheoir minicíocht, leibhéal agus am; léimeann cliceáil sa speictreagram, san eas nó sa leibhéal ansin agus seinneann. Cuirtear na beochaintí ar sos nuair nach bhfuil an t-eilimint le feiceáil nó nuair atá an cluaisín folaithe, agus fanann siad ciúin le gluaiseacht laghdaithe.

`tools/vorrechner.py before.wav after.wav --gipfel 5 --png media/x --out data.json` ríomhann sé na cuair, lipéid na mbuaicphointí, achoimre na mbanda agus na speictreagraim roimh ré (Python 3, numpy, Pillow, ffmpeg).

Cnaipí le aria-pressed, stádas beo, achoimre téacs ar an athrú, úsáid méarchláir, éadrom agus dorcha, gluaiseacht laghdaithe (gan claochlú ná líne bheo), gan scripteanna inlíne, téacs ó 13 px.

MIT License · Petit Souris · [psorvia.io](https://psorvia.io)
