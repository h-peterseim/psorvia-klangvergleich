/*! PSOrvia Klangvergleich 1.0.0 | MIT | Petit Souris | PSOrvia · psorvia.io */
const NS = 'http://www.w3.org/2000/svg';
const W = 600, H = 200;
let uid = 0, current = null;
const E = (t, a, p, x) => { const e = document.createElement(t); for (const k in a) e.setAttribute(k, a[k]); if (x != null) e.textContent = x; if (p) p.appendChild(e); return e; };
const S = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
const EN = {
  before: 'Before', after: 'After', play: 'Play', pause: 'Pause', ready: 'Ready', playing: 'Playing', heard: 'You hear:',
  gain: 'added', loss: 'removed', show: 'Show spectrum for', more: 'More energy {x}.', less: 'Less energy {x}.', same: 'The spectrum hardly changes.',
  below: 'below {to}', between: 'between {from} and {to}', above: 'above {from}',
  alt: 'Spectrum before and after as areas, 60 Hz to 12 kHz, level in decibels', gram: 'First tone over time: attack on the left, decay on the right; frequency from low (bottom) to high (top)',
  error: 'The sound could not be loaded.',
  view: 'View', v_spectrum: 'Spectrum', v_wipe: 'Wipe', v_diff: 'Difference', v_level: 'Level', v_stereo: 'Stereo', v_glow: 'Glow',
  alt_wipe: 'Spectrogram with a divider: before on the left, after on the right; time from left to right, frequency from low (bottom) to high (top)',
  alt_diff: 'Difference over time and frequency: added energy and removed energy in two colours',
  alt_level: 'Level over time, before and after, with the playback position',
  alt_stereo: 'Stereo image of before and after as point clouds, with correlation',
  alt_glow: 'Live spectrum while playing, with a soft afterglow',
  lv_louder: 'On average {x} dB louder.', lv_quieter: 'On average {x} dB quieter.', lv_same: 'The average level hardly changes.',
  glow_idle: 'Press play to see the live spectrum.', corr: 'Correlation', stereo_idle: 'Press play for the live view.',
  v_waterfall: 'Waterfall', v_radial: 'Radial', alt_waterfall: 'Spectrum as a three-dimensional landscape over time; the newest moment is in front', alt_radial: 'Spectrum as pulsing rings, before inside and after outside; low frequencies at the top', mix: 'Crossfade'
};
export const languages = { en: EN };
const VIEWS = ['spectrum', 'wipe', 'diff', 'level', 'stereo', 'waterfall', 'glow', 'radial'];
const unb64 = (s) => { const b = atob(s), a = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; };
const rgb = (x, c) => { x.fillStyle = '#000'; x.fillStyle = c; const t = x.fillStyle; if (t[0] === '#') return [1, 3, 5].map((i) => parseInt(t.substr(i, 2), 16)); const m = t.match(/[\d.]+/g); return m ? m.slice(0, 3).map(Number) : [0, 0, 0]; };
const num = (v, lang, d = 1) => { try { return new Intl.NumberFormat(lang, { maximumFractionDigits: d }).format(v); } catch (e) { return String(v); } };
const fhz = (v, lang) => (v >= 1000 ? num(v / 1000, lang) + ' kHz' : num(v, lang, 0) + ' Hz');
const pts = (db) => db.map((v, i) => [i * W / (db.length - 1), H * (1 - (Math.max(v, -60) + 60) / 60)]);
const line = (db) => pts(db).map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
const polys = (a, b, sign) => {   // zusammenhängende Läufe, in denen a um mehr als 2 dB über (sign 1) bzw. unter (-1) b liegt
  const n = a.length, out = [];
  let from = -1;
  for (let i = 0; i <= n; i++) {
    const ok = i < n && (a[i] - b[i]) * sign > 2;
    if (ok && from < 0) from = i;
    if (!ok && from >= 0) {
      const top = sign > 0 ? a : b, bot = sign > 0 ? b : a, P = pts(top), Q = pts(bot);
      const f = [];
      for (let j = from; j < i; j++) f.push((f.length ? 'L' : 'M') + P[j][0].toFixed(1) + ' ' + P[j][1].toFixed(1));
      for (let j = i - 1; j >= from; j--) f.push('L' + Q[j][0].toFixed(1) + ' ' + Q[j][1].toFixed(1));
      out.push(f.join(' ') + ' Z');
      from = -1;
    }
  }
  return out;
};
export function create(host, o) {
  const lang = o.lang || (host.lang || document.documentElement.lang || 'en').split('-')[0];
  const L = Object.assign({}, EN, languages[lang] || {}, o.labels || {});
  const d = o.data;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC || !d || !o.before || !o.after) return null;
  const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const id = 'pk' + (++uid);
  host.textContent = '';
  host.classList.add('pk');
  if (o.hero) host.classList.add('pk--hero');
  host.dataset.mode = 'after';
  host.dataset.view = 'spectrum';
  let lvl = null, mode = 'after', ctx = null, buf = null, nodes = {}, playing = false, offset = 0, started = 0, raf = null, mraf = null, master, an, fb, bands, last = 0;
  const sets = { before: d.before, after: d.after };
  let xf = 1, xfRaf = null;
  const head = E('div', { class: 'pk__head' }, host);
  const play = E('button', { type: 'button', class: 'pk__btn pk__play', 'aria-pressed': 'false' }, head, L.play);
  const grp = E('span', { class: 'pk__chips', role: 'group', 'aria-label': L.show }, head);
  const chips = {};
  for (const r of ['before', 'after']) chips[r] = E('button', { type: 'button', class: 'pk__chip', 'aria-pressed': r === 'after' ? 'true' : 'false', 'data-role': r }, grp, o[r].label || L[r]);
  const xl = E('label', { class: 'pk__mixl' }, head);
  E('span', {}, xl, L.mix);
  const xs = E('input', { type: 'range', min: 0, max: 100, value: 100, class: 'pk__xf', 'aria-label': L.mix + ': ' + (o.before.label || L.before) + ' / ' + (o.after.label || L.after) }, xl);
  const legend = E('span', { class: 'pk__legend' }, head);
  E('span', { class: 'pk__sw pk__sw--gain', 'aria-hidden': 'true' }, legend);
  legend.append(' ' + L.gain + ' ');
  E('span', { class: 'pk__sw pk__sw--loss', 'aria-hidden': 'true' }, legend);
  legend.append(' ' + L.loss);
  const status = E('p', { class: 'pk__sr', role: 'status', 'aria-live': 'polite' }, host);
  const hero = !!o.hero;
  const want = hero ? ['radial'] : (Array.isArray(o.views) && o.views.length ? o.views : o.view ? [o.view] : ['spectrum']).filter((v, i, a) => VIEWS.includes(v) && a.indexOf(v) === i && (v === 'spectrum' || v === 'glow' || v === 'waterfall' || v === 'radial' || (v === 'level' ? d.level : v === 'stereo' ? d.stereo : d.grams)));
  if (!want.length) want.push('spectrum');
  let view = want.includes(o.view) ? o.view : want[0];
  const vbtn = {};
  if (want.length > 1) {
    const vb = E('div', { class: 'pk__views', role: 'group', 'aria-label': L.view }, host);
    for (const v of want) vbtn[v] = E('button', { type: 'button', class: 'pk__vchip', 'aria-pressed': v === view ? 'true' : 'false', 'data-view': v }, vb, L['v_' + v]);
  }
  const vsp = E('div', { class: 'pk__v pk__v--spectrum' }, host);
  const plot = E('div', { class: 'pk__plot' }, vsp);
  const svg = S('svg', { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'none', role: 'img', 'aria-label': o.alt || L.alt, 'aria-describedby': id + '-sum', focusable: 'false' }, plot);
  const defs = S('defs', {}, svg);
  const ga = S('linearGradient', { id: id + 'a', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  S('stop', { offset: 0, class: 'pk__stop-a' }, ga); S('stop', { offset: 1, class: 'pk__stop-a pk__stop-a--end' }, ga);
  const gb = S('linearGradient', { id: id + 'b', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  S('stop', { offset: 0, class: 'pk__stop-b' }, gb); S('stop', { offset: 1, class: 'pk__stop-b pk__stop-b--end' }, gb);
  const pat = S('pattern', { id: id + 'h', width: 7, height: 7, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
  S('line', { x1: 0, y1: 0, x2: 0, y2: 7, class: 'pk__hatch' }, pat);
  const grid = S('g', { class: 'pk__grid' }, svg);
  S('line', { x1: 0, y1: H / 2, x2: W, y2: H / 2 }, grid); S('line', { x1: 0, y1: H, x2: W, y2: H }, grid);
  const hlr = S('rect', { class: 'pk__hl', x: 0, y: 0, width: 0, height: H }, svg);
  const diff = S('g', { class: 'pk__diff' }, svg);
  for (const p of polys(d.after, d.before, 1)) S('path', { class: 'pk__gain', d: p }, diff);
  for (const p of polys(d.after, d.before, -1)) S('path', { class: 'pk__loss', d: p, fill: `url(#${id}h)` }, diff);
  const ghost = S('path', { class: 'pk__ghost' }, svg);
  const area = S('path', { class: 'pk__area', fill: `url(#${id}a)` }, svg);
  const glow = S('path', { class: 'pk__glow' }, svg);
  const edge = S('path', { class: 'pk__edge' }, svg);
  const live = S('path', { class: 'pk__live', d: '' }, svg);
  const N = d.after.length;
  let lastX = -100;
  for (const g of d.peaks || []) {
    const idx = Math.max(0, Math.min(N - 1, Math.round(Math.log(g.hz / 60) / Math.log(200) * N - 0.5)));
    const px = idx / (N - 1) * 100;
    if (px - lastX < 11) continue;
    lastX = px;
    const s = E('span', { class: 'pk__peak' }, plot, g.label || (g.ratio ? '×' + num(g.ratio, lang) : fhz(g.hz, lang)));
    s.style.setProperty('left', px.toFixed(1) + '%');
    s.style.setProperty('top', (100 * (1 - (Math.max(d.after[idx], -60) + 60) / 60)).toFixed(1) + '%');
  }
  const ax = E('div', { class: 'pk__axis', 'aria-hidden': 'true' }, vsp);
  E('span', {}, ax, '60 Hz'); E('span', {}, ax, '1 kHz'); E('span', {}, ax, '12 kHz');
  let gram = null;
  if (d.spectrogram) {
    const gw = E('div', { class: 'pk__gramwrap' }, vsp);
    gram = E('div', { class: 'pk__gram', role: 'img', 'aria-label': L.gram }, gw);
    gram.style.setProperty('--pk-gram', `url(${d.spectrogram.after})`);
  }
  const part = (b) => (b.from <= 0 ? L.below.replace('{to}', fhz(b.to, lang)) : b.to >= 12000 ? L.above.replace('{from}', fhz(b.from, lang)) : L.between.replace('{from}', fhz(b.from, lang)).replace('{to}', fhz(b.to, lang)));
  const bs = (d.bands || []).filter((b) => Math.abs(b.delta) >= 3);
  const sum = bs.length ? bs.map((b) => (b.delta > 0 ? L.more : L.less).replace('{x}', part(b))).join(' ') : L.same;
  const pan = {}, cvs = {};
  const mk = (v) => {
    const p = E('div', { class: 'pk__v pk__v--' + v, hidden: '' }, host);
    const c = E('canvas', { class: 'pk__cv', role: 'img', 'aria-label': L['alt_' + v], 'aria-describedby': id + '-sum' }, p);
    cvs[v] = { c, x: c.getContext('2d'), w: 0, h: 0, k: 1 }; pan[v] = p;
    return p;
  };
  for (const v of want) if (v !== 'spectrum') mk(v);
  let rg = null;
  if (pan.wipe) rg = E('input', { type: 'range', min: 0, max: 100, value: 50, class: 'pk__range', 'aria-label': L.v_wipe + ': ' + (o.before.label || L.before) + ' / ' + (o.after.label || L.after) }, pan.wipe);
  const read = E('p', { class: 'pk__read', 'aria-live': 'off' }, host);
  const cap = E('p', { class: 'pk__cap', id: id + '-sum' }, host);
  const heard = E('span', { class: 'pk__heard' }, cap);
  const capS = E('strong', {}, cap, sum);
  const paint = (m, g) => {
    const l = line(m);
    area.setAttribute('d', l + ` L${W} ${H} L0 ${H} Z`); glow.setAttribute('d', l); edge.setAttribute('d', l); ghost.setAttribute('d', line(g));
  };
  const mixa0 = (a, b, t) => (t >= 1 ? b.slice() : t <= 0 ? a.slice() : a.map((v, i) => v + (b[i] - v) * t));
  const paintX = () => paint(mixa0(d.before, d.after, xf), mixa0(d.after, d.before, xf));
  paintX();
  const gainOf = (r) => (r === 'before' ? Math.cos(xf * 1.5708) : Math.sin(xf * 1.5708));
  const setXf = (v) => {
    xf = Math.max(0, Math.min(1, v));
    const m = xf >= .5 ? 'after' : 'before';
    if (m !== mode) {
      mode = m; host.dataset.mode = m;
      for (const r in chips) chips[r].setAttribute('aria-pressed', r === m ? 'true' : 'false');
      area.setAttribute('fill', `url(#${id}${m === 'after' ? 'a' : 'b'})`);
      if (gram && d.spectrogram) gram.style.setProperty('--pk-gram', `url(${d.spectrogram[m]})`);
      say();
    }
    xs.value = Math.round(xf * 100);
    xs.setAttribute('aria-valuetext', (o.after.label || L.after) + ' ' + Math.round(xf * 100) + ' %');
    paintX();
    if (playing) for (const r of ['before', 'after']) nodes[r].gain.gain.setTargetAtTime(gainOf(r), ctx.currentTime, 0.012);
    if (view !== 'spectrum') redraw();
  };
  const stopXf = () => { if (xfRaf) { cancelAnimationFrame(xfRaf); xfRaf = null; } };
  const tweenXf = (to) => {
    stopXf();
    if (reduce) { setXf(to); return; }
    const from = xf, t0 = performance.now();
    const st = (now) => { const k = Math.min(1, (now - t0) / 350), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; setXf(from + (to - from) * e); xfRaf = k < 1 ? requestAnimationFrame(st) : null; };
    xfRaf = requestAnimationFrame(st);
  };
  let say = () => {
    play.textContent = playing ? L.pause : L.play;
    play.setAttribute('aria-pressed', playing ? 'true' : 'false');
    const name = o[mode].label || L[mode];
    status.textContent = (playing ? L.playing : L.ready) + ': ' + name;
    heard.textContent = playing ? L.heard + ' ' + name + '. ' : '';
    host.dataset.playing = playing ? 'true' : 'false';
  };
  const setMode = (m) => tweenXf(m === 'after' ? 1 : 0);
  let C = null, gdat = null, gofs = 0, tex = null, texKey = '', wx = .5, wraf = null, gt = 0, hlast = 0, hist = [], introDone = false, hl = null, pr = null, plv = null, vis = true, docVis = !document.hidden, dead = false, wdrag = false, wsup = false, prq = false, wfg = null;
  const trail = new Float32Array(N).fill(-60), sdat = {}, sparks = [], WR = 36, wrows = [];
  const cx0 = document.createElement('canvas').getContext('2d');
  const PAL = { dark: ['#ff7a59', '#ffc24a', '#7dffa8', '#4fd1ff', '#9aa6ff'], light: ['#c2370f', '#a15c00', '#0a6a37', '#0a5fa8', '#4b3fc0'] };
  const mixa = (a, b, t) => (t >= 1 ? b.slice() : t <= 0 ? a.slice() : a.map((v, i) => v + (b[i] - v) * t));
  const fxu = (f) => Math.log(Math.max(60, Math.min(12000, f)) / 60) / Math.log(200);
  const uf = (u) => 60 * Math.pow(200, Math.max(0, Math.min(1, u)));
  const colors = () => {
    if (C) return C;
    const cs = getComputedStyle(host), g = (k) => cs.getPropertyValue(k).trim();
    C = { a: g('--pk-a'), b: g('--pk-b'), fg: g('--pk-fg'), mut: g('--pk-mut'), line: g('--pk-line'), bg: g('--pk-bg'), bg2: g('--pk-bg2'), font: cs.fontFamily };
    const bg = rgb(cx0, C.bg2); C.dark = (bg[0] + bg[1] + bg[2]) / 3 < 128; C.ra = rgb(cx0, C.a); C.rb = rgb(cx0, C.b);
    return C;
  };
  const cmix = (c, t) => `rgb(${c.rb.map((v, i) => Math.round(v + (c.ra[i] - v) * t)).join(',')})`;
  const fgrad = (x, w, c) => { const g = x.createLinearGradient(0, 0, w, 0); PAL[c.dark ? 'dark' : 'light'].forEach((col, i) => g.addColorStop(i / 4, col)); return g; };
  const fit = (v) => {
    const q = cvs[v], r = q.c.getBoundingClientRect(), k = window.devicePixelRatio || 1, w = Math.round(r.width * k), h = Math.round(r.height * k);
    if (!w || !h) return false;
    if (q.c.width !== w || q.c.height !== h) { q.c.width = w; q.c.height = h; }
    q.w = w; q.h = h; q.k = k;
    return true;
  };
  const tnow = () => (playing ? ctx.currentTime - started : offset);
  const bgfill = (q, c) => { if (hero) q.x.clearRect(0, 0, q.w, q.h); else { q.x.fillStyle = c.bg2; q.x.fillRect(0, 0, q.w, q.h); } };
  const lab = (q, c, t, px, py, al, col) => {
    const x = q.x, k = q.k;
    x.font = `600 ${13 * k}px ${c.font}`; x.textAlign = al; x.textBaseline = 'middle';
    const w = x.measureText(t).width, bx = al === 'left' ? px : al === 'right' ? px - w : px - w / 2;
    x.globalAlpha = .85; x.fillStyle = c.bg; x.fillRect(bx - 4 * k, py - 9 * k, w + 8 * k, 18 * k); x.globalAlpha = 1;
    x.fillStyle = col || c.fg; x.fillText(t, px, py);
  };
  const gd = () => {
    const g = d.grams;
    if (!gdat) { gdat = { before: unb64(g.before), after: unb64(g.after) }; let m = 0; for (let i = 0; i < gdat.after.length; i++) m = Math.max(m, gdat.after[i], gdat.before[i]); gofs = 80 - m * 80 / 255; }
    return gdat;
  };
  const textures = (c) => {
    const key = c.a + c.b + c.fg + c.bg2;
    if (tex && texKey === key) return tex;
    const g = d.grams, G = gd(), A = c.ra, B = c.rb, F = rgb(cx0, c.fg), n = g.w * g.h;
    const mkimg = (fn) => {
      const t = document.createElement('canvas'); t.width = g.w; t.height = g.h;
      const x = t.getContext('2d'), im = x.createImageData(g.w, g.h);
      for (let i = 0; i < n; i++) fn(i, im.data, i * 4);
      x.putImageData(im, 0, 0);
      return t;
    };
    const lev = (v) => Math.pow(Math.max(0, Math.min(1, (v * 80 / 255 - 10) / 70)), 1.6);
    const one = (src, col) => mkimg((i, p, j) => { p[j] = col[0]; p[j + 1] = col[1]; p[j + 2] = col[2]; p[j + 3] = Math.round(lev(src[i]) * 255); });
    tex = {
      before: one(G.before, B), after: one(G.after, A),
      base: mkimg((i, p, j) => { p[j] = F[0]; p[j + 1] = F[1]; p[j + 2] = F[2]; p[j + 3] = Math.round(lev(G.after[i]) * 70); }),
      diff: mkimg((i, p, j) => {
        const a = G.after[i], b = G.before[i], dd = (a - b) * 80 / 255;
        if (Math.max(a, b) < 64) return;
        const col = dd > 0 ? A : B;
        p[j] = col[0]; p[j + 1] = col[1]; p[j + 2] = col[2]; p[j + 3] = Math.round(Math.pow(Math.min(1, Math.abs(dd) / 16), .8) * 255);
      })
    };
    texKey = key;
    return tex;
  };
  const blit = (q, im) => {
    if (!im.sc || im.sc.width !== q.w || im.sc.height !== q.h) {
      const t = document.createElement('canvas'); t.width = q.w; t.height = q.h;
      const y = t.getContext('2d'); y.imageSmoothingEnabled = true; y.imageSmoothingQuality = 'high'; y.drawImage(im, 0, 0, q.w, q.h);
      im.sc = t;
    }
    q.x.drawImage(im.sc, 0, 0);
  };
  const axesTF = (q, c) => {
    const x = q.x, k = q.k, dur = d.grams.dur, y1 = q.h * (1 - fxu(1000));
    x.strokeStyle = c.line; x.lineWidth = k; x.globalAlpha = .7;
    x.beginPath(); x.moveTo(0, y1); x.lineTo(q.w, y1); x.stroke(); x.globalAlpha = 1;
    lab(q, c, fhz(12000, lang), 6 * k, 34 * k, 'left', c.mut);
    lab(q, c, fhz(1000, lang), 6 * k, y1 - 12 * k, 'left', c.mut);
    lab(q, c, fhz(60, lang), 6 * k, q.h - 12 * k, 'left', c.mut);
    const st = dur > 8 ? 2 : 1;
    for (let t = st; t < dur - .4; t += st) lab(q, c, num(t, lang, 0) + ' s', t / dur * q.w, q.h - 12 * k, 'center', c.mut);
  };
  const corner = (q, c, names) => {
    lab(q, c, names[0], 8 * q.k, 14 * q.k, 'left', c.b);
    lab(q, c, names[1], q.w - 8 * q.k, 14 * q.k, 'right', c.a);
  };
  const playhead = (q, c, span) => {
    if (!(playing || offset > 0) || !span) return;
    const t = tnow(); if (t < 0 || t > span) return;
    const x = q.x, px = Math.round(t / span * q.w);
    x.strokeStyle = c.fg; x.lineWidth = 2 * q.k; x.setLineDash([5 * q.k, 4 * q.k]); x.globalAlpha = .85;
    x.beginPath(); x.moveTo(px, 0); x.lineTo(px, q.h); x.stroke(); x.setLineDash([]); x.globalAlpha = 1;
  };
  const hlRange = () => (hl ? [fxu(hl.from > 0 ? hl.from : 60), fxu(hl.to >= 12000 || !hl.to ? 12000 : hl.to)] : null);
  const hlDraw = (q, c, kind) => {
    const r = hlRange(); if (!r) return;
    const x = q.x, k = q.k; x.globalAlpha = .16; x.fillStyle = c.fg;
    if (kind === 'y') x.fillRect(0, q.h * (1 - r[1]), q.w, q.h * (r[1] - r[0]));
    else x.fillRect(q.w * r[0], 0, q.w * (r[1] - r[0]), q.h);
    x.globalAlpha = .7; x.strokeStyle = c.fg; x.lineWidth = k;
    x.beginPath();
    if (kind === 'y') { x.moveTo(0, q.h * (1 - r[1])); x.lineTo(q.w, q.h * (1 - r[1])); x.moveTo(0, q.h * (1 - r[0])); x.lineTo(q.w, q.h * (1 - r[0])); } else { x.moveTo(q.w * r[0], 0); x.lineTo(q.w * r[0], q.h); x.moveTo(q.w * r[1], 0); x.lineTo(q.w * r[1], q.h); }
    x.stroke(); x.globalAlpha = 1;
  };
  const nm = [o.before.label || L.before, o.after.label || L.after];
  const cell = (v) => { const g = d.grams, G = gd(), q = cvs[v], cx = Math.min(g.w - 1, Math.max(0, Math.floor(pr.x / q.w * g.w))), cy = Math.min(g.h - 1, Math.max(0, Math.floor(pr.y / q.h * g.h))); return [G.before[cy * g.w + cx] * 80 / 255 - 80 + gofs, G.after[cy * g.w + cx] * 80 / 255 - 80 + gofs]; };
  const drawWipe = (q, c) => {
    const T = textures(c), x = q.x, k = q.k, sx = Math.round(wx * q.w);
    bgfill(q, c);
    x.save(); x.beginPath(); x.rect(0, 0, sx, q.h); x.clip(); blit(q, T.before); x.restore();
    x.save(); x.beginPath(); x.rect(sx, 0, q.w - sx, q.h); x.clip(); blit(q, T.after); x.restore();
    axesTF(q, c); hlDraw(q, c, 'y'); playhead(q, c, d.grams.dur); corner(q, c, nm);
    x.fillStyle = c.fg; x.fillRect(sx - k, 0, 2 * k, q.h);
    const cy = q.h / 2, r = 15 * k;
    x.beginPath(); x.arc(sx, cy, r, 0, 6.2832); x.fillStyle = c.bg; x.fill(); x.lineWidth = 2 * k; x.strokeStyle = c.fg; x.stroke();
    x.fillStyle = c.fg; x.beginPath(); x.moveTo(sx - 4 * k, cy - 6 * k); x.lineTo(sx - 10 * k, cy); x.lineTo(sx - 4 * k, cy + 6 * k); x.closePath();
    x.moveTo(sx + 4 * k, cy - 6 * k); x.lineTo(sx + 10 * k, cy); x.lineTo(sx + 4 * k, cy + 6 * k); x.closePath(); x.fill();
  };
  const drawDiff = (q, c) => {
    const T = textures(c), x = q.x;
    bgfill(q, c); blit(q, T.base); x.globalAlpha = xf; blit(q, T.diff); x.globalAlpha = 1; axesTF(q, c); hlDraw(q, c, 'y'); playhead(q, c, d.grams.dur);
    lab(q, c, L.loss, 8 * q.k, 14 * q.k, 'left', c.b); lab(q, c, L.gain, q.w - 8 * q.k, 14 * q.k, 'right', c.a);
  };
  const drawLevel = (q, c) => {
    const x = q.x, k = q.k, lv = d.level, n = lv.before.rms.length, mx = Math.max(...lv.before.peak, ...lv.after.peak);
    const top = Math.min(0, Math.ceil(mx / 12) * 12), span = 60, padT = 34 * k, padB = 30 * k;
    const X = (i) => i / (n - 1) * q.w, Y = (v) => padT + (q.h - padT - padB) * (1 - (Math.max(top - span, Math.min(top, v)) - (top - span)) / span);
    bgfill(q, c);
    x.strokeStyle = c.line; x.lineWidth = k;
    for (let v = top; v >= top - span; v -= 12) { x.beginPath(); x.moveTo(0, Y(v)); x.lineTo(q.w, Y(v)); x.stroke(); }
    for (let v = top - 12; v >= top - span + 12; v -= 12) lab(q, c, num(v, lang, 0) + ' dB', q.w - 6 * k, Y(v) - 11 * k, 'right', c.mut);
    const path = (arr, close) => {
      x.beginPath(); arr.forEach((v, i) => (i ? x.lineTo(X(i), Y(v)) : x.moveTo(X(i), Y(v))));
      if (close) { x.lineTo(q.w, Y(top - span)); x.lineTo(0, Y(top - span)); x.closePath(); }
    };
    for (const [tag, col, dash] of [['before', c.b, true], ['after', c.a, false]]) {
      const s = lv[tag], wgt = tag === 'after' ? xf : 1 - xf;
      path(s.rms, true); x.globalAlpha = tag === 'after' ? .1 + .2 * xf : .1 + .06 * (1 - xf) + .06; x.fillStyle = col; x.fill();
      path(s.peak, false); x.strokeStyle = col; x.globalAlpha = .3 + .25 * wgt; x.lineWidth = 1.2 * k; x.stroke(); x.globalAlpha = 1;
      path(s.rms, false); x.lineWidth = (1.6 + .8 * wgt) * k; x.lineJoin = 'round'; x.setLineDash(dash ? [6 * k, 4 * k] : []); x.stroke(); x.setLineDash([]);
    }
    const st = lv.dur > 8 ? 2 : 1;
    for (let t = st; t < lv.dur - .4; t += st) lab(q, c, num(t, lang, 0) + ' s', t / lv.dur * q.w, q.h - 12 * k, 'center', c.mut);
    corner(q, c, nm); playhead(q, c, lv.dur);
  };
  const unbCache = (t) => sdat[t] || (sdat[t] = unb64(d.stereo[t].d));
  const gon = {}, ghist = { before: [], after: [] }, corrS = { before: null, after: null };
  let gscale = .05, slowT = null;
  const readGon = () => {
    let pk = 0;
    for (const tag of ['before', 'after']) {
      const t = nodes[tag] && nodes[tag].tap; if (!t || !t.sp) continue;
      const n = t.bl.length, step = 4, pts = new Float32Array(2 * (n / step)); let ll = 0, rr = 0, lr = 0;
      for (let i = 0; i < n; i++) { ll += t.bl[i] * t.bl[i]; rr += t.br[i] * t.br[i]; lr += t.bl[i] * t.br[i]; }
      for (let i = 0, j = 0; i < n; i += step, j += 2) { pts[j] = (t.bl[i] - t.br[i]) * .7071; pts[j + 1] = (t.bl[i] + t.br[i]) * .7071; pk = Math.max(pk, Math.abs(pts[j]), Math.abs(pts[j + 1])); }
      const den = Math.sqrt(ll * rr), cr = den > 1e-9 ? lr / den : 0;
      corrS[tag] = corrS[tag] == null ? cr : corrS[tag] * .85 + cr * .15;
      if (!reduce) { ghist[tag].push(pts); if (ghist[tag].length > 5) ghist[tag].shift(); }
      gon[tag] = pts;
    }
    gscale = Math.max(.05, pk, gscale * .985);
  };
  const clearGon = () => { gon.before = gon.after = null; ghist.before.length = ghist.after.length = 0; corrS.before = corrS.after = null; };
  const drawStereo = (q, c) => {
    const x = q.x, k = q.k, st = d.stereo, G = st.n, R = Math.max(10 * k, Math.min(q.h / 2 - 48 * k, q.w / 4 - 40 * k)), cl = 2 * R / G, s2 = R * .7071, live = playing && gon.before && gon.after;
    bgfill(q, c);
    [['before', c.b, q.w * .25], ['after', c.a, q.w * .75]].forEach(([tag, col, cx], pi) => {
      const cy = q.h / 2 - 20 * k, dat = unbCache(tag), wgt = Math.max(.15, gainOf(tag));
      x.strokeStyle = c.line; x.lineWidth = k;
      x.beginPath(); x.arc(cx, cy, R, 0, 6.2832); x.moveTo(cx, cy - R); x.lineTo(cx, cy + R); x.moveTo(cx - R, cy); x.lineTo(cx + R, cy);
      x.moveTo(cx - s2, cy - s2); x.lineTo(cx + s2, cy + s2); x.moveTo(cx + s2, cy - s2); x.lineTo(cx - s2, cy + s2); x.stroke();
      x.fillStyle = col;
      const dim = live ? .3 : 1;
      for (let i = 0; i < G; i++) for (let j = 0; j < G; j++) {
        const v = dat[i * G + j]; if (v < 6) continue;
        const t = v / 255, px = cx + (-1 + (j + .5) * 2 / G) * R, py = cy - (-1 + (i + .5) * 2 / G) * R;
        x.globalAlpha = (.18 + .82 * t) * dim; x.beginPath(); x.arc(px, py, cl * (.45 + .6 * t), 0, 6.2832); x.fill();
      }
      if (live) {
        const dot = (pts, al) => { x.globalAlpha = al; for (let j = 0; j < pts.length; j += 2) x.fillRect(cx + pts[j] / gscale * R * .92 - k, cy - pts[j + 1] / gscale * R * .92 - k, 2 * k, 2 * k); };
        const hs = ghist[tag];
        hs.forEach((h, i) => dot(h, (.04 + .16 * (i + 1) / hs.length) * (.3 + .7 * wgt)));
        dot(gon[tag], (.45 + .45 * wgt));
      }
      x.globalAlpha = 1;
      lab(q, c, 'L', cx - s2 - 12 * k, cy - s2 - 6 * k, 'center', c.mut); lab(q, c, 'R', cx + s2 + 12 * k, cy - s2 - 6 * k, 'center', c.mut);
      const cr = live && corrS[tag] != null ? corrS[tag] : st[tag].corr, ym = q.h - 36 * k;
      x.fillStyle = c.line; x.fillRect(cx - R, ym - 4 * k, 2 * R, 8 * k);
      x.fillStyle = col; x.globalAlpha = .55 + .45 * wgt; x.fillRect(cr >= 0 ? cx : cx + cr * R, ym - 4 * k, Math.abs(cr) * R, 8 * k); x.globalAlpha = 1;
      x.fillStyle = c.fg; x.fillRect(cx - k, ym - 7 * k, 2 * k, 14 * k);
      lab(q, c, '−1', cx - R - 6 * k, ym, 'right', c.mut); lab(q, c, '+1', cx + R + 6 * k, ym, 'left', c.mut);
      lab(q, c, nm[pi] + ' · ' + L.corr + ' ' + num(cr, lang, 2), cx, q.h - 14 * k, 'center', col);
    });
    if (!live) lab(q, c, '▶ ' + L.stereo_idle, q.w / 2, 14 * k, 'center', c.fg);
  };
  const smooth = (x, arr, Wd, Y) => {
    x.beginPath();
    arr.forEach((v, i) => {
      const px = i / (N - 1) * Wd, py = Y(v);
      if (!i) x.moveTo(px, py); else x.quadraticCurveTo((i - 1) / (N - 1) * Wd, Y(arr[i - 1]), (i - .5) / (N - 1) * Wd, (Y(arr[i - 1]) + py) / 2);
    });
  };
  const curve = () => mixa(d.before, d.after, xf);
  const drawGlow = (q, c, now) => {
    const x = q.x, k = q.k, dt = Math.min(.1, Math.max(0, (now - gt) / 1000)); gt = now;
    const live = playing && lvl, Y = (v) => q.h * (.1 + .78 * (1 - (Math.max(-60, Math.min(0, v)) + 60) / 60)), col = cmix(c, xf), fg = fgrad(x, q.w, c);
    for (let i = 0; i < N; i++) trail[i] = live ? Math.max(lvl[i], trail[i] - 20 * dt) : -60;
    if (live) { if (now - hlast > 70) { hist.push(Float32Array.from(trail)); if (hist.length > 6) hist.shift(); hlast = now; } } else hist.length = 0;
    bgfill(q, c);
    x.strokeStyle = c.line; x.lineWidth = k; for (const f of [.25, .5, .75]) { x.beginPath(); x.moveTo(0, q.h * f); x.lineTo(q.w, q.h * f); x.stroke(); }
    hlDraw(q, c, 'x');
    smooth(x, curve(), q.w, Y); x.strokeStyle = c.mut; x.lineWidth = 1.5 * k; x.setLineDash([5 * k, 4 * k]); x.globalAlpha = .8; x.stroke(); x.setLineDash([]); x.globalAlpha = 1;
    if (live) {
      hist.forEach((h, i) => { smooth(x, h, q.w, Y); x.strokeStyle = fg; x.globalAlpha = .04 + .2 * (i + 1) / hist.length; x.lineWidth = 1.4 * k; x.stroke(); });
      x.globalAlpha = 1;
      smooth(x, trail, q.w, Y); x.lineTo(q.w, q.h); x.lineTo(0, q.h); x.closePath();
      const gr = x.createLinearGradient(0, 0, 0, q.h); gr.addColorStop(0, col); gr.addColorStop(1, 'transparent');
      x.globalAlpha = .38; x.fillStyle = fg; x.fill(); x.globalAlpha = .3; x.fillStyle = gr; x.fill(); x.globalAlpha = 1;
      smooth(x, lvl, q.w, Y); x.strokeStyle = fg; x.lineJoin = 'round'; x.globalAlpha = .22; x.lineWidth = 8 * k; x.stroke(); x.globalAlpha = 1; x.lineWidth = 2.4 * k; x.stroke();
      if (!reduce) {
        if (plv) for (let i = 1; i < N - 1 && sparks.length < 36; i++) {
          if (lvl[i] > -14 && lvl[i] >= lvl[i - 1] && lvl[i] >= lvl[i + 1] && lvl[i] - plv[i] > 5 && Math.random() < .5) sparks.push({ x: i / (N - 1) * q.w, y: Y(lvl[i]), vx: (Math.random() - .5) * 60 * k, vy: -(40 + Math.random() * 70) * k, life: 1, u: i / (N - 1) });
        }
        plv = lvl.slice();
      }
    } else plv = null;
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i]; s.life -= dt * 1.7; s.vy += 160 * k * dt; s.x += s.vx * dt; s.y += s.vy * dt;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      x.globalAlpha = s.life; x.fillStyle = PAL[c.dark ? 'dark' : 'light'][Math.min(4, Math.round(s.u * 4))]; x.beginPath(); x.arc(s.x, s.y, 2.2 * k * s.life + .6 * k, 0, 6.2832); x.fill();
    }
    x.globalAlpha = 1;
    if (!live) lab(q, c, L.glow_idle, q.w / 2, q.h / 2, 'center', c.fg);
    lab(q, c, fhz(60, lang), 6 * k, q.h - 12 * k, 'left', c.mut); lab(q, c, fhz(1000, lang), q.w / 2, q.h - 12 * k, 'center', c.mut); lab(q, c, fhz(12000, lang), q.w - 6 * k, q.h - 12 * k, 'right', c.mut);
  };
  const rowAt = (t, out) => {
    const g = d.grams;
    if (!g) { const cv = curve(); for (let i = 0; i < N; i++) out[i] = cv[i] + 10; return; }
    const G = gd(), cp = Math.max(0, Math.min(g.w - 1.001, t / g.dur * (g.w - 1))), c0 = cp | 0, fr = cp - c0;
    for (let i = 0; i < N; i++) {
      const r = g.h - 1 - Math.min(g.h - 1, ((i + .5) / N * g.h) | 0), a0 = r * g.w + c0;
      const vb = G.before[a0] * (1 - fr) + G.before[a0 + 1] * fr, va = G.after[a0] * (1 - fr) + G.after[a0 + 1] * fr;
      out[i] = (vb + (va - vb) * xf) * 80 / 255 - 80 + gofs;
    }
  };
  const WSL = .4, WYB = .93, WYS = .5;
  const drawWaterfall = (q, c) => {
    const x = q.x, k = q.k, g = d.grams, span = Math.min(6, g ? g.dur : 6);
    const tf = playing || offset > 0 ? Math.max(0, tnow()) : span, fg = fgrad(x, q.w, c);
    wfg = { tf, span, w: q.w, h: q.h };
    bgfill(q, c);
    x.lineJoin = 'round';
    for (let r = WR - 1; r >= 0; r--) {
      const z = r / (WR - 1), t = tf - z * span;
      if (t < 0) continue;
      const row = wrows[r] || (wrows[r] = new Float32Array(N)); rowAt(t, row);
      const sc = 1 - WSL * z, yb = q.h * (WYB - WYS * z), amp = q.h * .42 * (1 - .45 * z);
      x.beginPath(); x.moveTo(q.w * (.5 - .5 * sc), yb);
      for (let i = 0; i < N; i++) x.lineTo(q.w * (.5 + (i / (N - 1) - .5) * sc), yb - amp * Math.max(0, Math.min(1, (row[i] + 50) / 50)));
      x.lineTo(q.w * (.5 + .5 * sc), yb); x.closePath();
      x.fillStyle = c.bg2; x.globalAlpha = 1; x.fill();
      if (r % 3 === 0) { x.fillStyle = fg; x.globalAlpha = .12 + .2 * (1 - z); x.fill(); }
      x.strokeStyle = fg; x.globalAlpha = r === 0 ? 1 : .85 - .6 * z; x.lineWidth = (r === 0 ? 2.6 : 1.5 - .5 * z) * k;
      x.stroke();
      if (r === 0) { x.globalAlpha = .3; x.lineWidth = 6 * k; x.stroke(); }
    }
    x.globalAlpha = 1;
    if (hl) {
      const r = hlRange(); x.globalAlpha = .16; x.fillStyle = c.fg; x.beginPath();
      [[0, r[0]], [0, r[1]], [1, r[1]], [1, r[0]]].forEach(([z, u], j) => { const px = q.w * (.5 + (u - .5) * (1 - WSL * z)), py = q.h * (WYB - WYS * z); if (j) x.lineTo(px, py); else x.moveTo(px, py); });
      x.closePath(); x.fill(); x.globalAlpha = 1;
    }
    lab(q, c, fhz(60, lang), 6 * k, q.h - 12 * k, 'left', c.mut); lab(q, c, fhz(1000, lang), q.w * (.5 + (fxu(1000) - .5)), q.h - 12 * k, 'center', c.mut); lab(q, c, fhz(12000, lang), q.w - 6 * k, q.h - 12 * k, 'right', c.mut);
  };
  const RN = 256;
  const drawRadial = (q, c, now) => {
    const x = q.x, k = q.k, cx = q.w / 2, cy = q.h / 2, R = Math.min(q.w, q.h) / 2 - (hero ? 6 : 30) * k, anim = !reduce;
    const rot = anim ? now * (playing ? .00006 : .00002) : 0, br = anim ? 1 + .045 * Math.sin(now * .0021) : 1, s = playing && lvl ? .6 : 0;
    bgfill(q, c);
    const cvB = d.before, cvA = d.after;
    x.strokeStyle = c.line; x.lineWidth = k;
    for (const f of [.3, .55, .8, 1]) { x.beginPath(); x.arc(cx, cy, R * f, 0, 6.2832); x.stroke(); }
    const ring = (arr, base, amp, col, wgt, glowK) => {
      x.beginPath();
      for (let j = 0; j <= RN; j++) {
        const jj = j % RN, hf = jj <= RN / 2 ? jj / (RN / 2) : (RN - jj) / (RN / 2), fi = hf * (N - 1), i0 = Math.min(N - 2, fi | 0), fr = fi - i0;
        let v = (Math.max(-60, arr[i0] + (arr[i0 + 1] - arr[i0]) * fr) + 60) / 60;
        if (s) { const l = (Math.max(-60, lvl[i0] + (lvl[i0 + 1] - lvl[i0]) * fr) + 60) / 60; v = v * (1 - s) + l * s; }
        const rr = R * (base + amp * v * br), a = -1.5708 + jj / RN * 6.2832 + rot;
        if (!j) x.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); else x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
      }
      x.closePath();
      const gr = x.createRadialGradient(cx, cy, R * base, cx, cy, R * (base + amp));
      gr.addColorStop(0, 'transparent'); gr.addColorStop(1, col);
      x.globalAlpha = .12 + .3 * wgt; x.fillStyle = gr; x.fill();
      x.globalAlpha = .45 + .55 * wgt; x.strokeStyle = col; x.lineWidth = (1.4 + 1.4 * wgt) * k; x.lineJoin = 'round';
      x.stroke(); x.globalAlpha = .12 * wgt; x.lineWidth = (6 + glowK * .3) * k; x.stroke(); x.globalAlpha = 1;
    };
    ring(cvB, .2, .22, c.b, 1 - xf, 12); ring(cvA, .5, .46, c.a, xf, 16);
    if (!hero) {
      hlDraw(q, c, 'x');
      lab(q, c, fhz(60, lang), cx, cy - R - 12 * k, 'center', c.mut); lab(q, c, fhz(12000, lang), cx, cy + R + 12 * k, 'center', c.mut);
      lab(q, c, nm[0], cx, cy - 10 * k, 'center', c.b); lab(q, c, nm[1], cx, cy + 12 * k, 'center', c.a);
    }
  };
  const drawers = { wipe: drawWipe, diff: drawDiff, level: drawLevel, stereo: drawStereo, waterfall: drawWaterfall, glow: drawGlow, radial: drawRadial };
  const probe = () => {
    const q = cvs[view], x = pr.x, y = pr.y, f1 = (v) => num(v, lang, 0);
    if (view === 'wipe' || view === 'diff') {
      const g = d.grams, t = x / q.w * g.dur, f = uf(1 - y / q.h), [vb, va] = cell(view);
      return { t, tx: fhz(f, lang) + ' · ' + (view === 'wipe' ? f1(x / q.w < wx ? vb : va) + ' dB' : (va - vb > 0 ? '+' : '') + num(va - vb, lang, 1) + ' dB') + ' · ' + num(t, lang, 1) + ' s', seek: true };
    }
    if (view === 'level') {
      const lv = d.level, n = lv.before.rms.length, i = Math.max(0, Math.min(n - 1, Math.round(x / q.w * (n - 1)))), t = x / q.w * lv.dur;
      return { t, tx: num(t, lang, 1) + ' s · ' + nm[0] + ': ' + f1(lv.before.rms[i]) + ' dB · ' + nm[1] + ': ' + f1(lv.after.rms[i]) + ' dB', seek: true };
    }
    if (view === 'glow') { const u = x / q.w, cv = curve(); return { tx: fhz(uf(u), lang) + ' · ' + f1(cv[Math.round(u * (N - 1))]) + ' dB' }; }
    if (view === 'waterfall' && wfg) {
      const z = Math.max(0, Math.min(1, (WYB - y / q.h) / WYS)), t = Math.max(0, wfg.tf - z * wfg.span), u = (x / q.w - .5) / (1 - WSL * z) + .5, row = new Float32Array(N); rowAt(t, row);
      if (u < 0 || u > 1) return { t, tx: num(t, lang, 1) + ' s', seek: true };
      return { t, tx: fhz(uf(u), lang) + ' · ' + f1(row[Math.round(u * (N - 1))]) + ' dB · ' + num(t, lang, 1) + ' s', seek: true };
    }
    if (view === 'radial') {
      const a = (Math.atan2(y - q.h / 2, x - q.w / 2) + 1.5708 + 6.2832) % 6.2832, hf = a <= 3.1416 ? a / 3.1416 : (6.2832 - a) / 3.1416, cv = curve();
      return { tx: fhz(uf(hf), lang) + ' · ' + f1(cv[Math.round(hf * (N - 1))]) + ' dB' };
    }
    return null;
  };
  let pinfo = null;
  const drawLens = (q, c) => {
    pinfo = null;
    if (!pr || hero) { if (read.textContent) read.textContent = ''; return; }
    pinfo = probe();
    if (!pinfo) return;
    const x = q.x, k = q.k;
    x.strokeStyle = c.fg; x.lineWidth = k; x.globalAlpha = .55; x.setLineDash([3 * k, 3 * k]);
    x.beginPath(); x.moveTo(pr.x, 0); x.lineTo(pr.x, q.h); if (view !== 'level' && view !== 'glow') { x.moveTo(0, pr.y); x.lineTo(q.w, pr.y); } x.stroke(); x.setLineDash([]); x.globalAlpha = 1;
    x.beginPath(); x.arc(pr.x, pr.y, 5 * k, 0, 6.2832); x.fillStyle = c.bg; x.fill(); x.lineWidth = 2 * k; x.stroke();
    const right = pr.x > q.w * .55;
    lab(q, c, pinfo.tx, right ? pr.x - 12 * k : pr.x + 12 * k, Math.max(30 * k, Math.min(q.h - 30 * k, pr.y - 20 * k)), right ? 'right' : 'left');
    if (read.textContent !== pinfo.tx) read.textContent = pinfo.tx;
  };
  const redraw = (now) => {
    if (view === 'spectrum' || !fit(view)) return;
    const q = cvs[view], c = colors();
    drawers[view](q, c, now || performance.now());
    drawLens(q, c);
  };
  const askRedraw = () => { if (prq || dead) return; prq = true; requestAnimationFrame(() => { prq = false; if (!dead) redraw(); }); };
  const lvText = () => {
    const a = d.level.after.rms, b = d.level.before.rms; let s = 0, n = 0;
    for (let i = 0; i < a.length; i++) if (Math.max(a[i], b[i]) > -60) { s += a[i] - b[i]; n++; }
    const m = n ? s / n : 0;
    return Math.abs(m) < .5 ? L.lv_same : (m > 0 ? L.lv_louder : L.lv_quieter).replace('{x}', num(Math.abs(m), lang));
  };
  const setHl = (b) => {
    hl = b ? { from: b.from, to: b.to } : null;
    const r = hlRange();
    hlr.setAttribute('x', r ? (r[0] * W).toFixed(1) : 0); hlr.setAttribute('width', r ? ((r[1] - r[0]) * W).toFixed(1) : 0);
    redraw();
  };
  const setCap = (v) => {
    capS.textContent = '';
    if (v === 'level') capS.textContent = lvText();
    else if (v === 'stereo') capS.textContent = nm[0] + ': ' + L.corr + ' ' + num(d.stereo.before.corr, lang, 2) + '; ' + nm[1] + ': ' + num(d.stereo.after.corr, lang, 2) + '.';
    else if (!bs.length) capS.textContent = L.same;
    else bs.forEach((b, i) => {
      if (i) capS.append(' ');
      const sp = E('span', { class: 'pk__band', tabindex: '0' }, capS, (b.delta > 0 ? L.more : L.less).replace('{x}', part(b)));
      for (const ev of ['mouseenter', 'focus']) sp.addEventListener(ev, () => setHl(b));
      for (const ev of ['mouseleave', 'blur']) sp.addEventListener(ev, () => setHl(null));
    });
  };
  const setWx = (v) => { wx = Math.max(0, Math.min(1, v)); if (rg) rg.value = Math.round(wx * 100); redraw(); };
  const stopIntro = () => { if (wraf) { cancelAnimationFrame(wraf); wraf = null; } introDone = true; };
  const intro = () => {
    if (introDone || reduce) return;
    introDone = true; const t0 = performance.now();
    const st = (now) => { const kk = Math.min(1, (now - t0) / 900); setWx(.92 + (.5 - .92) * (1 - Math.pow(1 - kk, 3))); wraf = kk < 1 ? requestAnimationFrame(st) : null; };
    wraf = requestAnimationFrame(st);
  };
  const amb = () => !reduce && view === 'radial';
  const kick = () => { if (!raf && !dead && vis && docVis && (playing || amb())) raf = requestAnimationFrame(frame); };
  const setView = (v) => {
    if (!want.includes(v)) return;
    view = v; C = null; pr = null; hl = null; hlr.setAttribute('width', 0); host.dataset.view = v;
    vsp.hidden = v !== 'spectrum';
    for (const k in pan) pan[k].hidden = k !== v;
    const shown = v === 'spectrum' ? vsp : pan[v];
    if (!reduce && !hero) { shown.classList.remove('pk__in'); void shown.offsetWidth; shown.classList.add('pk__in'); }
    for (const k in vbtn) vbtn[k].setAttribute('aria-pressed', k === v ? 'true' : 'false');
    legend.hidden = !(v === 'spectrum' || v === 'diff');
    read.hidden = v === 'spectrum' || hero; read.textContent = '';
    setCap(v);
    if (v === 'wipe') intro();
    redraw();
    kick();
    if (want.length > 1) status.textContent = L['v_' + v];
  };
  for (const v in vbtn) vbtn[v].addEventListener('click', () => setView(v));
  const seekable = { wipe: 1, diff: 1, level: 1, waterfall: 1 };
  const seek = async (t) => { if (playing) stop(false); offset = Math.max(0, t); await toggle(); };
  const toPx = (e, q) => { const r = q.c.getBoundingClientRect(); return { x: (e.clientX - r.left) * q.w / r.width, y: (e.clientY - r.top) * q.h / r.height }; };
  for (const v in cvs) {
    const q = cvs[v], cv = q.c;
    cv.tabIndex = 0;
    if (seekable[v]) cv.classList.add('pk__seek');
    cv.addEventListener('pointermove', (e) => {
      if (v === 'wipe' && wdrag) { stopIntro(); const r = cv.getBoundingClientRect(); setWx((e.clientX - r.left) / r.width); return; }
      if (q.w) { pr = toPx(e, q); askRedraw(); }
    });
    cv.addEventListener('pointerleave', () => { if (!wdrag) { pr = null; askRedraw(); } });
    cv.addEventListener('blur', () => { pr = null; askRedraw(); });
    cv.addEventListener('pointerdown', (e) => {
      if (v !== 'wipe' || !q.w) return;
      const p = toPx(e, q);
      if (Math.abs(p.x - wx * q.w) < 28 * q.k) { wdrag = true; wsup = true; stopIntro(); cv.setPointerCapture(e.pointerId); }
    });
    cv.addEventListener('pointerup', () => { wdrag = false; });
    cv.addEventListener('click', (e) => {
      if (wsup) { wsup = false; return; }
      if (!seekable[v] || !q.w) return;
      pr = toPx(e, q); redraw();
      if (pinfo && pinfo.seek) seek(pinfo.t);
    });
    cv.addEventListener('keydown', (e) => {
      if (!q.w) return;
      const st = e.shiftKey ? .1 : .03, mv = { ArrowLeft: [-st, 0], ArrowRight: [st, 0], ArrowUp: [0, -st], ArrowDown: [0, st] }[e.key];
      if (mv) { e.preventDefault(); pr = pr || { x: q.w / 2, y: q.h / 2 }; pr = { x: Math.max(0, Math.min(q.w, pr.x + mv[0] * q.w)), y: Math.max(0, Math.min(q.h, pr.y + mv[1] * q.h)) }; if (v === 'wipe' && e.altKey) setWx(pr.x / q.w); askRedraw(); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (hero) toggle(); else if (seekable[v] && pr) { redraw(); if (pinfo && pinfo.seek) seek(pinfo.t); } }
      else if (e.key === 'Escape') { pr = null; askRedraw(); }
    });
  }
  if (rg) rg.addEventListener('input', () => { stopIntro(); setWx(rg.value / 100); });
  const rerun = () => { C = null; tex = null; redraw(); };
  let ro = null, mo = null, mq = null, io = null;
  const vc = () => { docVis = !document.hidden; if (docVis) { kick(); redraw(); } };
  if (want.length > 1 || view !== 'spectrum') {
    if (window.ResizeObserver) { ro = new ResizeObserver(() => redraw()); ro.observe(host); }
    mo = new MutationObserver(rerun); mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
    if (window.matchMedia) { mq = window.matchMedia('(prefers-color-scheme: dark)'); if (mq.addEventListener) mq.addEventListener('change', rerun); }
  }
  if (window.IntersectionObserver) { io = new IntersectionObserver((es) => { vis = es[es.length - 1].isIntersecting; if (vis) { kick(); redraw(); } }); io.observe(host); }
  document.addEventListener('visibilitychange', vc);
  const bandsFor = () => {
    const hz = ctx.sampleRate / an.fftSize;
    return Array.from({ length: N }, (_, i) => {
      const lo = 60 * Math.pow(200, i / N), hi = 60 * Math.pow(200, (i + 1) / N), a = Math.max(1, Math.floor(lo / hz));
      return [a, Math.max(a + 1, Math.floor(hi / hz))];
    });
  };
  const frame = () => {
    raf = null;
    if (dead || !vis || !docVis || !(playing || amb())) return;
    const now = performance.now();
    if (playing && now - last > 33) {
      last = now;
      an.getFloatFrequencyData(fb);
      const p = bands.map(([a, b]) => { let s = 0; for (let i = a; i < b; i++) s += Math.pow(10, fb[i] / 10); return s; });
      const mx = Math.max(...p, 1e-8);
      lvl = p.map((v) => Math.max(10 * Math.log10(Math.max(v, 1e-20) / mx), -60));
      live.setAttribute('d', line(lvl));
      if (view === 'wipe' || view === 'diff' || view === 'level') redraw(now);
    }
    if (view === 'stereo' && playing) readGon();
    if (view === 'glow' || view === 'radial' || (view === 'waterfall' && playing) || (view === 'stereo' && playing)) redraw(now);
    raf = requestAnimationFrame(frame);
  };
  const stop = (ended) => {
    if (!playing) return;
    if (!ended) offset = ctx.currentTime - started;
    for (const n of Object.values(nodes)) { n.src.onended = null; try { n.src.stop(); } catch (e) { /* schon beendet */ } if (n.tap && n.tap.sp) { n.tap.sp.onaudioprocess = null; try { n.tap.sp.disconnect(); } catch (e) { /* schon getrennt */ } } }
    if (slowT) { clearInterval(slowT); slowT = null; }
    clearGon();
    playing = false;
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    live.setAttribute('d', '');
    lvl = null;
    sparks.length = 0; plv = null;
    if (view !== 'spectrum') redraw();
    kick();
    if (current === api) current = null;
    say();
  };
  const toggle = async () => {
    if (playing) { stop(false); return; }
    if (!ctx) ctx = new AC();
    await ctx.resume();
    try {
      if (!buf) {
        const get = async (u) => ctx.decodeAudioData(await (await fetch(u)).arrayBuffer());
        buf = { before: await get(o.before.src), after: await get(o.after.src) };
      }
    } catch (e) { status.textContent = L.error; heard.textContent = L.error + ' '; return; }
    if (current && current !== api) current.stop();
    current = api;
    if (!master) {
      master = ctx.createGain(); an = ctx.createAnalyser(); an.fftSize = 4096; an.smoothingTimeConstant = 0.6;
      master.connect(an); an.connect(ctx.destination);
      fb = new Float32Array(an.frequencyBinCount); bands = bandsFor();
    }
    if (offset >= buf.after.duration - 0.05) offset = 0;
    nodes = {};
    for (const r of ['before', 'after']) {
      const src = ctx.createBufferSource(), gain = ctx.createGain();
      src.buffer = buf[r]; gain.gain.value = gainOf(r);
      src.connect(gain).connect(master); src.start(0, offset);
      const tap = { bl: new Float32Array(1024), br: new Float32Array(1024), sp: null };
      if (ctx.createScriptProcessor) {
        const sp = ctx.createScriptProcessor(1024, 2, 1); sp.channelCount = 2; sp.channelCountMode = 'explicit';
        sp.onaudioprocess = (e) => { tap.bl.set(e.inputBuffer.getChannelData(0)); tap.br.set(e.inputBuffer.getChannelData(1)); };
        src.connect(sp); sp.connect(ctx.destination); tap.sp = sp;
      }
      nodes[r] = { src, gain, tap };
    }
    started = ctx.currentTime - offset;
    nodes.after.src.onended = () => { if (playing) { offset = 0; stop(true); } };
    playing = true;
    say();
    if (!reduce) kick(); else { redraw(); slowT = setInterval(() => { if (playing && vis && docVis && view === 'stereo') { readGon(); redraw(); } }, 250); }
  };
  play.addEventListener('click', toggle);
  for (const r in chips) chips[r].addEventListener('click', () => setMode(r));
  xs.addEventListener('input', () => { stopXf(); setXf(xs.value / 100); });
  if (hero) {
    const cv = cvs.radial.c;
    cv.setAttribute('role', 'button'); cv.addEventListener('click', () => toggle());
    const lbl = () => cv.setAttribute('aria-label', (playing ? L.pause : L.play) + ': ' + L.alt_radial);
    const say0 = say; say = () => { say0(); lbl(); cv.setAttribute('aria-pressed', playing ? 'true' : 'false'); };
  }
  say();
  setView(view);
  const api = { setMode, play: toggle, stop: () => stop(false), destroy() { dead = true; if (slowT) clearInterval(slowT); stop(false); stopIntro(); stopXf(); if (raf) cancelAnimationFrame(raf); if (io) io.disconnect(); document.removeEventListener('visibilitychange', vc); if (ro) ro.disconnect(); if (mo) mo.disconnect(); if (mq && mq.removeEventListener) mq.removeEventListener('change', rerun); if (ctx) ctx.close(); host.textContent = ''; host.classList.remove('pk'); } };
  return api;
}
export function auto(root = document, defaults = {}) {
  const out = [];
  for (const h of root.querySelectorAll('[data-klangvergleich]')) {
    if (h.dataset.pkDone) continue;
    let o;
    try {
      const j = h.dataset.klangvergleich;
      o = j && j !== 'true' ? JSON.parse(j) : JSON.parse(h.querySelector('script[type="application/json"]').textContent);
    } catch (e) { continue; }
    const api = create(h, Object.assign({}, defaults, o));
    if (api) { h.dataset.pkDone = '1'; out.push(api); }
  }
  return out;
}
export const version = '1.0.0';
