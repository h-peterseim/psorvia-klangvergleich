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
  error: 'The sound could not be loaded.'
};
const languages = { en: EN };
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
  let mode = 'after', ctx = null, buf = null, nodes = {}, playing = false, offset = 0, started = 0, raf = null, mraf = null, master, an, fb, bands, last = 0;
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
  const plot = E('div', { class: 'pk__plot' }, host);
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
    if (px - lastX < 6.5) continue;
    lastX = px;
    const s = E('span', { class: 'pk__peak' }, plot, g.label || (g.ratio ? '×' + num(g.ratio, lang) : fhz(g.hz, lang)));
    s.style.setProperty('left', px.toFixed(1) + '%');
    s.style.setProperty('top', (100 * (1 - (Math.max(d.after[idx], -60) + 60) / 60)).toFixed(1) + '%');
  }
  const ax = E('div', { class: 'pk__axis', 'aria-hidden': 'true' }, host);
  E('span', {}, ax, '60 Hz'); E('span', {}, ax, '1 kHz'); E('span', {}, ax, '12 kHz');
  let gram = null;
  if (d.spectrogram) {
    const gw = E('div', { class: 'pk__gramwrap' }, host);
    gram = E('div', { class: 'pk__gram', role: 'img', 'aria-label': L.gram }, gw);
    gram.style.setProperty('--pk-gram', `url(${d.spectrogram.after})`);
  }
  const part = (b) => (b.from <= 0 ? L.below.replace('{to}', fhz(b.to, lang)) : b.to >= 12000 ? L.above.replace('{from}', fhz(b.from, lang)) : L.between.replace('{from}', fhz(b.from, lang)).replace('{to}', fhz(b.to, lang)));
  const more = (d.bands || []).filter((b) => b.delta >= 3).map(part), less = (d.bands || []).filter((b) => b.delta <= -3).map(part);
  const sum = more.length || less.length ? [more.length ? L.more.replace('{x}', more.join('; ')) : '', less.length ? L.less.replace('{x}', less.join('; ')) : ''].filter(Boolean).join(' ') : L.same;
  const cap = E('p', { class: 'pk__cap', id: id + '-sum' }, host);
  const heard = E('span', { class: 'pk__heard' }, cap);
  E('strong', {}, cap, sum);
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
    if (gram && d.spectrogram) gram.style.setProperty('--pk-gram', `url(${d.spectrogram[m]})`);
    morph(sets[m], sets[m === 'after' ? 'before' : 'after']);
    if (playing) for (const r of ['before', 'after']) nodes[r].gain.gain.setTargetAtTime(r === m ? 1 : 0, ctx.currentTime, 0.008);
    say();
  };
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
      const mx = Math.max(...p, 1e-20);
      live.setAttribute('d', line(p.map((v) => Math.max(10 * Math.log10(Math.max(v, 1e-20) / mx), -60))));
    }
    raf = requestAnimationFrame(frame);
  };
  const stop = (ended) => {
    if (!playing) return;
    if (!ended) offset = ctx.currentTime - started;
    for (const n of Object.values(nodes)) { n.src.onended = null; try { n.src.stop(); } catch (e) { /* schon beendet */ } }
    playing = false;
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    live.setAttribute('d', '');
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
    } catch (e) { status.textContent = L.error; return; }
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
    if (!reduce) frame();
  };
  play.addEventListener('click', toggle);
  for (const r in chips) chips[r].addEventListener('click', () => setMode(r));
  say();
  const api = { setMode, play: toggle, stop: () => stop(false), destroy() { stop(false); if (ctx) ctx.close(); host.textContent = ''; host.classList.remove('pk'); } };
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
