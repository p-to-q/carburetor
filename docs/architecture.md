# architecture

> the five layers between a thimble of fuel and a sentence on a screen.

carburetor is a chain of five typed transformations. each one consumes a state in its own native units and emits a state in the next layer's native units. naming each transition gives us five things at once: a place to test, a place to swap implementations, a place to instrument, a place to document, and a place to put a callout on the exploded view.

we did not invent five layers. we found five points along the chain where the physical _type_ of energy changes — chemical, mechanical-or-thermal, electrical, digital, sensory — and refused to collapse them.

## the chain

```
   FuelState        CombustorState       BusState           ComputeState        RitualState
  ┌────────┐  ──►  ┌───────────┐  ──►  ┌────────┐  ──►   ┌──────────┐  ──►   ┌──────────┐
  │  fuel  │       │ combustor │       │  bus   │        │ compute  │        │  ritual  │
  │        │       │           │       │        │        │          │        │          │
  │chemical│       │ chem  →   │       │rectify │        │  mcu +   │        │ ear · eye│
  │potentl │       │ mech/therm│       │+ buffer│        │  lcd +   │        │ hand · OS│
  │        │       │           │       │  mppt  │        │  radio   │        │  nose    │
  └────────┘       └───────────┘       └────────┘        └──────────┘        └──────────┘
       ▲                                                                          │
       │                            UserEvent (refuel / prime / crank / kill /    │
       └──────────────────────────  keypress / compose_send)  ────────────────────┘
                                                                                 user
```

each interface above the arrows is a typed contract. a `FuelState` is not a number; it is a record with units in the field names. a `CombustorState` carries operating mode and uncertainty. so on through the chain.

this is the same shape as `wittgenstein` — typed codecs producing real artifacts — except the upstream IR is chemistry instead of english.

---

## layer 1 — fuel

**what.** a refillable container of chemical potential.

**physics.** energy is stored in C-H and C-C bonds, liberated by oxidation. lower-heating-value densities of the fuels we use:

- glow fuel (methanol + 10–25 % nitromethane + 18 % castor oil) ≈ 22 MJ/kg ≈ 6.1 Wh/g.
- liquid butane (n-C4H10) ≈ 49 MJ/kg ≈ 13.6 Wh/g.
- gasoline ≈ 46 MJ/kg ≈ 12.8 Wh/g. (mk i could in principle run on it; the cox .049 requires a spark conversion we have not budgeted for v1.)

a tank can spill, can evaporate, can dissolve plastic, can ignite. these are not edge cases; they are the _defining_ properties of the layer.

**types.**

```typescript
type FuelKind = 'glow' | 'butane' | 'gasoline';

interface FuelState {
  kind: FuelKind;
  volume_mL: number;
  temperature_C: number;
  vapor_pressure_kPa: number;
  contaminant_water_pct?: number; // glow fuel only
}
```

**numbers.**

|                                 | mk i                 | mk ii                  |
| ------------------------------- | -------------------- | ---------------------- |
| tank                            | 15 mL pyrex          | 30 mL butane cartridge |
| typical fill                    | 3–5 s squeeze bottle | 8 s cartridge swap     |
| usable runtime per fill         | ~8 hours phone time  | ~24 hours phone time   |
| evaporation rate at 25 °C, open | ~0.05 mL/hr          | ~0 (sealed)            |

**how to test.** weigh the device before and after a benchmark cycle; subtract.

**what you can swap.** the fuel kind. the tank capacity. the filler interface. anything _upstream_ of `FuelState` is replaceable so long as the type contract holds.

---

## layer 2 — combustor

**what.** converts `FuelState` into either mechanical shaft power (mk i) or a thermal gradient (mk ii). both produce exhaust.

**physics.** mk i: a 0.81 cc 2-stroke glow engine; compression-ignites methanol-rich premix; peak ~108 W shaft at 22,000 rpm; we run it deliberately throttled at ~30–60 W to extend bearing life and reduce dB. mk ii: a platinum-on-alumina catalyst pad oxidizes butane at 400–600 °C; the hot face heats one side of a stacked bismuth-telluride TEG (three modules in series-parallel); cold side is finned aluminum.

mk i loses ~70 % of fuel energy to heat, sound, and unburnt fuel exiting the muffler as castor-oil mist. mk ii loses ~92–95 % to thermal radiation, conduction, and the carnot ceiling of a 200 °C ΔT TEG. both numbers are bad. both are honest.

**types.**

```typescript
type CombustorKind = 'cox-049' | 'catalytic-teg' | 'stirling' /* future */;

type CombustorPhase =
  | 'off'
  | 'prime'
  | 'ignite'
  | 'warmup'
  | 'run'
  | 'cooldown'
  | 'flameout'
  | 'fuel_low'
  | 'thermal_high';

interface CombustorState {
  kind: CombustorKind;
  running: boolean;
  rpm: number | null; // mk i only
  hot_C: number;
  cold_C: number | null; // mk ii only
  exhaust_dB_1m: number;
  shaft_W: number | null; // mk i only
  thermal_W: number;
  electric_W_raw: number; // pre-rectifier, feeds bus
  runtime_s: number;
  fuel_consumed_mL: number;
  phase: CombustorPhase;
  phase_elapsed_s: number;
}
```

**numbers.**

|                           | mk i           | mk ii                                 |
| ------------------------- | -------------- | ------------------------------------- |
| fuel burn at usable load  | 2.5 mL/min     | ~0.5 mL/min equivalent                |
| acoustic at 1 m, muffled  | 85–90 dBA      | < 30 dBA                              |
| hot face                  | 200–300 °C     | 400–600 °C catalyst, 180 °C TEG hot   |
| warm-up                   | 10–15 s        | 30–60 s                               |
| usable electric output    | 5–8 W into bus | 0.1–0.3 W sustained (passive cooling) |
| state-machine transitions | 11             | 9                                     |

**how to test.** torque transducer + tachometer for mk i; thermocouples + load resistor for mk ii. both produce telemetry frames at 100 Hz (see `codec-protocol.md`).

**what you can swap.** a different combustor (OS Wankel for higher shaft power, custom Stirling for silence — both tracked in `ROADMAP.md`). the carb / muffler. the catalyst formulation.

---

## layer 3 — bus

**what.** rectifies, regulates, buffers, distributes.

**physics.** the bus layer is edition-specific hardware but shares a typed contract (`BusState`).

- classica: AC from the BLDC-as-PMG → schottky bridge (Vf ~0.3 V per leg) → MPPT buck (`LTC3119`, ~92 % η) → supercap pair (300 F × 2 in series → 150 F at 5 V, ~600 J usable) in parallel with a li-ion buffer (18350, 600 mAh × 3.7 V ≈ 8 kJ). the supercap absorbs the modem's ~600 mA cat-M1 TX transients; the li-ion buffers slower discharge between engine cycles.
- processta: DC from the catalytic TEG (0.1–0.3 W sustained) → TPS562200 buck → BQ25170 linear charger ($0.80) → LiFePO4 18650 buffer (modeled as ~20 kJ). no supercap bank needed — the LoRa TX transient (118 mA, ~0.39 W at the cell) is within the LiFePO4 discharge capability. optional USB-C input via the BQ25170's VIN for bench/development charging.

the key insight at this layer: **the engine is the charger, the battery is the capacitor.** inverted from a normal phone. classica uses a supercap for peak shaving; processta's lower TX current means the LiFePO4 handles transients directly.

**types.**

```typescript
interface BusState {
  v_bus_V: number;
  i_bus_A: number;
  v_li_V: number;
  i_li_A: number;
  soc_li_pct: number; // LiFePO4 buffer state of charge
  soc_cap_pct: number; // small regulator/output-cap buffer state of charge
  t_case_C: number;
  mppt_locked: boolean; // charging regulator is accepting input
  e_in_J: number; // cumulative energy in from combustor
  e_out_J: number; // cumulative energy out to compute
  thermal_losses_J: number; // modeled waste heat rejected by combustor
}
```

energy accounting invariant: `buffer_initial_J + e_in_J ≈ buffer_final_J + e_out_J`; combustor waste heat is tracked separately as `thermal_losses_J`. both are enforced as CI gates, ±2 %.

**numbers (classica).**

| | value |
|---|---|
| supercap bus | 5 V nominal, 4.4–5.4 V operating |
| li-ion bus | 3.7 V nominal, 3.0–4.2 V operating |
| cat-M1 TX transient | 600 mA @ 3.8 V = 2.3 W, ~5 ms |
| supercap holdup at peak draw | 30+ s |
| li-ion holdup at idle after one burst-charge | ~12 h |

**numbers (processta).**

| | value |
|---|---|
| LiFePO4 bus | 3.2 V plateau, 2.8–3.65 V modeled |
| LoRa TX transient | 118 mA @ 3.3 V = 0.39 W |
| TEG sustained input | 0.1–0.3 W (passive-cooled Bi₂Te₃) |
| output-cap modeled energy | ~50 J |
| LiFePO4 modeled energy | ~20 kJ |
| USB-C input (optional) | 5 V via BQ25170, dev/bench only per classica constraint |

**how to test.** four-trace scope on (v_bus, i_bus, v_li, t_case). USB-PD analyzer at the compute rail.

**what you can swap.** any chip on the buck rail. supercap value (classica). li-ion chemistry (LiFePO4 for processta; li-ion 18350 for classica). charger IC (BQ25170 → MCP73831 if single-cell simplicity is preferred).

---

## layer 4 — compute

**what.** runs an OS, drives the screen, drives the radio.

**physics.** the compute layer is edition-specific hardware but edition-invariant contracts.

- classica: nRF52840 at 64 MHz + BG95-M3 cat-M1 modem + Sharp Memory LCD + Q10 keyboard.
- processta: ESP32-S3 at 80–240 MHz + SX1262 LoRa 868/915 MHz + Sharp Memory LCD + 5 buttons.

the sim currently models the processta profile (ESP32-S3 + LoRa). classica's cellular profile (higher TX current, different RSSI range) is a future variant.

**types.**

```typescript
type ComputeMode =
  | 'sleep'           // deep sleep, radio sleep, lcd holding image
  | 'idle'            // mcu awake, screen on, no traffic
  | 'rx'              // radio listening
  | 'tx'              // radio transmitting
  | 'compose'         // user typing
  | 'engine_attn';    // engine ui (during warmup or refuel)

interface ComputeState {
  mode: ComputeMode;
  mcu_mA: number;
  radio_mA: number;
  lcd_uA: number;
  signal_dbm: number;
  rssi_bars: 0 | 1 | 2 | 3 | 4;
  queued_messages: number;
  uptime_s: number;
}
```

**numbers (processta: ESP32-S3 + SX1262 LoRa).**

| mode | mcu | radio | lcd | total |
|---|---|---|---|---|
| sleep | 8 µA | 0.16 µA | 10 µA | ~60 µW |
| idle | 25 mA | 4.6 mA | 50 µA | ~110 mW |
| tx | 25 mA | 118 mA | 175 µA | ~530 mW |

**numbers (classica: nRF52840 + BG95-M3 cat-M1).** future; not yet modeled in sim.

| mode | mcu | radio | lcd | total |
|---|---|---|---|---|
| sleep | 2 µA | 3 µA | 50 µW | ~25 µW |
| idle | 5 mA | 100 mA | 175 µW | ~390 mW |
| tx (5 ms burst) | 5 mA | 600 mA | 175 µW | ~2.3 W |

**how to test.** keithley source-measure unit on each rail. firmware exposes per-mode current expectations; `pnpm bench:power-modes` asserts.

**what you can swap.** the SoC (classica: nRF52840; processta: ESP32-S3). the display (e-ink for mk ii). the radio (classica: BG95 cellular; processta: SX1262 LoRa). the OS (we use zephyr for classica, ESP-IDF for processta; nuttx is acceptable for ports).

---

## layer 5 — ritual

**what.** the layer where the device meets a person. sound, heat, light, weight, scent, pause.

**physics.** human sensorimotor. you hear engine note (~85 dBA muffled at arm's length, equivalent to a kitchen blender — not pleasant, not dangerous, deliberately present). you feel weight (~650 g, heavier than any contemporary phone — deliberate). you smell castor oil if mk i, nothing if mk ii. you wait (45 s warm-up for mk ii, ~10 s prime + crank + ignite for mk i). you watch a needle climb.

this is not decoration. it is the layer that _makes_ the device honest about what it is doing.

**types.**

```typescript
type RitualStage =
  | 'cold'
  | 'priming'
  | 'cranking'
  | 'warmup'
  | 'live'
  | 'cooldown'
  | 'refuel_needed';

type Scent = 'none' | 'castor' | 'butane';

interface RitualState {
  stage: RitualStage;
  dB_at_ear: number;
  case_C: number;
  scent: Scent;
  minutes_runtime_remaining: number;
  minutes_until_refuel: number;
  next_user_action: string | null; // e.g., 'pour 5 mL', 'pull crank', 'wait 38 s'
}
```

**numbers.**

| stage    | duration | what the user does          | what the device emits                         |
| -------- | -------- | --------------------------- | --------------------------------------------- |
| priming  | ~8 s     | three pumps of the primer   | (nothing)                                     |
| cranking | ~5 s     | one pull of the brass crank | engine "brap", warm exhaust                   |
| warmup   | ~45 s    | wait                        | needle climbs 0 → 5 V, lamp lights            |
| live     | 6–8 h    | use the phone               | screen + faint engine hum (mk i auto-stopped) |
| refuel   | ~8 s     | unscrew cap, pour, replace  | (nothing)                                     |

**how to test.** stopwatch + decibel meter + a person. sim: a playable widget where each stage is dragged through manually.

**what you can swap.** this is the only layer you should not swap. the whole project exists for this layer.

---

## the telemetry codec

each non-ritual layer reports state at 100 Hz over USB-serial as a 64-byte little-endian binary frame. one frame = one snapshot of the device.

```
byte    field
0       0xCB             sync byte ("carburetor")
1       0x01             protocol version
2-3     seq u16          monotonic sequence
4-11    t_us u64         monotonic timestamp µs
12      layer u8         1=fuel, 2=combustor, 3=bus, 4=compute, 5=ritual
13      kind u8          layer-specific kind enum
14-15   flags u16        layer flags
16-47   payload          layer-specific 32-byte payload
48-55   sha256_prefix    first 8 bytes of sha-256(bytes 0..47)
56-63   reserved
```

frame definitions per layer are in `docs/codec-protocol.md`. the host decodes frames into CSV (one file per layer per run); the simulator renders the same frames into PNG, SVG, and WAV artifacts.

**why a binary codec, not JSON.** we want byte-precise reproducibility. two runs with the same fuel + same firmware + same seed must produce sha-identical telemetry. JSON's whitespace and ordering would break that. fixed-width binary gives us a manifest spine — see `docs/reproducibility.md`.

---

## three readings

**for the engineer.** each layer has a typed interface. you can implement an alternative `Combustor` (a Stirling, say) and as long as it emits a valid `CombustorState`, the bus and compute layers are unchanged. the layer boundary is _exactly_ the place to put unit tests. our golden-fixture pattern (`fixtures/golden/<scenario>/`) pins reference telemetry as sha-256-locked binary files, so a refactor that changes one layer's internal logic but preserves its interface must produce byte-identical output. that is the strongest form of regression test we know how to write.

**for the researcher.** every layer is independently instrumentable. you can replay a recorded fuel + combustor session into the bus simulator and ask _what would the supercap have done with a slightly different MPPT setpoint?_ the manifest spine — `git_sha`, `lockfile_hash`, `seed`, full I/O — means any run is reproducible from a clean checkout. we publish numbers as `5.4 ± 0.3 %`, not `~5 %`; the `±` is the measured 1σ over the latest 12 bench runs, pinned in `artifacts/runs/`.

**for the user.** the device is built to be understood. the voltmeter shows you the supercap bus voltage — the same number you'd read in the spec sheet. the sight glass shows you the fuel level — the same number the firmware uses to estimate remaining runtime. the screen tells you what state the device is in and what you should do next. if it asks you to wait, it tells you for how long. if it needs fuel, it tells you how much.

---

## what this architecture creates

derived directly from these five layers, the repo grows:

- `packages/sim/src/types.ts` — the TypeScript interfaces above, verbatim.
- `packages/sim/src/{fuel,combustor,bus,compute,ritual}/` — five subpackages, one per layer, each independently testable.
- `python/sim_mini/{fuel,combustor,bus,compute,ritual}.py` — the python prototype, same shape.
- `firmware/mk1/src/{combustor,bus,compute,ritual}.rs` — four firmware modules. no fuel module: fuel is pure mechanical.
- `docs/codec-protocol.md` — the binary frame format, expanded.
- `docs/hard-constraints.md` — what will not change.
- `hardware/mk1/schematic/` — kicad blocks named per layer.
- `hardware/mk1/bom-classica.csv` — definitive parts list, grouped by layer.
- `hardware/mk1/bom-processta.csv` — maker edition parts list, same architecture, cheaper parts.
- `fixtures/golden/<scenario>/` — sha-pinned reference runs.
- `artifacts/runs/<id>/manifest.json` — per-run reproducibility manifest.

if you are building something, start by reading the layer your part lives in. if you are reviewing a PR, ask which layer it touches and whether the interface contract changes. if you are using the device, you mostly live in layer 5 — and that is intended.

---

`Q.E.D.`
