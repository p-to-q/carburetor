# pre-press checklist

run through this list immediately before submitting PDF to vendor. one pass per file (interior + cover).

## interior PDF (`build/edizione-1-interior.pdf`)

### content

- [ ] all 32 pages present
- [ ] page order matches `spine.md`
- [ ] manifesto pages (4-7) use FINAL user-authored prose, not draft, not scaffold
- [ ] receipts table populated with actual bench numbers, ±σ measured (not projected)
- [ ] BOM foldout has correct totals (classica + processta)
- [ ] colophon has actual city + printer name + contributor list
- [ ] no `(TBD)` or `(USER TO FILL)` markers anywhere

### typography

- [ ] only IBM Plex Serif / Sans / Mono in use
- [ ] no widows, no orphans (run paged.js `--debug` to inspect)
- [ ] all body justified, hyphenation enabled
- [ ] page numbers in brass footer, outside-bottom margin
- [ ] `Q.E.D.` close set in display-2 weight, brass, centered

### color

- [ ] interior ink is K-only (no rich black, no spot)
- [ ] cover ink is K + 1 named spot color: `BRASS_871`
- [ ] no rogue RGB colors anywhere — verify with `pdftk` or PDFtoolbox

### geometry

- [ ] trim size: 148 × 210 mm
- [ ] bleed: 3 mm on all edges where art runs to trim
- [ ] inner margin: 16 mm; outer: 14 mm; top: 18 mm; bottom: 18 mm
- [ ] crop marks present at corners
- [ ] no live text within 3 mm of trim

### fonts

- [ ] all fonts embedded (subset acceptable)
- [ ] no fallback substitutions in the PDF preview
- [ ] font names checked against IBM Plex OFL bundle

### format

- [ ] PDF/X-1a compliance verified
- [ ] transparency flattened
- [ ] file size < 30 MB (vendor portal limit)
- [ ] single file, not multi-spread

## cover PDF (`build/edizione-1-cover.pdf`)

### imposition

- [ ] 4-page wrap: back-cover left, spine area (none for saddle-stitch), front-cover right
- [ ] cover-front art is in correct position (front of wrap)
- [ ] cover-back art is in correct position (back of wrap)
- [ ] inner front cover (page 2 of cover) is blank or has only a tiny `[carburetor]` mark
- [ ] inner back cover (page 3 of cover) is blank or holds the legal strip

### ink

- [ ] K + 1 spot color (`BRASS_871`)
- [ ] brass treatment specified: spot ink OR foil stamp (vendor-dependent — confirm both options)

### geometry

- [ ] same as interior + score line for the wrap fold

## post-press

once printed:

- [ ] receive shipment, inspect 5 random units for defects
- [ ] hand-stamp each cover with a brass corner mark (`[c]`)
- [ ] hand-stamp serial number on page 2 of each unit (`001/100`, `002/100`, …, `100/100`)
- [ ] log serial → recipient in `distribution-ledger.csv`
- [ ] sleeve archive copies (mylar + acid-free board)

## shipping

- [ ] mailer + chipboard stiffener for every shipped unit
- [ ] brass-paper-tape seal (aesthetic, not functional)
- [ ] hand-written index card included (50 words)
- [ ] usps tracking generated and shared with recipient
- [ ] international declarations completed where required

## record

- [ ] save the final PDFs as `dist/edizione-1-interior-final.pdf` and `dist/edizione-1-cover-final.pdf`
- [ ] sha-256 of both PDFs recorded in `dist/manifest.json`
- [ ] git tag the repo: `git tag -a edizione-1 -m "edizione I, 100-unit print run"`
- [ ] post the dist PDFs to the website's `/edizione/download/` (free CC-BY-SA copy)

`Q.E.D.`
