#!/usr/bin/env python3
"""Baut klangvergleich.esm.js, klangvergleich.js (klassisch, global PsoKlangvergleich), klangvergleich.i18n.esm.js/.js und klangvergleich.css aus src/ (nur Kommentar- und Leerraum-Entfernung)."""
import re, os, gzip
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def strip_js(s):
    head = s.split('\n', 1)[0]
    out = []
    for l in s.split('\n')[1:]:
        t = l.strip()
        if not t or t.startswith('//') or (t.startswith('/*') and t.endswith('*/')): continue
        out.append(l.rstrip())
    return head + '\n' + '\n'.join(out) + '\n'
def strip_css(s):
    head = s.split('\n', 1)[0]
    body = re.sub(r'/\*.*?\*/', '', s, flags=re.S)
    body = re.sub(r'\n\s*', '', body)
    body = re.sub(r'\s*([{};,>])\s*', r'\1', body).replace(';}', '}')
    return head + '\n' + body + '\n'
src = open(f'{R}/src/klangvergleich.src.js').read()
esm = strip_js(src)
classic = re.sub(r'\bexport (function|const)\b', r'\1', esm)
classic = '(function(g){\n' + classic + 'g.PsoKlangvergleich={create,auto,version,languages};\n})(typeof window!=="undefined"?window:this);\n'
open(f'{R}/klangvergleich.esm.js', 'w').write(esm)
open(f'{R}/klangvergleich.js', 'w').write(classic)
i = open(f'{R}/src/klangvergleich.i18n.src.js').read()
head = i.split('\n', 1)[0]
body = i.split('\n', 1)[1]
open(f'{R}/klangvergleich.i18n.esm.js', 'w').write(head + "\nimport { languages } from './klangvergleich.esm.js';\n" + body)
open(f'{R}/klangvergleich.i18n.js', 'w').write('(function(g){\n' + head + '\nconst languages=g.PsoKlangvergleich.languages;\n' + body + '})(typeof window!=="undefined"?window:this);\n')
open(f'{R}/klangvergleich.css', 'w').write(strip_css(open(f'{R}/src/klangvergleich.css').read()))
for f in ('klangvergleich.js', 'klangvergleich.esm.js', 'klangvergleich.i18n.js', 'klangvergleich.css'):
    b = open(f'{R}/{f}', 'rb').read(); print(f, len(b), 'B', len(gzip.compress(b, 9)), 'B gz')
