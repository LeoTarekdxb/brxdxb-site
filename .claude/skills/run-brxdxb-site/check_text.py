#!/usr/bin/env python3
"""Fail if any public page leaks raw markup into its visible text, in EN or AR.

Three passes per page:
  1. Browser-grade parse: text nodes outside script/style, plus every data-en /
     data-ar value parsed as the HTML that setLang() will inject.
  2. Naive reader: strip tags with <[^>]*> the way scrapers, previews and
     screen-reader fallbacks do. A raw "<" or ">" inside an attribute breaks this.
  3. Raw "<" or ">" inside any attribute value (the cause of pass 2 failures).
     Write them as &lt; and &gt;.

Usage: python3 .claude/skills/run-brxdxb-site/check_text.py [page.html ...]
Exit 0 = clean.
"""
import html, pathlib, re, sys
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parents[3]
SKIP = ('.qa/', '.gstack/', 'v2/', 'v3/', 'card/', 'defender/app/', 'portal/', '_partials/', 'node_modules/')
RAW_ATTR = re.compile(r'\s(data-en|data-ar|data-en-aria|data-ar-aria|content|alt|title|aria-label|placeholder)="([^"]*)"')
BAD = re.compile(r'"\s*>|data-(en|ar)(-aria)?=|\bclass="|\bhref="|&quot;|&lt;|&gt;')


class Text(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.skip = 0
        self.out = []      # (where, text)
        self.attr_vals = []

    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style', 'noscript', 'template'):
            self.skip += 1
        for k, v in attrs:
            if v is None:
                continue
            if k in ('data-en', 'data-ar'):
                self.attr_vals.append((k, v))

    def handle_endtag(self, tag):
        if tag in ('script', 'style', 'noscript', 'template') and self.skip:
            self.skip -= 1

    def handle_data(self, d):
        if not self.skip and d.strip():
            self.out.append(('text', d))


def frag_text(v):
    p = Text()
    p.feed(v)
    return ' '.join(t for w, t in p.out if w == 'text')


def check(path):
    rel = path.relative_to(ROOT).as_posix()
    src = path.read_text(errors='replace')
    problems = []
    p = Text()
    p.feed(src)
    for where, t in p.out:
        if where != 'text':
            problems.append(f'{where} {t[:90]!r}')
        elif BAD.search(t):
            problems.append(f'visible text: {t.strip()[:120]!r}')
    for k, v in p.attr_vals:
        t = frag_text(v)
        if BAD.search(t):
            problems.append(f'{k} renders: {t.strip()[:120]!r}')
    # raw < or > inside a text-bearing attribute (must be &lt; / &gt;)
    for m in RAW_ATTR.finditer(src):
        if '<' in m.group(2) or '>' in m.group(2):
            problems.append(f'raw < or > in {m.group(1)}=: {m.group(2)[:90]!r}')
    # naive reader
    body = re.sub(r'<(script|style|noscript)\b.*?</\1>', ' ', src, flags=re.S | re.I)
    body = re.sub(r'<!--.*?-->', ' ', body, flags=re.S)
    naive = html.unescape(re.sub(r'<[^>]*>', '\n', body))
    for line in naive.splitlines():
        if re.search(r'"\s*>|data-(en|ar)=', line):
            problems.append(f'naive reader sees: {line.strip()[:120]!r}')
    return rel, problems


def pages(args):
    if args:
        return [ROOT / a for a in args]
    out = []
    for f in sorted(ROOT.rglob('*.html')):
        r = f.relative_to(ROOT).as_posix() + ('/' if f.is_dir() else '')
        if any(r.startswith(s) for s in SKIP) or r.startswith('.'):
            continue
        out.append(f)
    return out


def main():
    bad = 0
    for f in pages(sys.argv[1:]):
        rel, probs = check(f)
        for pr in dict.fromkeys(probs):
            print(f'{rel}: {pr}')
            bad += 1
    print(f'markup leaks: {bad}')
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
