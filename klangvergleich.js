(function(g){
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
  glow_idle: 'Press play to see the live spectrum.', corr: 'Correlation'
};
const languages = { en: EN };
const VIEWS = ['spectrum', 'wipe', 'diff', 'level', 'stereo', 'glow'];
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
function create(host, o) {
  const lang = o.lang || (host.lang || document.documentElement.lang || 'en').split('-')[0];
  const L = Object.assign({}, EN, languages[lang] || {}, o.labels || {});
  const d = o.data;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC || !d || !o.before || !o.after) return null;
  const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const id = 'pk' + (++uid);
  host.textContent = '';
  host.classList.add('pk');
  host.dataset.mode = 'after';
  host.dataset.view = 'spectrum';
  let lvl = null, mode = 'after', ctx = null, buf = null, nodes = {}, playing = false, offset = 0, started = 0, raf = null, mraf = null, master, an, fb, bands, last = 0;
  const sets = { before: d.before, after: d.after };
  let cur = { main: d.after.slice(), ghost: d.before.slice() };
  const head = E('div', { class: 'pk__head' }, host);
  const play = E('button', { type: 'button', class: 'pk__btn pk__play', 'aria-pressed': 'false' }, head, L.play);
  const grp = E('span', { class: 'pk__chips', role: 'group', 'aria-label': L.show }, head);
  const chips = {};
  for (const r of ['before', 'after']) chips[r] = E('button', { type: 'button', class: 'pk__chip', 'aria-pressed': r === 'after' ? 'true' : 'false', 'data-role': r }, grp, o[r].label || L[r]);
  const legend = E('span', { class: 'pk__legend' }, head);
  E('span', { class: 'pk__sw pk__sw--gain', 'aria-hidden': 'true' }, legend);
  legend.append(' ' + L.gain + ' ');
  E('span', { class: 'pk__sw pk__sw--loss', 'aria-hidden': 'true' }, legend);
  legend.append(' ' + L.loss);
  const status = E('p', { class: 'pk__sr', role: 'status', 'aria-live': 'polite' }, host);
  const want = (Array.isArray(o.views) && o.views.length ? o.views : o.view ? [o.view] : ['spectrum']).filter((v, i, a) => VIEWS.includes(v) && a.indexOf(v) === i && (v === 'spectrum' || v === 'glow' || (v === 'level' ? d.level : v === 'stereo' ? d.stereo : d.grams)));
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
  const cap = E('p', { class: 'pk__cap', id: id + '-sum' }, host);
  const heard = E('span', { class: 'pk__heard' }, cap);
  const capS = E('strong', {}, cap, sum);
  const paint = (m, g) => {
    const l = line(m);
    area.setAttribute('d', l + ` L${W} ${H} L0 ${H} Z`); glow.setAttribute('d', l); edge.setAttribute('d', l); ghost.setAttribute('d', line(g));
  };
  paint(cur.main, cur.ghost);
  const morph = (tm, tg) => {
    if (mraf) cancelAnimationFrame(mraf);
    const f = { m: cur.main.slice(), g: cur.ghost.slice() };
    if (reduce) { cur = { main: tm.slice(), ghost: tg.slice() }; paint(cur.main, cur.ghost); return; }
    const t0 = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - t0) / 300), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      const mix = (a, b) => a.map((v, i) => v + (b[i] - v) * e);
      cur = { main: mix(f.m, tm), ghost: mix(f.g, tg) };
      paint(cur.main, cur.ghost);
      mraf = k < 1 ? requestAnimationFrame(step) : null;
    };
    mraf = requestAnimationFrame(step);
  };
  const say = () => {
    play.textContent = playing ? L.pause : L.play;
    play.setAttribute('aria-pressed', playing ? 'true' : 'false');
    const name = o[mode].label || L[mode];
    status.textContent = (playing ? L.playing : L.ready) + ': ' + name;
    heard.textContent = playing ? L.heard + ' ' + name + '. ' : '';
    host.dataset.playing = playing ? 'true' : 'false';
  };
  const setMode = (m) => {
    if (m === mode) return;
    mode = m;
    host.dataset.mode = m;
    for (const r in chips) chips[r].setAttribute('aria-pressed', r === m ? 'true' : 'false');
    area.setAttribute('fill', `url(#${id}${m === 'after' ? 'a' : 'b'})`);
    if (view === 'glow') redraw();
    if (gram && d.spectrogram) gram.style.setProperty('--pk-gram', `url(${d.spectrogram[m]})`);
    morph(sets[m], sets[m === 'after' ? 'before' : 'after']);
    if (playing) for (const r of ['before', 'after']) nodes[r].gain.gain.setTargetAtTime(r === m ? 1 : 0, ctx.currentTime, 0.008);
    say();
  };
  let C = null, gdat = null, tex = null, texKey = '', wx = .5, wraf = null, gt = 0, hlast = 0, hist = [], introDone = false;
  const trail = new Float32Array(N).fill(-60), sdat = {};
  const colors = () => {
    if (C) return C;
    const cs = getComputedStyle(host), g = (k) => cs.getPropertyValue(k).trim();
    return (C = { a: g('--pk-a'), b: g('--pk-b'), fg: g('--pk-fg'), mut: g('--pk-mut'), line: g('--pk-line'), bg: g('--pk-bg'), bg2: g('--pk-bg2'), font: cs.fontFamily });
  };
  const fit = (v) => {
    const q = cvs[v], r = q.c.getBoundingClientRect(), k = window.devicePixelRatio || 1, w = Math.round(r.width * k), h = Math.round(r.height * k);
    if (!w || !h) return false;
    if (q.c.width !== w || q.c.height !== h) { q.c.width = w; q.c.height = h; }
    q.w = w; q.h = h; q.k = k;
    return true;
  };
  const tnow = () => (playing ? ctx.currentTime - started : offset);
  const bgfill = (q, c) => { q.x.fillStyle = c.bg2; q.x.fillRect(0, 0, q.w, q.h); };
  const lab = (q, c, t, px, py, al, col) => {
    const x = q.x, k = q.k;
    x.font = `600 ${13 * k}px ${c.font}`; x.textAlign = al; x.textBaseline = 'middle';
    const w = x.measureText(t).width, bx = al === 'left' ? px : al === 'right' ? px - w : px - w / 2;
    x.globalAlpha = .85; x.fillStyle = c.bg; x.fillRect(bx - 4 * k, py - 9 * k, w + 8 * k, 18 * k); x.globalAlpha = 1;
    x.fillStyle = col || c.fg; x.fillText(t, px, py);
  };
  const textures = (c) => {
    const key = c.a + c.b + c.fg + c.bg2;
    if (tex && texKey === key) return tex;
    const g = d.grams;
    if (!gdat) gdat = { before: unb64(g.before), after: unb64(g.after) };
    const x0 = document.createElement('canvas').getContext('2d'), A = rgb(x0, c.a), B = rgb(x0, c.b), F = rgb(x0, c.fg), n = g.w * g.h;
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
      before: one(gdat.before, B), after: one(gdat.after, A),
      base: mkimg((i, p, j) => { p[j] = F[0]; p[j + 1] = F[1]; p[j + 2] = F[2]; p[j + 3] = Math.round(lev(gdat.after[i]) * 70); }),
      diff: mkimg((i, p, j) => {
        const a = gdat.after[i], b = gdat.before[i], dd = (a - b) * 80 / 255;
        if (Math.max(a, b) < 64) return;
        const col = dd > 0 ? A : B;
        p[j] = col[0]; p[j + 1] = col[1]; p[j + 2] = col[2]; p[j + 3] = Math.round(Math.pow(Math.min(1, Math.abs(dd) / 16), .8) * 255);
      })
    };
    texKey = key;
    return tex;
  };
  const blit = (q, im) => { const x = q.x; x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; x.drawImage(im, 0, 0, q.w, q.h); };
  const axesTF = (q, c) => {
    const x = q.x, k = q.k, dur = d.grams.dur, y1 = q.h * (1 - Math.log(1000 / 60) / Math.log(200));
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
  const nm = [o.before.label || L.before, o.after.label || L.after];
  const drawWipe = (q, c) => {
    const T = textures(c), x = q.x, k = q.k, sx = Math.round(wx * q.w);
    bgfill(q, c);
    x.save(); x.beginPath(); x.rect(0, 0, sx, q.h); x.clip(); blit(q, T.before); x.restore();
    x.save(); x.beginPath(); x.rect(sx, 0, q.w - sx, q.h); x.clip(); blit(q, T.after); x.restore();
    axesTF(q, c); playhead(q, c, d.grams.dur); corner(q, c, nm);
    x.fillStyle = c.fg; x.fillRect(sx - k, 0, 2 * k, q.h);
    const cy = q.h / 2, r = 15 * k;
    x.beginPath(); x.arc(sx, cy, r, 0, 6.2832); x.fillStyle = c.bg; x.fill(); x.lineWidth = 2 * k; x.strokeStyle = c.fg; x.stroke();
    x.fillStyle = c.fg; x.beginPath(); x.moveTo(sx - 4 * k, cy - 6 * k); x.lineTo(sx - 10 * k, cy); x.lineTo(sx - 4 * k, cy + 6 * k); x.closePath();
    x.moveTo(sx + 4 * k, cy - 6 * k); x.lineTo(sx + 10 * k, cy); x.lineTo(sx + 4 * k, cy + 6 * k); x.closePath(); x.fill();
  };
  const drawDiff = (q, c) => {
    const T = textures(c);
    bgfill(q, c); blit(q, T.base); blit(q, T.diff); axesTF(q, c); playhead(q, c, d.grams.dur);
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
      const s = lv[tag];
      path(s.rms, true); x.globalAlpha = tag === 'after' ? .3 : .16; x.fillStyle = col; x.fill();
      path(s.peak, false); x.strokeStyle = col; x.globalAlpha = .55; x.lineWidth = 1.2 * k; x.stroke(); x.globalAlpha = 1;
      path(s.rms, false); x.lineWidth = 2.4 * k; x.lineJoin = 'round'; x.setLineDash(dash ? [6 * k, 4 * k] : []); x.stroke(); x.setLineDash([]);
    }
    const st = lv.dur > 8 ? 2 : 1;
    for (let t = st; t < lv.dur - .4; t += st) lab(q, c, num(t, lang, 0) + ' s', t / lv.dur * q.w, q.h - 12 * k, 'center', c.mut);
    corner(q, c, nm); playhead(q, c, lv.dur);
  };
  const unbCache = (t) => sdat[t] || (sdat[t] = unb64(d.stereo[t].d));
  const drawStereo = (q, c) => {
    const x = q.x, k = q.k, st = d.stereo, G = st.n, R = Math.max(10 * k, Math.min(q.h / 2 - 30 * k, q.w / 4 - 24 * k)), cell = 2 * R / G, s2 = R * .7071;
    bgfill(q, c);
    [['before', c.b, q.w * .25], ['after', c.a, q.w * .75]].forEach(([tag, col, cx], pi) => {
      const cy = q.h / 2 - 8 * k, dat = unbCache(tag);
      x.strokeStyle = c.line; x.lineWidth = k;
      x.beginPath(); x.arc(cx, cy, R, 0, 6.2832); x.moveTo(cx, cy - R); x.lineTo(cx, cy + R); x.moveTo(cx - R, cy); x.lineTo(cx + R, cy);
      x.moveTo(cx - s2, cy - s2); x.lineTo(cx + s2, cy + s2); x.moveTo(cx + s2, cy - s2); x.lineTo(cx - s2, cy + s2); x.stroke();
      x.fillStyle = col;
      for (let i = 0; i < G; i++) for (let j = 0; j < G; j++) {
        const v = dat[i * G + j]; if (v < 6) continue;
        const t = v / 255, px = cx + (-1 + (j + .5) * 2 / G) * R, py = cy - (-1 + (i + .5) * 2 / G) * R;
        x.globalAlpha = .18 + .82 * t; x.beginPath(); x.arc(px, py, cell * (.45 + .6 * t), 0, 6.2832); x.fill();
      }
      x.globalAlpha = 1;
      lab(q, c, 'L', cx - s2 - 12 * k, cy - s2 - 6 * k, 'center', c.mut); lab(q, c, 'R', cx + s2 + 12 * k, cy - s2 - 6 * k, 'center', c.mut);
      lab(q, c, nm[pi] + ' · ' + L.corr + ' ' + num(st[tag].corr, lang, 2), cx, q.h - 14 * k, 'center', col);
    });
  };
  const smooth = (x, arr, Wd, Y) => {
    x.beginPath();
    arr.forEach((v, i) => {
      const px = i / (N - 1) * Wd, py = Y(v);
      if (!i) x.moveTo(px, py); else x.quadraticCurveTo((i - 1) / (N - 1) * Wd, Y(arr[i - 1]), (i - .5) / (N - 1) * Wd, (Y(arr[i - 1]) + py) / 2);
    });
  };
  const drawGlow = (q, c, now) => {
    const x = q.x, k = q.k, dt = Math.min(.1, Math.max(0, (now - gt) / 1000)); gt = now;
    const live = playing && lvl, Y = (v) => q.h * (.1 + .78 * (1 - (Math.max(-60, Math.min(0, v)) + 60) / 60)), col = mode === 'after' ? c.a : c.b;
    for (let i = 0; i < N; i++) trail[i] = live ? Math.max(lvl[i], trail[i] - 20 * dt) : -60;
    if (live) { if (now - hlast > 70) { hist.push(Float32Array.from(trail)); if (hist.length > 9) hist.shift(); hlast = now; } } else hist.length = 0;
    bgfill(q, c);
    x.strokeStyle = c.line; x.lineWidth = k; for (const f of [.25, .5, .75]) { x.beginPath(); x.moveTo(0, q.h * f); x.lineTo(q.w, q.h * f); x.stroke(); }
    smooth(x, sets[mode], q.w, Y); x.strokeStyle = c.mut; x.lineWidth = 1.5 * k; x.setLineDash([5 * k, 4 * k]); x.globalAlpha = .8; x.stroke(); x.setLineDash([]); x.globalAlpha = 1;
    if (live) {
      hist.forEach((h, i) => { smooth(x, h, q.w, Y); x.strokeStyle = col; x.globalAlpha = .04 + .2 * (i + 1) / hist.length; x.lineWidth = 1.4 * k; x.stroke(); });
      x.globalAlpha = 1;
      smooth(x, trail, q.w, Y); x.lineTo(q.w, q.h); x.lineTo(0, q.h); x.closePath();
      const gr = x.createLinearGradient(0, 0, 0, q.h); gr.addColorStop(0, col); gr.addColorStop(1, 'transparent');
      x.globalAlpha = .5; x.fillStyle = gr; x.fill(); x.globalAlpha = 1;
      smooth(x, lvl, q.w, Y); x.strokeStyle = col; x.lineWidth = 2.4 * k; x.shadowColor = col; x.shadowBlur = 14 * k; x.lineJoin = 'round'; x.stroke(); x.shadowBlur = 0;
    } else lab(q, c, L.glow_idle, q.w / 2, q.h / 2, 'center', c.fg);
    lab(q, c, fhz(60, lang), 6 * k, q.h - 12 * k, 'left', c.mut); lab(q, c, fhz(1000, lang), q.w / 2, q.h - 12 * k, 'center', c.mut); lab(q, c, fhz(12000, lang), q.w - 6 * k, q.h - 12 * k, 'right', c.mut);
  };
  const drawers = { wipe: drawWipe, diff: drawDiff, level: drawLevel, stereo: drawStereo, glow: drawGlow };
  const redraw = (now) => { if (view === 'spectrum' || !fit(view)) return; drawers[view](cvs[view], colors(), now || performance.now()); };
  const lvText = () => {
    const a = d.level.after.rms, b = d.level.before.rms; let s = 0, n = 0;
    for (let i = 0; i < a.length; i++) if (Math.max(a[i], b[i]) > -60) { s += a[i] - b[i]; n++; }
    const m = n ? s / n : 0;
    return Math.abs(m) < .5 ? L.lv_same : (m > 0 ? L.lv_louder : L.lv_quieter).replace('{x}', num(Math.abs(m), lang));
  };
  const capFor = (v) => (v === 'level' ? lvText() : v === 'stereo' ? nm[0] + ': ' + L.corr + ' ' + num(d.stereo.before.corr, lang, 2) + '; ' + nm[1] + ': ' + num(d.stereo.after.corr, lang, 2) + '.' : sum);
  const setWx = (v) => { wx = Math.max(0, Math.min(1, v)); if (rg) rg.value = Math.round(wx * 100); redraw(); };
  const stopIntro = () => { if (wraf) { cancelAnimationFrame(wraf); wraf = null; } introDone = true; };
  const intro = () => {
    if (introDone || reduce) return;
    introDone = true; const t0 = performance.now();
    const st = (now) => { const kk = Math.min(1, (now - t0) / 900); setWx(.92 + (.5 - .92) * (1 - Math.pow(1 - kk, 3))); wraf = kk < 1 ? requestAnimationFrame(st) : null; };
    wraf = requestAnimationFrame(st);
  };
  const setView = (v) => {
    if (!want.includes(v)) return;
    view = v; C = null; host.dataset.view = v;
    vsp.hidden = v !== 'spectrum';
    for (const k in pan) pan[k].hidden = k !== v;
    for (const k in vbtn) vbtn[k].setAttribute('aria-pressed', k === v ? 'true' : 'false');
    legend.hidden = !(v === 'spectrum' || v === 'diff');
    capS.textContent = capFor(v);
    if (v === 'wipe') intro();
    redraw();
    if (want.length > 1) status.textContent = L['v_' + v];
  };
  for (const v in vbtn) vbtn[v].addEventListener('click', () => setView(v));
  if (rg) {
    const cw = cvs.wipe.c;
    rg.addEventListener('input', () => { stopIntro(); setWx(rg.value / 100); });
    const mv = (e) => { stopIntro(); const r = cw.getBoundingClientRect(); setWx((e.clientX - r.left) / r.width); };
    cw.addEventListener('pointerdown', (e) => { cw.setPointerCapture(e.pointerId); mv(e); });
    cw.addEventListener('pointermove', (e) => { if (cw.hasPointerCapture(e.pointerId)) mv(e); });
  }
  const rerun = () => { C = null; tex = null; redraw(); };
  let ro = null, mo = null, mq = null;
  if (want.length > 1 || view !== 'spectrum') {
    if (window.ResizeObserver) { ro = new ResizeObserver(() => redraw()); ro.observe(host); }
    mo = new MutationObserver(rerun); mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
    if (window.matchMedia) { mq = window.matchMedia('(prefers-color-scheme: dark)'); if (mq.addEventListener) mq.addEventListener('change', rerun); }
  }
  setView(view);
  const bandsFor = () => {
    const hz = ctx.sampleRate / an.fftSize;
    return Array.from({ length: N }, (_, i) => {
      const lo = 60 * Math.pow(200, i / N), hi = 60 * Math.pow(200, (i + 1) / N), a = Math.max(1, Math.floor(lo / hz));
      return [a, Math.max(a + 1, Math.floor(hi / hz))];
    });
  };
  const frame = () => {
    if (!playing) return;
    const now = performance.now();
    if (now - last > 33) {
      last = now;
      an.getFloatFrequencyData(fb);
      const p = bands.map(([a, b]) => { let s = 0; for (let i = a; i < b; i++) s += Math.pow(10, fb[i] / 10); return s; });
      const mx = Math.max(...p, 1e-8);
      lvl = p.map((v) => Math.max(10 * Math.log10(Math.max(v, 1e-20) / mx), -60));
      live.setAttribute('d', line(lvl));
      if (view === 'wipe' || view === 'diff' || view === 'level') redraw(now);
    }
    if (view === 'glow') redraw(now);
    raf = requestAnimationFrame(frame);
  };
  const stop = (ended) => {
    if (!playing) return;
    if (!ended) offset = ctx.currentTime - started;
    for (const n of Object.values(nodes)) { n.src.onended = null; try { n.src.stop(); } catch (e) { /* schon beendet */ } }
    playing = false;
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    live.setAttribute('d', '');
    lvl = null;
    if (view !== 'spectrum') redraw();
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
      src.buffer = buf[r]; gain.gain.value = r === mode ? 1 : 0;
      src.connect(gain).connect(master); src.start(0, offset);
      nodes[r] = { src, gain };
    }
    started = ctx.currentTime - offset;
    nodes.after.src.onended = () => { if (playing) { offset = 0; stop(true); } };
    playing = true;
    say();
    if (!reduce) frame(); else redraw();
  };
  play.addEventListener('click', toggle);
  for (const r in chips) chips[r].addEventListener('click', () => setMode(r));
  say();
  const api = { setMode, play: toggle, stop: () => stop(false), destroy() { stop(false); stopIntro(); if (ro) ro.disconnect(); if (mo) mo.disconnect(); if (mq && mq.removeEventListener) mq.removeEventListener('change', rerun); if (ctx) ctx.close(); host.textContent = ''; host.classList.remove('pk'); } };
  return api;
}
function auto(root = document, defaults = {}) {
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
const version = '1.0.0';
g.PsoKlangvergleich={create,auto,version,languages};
})(typeof window!=="undefined"?window:this);
