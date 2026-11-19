[English](../../README.md)

# PSOrvia Klangvergleich

**Ακούστε και δείτε τη διαφορά μεταξύ δύο ήχων – για τον ιστότοπό σας**

PSOrvia · [psorvia.io](https://psorvia.io)

### ▶ [Ζωντανή επίδειξη](https://h-peterseim.github.io/psorvia-klangvergleich/)

Δύο εκδοχές ενός ήχου παίζουν συγχρονισμένα και εναλλάσσονται χωρίς κλικ. Το φάσμα σχεδιάζεται ως επιφάνειες, η αλλαγή επισημαίνεται, η καμπύλη μεταμορφώνεται κατά την εναλλαγή και κατά την αναπαραγωγή το πραγματικό φάσμα κινείται από πάνω. Καθαρό JavaScript και CSS χωρίς εξαρτήσεις.

## Χρήση

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

`tools/vorrechner.py before.wav after.wav --gipfel 5 --png media/x --out data.json` υπολογίζει εκ των προτέρων καμπύλες, ετικέτες κορυφών, σύνοψη ζωνών και φασματογραφήματα (Python 3, numpy, Pillow, ffmpeg).

Κουμπιά με aria-pressed, ζωντανή κατάσταση, κειμενική σύνοψη της αλλαγής, χειρισμός με πληκτρολόγιο, φωτεινό και σκούρο θέμα, μειωμένη κίνηση (χωρίς μεταμόρφωση και ζωντανή γραμμή), χωρίς ενσωματωμένα σενάρια, κείμενο από 13 px.

MIT License · Petit Souris · [psorvia.io](https://psorvia.io)
