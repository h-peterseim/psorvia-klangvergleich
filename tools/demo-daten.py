#!/usr/bin/env python3
"""Schreibt media/demo-data.js: Daten, Spektrogramm-Bilder und Ton der beiden Demo-Beispiele als data:-URLs, damit index.html und demo.html auch per Doppelklick (file://) laufen."""
import json, base64, os
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); M = R + '/media/'
uri = lambda f, t: f'data:{t};base64,' + base64.b64encode(open(M + f, 'rb').read()).decode()
g = json.load(open(M + 'glocke.json'))
g['spectrogram'] = {'before': uri('glocke-before.png', 'image/png'), 'after': uri('glocke-after.png', 'image/png')}
s = json.load(open(M + 'stereo.json'))
D = {'bell': {'before': uri('glocke-vorher.m4a', 'audio/mp4'), 'after': uri('glocke-nachher.m4a', 'audio/mp4'), 'data': g},
     'stereo': {'before': uri('stereo-vorher.m4a', 'audio/mp4'), 'after': uri('stereo-nachher.m4a', 'audio/mp4'), 'data': s}}
open(M + 'demo-data.js', 'w').write('window.PSO_DEMO=' + json.dumps(D, separators=(',', ':')) + ';\n')
