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

### phase 2a — fix and validate (Codex) — DONE, pending merge

all four original items completed in PR #30. blocked on review fixes.

- ✅ #13: thermal model waste heat ratio fixed
- ✅ #15: Python telemetry codec (byte-identical to TS)
- ✅ #17: edge-case tests (flameout, fuel exhaustion, kill during warmup)
- ✅ #16: golden fixtures — four scenarios (cold-start, full-burn, kill-restart, low-fuel)

**review debt** (PR #30, moapacha): codec spec violation, rounding divergence, energy invariant, manifest spine. tracked in #44–#48 (all closed). awaiting moapacha re-review.

### phase 2a.1 — LoRa architecture pivot (Claude Code: spec; Codex: impl) — DONE, pending merge

the processta edition switched from cellular (BG95 cat-M1) to LoRa mesh (SX1262, Meshtastic-compatible). design spec landed in PR #43. simulator types and bus model updated in PR #53.

- ✅ #41: update types.ts/sim_types.py — `modem_mA` → `radio_mA`, LoRa RSSI thresholds (PR #53)
- ✅ #42: resize bus model — LiFePO4 20 kJ + 50 J output cap, no supercap bank (PR #53)
- ✅ TEG power model correction — sustained output 0.1–0.3 W confirmed in architecture.md
- ✅ #36: bus/compute edge-case tests (PR #54, stacked on #53)
- ✅ #49: processta BOM rewritten for LoRa (PR #51)
- ✅ #50: Edizione I processta content updated (PR #52)

### phase 2b — browser simulator (Claude Code + Codex) — DONE, pending merge

vapore is feature-complete: sim loop, LCD canvas, audio, responsive layout, polish.

- ✅ #32: Sharp Memory LCD 128×128 canvas renderer (PR #55)
- ✅ #28: Web Audio engine sound — sawtooth + noise, RPM-driven (PR #56)
- ✅ #29: responsive polish, animations, reduced-motion, meta tags (PR #57)
- 🔴 Cox 049 Otto-cycle thermodynamics in Python (deferred to v0.3)

### phase 2c — firmware skeletons (Codex)

- 🔴 firmware skeleton: `firmware/classica/` (Zephyr + nRF52840)
- 🔴 firmware skeleton: `firmware/processta/` (ESP-IDF + ESP32-S3)
- 🔴 bench scripts populated (`scripts/bench/`)

### phase 2d — Edizione (Claude Code: design; Codex: build pipeline)

- 🔴 Edizione I — interior content (pending bench data for receipts spread)
- 🔴 Edizione build pipeline (paged.js + puppeteer → PDF)

## v0.3 — bench numbers replace projections (mid-term)

target: 2026 Q4 – 2027 Q1.

- 🔴 classica hardware v0 assembled (one unit, one engineer's hands)
- 🔴 processta kit assembled by an external maker — replication test
- 🔴 measured receipts replace projected numbers in README
- 🔴 KiCad schematic + PCB rev A (processta first — simpler BOM)
- 🔴 FreeCAD enclosure with injection-mold drawings (processta ABS case)
- 🔴 docs/safety.md updated with measured CO ppm (classica) and thermal profile (processta TEG)
- 🔴 first postmortem (something will fail)

## v0.4 — mk ii combustor enters

target: 2027 Q2.

mk ii replaces the Cox .049 with a catalytic butane combustor + TEG stack. both editions get mk ii as an option — classica gets more power (5–8W → still 5–8W, different source), processta gets it as the default (it's already designed for TEG).

- 🔴 mk ii combustor spec (catalyst chamber, TEG mounting, thermal management)
- 🔴 mk ii BOM delta (classica: +$40; processta: already costed)
- 🔴 mk ii firmware delta (temperature PID for TEG, no RPM/tach)
- 🔴 mk ii exploded view
- 🔴 Edizione II — adds mk ii pages

## v1.0 — three editions, two units, real numbers

target: 2027 Q4.

- 🔴 ten classica units built (archive run)
- 🔴 fifty processta kits documented as built by external makers
- 🔴 mk ii combustor in field test
- 🔴 every receipts number has ≥ 12 bench runs of σ
- 🔴 carburetor.wtf launches with embedded Vapore simulator
- 🔴 Edizione I print run sold out; Edizione II in print

## possible later

- mk iii (table-piece "INTERNAL" desk-phone variant — AC powered, no combustor)
- mk i Stirling sub-variant (silent IC option, replaces Cox .049 with a free-piston Stirling)
- multi-unit LoRa mesh (Meshtastic mesh relay between carburetors)
- companion analog accessories: fuel canteen, repair kit, field gauge

these are not committed. they are reminders that the architecture supports them.

## the principles that gate every milestone

1. **no milestone ships without receipts.** every advertised number is bench-measured and ±σ-pinned.
2. **no edition diverges from the architecture.** if processta needs a sixth layer, processta is wrong.
3. **the Edizione is not optional.** every major version ships its print.

`Q.E.D.`
