# build-scripts

the print pipeline for edizione I.

## status

🧪 v0.1 — pipeline structure committed. paged.js + puppeteer integration TBD at v0.2.

## what's here

- `build.mjs` — node script that concatenates the interior markdown files in spine order, renders them through marked → HTML, applies the print CSS, and (when complete) invokes paged.js + puppeteer to produce the print-ready PDF.
- `style.css` — the print stylesheet. all typography rules from `../typography.md` translated into CSS print rules.
- `template.html` — the outer HTML scaffold. defines the page boundaries, loads fonts, includes `style.css`, and contains the `{{BODY}}` slot the build script fills.

## usage (v0.2 when complete)

```sh
pnpm install
pnpm edizione:build
# → press/edizione/build/edizione-1-interior.pdf
# → press/edizione/build/edizione-1-cover.pdf  (TBD)
```

## what the pipeline does

1. read every `.md` in spine order:
   - `00-frontispiece.md`
   - `00-contents.md`
   - `01-manifesto.md` (or `01-manifesto-draft.md` for proof; configurable)
   - `02-architecture.md`
   - `03-mk-units.md`
   - `06-receipts.md`
   - `04-editions.md`
   - `05-bom-foldout.md` + inline `05-bom-foldout.svg`
   - `07-influences.md`
   - `08-close.md`
2. parse each via `marked` (GFM extensions enabled).
3. wrap in `template.html` with `style.css` inlined.
4. (TBD) feed to `pagedjs-cli` to produce paginated PDF.
5. (TBD) merge cover-front.svg + cover-back.svg into a separate cover PDF.

## dependencies

```
marked            ^12.0.0   markdown → HTML
@pagedjs/cli      ^0.4.0    HTML → paginated PDF
puppeteer         ^22.0.0   needed by pagedjs-cli (headless chromium)
```

these are not yet installed; install when implementing v0.2:

```sh
cd press/edizione/build-scripts
pnpm add marked @pagedjs/cli puppeteer
```

## reproducibility

the pipeline must be deterministic. fixed-seed any random elements (there should be none). normalize whitespace. embed fonts subset-only. emit PDF/X-1a where possible.

each build writes a `build/manifest.json` with `git_sha`, `lockfile_hash`, input file sha-256s, output file sha-256s. see `../../docs/reproducibility.md`.

`Q.E.D.`
