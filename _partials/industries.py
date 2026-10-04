#!/usr/bin/env python3
"""Build every Industries page (professions + sectors) from ONE template.
Data: _partials/industries.json. Run: python3 _partials/industries.py && python3 _partials/sync.py
Never hand-edit agents/*.html or flow/*-sector.html: edit the JSON and re-run."""
import html, json, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
D = json.loads((ROOT / '_partials' / 'industries.json').read_text())
CAL = 'https://calendly.com/leanderkhatib/30min'


def a(v):  # attribute-safe
    return html.escape(v, quote=True)


def t(tag, pair, cls=''):
    en, ar = pair
    c = f' class="{cls}"' if cls else ''
    return f'<{tag}{c} data-en="{a(en)}" data-ar="{a(ar)}">{html.escape(en)}</{tag}>'


def page(slug, v):
    url = 'https://www.brxdxb.com/' + v['path']
    group = ['Professions', 'المهن'] if v['group'] == 'Professions' else ['Sectors', 'القطاعات']
    proc = '\n'.join(f'        <li><div><b data-en="{a(p[0])}" data-ar="{a(p[1])}">{html.escape(p[0])}</b><span data-en="{a(p[2])}" data-ar="{a(p[3])}">{html.escape(p[2])}</span></div></li>' for p in v['proc'])
    steps = '\n'.join(f'          <li><time>{s[0]}</time><span data-en="{a(s[1])}" data-ar="{a(s[2])}">{html.escape(s[1])}</span></li>' for s in v['ex_steps'])
    prod = ''
    if v.get('product'):
        href, name, en, ar = v['product']
        prod = f'\n      <p class="more-link"><a class="link" href="{href}" data-en="{a(en)}" data-ar="{a(ar)}">{html.escape(en)}</a></p>'
    reg = f'\n<div class="wrap" style="padding-bottom:48px">{t("p", v["reg"], "reg-line")}</div>' if v.get('reg') else ''
    after = f'\n      {t("p", v["ex_after"], "after")}' if v.get('ex_after') else ''
    return f'''<!DOCTYPE html>
<html lang="en" dir="ltr" data-lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{html.escape(v['title'])}</title>
<meta name="description" content="{a(v['desc'])}">
<meta property="og:title" content="{a(v['title'])}">
<meta property="og:description" content="{a(v['desc'])}">
<meta property="og:image" content="https://www.brxdxb.com/assets/brx-film-poster.jpg">
<meta property="og:url" content="{url}">
<link rel="canonical" href="{url}">
<!-- head:start -->
<!-- head:end -->
</head>
<body data-page="industries" data-industry="{slug}">
<!-- nav:start -->
<!-- nav:end -->
<main id="main">
<section class="page-hero prof-hero">
  <div class="wrap">
    <p class="crumb"><a href="/industries/" data-en="Industries" data-ar="القطاعات">Industries</a> / <span data-en="{group[0]}" data-ar="{group[1]}">{group[0]}</span></p>
    {t('p', v['eyebrow'], 'eyebrow')}
    {t('h1', v['h1'], 'display--xl')}
    {t('p', v['lede'], 'lede')}
    <div class="btn-row">
      <a class="btn" href="{CAL}" target="_blank" rel="noopener" data-en="Book a demo" data-ar="احجز عرضاً">Book a demo</a>
      <a class="btn btn--ghost" href="/savings/" data-en="Work out your saving" data-ar="احسب توفيرك">Work out your saving</a>
    </div>
  </div>
</section>
<section class="sec sec--alt" id="work">
  <div class="wrap prof-grid">
    <div>
      <h2 class="display" data-en="What it takes off the desk" data-ar="ما يرفعه عن مكتبك">What it takes off the desk</h2>
      <ol class="proc" style="margin-top:32px">
{proc}
      </ol>
      {t('p', v['stays'], 'stays')}{prod}
    </div>
    <article class="example">
      {t('span', v['ex_meta'], 'meta')}
      {t('h3', v['ex_h3'])}
      <ol>
{steps}
      </ol>{after}
    </article>
  </div>
</section>
<section class="sec" id="cta">
  <div class="wrap">
    <div class="sec-head" style="margin-bottom:0">
      {t('h2', v['cta_h2'], 'display')}
      {t('p', v['cta_lede'], 'lede')}
    </div>
    <div class="btn-row"><a class="btn" href="{CAL}" target="_blank" rel="noopener" data-en="Book a demo" data-ar="احجز عرضاً">Book a demo</a><a class="btn btn--ghost" href="/savings/" data-en="Work out your saving" data-ar="احسب توفيرك">Work out your saving</a></div>
    <p class="back-flow" data-en="Built with &lt;a href=&quot;/flow/&quot;&gt;BRX Flow&lt;/a&gt;, our custom offer: we map your process, build the agents and run them." data-ar="مبنيّ بخدمة &lt;a href=&quot;/flow/&quot;&gt;BRX Flow&lt;/a&gt;، عرضنا المخصّص: نرسم إجراءك ونبني الوكلاء ونشغّلهم.">Built with <a href="/flow/">BRX Flow</a>, our custom offer: we map your process, build the agents and run them.</p>
  </div>
</section>{reg}
</main>
<!-- foot:start -->
<!-- foot:end -->
</body>
</html>
'''


for slug, v in D.items():
    (ROOT / v['path']).write_text(page(slug, v))
    print('built', v['path'])
