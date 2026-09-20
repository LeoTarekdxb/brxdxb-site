# BRX·DXB homepage — v3 design record

Preview only (`<meta name="robots" content="noindex">`). Lives at `/v3/`, touches nothing else in the repo.

## The one reader, the one job

**Reader:** the owner or sales director of a Dubai brokerage, 5–40 agents, who already
knows leads are leaking and is deciding whether to spend fifteen minutes on a call.
Not an investor, not a developer, not a trader.

**Their job on this page:** decide whether to book the call.

**Primary action:** Book a 15-minute call → https://calendly.com/leo-khatib.
**Secondary (quiet, text only):** See pricing. Everything else is a footnote.

Everything that does not move that decision was cut: the trading product (one quiet
footer link to `/v2/terminal.html` and nothing else), the feature pill row, the
"commission a custom agent" line, the DIFC badge-chip, the live-dot chip.

## Visual system

Reference point is a professional-services firm's report cover, not a SaaS landing page.

| Token | Value | Role |
|---|---|---|
| `--paper` | `#FCFBF8` | ground; warm-biased white, not pure `#fff` |
| `--paper-2` | `#F4F2EC` | footer + log footnote only |
| `--ink` | `#16150F` | type, rules, the one filled button |
| `--ink-soft` `--ink-mute` | `#4B4941` `#77746A` | body support, mono labels |
| `--rule` `--rule-strong` | `#DEDACE` `#BFBAAA` | hairlines — the main structural device |
| `--night` | `#14130E` | the single dark band (founder's note) |
| `--gold` | `#A9811F` | the dot in BRX·DXB, 5px section markers, the "Most brokerages" tag, focus ring. Nothing else. |

Gold is never a fill, never a gradient, never a glow. It behaves the way Deloitte's green
dot behaves: a small piece of punctuation that you notice twice and then trust.

**Type pairing**
- Display: **Newsreader** (optical-size serif, 400/500, italic for one word in the H1).
  Headlines run to 78px, left-aligned, tight tracking.
- Body: **Hanken Grotesk** 400/500/600.
- Data: **IBM Plex Mono** for timestamps, section numbers, table column heads, eyebrow
  labels. Mono never sets a sentence.
- No Inter. No Space Grotesk. No Syne (v2's display face went with the rest of v2).

**Spacing** 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128. Sections sit on the 96–128 steps
so whitespace does the separating instead of boxes.

**Structure** Hairlines and a grid. No cards, no shadow, no rounded corners except a 2px
radius on the single filled button. Section heads are a two-column rig: mono label +
numeral on the left, serif H2 on the right.

**Motion budget** One animation in the whole page: the six overnight-log rows fade in over
0.5s on load, staggered 90ms. All rows are present at rest (they are in the DOM with no
transform); under `prefers-reduced-motion: reduce` the rule does not apply at all. There is
no scroll-reveal, no sticky-header state change, no hover lift. **Zero JavaScript ships.**

## The hero element: the overnight log

A bordered panel, mono-timestamped, showing one representative night: 23:04 enquiry → 23:06
reply in the buyer's language → 23:20 scored → 02:41 second enquiry → 02:43 reply → 09:00
briefing. It is the product demonstrated instead of described.

It is labelled twice as illustrative — in the panel header (`Illustrative — not client
data`) and in the footnote below the rows — so it can never be read as a client's real
pipeline.

## Copy rules applied

- Outside-in, second person, present tense: "An enquiry lands at 23:04. Your desk reads it
  at 09:00."
- One promise per screen. The H1 is the whole promise: **No lead waits until morning.**
- Figures are attributed and bounded: "three weeks on the founder's own live Dubai
  brokerage pipeline", plus an explicit "your numbers will depend on your lead volume".
- No superlatives, no "#1", no "first", no named client logos.
- No employer, brokerage, portal host or CRM vendor is named anywhere. v2's mentions of the
  employer and of specific CRM/portal vendors are all removed; capability is stated
  generically ("the CRM you already run", "portal enquiries synced in").
- The quote is attributed to **Leo Khatib — Co-founder, BRX**. No employer title.

## Pricing as a table

Five real columns — plan / who it's for / price / what's included / action — as a semantic
`<table>` with `<caption>`, `scope`, and per-cell `data-label`. Below 760px the head is
visually hidden and each row becomes a stacked record with mono field labels, so it reads
as a record rather than a squeezed grid. The recommended row is marked with a small gold
"Most brokerages" tag under the plan name, not with a coloured box.

Prices carried over from v2 unchanged: Solo AED 249/mo, Team AED 199/agent/mo (5+),
Multi-branch on application. Live in 48 hours, cancel any month.

## Accessibility & performance

- Semantic landmarks (`header`/`main`/`section`/`footer`/`nav`), `figure`+`figcaption` for
  the log, `ol`+`time` for the sequence of events, real `table` semantics for pricing.
- `:focus-visible` shows a 2px gold outline at 3px offset on every interactive element.
- Body contrast 15:1; the lightest text in use (`--ink-mute` on paper) is ~5.2:1.
- Responsive to 380px: gutter steps 32 → 24 → 16px, no horizontal scroll, no fixed widths.
- Third parties: Google Fonts only (3 families, `display=swap`, preconnected). No
  analytics, no tag manager, no cookies, no tracking pixel — nothing to consent-gate. If
  analytics is ever added it should be cookieless and server-side-aggregated.
- Total page weight is the HTML plus fonts. No images, no video, no icon set.

## Known tension for the next pass

The stat row (`<5 min`, `6`, `0`, `24/7`) is inherited from v2 and is the weakest content
on an otherwise evidence-led page: four figures from a three-week single-pipeline run are
directionally honest but thin. The fix is not design — it is a second reference pipeline.
