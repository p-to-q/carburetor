# edizione

the printed zine of `[carburetor]`.

a 32-page A5 saddle-stitch booklet, monochrome offset with one brass spot color. ~100-unit first run for v0.1. not buildable — *receivable*. for people who want to encounter the project as a physical object.

## status

🧪 v0.1 — spec locked, spine drafted, cover-front in progress. target press date: 2026 Q3.

## why printed

three reasons that are not the same reason.

1. **as a thinking medium.** Bret Victor's argument: print does what screens cannot — total page, no interaction, sustained attention. the project's manifesto deserves a place where the reader cannot tab away.
2. **as a cultural artifact.** Hundred Rabbits, Low-tech Magazine, SRL show posters, Teenage Engineering product manuals: physical print is how this kind of work gets remembered. github stars decay; a stapled booklet on a shelf does not.
3. **as a forcing function.** a printed thing cannot be patched. it requires the project to commit. that commitment is documentation that the version it captures actually existed.

## spec, in one line

A5 portrait, 32 + 4 cover pages, saddle-stitch, black + brass spot, IBM Plex on 80 gsm uncoated.

full spec: `spec.md`. spine: `spine.md`. typography: `typography.md`. colophon: `colophon.md`.

## file layout

```
press/edizione/
├── README.md            this file
├── spec.md              full print specification
├── spine.md             32-page sequence map
├── typography.md        fonts, leading, margins, brass spot rules
├── colophon.md          page 30 — masthead, contributors, edition number
├── cover-front.svg      front cover artwork
├── cover-back.svg       back cover (TBD)
├── 01-manifesto.md      pages 4-7 — scaffold (user-authored prose)
├── 02-architecture.md   pages 8-19 — the five layers
├── 03-mk-units.md       pages 20-25 — mk i + mk ii specs
├── 04-editions.md       pages 26-27 — three editions
├── 05-bom-foldout.svg   pages 28-29 — BOM foldout artwork (TBD)
├── build-scripts/       paged.js HTML+CSS → PDF pipeline (TBD)
└── build/               generated PDFs (gitignored)
```

## how it prints

interior pages are written in markdown + svg, compiled via a custom HTML+CSS print pipeline (paged.js + a small TypeScript build script) into a single PDF. typography and imposition are handled by CSS print rules locked in `typography.md`.

```sh
pnpm edizione:build       # build/edizione-1-interior.pdf and build/edizione-1-cover.pdf
pnpm edizione:proof       # build/edizione-1-proof.pdf — low-res screen proof for review
pnpm edizione:imposition  # build/edizione-1-imposed.pdf — print-ready imposed PDF
```

scripts are stubs at v0.1; implementation tracked in `ROADMAP.md` (v0.2).

## vendor candidates

- **Newspaper Club** (UK) — newsprint format, perfect aesthetic match. minimum 50.
- **Mixam** (UK/US/CA) — A5 saddle-stitch, brass spot color via Pantone, ~$3.50/unit at 100 qty.
- **Lulu** (US POD) — print-on-demand, no minimum. coated cover only; brass via foil stamp at extra cost.
- **local risograph studio** — preferred if available. riso-on-newsprint is the project's spiritual aesthetic.

target: 100-unit first run via Mixam or local risograph. price ~$25/copy at cost.

## licensing

content is under CC-BY-SA 4.0 (per `LICENSE-DOCS`). printed edition is sold at cost; any margin returns to the next print run. no DRM. share freely.

`Q.E.D.`
