# edizione spine

the 32-page sequence. each entry is a single page or a spread (two pages facing).

## the sequence

```
COVER FRONT     [carburetor] wordmark in brass on cream
                exploded engine silhouette
                edizione I · 2026
                wooden computer co., ltd.

page 1          FRONTISPIECE
                full-bleed mk i exploded view (callouts 01-12 in brass)

page 2          HALF-TITLE
                "edizione I · 2026 · ___ / 100"
                ($ stamped by hand $)

page 3          CONTENTS
                manifesto                  p.4
                the five layers            p.8
                mk i + mk ii units         p.20
                three editions             p.26
                bill of materials          p.28
                colophon                   p.30

═══════════════════════════════════════════════════════════════════
SPREAD
page 4-5        MANIFESTO opening
                left: opening line ("we built a phone you refuel.")
                right: claim + why
                (USER-AUTHORED PROSE — scaffold in 01-manifesto.md)

SPREAD
page 6-7        MANIFESTO continuation
                left: the surprise (warm-up is a feature)
                right: receipts pointer + closing triad ending in Q.E.D.
                (USER-AUTHORED PROSE — scaffold in 01-manifesto.md)

═══════════════════════════════════════════════════════════════════
SPREAD
page 8-9        FIVE LAYERS opener
                left: full-page architecture diagram (brass-accented ASCII)
                right: "we found five points along the chain where the
                physical type of energy changes — and refused to collapse them."

page 10         LAYER 1 · fuel
                short prose + types panel + numbers table
page 11         LAYER 1 · fuel — sight glass + tank illustration, brass-accented

page 12         LAYER 2 · combustor (text)
page 13         LAYER 2 · combustor — cox engine illustration with callouts

page 14         LAYER 3 · bus (text + power-chain diagram)
page 15         LAYER 3 · bus — oscilloscope trace, V_bus during one burst

═══════════════════════════════════════════════════════════════════
SPREAD (full-bleed)
page 16-17      LAYER 4 · compute
                PCB stack exploded across the full spread
                bg95 + nrf52840 + sharp lcd + q10 keyboard
                all callouts in brass

page 18         LAYER 5 · ritual (text)
page 19         LAYER 5 · ritual — stage diagram
                cold → priming → cranking → warmup → live → cooldown → refuel

═══════════════════════════════════════════════════════════════════
SPREAD
page 20-21      MK I · field
                left: photograph (or render) of mk i, brunswick green
                right: spec table

SPREAD
page 22-23      MK II · pilot
                left: spec table
                right: photograph (or render) of mk ii, slate-grey with honda-red accent

═══════════════════════════════════════════════════════════════════
SPREAD
page 24-25      RECEIPTS · numbers + methodology
                left: full receipts table with ±σ
                right: how we measured each (one paragraph per row)

═══════════════════════════════════════════════════════════════════
SPREAD
page 26-27      THREE EDITIONS · vapore / processta / classica
                comparison table + one paragraph per edition

═══════════════════════════════════════════════════════════════════
SPREAD (gatefold optional)
page 28-29      BOM FOLDOUT
                classica + processta BOMs side by side
                grouped by layer; brass column rules

═══════════════════════════════════════════════════════════════════
page 30         COLOPHON
                masthead · contributors · print run · edition number
                (see colophon.md)

page 31         INFLUENCES
                kindred-spirits + canon (see INFLUENCES.md condensed)

page 32         CLOSE
                Q.E.D. (centered, brass, ~150pt)
                © 2026 wooden computer co., ltd.
                carburetor.wtf · github.com/p-to-q/carburetor

COVER BACK      back-cover blurb (3 lines)
                ISBN/edition strip (small, bottom)
                tiny [carburetor] wordmark in brass
```

## design rhythm

- every left-page is text-heavy, every right-page is image-heavy — with two intentional exceptions:
  - page 16-17 is full-bleed (the project's most ambitious visual moment)
  - page 28-29 is the foldout (the BOM is the manifesto's most-tangible artifact)
- type-only spreads (4-5, 6-7, 26-27) follow image-rich spreads. give the eye a rest.
- brass spot color appears: cover, page 1 (callouts), page 12 (cox illustration), page 16-17 (PCB labels), page 28-29 (column rules), page 30-32 (closing brand marks).
- every page has a tiny `[carburetor]` footer with the page number in brass. on type-only spreads the footer drops to bottom-outside corner; on image-heavy pages it sits in the bottom margin.

## the constraint that holds this together

**a manifesto with too much ink on it stops being read.** the target ratio across the manifesto pages (4-7) is `ink : whitespace = 1 : 1`. the user is the only person who decides where that ratio is broken.

`Q.E.D.`
