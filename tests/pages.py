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
    p = subprocess.Popen(['chromium', '--headless=new', '--no-sandbox', '--disable-gpu', '--mute-audio', f'--remote-debugging-port={cport}', f'--user-data-dir={tmp}', 'about:blank'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
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
