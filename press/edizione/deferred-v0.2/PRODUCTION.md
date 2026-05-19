# edizione I · production master

priority: **TOP of v0.2.** this document is the production trunk. every other file in `press/edizione/` either feeds into a phase below or is referenced from a phase below.

target in-hand date: **2026-09-15** (Tuesday). all dates and tasks downstream of that anchor.

---

## status at a glance

| phase                           | status | gate                                                |
| ------------------------------- | ------ | --------------------------------------------------- |
| 1 · spec & spine locked         | ✅     | spec.md + spine.md committed                        |
| 2 · interior content drafted    | 🧪     | manifesto stays user-authored; rest agent-drafted   |
| 3 · typography & build pipeline | 🧪     | paged.js scripts working; CSS locked at v0.1        |
| 4 · vendor RFQ sent             | 🔴     | needs production lead's signature                   |
| 5 · cover + interior PDF ready  | 🔴     | requires user's final manifesto + vendor file specs |
| 6 · print order placed          | 🔴     | requires PDF + payment + ship-to                    |
| 7 · pre-order page live         | 🔴     | requires squarespace/notion/shop setup              |
| 8 · in-hand                     | 🔴     | depends on vendor lead time                         |
| 9 · numbered + stamped          | 🔴     | requires brass-ink stamp + serial book              |
| 10 · shipped to contributors    | 🔴     | requires distribution list (see distribution.md)    |

---

## the schedule

```
WEEK    DATE       PHASE                        OWNER       OUTPUT
─────   ─────      ─────                        ─────       ─────
W-18    2026-05-13 ✅ spec/spine/cover-front    agent       this commit
W-17    2026-05-20 finish missing interior      agent       all .md pages
W-16    2026-05-27 manifesto final prose        USER        01-manifesto.md
W-15    2026-06-03 typography proof v0.1        agent       pdf proof to user
W-14    2026-06-10 vendor RFQ sent to 4 shops   user/agent  vendor-rfq.md
W-12    2026-06-24 vendor quotes received       user        cost decisions
W-11    2026-07-01 vendor selected, paid        user        invoice
W-10    2026-07-08 cover-back finalized         agent       cover-back.svg
W-09    2026-07-15 interior PDF locked v1.0     agent       edizione-1-interior.pdf
W-08    2026-07-22 cover PDF locked v1.0        agent       edizione-1-cover.pdf
W-07    2026-07-29 final proof from vendor      user        physical proof
W-06    2026-08-05 sign-off; production run     user        100 units
W-04    2026-08-19 pre-order page live          user        carburetor.wtf/edizione
W-02    2026-09-02 inventory arrives            user        100 booklets
W-00    2026-09-15 🎯 IN-HAND DATE              user        ship to contributors
W+1     2026-09-22 first 25 contributor copies  user        signed + numbered
W+2     2026-09-29 60 pre-order copies ship     user        post office
W+3     2026-10-06 archive 15 sealed            user        wooden computer co.
```

15 weeks. tight but achievable if the manifesto prose is locked by W-16 and the vendor is decided by W-12.

---

## the critical path

three gates that, if missed, slip the whole schedule:

1. **manifesto final prose locked by W-16 (2026-05-27).** the user is the only person who can produce this. agent-drafts exist in `01-manifesto-draft.md`. lock by reply-in-thread: _"manifesto is final, ship it."_

2. **vendor selected by W-12 (2026-06-24).** the user signs the invoice; the agent prepares the RFQ. four candidates (`vendor-rfq.md`). target turnaround for quotes: 2 weeks from RFQ send.

3. **interior PDF locked by W-09 (2026-07-15).** depends on (1) and the production-quality `build.mjs` script. all 32 pages + cover-back.

---

## owner matrix

| item                             | agent         | user        | note                                  |
| -------------------------------- | ------------- | ----------- | ------------------------------------- |
| spec, spine, typography rules    | ✅            | ✅ (review) | locked v0.1                           |
| interior content (non-manifesto) | ✅            | ✅ (review) | agent drafts all                      |
| manifesto final prose            | ❌            | ✅          | agent provides scaffolds + draft only |
| cover-front + cover-back design  | ✅            | ✅ (review) | agent ships SVG                       |
| BOM foldout SVG                  | ✅            | ✅ (review) | agent renders                         |
| build pipeline (paged.js)        | ✅            | ✅ (run it) | agent ships scripts                   |
| vendor RFQ                       | ✅ (template) | ✅ (send)   | user signs and emails                 |
| invoice, payment                 | ❌            | ✅          | wooden computer co. credit card       |
| pre-order page                   | ✅ (copy)     | ✅ (deploy) | shopify/notion/custom                 |
| numbering, stamping              | ❌            | ✅          | hand-stamped by user                  |
| shipping                         | ❌            | ✅          | post-office trip                      |

---

## cost model (target)

per-unit at 100-unit run:

```
print  (interior 32pp + cover 4pp, A5, K + brass spot, 80/120 gsm)  $4.20
saddle-stitch + trim                                                 $0.40
brass ink stamp (serial)                                             $0.10
brass corner stamp (cover)                                           $0.20
packaging (kraft envelope + cardboard stiffener)                     $1.20
domestic shipping (USPS Media Mail)                                  $4.50
international shipping (USPS First-Class Intl.)                      $14.00
                                                                     ─────
domestic per-unit cost                                              $10.60
international per-unit cost                                         $20.10
```

revenue at $25/unit retail:

```
60 units sold domestic @ $25 = $1,500    cost $636    surplus  $864
0 units sold international (TBD)
─────────────────────────────────────────────────────────────────────
edizione I projected surplus            $864
↓
returns to edizione II print fund (not paid to anyone)
```

we are not making money. we are not losing money. we are returning the surplus to the next print.

see `pricing.md` for the full cost model with sensitivity analysis.

---

## risk register

ranked by impact × likelihood.

| risk                                          | probability | impact   | mitigation                                                  |
| --------------------------------------------- | ----------- | -------- | ----------------------------------------------------------- |
| manifesto prose slips past W-16               | medium      | critical | publish draft with disclaimer; user can edit between proofs |
| brass spot color unavailable at chosen vendor | medium      | medium   | foil-stamp fallback locked in spec.md soft-list             |
| vendor minimum exceeds 100 units              | low         | medium   | switch to Lulu POD or absorb the 200-unit run               |
| IBM Plex license confusion                    | very low    | low      | OFL is bundled; vendor only needs PDF/X-1a                  |
| shipping cost overruns                        | medium      | low      | hold prices at $25 + actual shipping; absorb up to $2       |
| serial-stamp ink quality varies               | medium      | low      | use a single stamp pad sourced from one vendor              |

---

## file map

```
press/edizione/
├── PRODUCTION.md            this file
├── README.md                public overview
├── spec.md                  trim/paper/binding/color
├── spine.md                 32-page sequence
├── typography.md            type + brass usage rules
├── colophon.md              page 30
├── distribution.md          who gets the 25 contributor copies
├── pricing.md               full cost model
├── promo-and-preorder.md    pre-order page copy + outreach plan
├── vendor-rfq.md            template for printers
├── print-checklist.md       pre-press final pass
├── cover-front.svg          ✅
├── cover-back.svg           ✅
├── 00-frontispiece.md       page 1 — full-bleed exploded view
├── 00-contents.md           page 3 — TOC
├── 01-manifesto.md          pages 4-7 — SCAFFOLD (structural authority)
├── 01-manifesto-draft.md    pages 4-7 — AGENT DRAFT
├── 02-architecture.md       pages 8-19 — five layers
├── 03-mk-units.md           pages 20-23 — mk i + mk ii
├── 04-editions.md           pages 26-27 — three editions
├── 05-bom-foldout.md        pages 28-29 — BOM foldout description
├── 05-bom-foldout.svg       pages 28-29 — BOM foldout artwork
├── 06-receipts.md           pages 24-25 — receipts + methodology
├── 07-influences.md         page 31 — condensed canon
├── 08-close.md              page 32 — Q.E.D.
└── build-scripts/
    ├── README.md            how to run the build
    ├── build.mjs            paged.js HTML+CSS → PDF
    ├── style.css            the print CSS
    └── template.html        the HTML scaffold
```

---

## the philosophy

three things this production is for:

1. **as a thinking medium.** print does what screens cannot — total page, no interaction, sustained attention. the manifesto deserves a place where the reader cannot tab away.
2. **as a cultural artifact.** Hundred Rabbits, Low-tech Magazine, SRL show posters, Teenage Engineering product manuals: physical print is how this kind of work gets remembered.
3. **as a forcing function.** a printed thing cannot be patched. it requires the project to commit. that commitment is documentation that the version it captures actually existed.

if at any point in the schedule one of these three things is no longer being served, stop and rethink. do not ship for the sake of shipping.

`Q.E.D.`
