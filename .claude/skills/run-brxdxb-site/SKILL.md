---
name: run-brxdxb-site
description: Run, check, screenshot and deploy the brxdxb.com public site (this repo, GitHub Pages). Use whenever someone asks to run the site, preview a page, take screenshots of brxdxb.com, check the site for broken links or leaked private data, verify a deploy, or push a change live. Also use before and after any edit to index.html, flow/*.html, assets/brx.css or _partials/*.
---

# run-brxdxb-site

Static site, no build step. 10 HTML pages share one CSS (`assets/brx.css`), one JS (`assets/brx.js`) and generated partials. Hosted on GitHub Pages from `main` (repo LeoTarekdxb/brxdxb-site). All paths below are relative to the repo root.

## Run (agent path)

The driver serves the checkout, hits every page, greps for leaks, checks internal links and screenshots home + Lead Defence at desktop and phone widths:

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

- **www vs bare domain.** `www.brxdxb.com` is GitHub Pages (this repo). `brxdxb.com` bare points at an old Netlify site in another account (A 75.2.60.5). Only Leo can fix it in Cloudflare: replace the A record with the 4 GitHub Pages IPs 185.199.108-111.153. The mini's Cloudflare token has no zone access (verified 2026-09-23).
- **Headless Chrome clamps window width to ~500 px.** A `--window-size=390` screenshot is really a 500 px layout, cropped, so text looks cut off. It is not a bug in the site. For true phone checks use playwright at 390 and read `document.documentElement.scrollWidth` (must equal 390).
- **Virtual time hides WebGL.** Headless screenshots show a blank box where the 3D logo is. Check `model-viewer.loaded` in a real browser instead.
- **The 3D GLB must stay small.** `assets/brx-logo.glb` is draco + webp, 396 KB. The 7.3 MB original is in `.qa/brx-logo.orig.glb`. Re-compress with `npx -y @gltf-transform/cli optimize in.glb out.glb --compress draco --texture-compress webp`.
- **Never on a public page:** PIN codes, defender.brxdxb.com/calls links, localhost ports, the Provident name or number +971 56 603 0347, Bitrix24. The driver greps for these and fails.
- **`.qa/`, `.gstack/` are gitignored.** Never commit screenshots or backups.
- **Another session may be committing.** Always `git pull --rebase` before commit.

## Troubleshooting

- `no matches found: --include=*.html` → zsh globbed the flag. Quote it. Already fixed in the driver.
- `Address already in use :8811` → a server from an earlier run is still up. The driver reuses it; nothing to do.
- Pages build stuck on `building` > 3 min → push an empty commit: `git commit --allow-empty -m "rebuild" && git push`.
