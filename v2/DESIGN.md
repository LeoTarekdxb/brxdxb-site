# BRX homepage v2 — design source of truth

Preview URL: https://www.brxdxb.com/v2/  ·  Trading page: https://www.brxdxb.com/v2/terminal.html
Non-destructive: root `index.html` is untouched. This is a parallel rebuild for critic re-review.

## The one buyer, the one job

**Buyer:** the owner / sales director of a Dubai real estate brokerage (5–50 agents).
He is not a trader, not a developer, not a "любитель AI". He runs a pipeline and he is
losing money on leads that go cold overnight and international buyers who get a generic
English reply hours late.

**His one job on this page:** decide whether to put BRX's lead agent on his pipeline.
Nothing else competes for that decision. The retail trading product (BRX Terminal,
$29/mo + $99/$199/$399 packs) is a *different buyer* and lives entirely on
`terminal.html`, linked only from the footer. It never appears on his scroll. (F1)

**One primary action:** *Book a 15-minute call* (Calendly) — plus two lower-friction
outs on the same screen: WhatsApp a question, or read the price right here. (F7)

## Page spine (problem → proof → offer → price → next step) — F2

1. **Hero** — a promise in his words, one CTA, one factual trust chip. No pun, no superlative. (F3)
2. **The problem** — three concrete losses he recognises (cold leads, wrong language, forgotten follow-ups).
3. **Proof** — the real, first-person result: the founder ran it on *his own* Provident
   Estate pipeline for 3 weeks. `<5 min` to first WhatsApp, 6 languages, zero missed leads,
   still live. Framed as *his* result, not "Proof Case #001". Surfaces in the first scroll. (F6)
4. **How it works** — what the agent actually does + 48h go-live + plugs into the CRM he already runs.
5. **Pricing** — real numbers, on the page, no sales wall: Solo AED 249/mo, Team AED 199/agent/mo,
   Multi-Branch custom. (F7)
6. **Next step** — book / WhatsApp / email. Lower-friction than "commission an agent".
7. **Footer** — contact + one quiet link to BRX Terminal (the trading tool) and the whitepaper.

No ticker, no orb, no grid overlay, no grain-stack, no emoji category system. Every section
earns its place for this one buyer. Target ≈ 1,100–1,300 words, ~6 sections. (F5)

## Substantiating the claims — F4 / F8

- Dropped: "#1 in UAE & Middle East", "Dubai's First AI Agents Lab", "Dubai's top agencies".
- Kept only checkable facts on the same screen: **DIFC-registered** (BRX Technologies L.L.C),
  and the proof metrics, which are the founder's own measured pipeline result, stated as such.
- The only place "top agency" appeared is replaced by the honest, stronger claim: *"I built it
  on my own desk first."*
- **No loss-of-capital / financial-risk disclaimer anywhere on this page.** That language belongs
  only to the trading product and lives on `terminal.html`. (F8)

## Visual identity — evolve, don't discard

The critic praised **Syne display + gold on near-black**. Kept and refined.

**Type pairing (deliberate, not Inter-only / not Space-Grotesk-default):**
- Display / headlines: **Syne** 700–800 (kept — it's the brand's face).
- Body / UI: **Hanken Grotesk** 400–600 — warm, humanist grotesque, clearly not Inter.
- Editorial accent: **Newsreader** italic — used *only* for the founder's first-person proof
  line, to make the human voice read as human, not as another UI card.

**Palette (one confident accent, warm neutral — no cyan, no acid green):**
- `--ink` #0A0A0C (near-black, faint warm bias) / `--ink-2` #101014 / `--ink-3` #16161C surfaces.
- `--gold` #C9A84C → `--gold-2` #E8C96A (kept). Gold is the *only* accent; the old cyan is gone.
- `--paper` #F4F1EA warm off-white for text; `--muted` #A29C90 warm grey (not the old cold #9CA3AF).
- Hairlines: warm white at 8–12% alpha.
- Success/live dot: a restrained gold-green `--live` #7FB77E, used once, next to the real proof.

**Spacing scale:** 4-based → 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128. Section rhythm 96–128 desktop, 64 mobile. 16px side gutter at 380px.

**Radii:** 10px controls, 16px cards. No `rounded-lg`-on-everything; hero and proof use flat editorial edges, only interactive cards get radius.

**Motion budget (small):** one fade-up-8px on scroll-in via IntersectionObserver, 0.5s ease,
staggered max 3. Nav background fade on scroll. Nothing else — no marquee, no drifting orb,
no blinking. All motion wrapped in `@media (prefers-reduced-motion: reduce)` → instant, no transform.

## Data / privacy stance

- Static HTML on GitHub Pages. **Zero third-party scripts, zero analytics, zero cookies** in v2.
- Fonts self-referenced from Google Fonts with `display=swap` + preconnect; system-font fallback stack so first paint never blocks.
- No PII in URLs: WhatsApp/mailto links carry only a generic prefilled subject, never a name/number field. Calendly opens in a new tab; no lead data touches our origin.
- No tracking pixels, no chat widget, no embeds. Fast by construction (single file, inline CSS, no images above the fold — the logo is inline SVG).

## Accessibility

Semantic landmarks (`header/main/section/footer`), one `h1`, ordered headings, visible
gold focus ring on every interactive element, `prefers-reduced-motion` honoured,
colour contrast: paper-on-ink ≥ 12:1, gold-on-ink ≥ 6:1, muted-on-ink ≥ 4.5:1. Responsive at 380px.

## Known gap for the next pass

v2 ships **English-first**. The live site is bilingual (EN/AR, Cairo). Re-adding the AR
toggle for this focused spine is the top next-pass item; it was cut this pass to nail
structure and honesty first, not because Arabic doesn't matter to this buyer.
