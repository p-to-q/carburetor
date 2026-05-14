# 02-architecture · pages 8-19

the five layers spread. NOT a user-authored manifesto; this is technical content that an agent can produce.

## page 8-9 — opener spread

### page 8 (left, full-page architecture diagram)

reproduction of the ASCII chain from `docs/architecture.md`, set in Plex Mono 11pt:

```
   FuelState        CombustorState       BusState           ComputeState        RitualState
  ┌────────┐  ──►  ┌───────────┐  ──►  ┌────────┐  ──►   ┌──────────┐  ──►   ┌──────────┐
  │  fuel  │       │ combustor │       │  bus   │        │ compute  │        │  ritual  │
  │        │       │           │       │        │        │          │        │          │
  │chemical│       │ chem  →   │       │rectify │        │  mcu +   │        │ ear · eye│
  │potentl │       │ mech/therm│       │+ buffer│        │  lcd +   │        │ hand · OS│
  │        │       │           │       │  mppt  │        │  modem   │        │  nose    │
  └────────┘       └───────────┘       └────────┘        └──────────┘        └──────────┘
       ▲                                                                          │
       │                            UserEvent (refuel / prime / crank / kill /    │
       └──────────────────────────  keypress / compose_send)  ────────────────────┘
                                                                                 user
```

arrows and box outlines: brass.
all labels: black.

### page 9 (right, opening prose)

```
we found five points along the chain where the
physical type of energy changes — chemical,
mechanical or thermal, electrical, digital,
sensory — and refused to collapse them.

naming each transition gives us five things at
once: a place to test, a place to swap, a place
to instrument, a place to document, and a place
to put a callout on the exploded view.

we did not invent five. five is what was there.
```

set in Plex Serif 12pt / 18pt leading. ragged-right.

## page 10-11 — layer 1: fuel

### page 10 (text)

```
01 · FUEL

  what     a refillable container of chemical potential.

  physics  glow fuel  ≈ 22 MJ/kg ≈  6.1 Wh/g
           liquid butane ≈ 49 MJ/kg ≈ 13.6 Wh/g
           gasoline   ≈ 46 MJ/kg ≈ 12.8 Wh/g

  numbers  mk i  ·  15 mL pyrex tank  ·  ~8 h per fill
           mk ii · 30 mL butane cartridge · ~24 h per fill

  swap     fuel kind, tank capacity, filler interface.
           anything upstream of FuelState is replaceable.

  test     weigh the device before and after a cycle.
           subtract.
```

set in Plex Mono 9pt, with the `01 · FUEL` header in Plex Sans 18pt brass.

### page 11 (visual)

a single brass-accented illustration: the pyrex sight glass with a meniscus shown, fuel line emerging, brass chained filler cap. labeled "01" in brass at the top corner.

below it, a small caption: "the sight glass shows you the same number the firmware uses to estimate runtime."

## page 12-13 — layer 2: combustor

### page 12 (text + cox illustration)

```
02 · COMBUSTOR

  what     converts fuel into either mechanical shaft
           power (mk i) or a thermal gradient (mk ii).

  mk i     cox tee dee .049 · 0.81 cc · 2-stroke glow
           78–108 W shaft @ 22,000 rpm · 14 g

  mk ii    butane catalytic + bismuth-telluride TEG
           400–600 °C catalyst · 180 °C TEG hot face
           1.5–2.0 W into bus

  loses    mk i: ~70% to heat, sound, castor mist
           mk ii: ~92–95% to thermal radiation
```

a small cox engine illustration in brass on this same page, taking the right half. callouts: 09 (engine), 10 (generator).

### page 13 (full illustration)

the cox tee dee .049 in cross-section, drawn at near-full page, brass-accented. cooling fins visible. glow plug on top. crankcase + crank + connecting rod visible.

bottom caption: "the cox tee dee .049 was in production from 1948 to 2006. it is the most-built model glow engine in history."

## page 14-15 — layer 3: bus

### page 14 (text + diagram)

```
03 · BUS

  what     rectifies, regulates, buffers, distributes.

  insight  the engine is the charger,
           the li-ion is the capacitor.
           inverted from a normal phone.

  power    AC from BLDC PMG
            → schottky bridge (Vf ~0.3 V)
            → MPPT buck (LTC3119, ~92% η)
            → 300 F × 2 supercap (~600 J)
            || 18350 li-ion (8 kJ)
            → LDO to compute

  invariant  ∫ P_combustor · dt
           ≥ ∫ P_compute · dt
           + thermal losses (within 2%)
```

### page 15 (oscilloscope trace)

a single SVG: the V_bus voltage trace during one full burst cycle (~3 minutes). x-axis: time. y-axis: V_bus. the trace climbs from 0 to 5.4 V, plateaus, drops as compute load engages, then engine cuts out and V_bus slowly decays to 4.4 V over 8 hours of standby.

brass-accented annotations: "ignite", "live", "engine cutoff", "8 h later".

caption below: "one engine burst. then eight hours."

## page 16-17 — layer 4: compute (full bleed)

a single full-bleed illustration: the PCB stack exploded.

four modules, each in its own brass-outlined rectangle:
- nRF52840 (mcu)
- Quectel BG95-M3 (cellular)
- LTC3119 (mppt)
- 300 F × 2 supercap

leader lines in brass connect each module to a label in the margin.

below the spread, in a single thin line of Plex Mono: "compute · ~50 mW average · ~2.3 W peak · cat-m1 data only · no voice."

## page 18-19 — layer 5: ritual

### page 18 (text)

```
05 · RITUAL

  what     the layer where the device meets a person.
           sound, heat, light, weight, scent, pause.

  not      decoration. the layer that makes the device
           honest about what it is doing.

  mk i     85 dBA muffled at arm's length · castor
           scent · ~650 g · 10 s prime + crank + warmup
           · 8 h live · ~12 h li-ion holdup at standby.

  mk ii    silent · butane scent (faint) · ~280 g
           · 60 s catalyst warmup · 24 h live.

  swap     do not. this is the only layer you should
           not swap. the whole project exists for
           this layer.
```

### page 19 (stage diagram)

a brass-accented horizontal flow diagram:

```
COLD → PRIMING → CRANKING → WARMUP → LIVE → COOLDOWN → REFUEL_NEEDED
       (3 pumps)  (1 pull)  (45 s)    (8 h)
                                                ↑                  │
                                                └──────────────────┘
```

caption: "the firmware will tell you which stage you are in. you will know without looking."

## footer

every page in this section carries the `[carburetor]` brass footer + page number in the outside bottom margin.

`Q.E.D.`
