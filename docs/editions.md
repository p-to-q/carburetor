# editions

three ways to encounter `[carburetor]`. all three implement the same five-layer architecture (`docs/architecture.md`) and emit telemetry in the same wire format (`docs/codec-protocol.md`). they differ in *how the layers are realized*.

| edition | cost (USD) | time | who it is for |
|---|---|---|---|
| **vapore** — the simulator | $0 | 5 minutes | anyone curious |
| **processta** — the maker | ~$120 | one weekend | students, makers, weekend builders |
| **classica** — the definitive | ~$760 | several weekends | serious builders, archival units |

---

## vapore — the simulator

zero dollars. zero parts. open `https://carburetor.wtf/sim` in a browser. pour fuel, prime, crank, listen for the engine note, watch the supercap bus climb, send a text, run out of fuel.

vapore implements **all five layers** in TypeScript (and a parallel Python mirror in `python/sim_mini/`). the telemetry frames it produces are byte-identical to what classica and processta hardware emit — same `0xCB` sync byte, same 64-byte width, same sha-256 prefix. you can decode a vapore run with the same tools you'd use on a classica run.

vapore simulates both editions: the classica power path (combustion → TEG → supercap → bus) and the processta power path (catalytic TEG → LiFePO4 → bus). the compute layer switches between cellular (classica) and LoRa (processta) profiles.

vapore is not a toy. it is the first-class implementation of the architecture; the hardware editions are the second and third. when we write a new scenario, we write it in vapore first, then mirror it into a hardware bench test.

**target:** anyone who wants to *encounter* the project at five minutes' notice. researchers comparing architectures. students learning what a power state machine looks like. people who want to verify that the warm-up really does take 45 seconds before committing $120 to a kit.

---

## processta — the maker edition

`~$120 USD · one weekend · soldering iron + multimeter required`

hardware architecture: `docs/processta-architecture.md`. firmware: `firmware/processta/` (TBD).

processta replaces the combustion engine with a butane catalytic heater (Pt/Al₂O₃ catalyst, silent, no moving parts) driving a Bi₂Te₃ thermoelectric generator. it replaces cellular with LoRa mesh (Meshtastic-compatible). the result is a device that runs on lighter fuel, communicates off-grid, and costs $120.

**what processta trades away for the price:**

| | classica | processta | trade |
|---|---|---|---|
| power source | Cox Tee Dee .049 (0.81 cc, 78–108 W shaft) | butane catalytic TEG (0.5–1.5 W electrical) | no moving parts, silent, but much less power — sufficient for LoRa |
| connectivity | BG95-M3 cat-M1 / nb-IoT / 2G (real cellular) | SX1262 LoRa 868/915 MHz (Meshtastic mesh) | no SIM, no cellular. range: 5–15 km LoS, 1–3 km urban. TX: 118 mA vs 600 mA |
| compute | nRF52840 + BG95 modem | ESP32-S3-WROOM-1 + EBYTE E22-900M22S | simpler stack, well-supported (ESP-IDF, Arduino, MicroPython) |
| display | Sharp LS027B7DH01 (same) | Sharp LS027B7DH01 (same) | identical — the right display for both |
| keyboard | BlackBerry Q10 (the best thumb keyboard ever shipped) | 5 tactile buttons (up/down/select/back/power) | no QWERTY; T9-style or scroll compose. honest constraint. |
| bus | LTC3119 MPPT + 2 × 300 F supercap + 18350 li-ion | BQ25170 charger + LiFePO4 18650 (3.5 Wh) | no supercap needed — LoRa TX peak (118 mA) is within battery C-rate |
| case | custom-sewn canvas, brass fittings, leather strap | injection-molded ABS, brunswick green (#2D4A3E) | field-instrument aesthetic, not heirloom. $8 vs $80 |

**what does *not* change:** the architecture (five layers, same as `docs/architecture.md`), the telemetry codec (same 64-byte frames, same sha-256 self-check), the simulator parity (both editions pass the same `pnpm sim:test` golden fixtures).

**target:** anyone who wants to build the project this weekend with a soldering iron and the standard maker toolkit.

---

## classica — the definitive edition

`~$760 USD · several weekends · oscilloscope helpful · sewing shop visit required`

parts list: `hardware/mk1/bom-classica.csv`. firmware: `firmware/mk1-classica/` (TBD).

every part has been chosen with the architecture in mind:

- **cox tee dee .049** is exactly at the project's spec — small enough to fit in 700 g, just powerful enough at 78–108 W to charge the supercap in a 10-minute burst, and old enough to have a 60-year service history. its quirks (castor exhaust, narrow throttle band, glow-plug pre-heat) are *features* the project celebrates.
- **sharp memory LS027B7DH01** is the canonical low-power reflective display. 50 µW static. daylight readable. no backlight. used by Pebble and Beepy and every honest battery-aware handheld since 2013.
- **BlackBerry Q10** is the best thumb keyboard ever shipped. fight us. the sculpted fret bars, the slight key dish, the click — there is no replacement in production, only the Solder Party carrier that revives it.
- **quectel BG95-M3** is the smallest, lowest-current, most widely-certified cat-M1 / nb-IoT module that ships with both modes plus a 2G fallback. 3 µA in PSM. 600 mA peak in TX.
- **custom canvas case** with brass fittings — this part is the project's spiritual ancestor: a TA-312 field telephone inherited by Coleman. you don't buy this on Amazon. you find a canvas sewing shop and you ask them politely.

**target:** people building an archival unit, or a unit they intend to use for years. a classica build is closer to a Leica purchase than a smartphone purchase: more expensive than seems reasonable, less convenient than seems reasonable, and the kind of thing whose value emerges over time.

---

## the architecture is the same

all three editions implement the same five-layer architecture defined in `docs/architecture.md`, and emit telemetry frames in the same format defined in `docs/codec-protocol.md`. you can run the same simulator scenarios against all three. you can use the same `pnpm decode` against the binary output of any of them.

this is what we mean by **"implementation swap is the contract"**. the editions exist to *validate* the architecture's swap-friendly claim. if you cannot build a $120 version and a $760 version against the same interfaces, the interfaces are not interfaces.

---

## a possible fourth: edizione (under discussion)

an **edizione** would be a printed zine — manifesto, drawings, the BOM rendered as a foldout, photographs of three or four built units, the receipts table, a few short essays. ~32 pages, ~$20–40 print-on-demand or limited offset run. not buildable; *receivable*. the way Hundred Rabbits and Low-tech Magazine and SRL distribute their work.

edizione is not in v1. it is here as a marker. if v0.1 ships well, we should consider whether to add it.

---

`Q.E.D.`
