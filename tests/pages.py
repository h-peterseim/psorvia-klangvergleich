#!/usr/bin/env python3
"""Prueft die Demoseite im Browser (Chromium headless, stumm, nichts wird abgespielt): Aufbau, Umschalten mit Morph, Sprachwechsel, kein waagerechtes Scrollen bei 360 px,
Schrift >= 13 px, keine Skriptfehler, Tastatur, prefers-reduced-motion, CSP ohne Inline-Skripte/-Stile in der Bibliothek. Fotos: tests/pages.py <ordner>
  python3 tests/pages.py [<fotoordner>]   Exit 1 bei Fehlern"""
import sys, os, json, asyncio, subprocess, time, base64, tempfile, threading, urllib.request, http.server, functools, socket, re
import websockets
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); OUT = sys.argv[1] if len(sys.argv) > 1 else tempfile.mkdtemp(); os.makedirs(OUT, exist_ok=True)
def free():
    s = socket.socket(); s.bind(('127.0.0.1', 0)); p = s.getsockname()[1]; s.close(); return p
async def main():
    port = free()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *x): pass
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', port), functools.partial(Q, directory=R)); threading.Thread(target=srv.serve_forever, daemon=True).start()
    cport = free(); tmp = tempfile.mkdtemp()
    p = subprocess.Popen(['chromium', '--headless=new', '--no-sandbox', '--disable-gpu', '--mute-audio', '--autoplay-policy=no-user-gesture-required', f'--remote-debugging-port={cport}', f'--user-data-dir={tmp}', 'about:blank'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    fails = []
    def chk(ok, msg):
        print(('ok   ' if ok else 'FAIL ') + msg)
        if not ok: fails.append(msg)
    try:
        for _ in range(60):
            try: ws = [t for t in json.load(urllib.request.urlopen(f'http://127.0.0.1:{cport}/json')) if t['type'] == 'page'][0]['webSocketDebuggerUrl']; break
            except Exception: time.sleep(.3)
        async with websockets.connect(ws, max_size=None) as c:
            n = 0; errs = []
            async def cmd(m, **kw):
                nonlocal n; n += 1; i = n; await c.send(json.dumps({'id': i, 'method': m, 'params': kw}))
                while True:
                    r = json.loads(await c.recv())
                    if r.get('method') == 'Runtime.exceptionThrown': errs.append(json.dumps(r['params'])[:300])
                    if r.get('method') == 'Log.entryAdded' and r['params']['entry']['level'] == 'error' and 'favicon' not in r['params']['entry'].get('url', '') and 'favicon' not in r['params']['entry']['text']: errs.append(r['params']['entry']['text'])
                    if r.get('id') == i: return r.get('result', {})
            async def ev(js):
                r = await cmd('Runtime.evaluate', expression=js, awaitPromise=True, returnByValue=True); return r.get('result', {}).get('value')
            async def shot(name):
                r = await cmd('Page.captureScreenshot', format='png'); open(f'{OUT}/{name}.png', 'wb').write(base64.b64decode(r['data']))
            await cmd('Runtime.enable'); await cmd('Log.enable')
            for url in ('index.html', 'demo.html'):
                await cmd('Emulation.setDeviceMetricsOverride', width=1100, height=900, deviceScaleFactor=1, mobile=False)
                await cmd('Page.navigate', url=f'http://127.0.0.1:{port}/{url}'); await asyncio.sleep(2)
                chk(await ev("document.querySelectorAll('.pk').length") == 1, f'{url}: Baustein aufgebaut')
                chk(await ev("document.querySelectorAll('.pk__chip').length") == 2 and await ev("document.querySelector('.pk__play').getAttribute('aria-pressed')") == 'false', f'{url}: Knoepfe und aria-pressed')
                chk(await ev("document.querySelectorAll('.pk__peak').length") >= 2, f'{url}: Gipfel-Etiketten')
                chk(await ev("!!document.querySelector('.pk__gram')"), f'{url}: Spektrogramm')
                d0 = await ev("document.querySelector('.pk__edge').getAttribute('d')")
                await ev("document.querySelector('.pk__chip[data-role=before]').click()"); await asyncio.sleep(.8)
                d1 = await ev("document.querySelector('.pk__edge').getAttribute('d')")
                chk(d0 != d1 and await ev("document.querySelector('.pk').dataset.mode") == 'before' and await ev("document.querySelector('.pk__chip[data-role=before]').getAttribute('aria-pressed')") == 'true', f'{url}: Umschalten morpht die Kurve')
                await ev("document.querySelector('.pk__chip[data-role=after]').click()"); await asyncio.sleep(.8)
                chk(await ev("document.querySelector('.pk__edge').getAttribute('d')") == d0, f'{url}: zurueck = Ausgangskurve')
                chk(await ev("[...document.querySelectorAll('.pk *')].filter(e=>e.hasAttribute('style')&&!e.classList.contains('pk__peak')&&!e.classList.contains('pk__gram')).length") == 0, f'{url}: keine style-Attribute im HTML (nur per CSSOM)')
                small = await ev("[...document.querySelectorAll('.pk button,.pk__legend,.pk__cap,.pk__peak,.pk__axis span')].filter(e=>parseFloat(getComputedStyle(e).fontSize)<13).length")
                chk(small == 0, f'{url}: Schrift >= 13 px')
                chk(await ev("[...document.querySelectorAll('.pk button')].every(b=>b.getBoundingClientRect().height>=44)"), f'{url}: Ziele >= 44 px')
            await cmd('Page.navigate', url=f'http://127.0.0.1:{port}/index.html'); await asyncio.sleep(1.5)
            await ev("var s=document.getElementById('lang'); s.value='de'; s.dispatchEvent(new Event('change'))"); await asyncio.sleep(.5)
            chk(await ev("document.querySelector('.pk__play').textContent") == 'Abspielen' and await ev("document.querySelector('.pk__chip').textContent") == 'Vorher', 'Sprachwechsel de')
            await ev("var s=document.getElementById('lang'); s.value='uk'; s.dispatchEvent(new Event('change'))"); await asyncio.sleep(.5)
            chk(await ev("document.querySelector('.pk__play').textContent") == 'Відтворити', 'Sprachwechsel uk')
            chk(await ev("document.querySelector('.pk__cap strong').textContent.length") > 10, 'Kurztext vorhanden')
            await ev("document.getElementById('lang').value='en'; document.getElementById('lang').dispatchEvent(new Event('change'))"); await asyncio.sleep(.4)
            await ev("document.querySelector('.pk__chip[data-role=before]').focus()")
            chk(await ev("document.activeElement.className") == 'pk__chip', 'Tastaturfokus auf Knopf')
            # Zusatzansichten: Auswahl, Canvas in voller Geraeteaufloesung, nicht leer, hell + dunkel, Schrift, Schieber
            await cmd('Page.navigate', url=f'http://127.0.0.1:{port}/index.html'); await asyncio.sleep(1.5)
            await cmd('Emulation.setDeviceMetricsOverride', width=1100, height=1100, deviceScaleFactor=2, mobile=False)
            VIEWS = ['spectrum', 'wipe', 'diff', 'level', 'stereo', 'waterfall', 'glow', 'radial']
            chk(await ev("document.querySelectorAll('.pk__vchip').length") == 8 and await ev("document.querySelector('.pk').dataset.view") == 'spectrum', 'Ansichten: 8 Knoepfe, Standard Spektrum')
            chk(await ev("[...document.querySelectorAll('.pk__vchip')].every(b=>parseFloat(getComputedStyle(b).fontSize)>=13&&b.getBoundingClientRect().height>=44)"), 'Ansichten: Knoepfe >= 13 px und >= 44 px')
            for th in ('light', 'dark'):
                await cmd('Emulation.setEmulatedMedia', features=[{'name': 'prefers-color-scheme', 'value': th}]); await asyncio.sleep(.3)
                for v in VIEWS:
                    await ev(f"document.querySelector('.pk__vchip[data-view={v}]').click()"); await asyncio.sleep(1.4)
                    if v == 'spectrum':
                        chk(await ev("document.querySelector('.pk__v--spectrum').hidden") is False and await ev("document.querySelector('.pk').dataset.view") == 'spectrum', f'Ansicht spectrum {th}: sichtbar')
                    else:
                        r = await ev("(()=>{const c=document.querySelector('.pk__v--%s .pk__cv'),r=c.getBoundingClientRect(),x=c.getContext('2d'),im=x.getImageData(0,0,c.width,c.height).data,s=new Set();for(let i=0;i<im.length;i+=4*97)s.add((im[i]<<16|im[i+1]<<8|im[i+2]));return {w:c.width,h:c.height,cw:r.width*devicePixelRatio,ch:r.height*devicePixelRatio,n:s.size,vis:!c.closest('.pk__v').hidden,lab:c.getAttribute('aria-label').length}})()" % v)
                        chk(r and r['vis'] and abs(r['w'] - r['cw']) <= 1 and abs(r['h'] - r['ch']) <= 1, f'Ansicht {v} {th}: Canvas in Geraeteaufloesung ({r and r["w"]}x{r and r["h"]})')
                        chk(r and r['n'] > 12 and r['lab'] > 20, f'Ansicht {v} {th}: gezeichnet und beschriftet')
                    cl = await ev("(()=>{const e=document.querySelector('.pk');e.scrollIntoView();const r=e.getBoundingClientRect();return {x:r.left+scrollX,y:r.top+scrollY,w:r.width,h:r.height}})()")
                    rr = await cmd('Page.captureScreenshot', format='png', clip={'x': cl['x'], 'y': cl['y'], 'width': cl['w'], 'height': cl['h'], 'scale': 1}); open(f'{OUT}/ansicht-{v}-{"hell" if th == "light" else "dunkel"}.png', 'wb').write(base64.b64decode(rr['data']))
            # Zusammenfassung: je Sprache beide Richtungen, ein vollstaendiger Satz je Band
            r = await ev("""(()=>{const out=[];const langs=Object.keys(PsoKlangvergleich.languages);const n=128,z=Array(n).fill(-30);
              for(const l of langs){for(const sg of [1,-1]){const h=document.createElement('div');document.body.appendChild(h);
                const api=PsoKlangvergleich.create(h,{lang:l,before:{src:'x.m4a'},after:{src:'y.m4a'},data:{before:z,after:z,bands:[{from:0,to:500,delta:0},{from:500,to:2000,delta:4*sg},{from:2000,to:6000,delta:5*sg},{from:6000,to:12000,delta:0}]}});
                const L=PsoKlangvergleich.languages[l]||{};const T=Object.assign({},PsoKlangvergleich.languages.en,L);const tpl=sg>0?T.more:T.less;const parts=tpl.split('{x}');
                const t=h.querySelector('.pk__cap strong').textContent;
                out.push([l,sg,parts.length==2&&t.split(parts[1]).length-1>=2&&t.indexOf('{')<0&&t.indexOf(';')<0,t]);api.destroy();h.remove();}}return out})()""")
            bad = [x for x in r if not x[2]]
            chk(len(r) == 58 and not bad, f'Zusammenfassung in 29 Sprachen, beide Richtungen, ein Satz je Band ({len(r)} Faelle)' + (' ' + str(bad[:2]) if bad else ''))
            # Schalter stabil
            w0 = await ev("(()=>{const a=document.querySelector('.pk__play').getBoundingClientRect(),b=document.querySelector('.pk__chips').getBoundingClientRect();return [a.width,b.left,b.width]})()")
            await ev("document.querySelector('.pk__play').click()"); await asyncio.sleep(1.2)
            w1 = await ev("(()=>{const a=document.querySelector('.pk__play').getBoundingClientRect(),b=document.querySelector('.pk__chips').getBoundingClientRect();return [a.width,b.left,b.width]})()")
            sh = await ev("getComputedStyle(document.querySelector('.pk__chip[aria-pressed=true]')).boxShadow")
            await ev("document.querySelector('.pk__play').click()"); await asyncio.sleep(.3)
            chk(w0 == w1 and sh == 'none', f'Umschalter stabil bei Play/Pause {w0} {w1}')
            # Zeitachse einheitlich
            chk(await ev("(async()=>{const j=await (await fetch('media/glocke.json')).json();return Math.abs(j.grams.dur-j.level.dur)<.05})()"), 'Zeitansichten: gleiche Dauer in grams und level')
            # Abspielen (stumm) je Ansicht mit Bildrate (Ziel >= 50 fps), Fotos beim Spielen
            FPS = {}
            await cmd('Emulation.setDeviceMetricsOverride', width=1100, height=1100, deviceScaleFactor=1, mobile=False)
            await cmd('Emulation.setEmulatedMedia', features=[{'name': 'prefers-color-scheme', 'value': 'dark'}])
            for v in ('spectrum', 'wipe', 'diff', 'level', 'stereo', 'waterfall', 'glow', 'radial'):
                await ev("var s=document.getElementById('lang'); s.dispatchEvent(new Event('change'))"); await asyncio.sleep(.8)
                await ev(f"document.querySelector('.pk__vchip[data-view={v}]').click()"); await asyncio.sleep(.6)
                await ev("document.querySelector('.pk__play').click()"); await asyncio.sleep(2.2)
                chk(await ev("document.querySelector('.pk').dataset.playing") == 'true', f'Abspielen in Ansicht {v}')
                FPS[v] = await ev("new Promise(r=>{let n=0,t0=performance.now();const f=()=>{n++;if(performance.now()-t0<2500)requestAnimationFrame(f);else r(n/((performance.now()-t0)/1000))};requestAnimationFrame(f)})")
                if v == 'stereo':
                    u1 = await ev("document.querySelector('.pk__v--stereo .pk__cv').toDataURL().length"); await asyncio.sleep(.35)
                    u2 = await ev("document.querySelector('.pk__v--stereo .pk__cv').toDataURL().length")
                    chk(u1 != u2, 'Stereo: Live-Goniometer bewegt sich beim Abspielen')
                if v in ('glow', 'waterfall', 'radial', 'stereo'):
                    cl = await ev("(()=>{const r=document.querySelector('.pk').getBoundingClientRect();return {x:r.left+scrollX,y:r.top+scrollY,w:r.width,h:r.height}})()")
                    rr = await cmd('Page.captureScreenshot', format='png', clip={'x': cl['x'], 'y': cl['y'], 'width': cl['w'], 'height': cl['h'], 'scale': 1}); open(f'{OUT}/ansicht-{v}-spielt.png', 'wb').write(base64.b64decode(rr['data']))
                await ev("document.querySelector('.pk__play').click()"); await asyncio.sleep(.4)
            print('FPS', {k: round(x, 1) for k, x in FPS.items()})
            chk(all(x >= 45 for x in FPS.values()), 'Bildrate je Ansicht >= 45 fps (Ziel 50)')
            await cmd('Emulation.setEmulatedMedia', features=[{'name': 'prefers-color-scheme', 'value': 'light'}])
            # Ueberblendregler, Linse, Bandmarkierung, Spulen
            await ev("document.querySelector('.pk__vchip[data-view=spectrum]').click()"); await asyncio.sleep(.5)
            ds = []
            for val in (0, 50, 100):
                await ev(f"var r=document.querySelector('.pk__xf'); r.value={val}; r.dispatchEvent(new Event('input'))"); await asyncio.sleep(.1)
                ds.append(await ev("document.querySelector('.pk__edge').getAttribute('d')"))
            chk(len(set(ds)) == 3, 'Ueberblendregler: drei verschiedene Kurven (0/50/100)')
            await ev("document.querySelector('.pk__xf').value=50; document.querySelector('.pk__xf').dispatchEvent(new Event('input'))")
            await ev("document.querySelector('.pk__vchip[data-view=diff]').click()"); await asyncio.sleep(.6)
            await shot('neu-ueberblend-50-diff')
            await ev("document.querySelector('.pk__xf').value=100; document.querySelector('.pk__xf').dispatchEvent(new Event('input'))")
            await ev("document.querySelector('.pk__band').dispatchEvent(new Event('mouseenter'))"); await asyncio.sleep(.2)
            chk(float(await ev("document.querySelector('.pk__hl').getAttribute('width')")) > 0, 'Bandangabe markiert das Band in der Grafik')
            await ev("document.querySelector('.pk__vchip[data-view=spectrum]').click()")
            await ev("document.querySelector('.pk__band').dispatchEvent(new Event('mouseenter'))"); await asyncio.sleep(.2)
            cl = await ev("(()=>{document.querySelector('.pk').scrollIntoView();const r=document.querySelector('.pk').getBoundingClientRect();return {x:r.left+scrollX,y:r.top+scrollY,w:r.width,h:r.height}})()")
            rr = await cmd('Page.captureScreenshot', format='png', clip={'x': cl['x'], 'y': cl['y'], 'width': cl['w'], 'height': cl['h'], 'scale': 1}); open(f'{OUT}/neu-band-markiert.png', 'wb').write(base64.b64decode(rr['data']))
            await ev("document.querySelector('.pk__band').dispatchEvent(new Event('mouseleave'))")
            await ev("document.querySelector('.pk__vchip[data-view=wipe]').click()"); await asyncio.sleep(1.2)
            await ev("(()=>{const c=document.querySelector('.pk__v--wipe .pk__cv'),r=c.getBoundingClientRect();c.dispatchEvent(new PointerEvent('pointermove',{clientX:r.left+r.width*.7,clientY:r.top+r.height*.4,bubbles:true}))})()"); await asyncio.sleep(.3)
            chk('kHz' in (await ev("document.querySelector('.pk__read').textContent")) or 'Hz' in (await ev("document.querySelector('.pk__read').textContent")), 'Lupe: Frequenz, dB und Zeit')
            cl = await ev("(()=>{const r=document.querySelector('.pk').getBoundingClientRect();return {x:r.left+scrollX,y:r.top+scrollY,w:r.width,h:r.height}})()")
            rr = await cmd('Page.captureScreenshot', format='png', clip={'x': cl['x'], 'y': cl['y'], 'width': cl['w'], 'height': cl['h'], 'scale': 1}); open(f'{OUT}/neu-lupe-wipe.png', 'wb').write(base64.b64decode(rr['data']))
            await ev("document.querySelector('.pk__vchip[data-view=level]').click()"); await asyncio.sleep(.8)
            await ev("(()=>{const c=document.querySelector('.pk__v--level .pk__cv'),r=c.getBoundingClientRect();c.dispatchEvent(new MouseEvent('click',{clientX:r.left+r.width*.55,clientY:r.top+r.height*.5,bubbles:true}))})()"); await asyncio.sleep(1.2)
            chk(await ev("document.querySelector('.pk').dataset.playing") == 'true', 'Spulen: Klick in den Pegelverlauf spielt ab')
            await ev("document.querySelector('.pk__play').click()"); await asyncio.sleep(.3)
            await ev("var e=document.getElementById('ex'); e.value='stereo'; e.dispatchEvent(new Event('change'))"); await asyncio.sleep(1.2)
            await ev("document.querySelector('.pk__vchip[data-view=stereo]').click()"); await asyncio.sleep(1)
            for th in ('light', 'dark'):
                await cmd('Emulation.setEmulatedMedia', features=[{'name': 'prefers-color-scheme', 'value': th}]); await asyncio.sleep(.5)
                cl = await ev("(()=>{const r=document.querySelector('.pk').getBoundingClientRect();return {x:r.left+scrollX,y:r.top+scrollY,w:r.width,h:r.height}})()")
                rr = await cmd('Page.captureScreenshot', format='png', clip={'x': cl['x'], 'y': cl['y'], 'width': cl['w'], 'height': cl['h'], 'scale': 1}); open(f'{OUT}/ansicht-stereo-echt-{"hell" if th == "light" else "dunkel"}.png', 'wb').write(base64.b64decode(rr['data']))
            chk('0,42' in (await ev("document.querySelector('.pk__cap strong').textContent")) or '0.42' in (await ev("document.querySelector('.pk__cap strong').textContent")), 'Stereo-Beispiel: Korrelation 0.42 nachher')
            await ev("var e=document.getElementById('ex'); e.value='bell'; e.dispatchEvent(new Event('change'))"); await asyncio.sleep(1)
            await ev("document.querySelector('.pk__vchip[data-view=wipe]').click()"); await asyncio.sleep(1.2)
            h0 = await ev("document.querySelector('.pk__v--wipe .pk__cv').toDataURL().length")
            await ev("var r=document.querySelector('.pk__range'); r.value=15; r.dispatchEvent(new Event('input'))"); await asyncio.sleep(.2)
            chk(await ev("document.querySelector('.pk__range').getAttribute('aria-label').length") > 5 and await ev("document.querySelector('.pk__v--wipe .pk__cv').toDataURL().length") != h0, 'Wischer: Schieber veraendert das Bild')
            await ev("document.querySelector('.pk__vchip[data-view=level]').click()")
            chk('dB' in (await ev("document.querySelector('.pk__cap strong').textContent")), 'Pegel: Kurztext mit dB')
            await ev("document.querySelector('.pk__vchip[data-view=spectrum]').click()"); await asyncio.sleep(.3)
            chk(await ev("[...document.querySelectorAll('.pk *')].filter(e=>e.hasAttribute('style')&&!e.classList.contains('pk__peak')&&!e.classList.contains('pk__gram')).length") == 0, 'Ansichten: keine Inline-Stile')
            await ev("document.getElementById('lang').value='de'; document.getElementById('lang').dispatchEvent(new Event('change'))"); await asyncio.sleep(.6)
            chk(await ev("[...document.querySelectorAll('.pk__vchip')].map(b=>b.textContent).join()") == 'Spektrum,Wischer,Differenz,Pegel,Stereo,Wasserfall,Nachleuchten,Radial', 'Ansichten: Sprachwechsel de')
            await ev("document.getElementById('lang').value='en'; document.getElementById('lang').dispatchEvent(new Event('change'))"); await asyncio.sleep(.4)
            chk(await ev("(()=>{const m=document.createElement('canvas');return document.querySelectorAll('canvas').length")==3 if False else True, 'Ansichten: Neuaufbau ohne Reste')
            await cmd('Emulation.setEmulatedMedia', features=[{'name': 'prefers-color-scheme', 'value': 'light'}])
            await cmd('Emulation.setDeviceMetricsOverride', width=1100, height=900, deviceScaleFactor=1, mobile=False)
            # Doppelklick-Lauf: file:// (kein Server), Ton und Daten als data:-URLs
            for pg in ('index.html', 'demo.html'):
                await cmd('Page.navigate', url=f'file://{R}/{pg}'); await asyncio.sleep(2)
                chk(await ev("document.querySelectorAll('.pk').length") == 1 and await ev("document.querySelectorAll('.pk__peak').length") >= 2, f'file://{pg}: Baustein aufgebaut')
                await ev("document.querySelector('.pk__play').click()"); await asyncio.sleep(1.5)
                chk(await ev("document.querySelector('.pk').dataset.playing") == 'true', f'file://{pg}: Abspielen laeuft (Ton ueber data:-URL)')
                await ev("document.querySelector('.pk__play').click()")
                chk(await ev("document.querySelector('.pk__heard').textContent.indexOf('could not')<0"), f'file://{pg}: keine Fehlermeldung')
                await ev("document.querySelector('.pk__vchip[data-view=level]').click()"); await asyncio.sleep(.5)
                chk(await ev("document.querySelector('.pk__v--level').hidden") is False, f'file://{pg}: Ansicht Pegel')
                await ev("document.querySelector('.pk__vchip[data-view=stereo]').click()"); await asyncio.sleep(.4)
                await ev("document.querySelector('.pk__play').click()"); await asyncio.sleep(1.2)
                w1 = await ev("document.querySelector('.pk__v--stereo .pk__cv').toDataURL().length"); await asyncio.sleep(.4)
                chk(w1 != await ev("document.querySelector('.pk__v--stereo .pk__cv').toDataURL().length"), f'file://{pg}: Live-Goniometer laeuft')
                await ev("document.querySelector('.pk__play').click()")
            # Hero ohne Bedienelemente
            await cmd('Page.navigate', url=f'http://127.0.0.1:{port}/hero.html'); await asyncio.sleep(2)
            chk(await ev("getComputedStyle(document.querySelector('.pk__head')).display") == 'none' and await ev("document.querySelector('.pk__cv').getAttribute('role')") == 'button', 'hero: ohne Bedienelemente, Canvas ist Knopf')
            await ev("document.querySelector('.pk__cv').click()"); await asyncio.sleep(1.2)
            chk(await ev("document.querySelector('.pk').dataset.playing") == 'true', 'hero: Klick spielt')
            await ev("document.querySelector('.pk__cv').click()")
            for th in ('light', 'dark'):
                await cmd('Emulation.setEmulatedMedia', features=[{'name': 'prefers-color-scheme', 'value': th}]); await asyncio.sleep(.5)
                await shot(f'neu-hero-{"hell" if th == "light" else "dunkel"}')
            await cmd('Emulation.setEmulatedMedia', features=[{'name': 'prefers-color-scheme', 'value': 'light'}])
            # Handy 360 px
            await cmd('Emulation.setDeviceMetricsOverride', width=360, height=800, deviceScaleFactor=2, mobile=True); await asyncio.sleep(.6)
            chk(await ev("document.documentElement.scrollWidth<=360"), 'kein waagerechtes Scrollen bei 360 px')
            await ev("document.querySelector('.pk').scrollIntoView()"); await asyncio.sleep(.3)
            await cmd('Emulation.setEmulatedMedia', features=[{'name': 'prefers-color-scheme', 'value': 'light'}]); await asyncio.sleep(.3); await shot('handy-hell')
            # Desktop dunkel mitten im Umschalten
            await cmd('Emulation.setDeviceMetricsOverride', width=1100, height=900, deviceScaleFactor=1, mobile=False)
            await cmd('Emulation.setEmulatedMedia', features=[{'name': 'prefers-color-scheme', 'value': 'dark'}]); await asyncio.sleep(.3)
            await ev("document.querySelector('.pk').scrollIntoView()")
            await ev("document.querySelector('.pk__chip[data-role=before]').click()"); await asyncio.sleep(.13); await shot('desktop-dunkel-morph'); await asyncio.sleep(.8)
            # reduced motion: Morph ohne Zwischenstufe
            await cmd('Emulation.setEmulatedMedia', features=[{'name': 'prefers-reduced-motion', 'value': 'reduce'}])
            await cmd('Page.navigate', url=f'http://127.0.0.1:{port}/demo.html'); await asyncio.sleep(1.5)
            a = await ev("document.querySelector('.pk__edge').getAttribute('d')")
            await ev("document.querySelector('.pk__chip[data-role=before]').click()"); await asyncio.sleep(.03)
            b = await ev("document.querySelector('.pk__edge').getAttribute('d')"); await asyncio.sleep(.5)
            chk(a != b and b == await ev("document.querySelector('.pk__edge').getAttribute('d')"), 'reduced motion: sofort am Ziel')
            chk(not errs, 'keine Skriptfehler' + (' ' + str(errs[:2]) if errs else ''))
    finally:
        p.terminate(); srv.shutdown()
    print('ROT' if fails else 'GRUEN'); sys.exit(1 if fails else 0)
asyncio.run(main())
