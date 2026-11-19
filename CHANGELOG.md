# Changelog

## 1.0.0
- First release: synchronous before/after playback with a 30 ms crossfade (Web Audio), spectrum drawn as areas with the difference marked (added / removed), the curve morphs with the switch, the real spectrum of the running sound as a fine live line (AnalyserNode), labelled partials, a spectrogram strip, a text summary of the change for screen readers.
- Labels in 29 languages (`klangvergleich.i18n.js`), README in 29 languages.
- `tools/vorrechner.py` computes the data from two audio files in advance.
- Keyboard use, `aria-pressed`, live status, light and dark, reduced motion (no morph, no live line), no inline scripts, text at 13 px or more.
