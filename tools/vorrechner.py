#!/usr/bin/env python3
"""PSOrvia Klangvergleich - Vorrechner: zwei Audiodateien -> JSON fuer den Baustein (und optional zwei Spektrogramm-PNGs).
Benoetigt python3, numpy, Pillow (nur fuer --png) und ffmpeg. Beide Dateien sollten gleich laut sein (Pegelabgleich vorher).

  vorrechner.py VORHER NACHHER [--out datei.json] [--gipfel 6] [--grundton HZ] [--ton START DAUER] [--png PRAEFIX --png-url URLPRAEFIX] [--ansichten] [--ergaenze data.json]

JSON: {"before":[128 dB], "after":[128 dB], "peaks":[{"hz","ratio"?,"db"}], "bands":[{"from","to","delta"}], "spectrogram":{"before","after"}?}
Die 128 Werte liegen logarithmisch zwischen 60 Hz und 12 kHz, in dB bezogen auf das Maximum beider Kurven (Boden -90).
--grundton: Gipfel werden zusaetzlich als Verhaeltnis ("ratio") zu diesem Ton ausgegeben. --ton: Zeitfenster (Sekunden) des ersten Tons fuer Gipfel und Spektrogramm (Vorgabe 0 bis 2).
--ansichten: rechnet zusaetzlich die Daten der Zusatzansichten (Wischer/Differenz: "grams", Pegelverlauf: "level", Stereobild: "stereo"); "grams" deckt die ganze Länge ab (wie "level").
--ergaenze: liest eine vorhandene JSON-Datei ein und fuegt nur die Ansichts-Daten hinzu (Kurven, Gipfel und PNGs bleiben)."""
import sys, json, subprocess, argparse, base64
import numpy as np
SR = 48000
FR = np.geomspace(60, 12000, 129)
MID = np.sqrt(FR[:-1] * FR[1:])

def lesen(p):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True)
    return np.frombuffer(r.stdout, '<f4').astype(np.float64)

def lesen2(p):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True)
    return np.frombuffer(r.stdout, '<f4').astype(np.float64).reshape(-1, 2)

def b64(a): return base64.b64encode(np.ascontiguousarray(a, dtype='uint8').tobytes()).decode()

def ansichten(pa, pb, st_a, st_b, ton):
    """Daten der Zusatzansichten. grams: dB-Karten (0..255 = -80..0 dB, gemeinsamer Bezug), level: Hüllkurven, stereo: Dichte im Mitte/Seite-Gitter + Korrelation."""
    o = {}
    W, H = 320, 144
    ton = [0, max(len(st_a), len(st_b)) / SR]   # ganze Länge, einheitlich mit dem Pegelverlauf
    fr = np.geomspace(60, 12000, H + 1); NN = 4096; ww = np.hanning(NN); ff = np.fft.rfftfreq(NN, 1 / SR)
    idx = [np.where((ff >= a) & (ff < b))[0] for a, b in zip(fr[:-1], fr[1:])]
    for i, ix in enumerate(idx):
        if len(ix) == 0: idx[i] = np.array([min(len(ff) - 1, int(np.searchsorted(ff, fr[i])))])
    def karte(x):
        m = np.zeros((H, W))
        for c in range(W):
            i = int((ton[0] + c * ton[1] / W) * SR); seg = x[i:i + NN]
            if len(seg) < NN: seg = np.pad(seg, (0, NN - len(seg)))
            p = np.abs(np.fft.rfft(seg * ww)) ** 2
            m[:, c] = [p[ix].sum() for ix in idx]
        return m
    ma, mb = karte(st_a.mean(1)), karte(st_b.mean(1)); ref = max(ma.max(), mb.max(), 1e-12)
    q = lambda m: np.flipud(np.clip((10 * np.log10(np.maximum(m, 1e-12) / ref) + 80) / 80, 0, 1) * 255).round()
    o['grams'] = {'w': W, 'h': H, 'dur': round(ton[1], 2), 'before': b64(q(ma)), 'after': b64(q(mb))}
    n = 160; lv = {}
    dur = max(len(st_a), len(st_b)) / SR
    for tag, st in (('before', st_a), ('after', st_b)):
        x = st.mean(1); L = len(x); seg = np.array_split(np.arange(L), n); rms, pk = [], []
        for s_ in seg:
            v = x[s_] if len(s_) else np.zeros(1)
            rms.append(round(float(max(10 * np.log10(np.mean(v ** 2) + 1e-12), -90)), 1)); pk.append(round(float(max(20 * np.log10(np.abs(v).max() + 1e-9), -90)), 1))
        lv[tag] = {'rms': rms, 'peak': pk}
    lv['dur'] = round(dur, 2); o['level'] = lv
    G = 64; dens = {}; cor = {}
    for tag, st in (('before', st_a), ('after', st_b)):
        l, r = st[:, 0], st[:, 1]
        sd, md = (l - r) / np.sqrt(2), (l + r) / np.sqrt(2); pk = max(np.abs(md).max(), np.abs(sd).max(), 1e-9)
        h, _, _ = np.histogram2d(md / pk, sd / pk, bins=G, range=[[-1, 1], [-1, 1]]); dens[tag] = h
        den = np.sqrt((l ** 2).sum() * (r ** 2).sum()); cor[tag] = round(float((l * r).sum() / den) if den > 0 else 0, 2)
    mx = max(d.max() for d in dens.values())
    o['stereo'] = {t: {'d': b64(np.clip(np.log1p(dens[t] * 40 / mx) / np.log1p(40) * 255, 0, 255).round()), 'corr': cor[t]} for t in dens}
    o['stereo']['n'] = G
    return o

def mittel(x):
    N = 8192; w = np.hanning(N); acc = np.zeros(N // 2 + 1)
    for i in range(0, len(x) - N, N // 2): acc += np.abs(np.fft.rfft(x[i:i + N] * w)) ** 2
    f = np.fft.rfftfreq(N, 1 / SR)
    return np.array([acc[(f >= a) & (f < b)].sum() for a, b in zip(FR[:-1], FR[1:])])

def gram(x, t0, dur, cols=192):
    NN = 4096; ww = np.hanning(NN); ff = np.fft.rfftfreq(NN, 1 / SR); out = []
    for c in range(cols):
        i = int((t0 + c * dur / cols) * SR); seg = x[i:i + NN]
        if len(seg) < NN: seg = np.pad(seg, (0, NN - len(seg)))
        p = np.abs(np.fft.rfft(seg * ww)) ** 2
        out.append([p[(ff >= a) & (ff < b)].sum() for a, b in zip(FR[:-1], FR[1:])])
    return np.array(out).T

def gipfel(x, t0, n, f0):
    from scipy.signal import find_peaks
    NF = 1 << 16; seg = x[int((t0 + .05) * SR):int((t0 + 1.25) * SR)]
    seg = seg[:NF] if len(seg) >= NF else np.pad(seg, (0, NF - len(seg)))
    sp = np.abs(np.fft.rfft(seg * np.hanning(NF))); f = np.fft.rfftfreq(NF, 1 / SR); m = (f > 150) & (f < 11000)
    db = 20 * np.log10(sp / sp[m].max() + 1e-9)
    idx, _ = find_peaks(np.where(m, db, -200), height=-32, prominence=10, distance=20)
    chosen = []
    for i in sorted(idx, key=lambda i: -db[i]):
        if all(abs(np.log(f[i] / f[j])) > .12 for j in chosen): chosen.append(i)
        if len(chosen) >= n: break
    out = []
    for i in sorted(chosen):
        g = {'hz': round(float(f[i]), 1), 'db': round(float(db[i]), 1)}
        if f0: g['ratio'] = round(float(f[i] / f0), 2)
        out.append(g)
    return out

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('vorher'); ap.add_argument('nachher'); ap.add_argument('--out'); ap.add_argument('--gipfel', type=int, default=0)
    ap.add_argument('--grundton', type=float, default=0); ap.add_argument('--ton', nargs=2, type=float, default=[0, 2])
    ap.add_argument('--png'); ap.add_argument('--png-url', default=''); ap.add_argument('--ansichten', action='store_true'); ap.add_argument('--ergaenze')
    a = ap.parse_args()
    if a.ergaenze:
        o = json.load(open(a.ergaenze)); o.update(ansichten(None, None, lesen2(a.vorher), lesen2(a.nachher), a.ton))
        open(a.ergaenze, 'w').write(json.dumps(o, ensure_ascii=False, separators=(',', ':'))); return
    xa, xb = lesen(a.vorher), lesen(a.nachher)
    pa, pb = mittel(xa), mittel(xb); ref = max(pa.max(), pb.max())
    db = lambda v: [round(float(max(10 * np.log10(max(t / ref, 1e-12)), -90)), 1) for t in v]
    bands = []
    for lo, hi in ((0, 500), (500, 2000), (2000, 6000), (6000, 12000)):
        m = (MID >= lo) & (MID < hi)
        bands.append({'from': lo, 'to': hi, 'delta': round(float(10 * np.log10(max(pb[m].sum(), 1e-12) / max(pa[m].sum(), 1e-12))), 1)})
    o = {'before': db(pa), 'after': db(pb), 'bands': bands, 'peaks': gipfel(xb, a.ton[0], a.gipfel, a.grundton) if a.gipfel else []}
    if a.png:
        from PIL import Image
        ga, gb = gram(xa, *a.ton), gram(xb, *a.ton); sref = max(ga.max(), gb.max()); o['spectrogram'] = {}
        for tag, g in (('before', ga), ('after', gb)):
            lv = np.clip((10 * np.log10(np.maximum(g, 1e-12) / sref) + 70) / 70, 0, 1) ** 1.6
            a8 = (np.flipud(lv) * 255).astype('uint8')
            Image.fromarray(np.dstack([np.full_like(a8, 255)] * 3 + [a8]), 'RGBA').save(f'{a.png}-{tag}.png', optimize=True)
            o['spectrogram'][tag] = f'{a.png_url}{a.png.split("/")[-1]}-{tag}.png'
    if a.ansichten: o.update(ansichten(pa, pb, lesen2(a.vorher), lesen2(a.nachher), a.ton))
    s = json.dumps(o, ensure_ascii=False, separators=(',', ':'))
    if a.out: open(a.out, 'w').write(s)
    else: print(s)

main()
