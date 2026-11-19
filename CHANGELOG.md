# Changelog

## 1.0.0
- More views and tools: `waterfall`, `radial` (and `hero: true` without controls), a crossfade slider (equal-power sound mix and picture, also while playing), smooth morphs between before/after, band highlight from the summary, a lens (frequency, level, time), click-to-seek, frequency-coloured glow with sparse sparks. Animations pause when out of view or the tab is hidden; reduced motion stays calm.
- Optional extra views (`views` option, default stays the spectrum): `wipe` (divider over two spectrograms), `diff` (added / removed energy over time and frequency), `level` (level over time with the playback position), `stereo` (point clouds with correlation) and `glow` (live spectrum with a soft afterglow). Canvas at full device resolution, light and dark, reduced motion (no intro sweep, no live drawing), labels in 29 languages. `tools/vorrechner.py --ansichten` computes their data.
- First release: synchronous before/after playback with a 30 ms crossfade (Web Audio), spectrum drawn as areas with the difference marked (added / removed), the curve morphs with the switch, the real spectrum of the running sound as a fine live line (AnalyserNode), labelled partials, a spectrogram strip, a text summary of the change for screen readers.
- Labels in 29 languages (`klangvergleich.i18n.js`), README in 29 languages.
- `tools/vorrechner.py` computes the data from two audio files in advance.
- Keyboard use, `aria-pressed`, live status, light and dark, reduced motion (no morph, no live line), no inline scripts, text at 13 px or more.
