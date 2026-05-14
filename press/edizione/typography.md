# typography

locked at v0.1. small adjustments allowed at v0.2 (mostly hierarchy weights).

## type family

**IBM Plex** — OFL-licensed (SIL Open Font License). bundle the fonts with the print PDF.

three styles in use:

- **IBM Plex Serif** — body text. neutral, readable, contemporary-but-not-flashy.
- **IBM Plex Sans** — display, headings, captions in tables. weights 200–700 in use.
- **IBM Plex Mono** — code, BOM tables, frame layouts, brass-accent labels.

ITC IBM Plex Mono Light is the "carburetor wordmark" face: `[carburetor]` in mono caps, 0.6px letter-spacing.

## hierarchy

```
H1 — Plex Sans Bold 700 · 28pt · 32pt leading · all-lowercase · brass
H2 — Plex Sans Medium 500 · 18pt · 22pt leading · all-lowercase · brass
H3 — Plex Sans Regular 400 · 12pt · 16pt leading · all-lowercase · black
Body — Plex Serif Regular · 10pt · 14pt leading · justified · hyphens-auto
Caption — Plex Mono Regular · 8pt · 12pt leading · black or brass (callouts)
Footer — Plex Mono Regular · 7pt · 9pt leading · brass
Numbers (large) — Plex Mono Light · 24pt+ · for "edizione I" and serial stamps
```

## scale

| element | size | leading | tracking |
|---|---|---|---|
| body text | 10pt | 14pt | 0 |
| body small (captions) | 8pt | 12pt | 0 |
| body large (manifesto) | 12pt | 18pt | 0 |
| H3 (subsection) | 12pt | 16pt | 0 |
| H2 (section) | 18pt | 22pt | 10 units |
| H1 (title) | 28pt | 32pt | 30 units |
| display 1 (page numbers, opener) | 36pt | n/a | 0 |
| display 2 (Q.E.D. close) | 150pt | n/a | 60 units |
| footer | 7pt | 9pt | 40 units |
| caption mono | 8pt | 12pt | 20 units |
| code blocks (architecture diagrams) | 9pt | 12pt | 0 |

## brass color usage rules

brass is precious. it appears in roughly these places only:

1. cover front: the wordmark `[carburetor]`, the exploded engine silhouette, "edizione I".
2. page 1 frontispiece: all callout numbers and lines.
3. section openers (page 8-9, 20-21, 22-23, 26-27): the H1 only.
4. page 12: the cox illustration's labels.
5. page 16-17 PCB spread: all module names.
6. page 28-29: column rules and table headers in the BOM foldout.
7. footer: the `[carburetor]` mark + page number on every page.
8. page 32: the Q.E.D. close + the back-cover mark.

brass does NOT appear in: body text, table cell contents, photo captions, citations. if a designer is tempted to use brass on body text, they have lost track of why brass is brass.

## margins

```
            ┌─────────────────────────────┐
            │       18 mm top             │
            │                             │
   16 mm    │                             │  14 mm
   inner    │                             │  outer
            │                             │
            │                             │
            │       18 mm bottom          │
            └─────────────────────────────┘
            148 × 210 mm trim, 3 mm bleed all edges
```

## widows & orphans

- minimum 2 lines at the bottom of a page before a paragraph break.
- minimum 2 lines at the top of a page when continuing a paragraph.
- never break a heading from the paragraph that follows.
- never break a row mid-cell in a table.

## ligatures & figures

- enable common ligatures (`fi`, `fl`).
- use tabular figures in tables; proportional figures in body.
- en-dashes for ranges (`200–300 °C`); em-dashes for parenthetical breaks (`— like this —`).

## the small print

`Q.E.D.` is set in display 2 weight, brass color, centered on its line. never use it in body.

`Q.E.D.`
