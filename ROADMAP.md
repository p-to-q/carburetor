# ROADMAP

## v0.1 — the trunk (current, 2026-05-13)

- ✅ five-layer architecture, codec protocol, hard constraints
- ✅ types in TypeScript and Python (canonical contracts)
- ✅ three editions defined (vapore / processta / classica)
- ✅ two BOMs (mk1-classica $760, mk1-processta $120)
- ✅ mk1 exploded view
- ✅ README, PROMPT, AGENTS, license tier, workspace hygiene
- ✅ Edizione I spec, spine, cover-front, colophon
- ✅ five-layer simulator (TS + Python, headless runner, 7 tests)
- ✅ telemetry codec (TS, 64-byte frame with SHA-256)
- ✅ CI pipeline (format, build, test, golden check, doctrine guardrail)
- ✅ surface audit — docs aligned with implementation reality (2026-05-20)

## v0.2 — the simulator becomes real (near-term)

target: 2026 Q3.

### phase 2a — fix and validate (Codex)

- 🔴 #13: fix thermal model waste heat ratio (~4x too low)
- 🔴 #15: implement Python telemetry codec (byte-identical to TS)
- 🔴 #17: add edge-case tests (flameout, fuel exhaustion, kill during warmup, refuel during cooldown)
- 🔴 #16: first golden fixture — cold-start-warmup scenario (blocked on #13)

### phase 2b — browser simulator (Claude Code + Codex)

- 🔴 browser playable simulator — the Vapore release (architecture + UI: Claude Code; implementation: Codex)
- 🔴 Cox 049 Otto-cycle thermodynamics in Python

### phase 2c — firmware and fixtures (Codex)

- 🔴 firmware skeleton: `firmware/mk1-classica/` (Zephyr/Rust)
- 🔴 firmware skeleton: `firmware/mk1-processta/` (ESP-IDF/Rust)
- 🔴 golden fixtures for three more scenarios:
  - `flameout-recovery`
  - `low-fuel-warning`
  - `refuel-and-text-for-an-hour`
- 🔴 bench scripts populated (`scripts/bench/`)

### phase 2d — Edizione (Claude Code: design; Codex: build pipeline)

- 🔴 Edizione I — interior content filled (pending bench data for receipts spread)
- 🔴 Edizione build pipeline (paged.js + puppeteer → PDF)

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
