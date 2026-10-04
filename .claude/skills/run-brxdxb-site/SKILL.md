---
name: run-brxdxb-site
description: Run, check, screenshot and deploy the brxdxb.com public site (this repo, GitHub Pages). Use whenever someone asks to run the site, preview a page, take screenshots of brxdxb.com, check the site for broken links or leaked private data, verify a deploy, or push a change live. Also use before and after any edit to index.html, flow/*.html, assets/brx.css or _partials/*.
---

# run-brxdxb-site

Static site, no build step. About 25 HTML pages (incl. the private app shell `portal/`) share one CSS (`assets/brx.css`), one JS (`assets/brx.js`) and generated partials. Hosted on GitHub Pages from `main` (repo LeoTarekdxb/brxdxb-site). All paths below are relative to the repo root.

## Run (agent path)

The driver serves the checkout, hits every page, greps for leaks, checks internal links and screenshots home + the Defender page at desktop and phone widths:

```bash
.claude/skills/run-brxdxb-site/smoke.sh          # local checkout on :8811
.claude/skills/run-brxdxb-site/smoke.sh live     # the deployed www.brxdxb.com
```

Exit 0 = PASS. Screenshots land in `.qa/smoke/` (gitignored). Read them, do not trust "PASS" alone.

Interactive checks (3D hero loaded, hamburger, AR toggle) need a real browser. With the playwright MCP:

```
navigate http://localhost:8811/index.html
evaluate: document.querySelector('model-viewer').loaded
evaluate: document.querySelector('.burger').click()
evaluate: setLang('ar'); document.documentElement.dir
```

## Edit

- Nav, footer, founders block, `<head>` live in `_partials/`. Edit there, then `python3 _partials/sync.py` copies them into every page. Never edit the nav inside a page.
- Bilingual text uses `data-en` / `data-ar` attributes and `setLang()` in `assets/brx.js`. Add both or the AR toggle shows English.
- Brand rules, tokens and the design-skill stack: load the global `brx-web-brand` skill.

## Deploy

```bash
git pull --rebase && git add <files> && git commit -m "..." && git push origin main
gh api repos/LeoTarekdxb/brxdxb-site/pages/builds/latest -q .status    # "built" after ~60 s
```

Then `smoke.sh live`. GitHub caches 10 minutes; append `?x=123` to bypass while checking.

## Gotchas

- **www vs bare domain.** Fixed 2026-10-04: bare `brxdxb.com` now 301s to `www`. If it ever regresses, the bare A record must point at GitHub Pages 185.199.108-111.153 (Cloudflare, Leo only).
- **One product page.** Lead Defence was merged into `/defender/` on 2026-10-04. `/flow/real-estate.html` is a hash-aware redirect stub; do not rebuild it. Nav: BRX Flow · Products ▾ · BRX Launch · Industries ▾ · Book a demo (round 6, 2026-10-05, see brx-web-brand/references/positioning.md). The company is BRXDXB; smoke.sh fails on "BRX Technologies" or "BRX·DXB". Profession and sector pages come from `_partials/industries.py` (edit industries.json, re-run, then sync.py). `check_text.py` fails on raw markup in visible text; write < and > in data-en/data-ar as &lt; and &gt;. New pages must be added to PAGES in `_partials/sync.py` and `smoke.sh`, and to `sitemap.xml`. One primary button: the green `.btn`. Home stays at 6 phone screens or fewer.
- **Headless Chrome clamps window width to ~500 px.** A `--window-size=390` screenshot is really a 500 px layout, cropped, so text looks cut off. It is not a bug in the site. For true phone checks use playwright at 390 and read `document.documentElement.scrollWidth` (must equal 390).
- **Virtual time hides WebGL.** Headless screenshots show a blank box where the 3D logo is. Check `model-viewer.loaded` in a real browser instead.
- **The 3D GLB must stay small.** `assets/brx-logo.glb` is draco + webp, 396 KB. The 7.3 MB original is in `.qa/brx-logo.orig.glb`. Re-compress with `npx -y @gltf-transform/cli optimize in.glb out.glb --compress draco --texture-compress webp`.
- **Never on a public page:** PIN codes, defender.brxdxb.com/calls links, localhost ports, the Provident name or number +971 56 603 0347, Bitrix24. The driver greps for these and fails.
- **`.qa/`, `.gstack/` are gitignored.** Never commit screenshots or backups.
- **Another session may be committing.** Always `git pull --rebase` before commit.

## The portal shell (`portal/`)

`portal/index.html` + `portal.css` + `portal.js` is the BRX Portal app. It holds no data: after sign-in it calls
`https://defender.brxdxb.com/api/portal/*` (service `~/bots/brx-portal`, launchd `com.leanderkhatib.brx-portal`, :8795,
forwarded by the twin). Rules:

- Never put a lead name, phone, key, token or a `defender.brxdxb.com/calls` link in these files. Private links come from
  the API after login. `smoke.sh` greps `portal/` (html, js, css) for these and fails.
- CSP is a meta tag in `portal/index.html`. A new CDN script must be on cdnjs and added to `script-src`.
- Test it against a QA instance, never Leo's login: see the `brx-portal` skill (`qa_shots.py`).
- Bump `?v=` on `portal.css` / `portal.js` in `index.html` when you change them (GitHub Pages caches 10 min).

## Troubleshooting

- `no matches found: --include=*.html` → zsh globbed the flag. Quote it. Already fixed in the driver.
- `Address already in use :8811` → a server from an earlier run is still up. The driver reuses it; nothing to do.
- Pages build stuck on `building` > 3 min → push an empty commit: `git commit --allow-empty -m "rebuild" && git push`.
