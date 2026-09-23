#!/usr/bin/env python3
"""Inject shared partials into every page between <!-- x:start --> / <!-- x:end --> markers.
Run from anywhere: python3 _partials/sync.py   (Jekyll never publishes _partials/)."""
import pathlib, re
ROOT = pathlib.Path(__file__).resolve().parent.parent
P = {n: (ROOT / '_partials' / f'{n}.html').read_text().rstrip('\n') for n in ('head', 'nav', 'founders', 'foot')}
PAGES = ['index.html', 'agent.html', 'calculator.html', 'console.html', 'get-whitepaper.html', 'table/index.html',
         'flow/index.html', 'flow/real-estate.html', 'flow/legal.html', 'flow/hospitality.html', 'flow/healthcare.html']
for rel in PAGES:
    f = ROOT / rel
    if not f.exists():
        continue
    s = f.read_text()
    cta = '#cta' if 'id="cta"' in s else '/#cta'
    for name, body in P.items():
        body = body.replace('{CTA}', cta)
        s, n = re.subn(rf'(<!-- {name}:start -->).*?(<!-- {name}:end -->)',
                       lambda m: f'{m.group(1)}\n{body}\n{m.group(2)}', s, flags=re.S)
    f.write_text(s)
    print('synced', rel)
