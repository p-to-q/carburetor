# 06-receipts · pages 24-25

## page 24 (left, full receipts table)

set in Plex Mono 9pt / 13pt. brass horizontal rules between rows.

```
RECEIPTS                                              v0.1
──────────────────────────────────────────────────────────
fuel-to-USB efficiency (mk i)              ⚠ 5.4 ± 0.3 %
warm-up time (mk ii)                       ⚠ 45 ± 5 s
state-machine totality (sim)               🔴 pending
BOM resolvability                          ⚠ 100 % SKUs
case temperature at user grip (mk i)       🔴 pending
audible signature at 1 m (mk i)            🔴 pending
CO ppm at user breath height (mk i)        🔴 pending
modem TX peak current (mk i)               🔴 pending
li-ion holdup at idle, post-burst (mk i)   🔴 pending
──────────────────────────────────────────────────────────

  ⚠  measured at bench-prototype, not pinned
  🔴 pending bench (see scripts/bench/, TBD v0.2)

every number above is reproducible from a clean checkout.
each row points to a script under scripts/bench/ that produced
it; each script writes a manifest under artifacts/runs/<id>/.

we publish numbers as N ± σ, never as ~N. σ is the 1σ over
the most-recent 12 bench runs.
```

footer: `[carburetor] · 24` brass.

## page 25 (right, methodology)

set in Plex Serif 10pt / 14pt. one short paragraph per measured row.

```
fuel-to-USB efficiency (mk i)

bench: a Cox 049 mounted to a torque-arm dyno, coupled to a
T-motor 1806 outrunner used as PMG. measured shaft watts and
post-rectifier bus watts over a 3-minute burn of 7.5 mL glow
fuel. efficiency = bus_Wh / (fuel_mass × LHV). target run count
12. σ is the 1σ over those 12 runs.


warm-up time (mk ii)

bench: a catalytic combustor + 3-element TEG stack with a
thermocouple at the catalyst hot face and a USB-PD analyzer at
the bus. warm-up time = seconds from ignition to V_bus ≥ 4.8 V
sustained for 5 seconds. target run count 12.


state-machine totality (sim)

CI gate: every CombustorPhase has at least one valid transition
out. enforced by pnpm sim:test against fixtures/golden/. either
the 23 transitions are present in the implementation, or the
build fails.


BOM resolvability

CI gate: every SKU in bom-classica.csv and bom-processta.csv
resolves to a current vendor URL. weekly cron via pnpm bom:resolve.
target ≥ 95 %; rows that 404 are marked stale.
```

footer: `[carburetor] · 25` brass.

---

## the small print at the bottom of page 25

```
we do not say what we have not measured. when the bench has not
returned a row, the row says so. when the bench has returned a row
with σ above its threshold, the row says so. we will not move a row
from ⚠ to ✅ without 12 successive runs within tolerance.
```

set in Plex Serif italic 9pt / 13pt, centered, ~80 mm wide block.

`Q.E.D.`
