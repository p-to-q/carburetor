# ROADMAP

## v0.1 — the trunk (current)

- ✅ five-layer architecture, codec protocol, hard constraints
- ✅ types in TypeScript and Python (canonical contracts)
- ✅ three editions defined (vapore / processta / classica)
- ✅ two BOMs (mk1-classica $760, mk1-processta $120)
- ✅ mk1 exploded view
- ✅ README, PROMPT, AGENTS, license tier, workspace hygiene
- ✅ Edizione I spec, spine, cover-front, colophon

## v0.2 — the trunk grows code (near-term)

target: 2026 Q3.

- 🔴 combustor state machine (TS + Python, parallel impls)
- 🔴 bus simulator (energy-conservation invariant satisfied)
- 🔴 compute power model (per-mode current draws)
- 🔴 ritual stage driver
- 🔴 browser playable simulator `sim/index.html` — the Vapore release
- 🔴 Cox 049 Otto-cycle thermodynamics in Python
- 🔴 firmware skeleton: `firmware/mk1-classica/` (Zephyr/Rust)
- 🔴 firmware skeleton: `firmware/mk1-processta/` (ESP-IDF/Rust)
- 🔴 golden fixtures for the four core scenarios:
  - `refuel-and-text-for-an-hour`
  - `flameout-recovery`
  - `low-fuel-warning`
  - `cold-start-warmup`
- 🔴 bench scripts populated (`scripts/bench/`)
- 🔴 Edizione I — full interior content, print PDF, first 100-copy run

## v0.3 — bench numbers replace projections (mid-term)

target: 2026 Q4 – 2027 Q1.

- 🔴 mk1-classica hardware v0 assembled (one unit, one engineer's hands)
- 🔴 mk1-processta kit assembled by an external maker — replication test
- 🔴 measured receipts replace projected numbers in README
- 🔴 mk1 KiCad schematic + PCB rev A
- 🔴 mk1 FreeCAD enclosure with CNC drawings
- 🔴 docs/safety.md updated with measured CO ppm under each operating mode
- 🔴 first postmortem (something will fail)

## v0.4 — mk ii enters

target: 2027 Q2.

- 🔴 mk2 hardware spec
- 🔴 catalytic combustor + TEG stack BOM (classica + processta)
- 🔴 mk2 firmware skeletons
- 🔴 mk2 exploded view
- 🔴 Edizione II — adds mk ii pages

## v1.0 — three editions, two units, real numbers

target: 2027 Q4.

- 🔴 ten mk1-classica units built (archive run)
- 🔴 fifty mk1-processta kits documented as built by external makers
- 🔴 mk2 in field test
- 🔴 every receipts number has ≥ 12 bench runs of σ
- 🔴 carburetor.wtf launches with embedded Vapore simulator
- 🔴 Edizione I print run sold out; Edizione II in print

## possible later

- mk iii (currently undefined; could be the table-piece "INTERNAL" desk-phone variant)
- mk i Stirling sub-variant (the silent IC option)
- multi-unit mesh (BLE-tether between paired carburetors)
- companion analog accessories: fuel canteen, repair kit, field gauge

these are not committed. they are reminders that the architecture supports them.

## the principles that gate every milestone

1. **no milestone ships without receipts.** every advertised number is bench-measured and ±σ-pinned.
2. **no edition diverges from the architecture.** if processta needs a sixth layer, processta is wrong.
3. **the Edizione is not optional.** every major version ships its print.

`Q.E.D.`
