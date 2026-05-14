# 05-bom-foldout · pages 28-29

a gatefold spread that reproduces both BOMs side by side, layer-grouped, with a brass vertical rule between the two BOMs.

the actual artwork is `05-bom-foldout.svg`. this markdown documents the layout for the build pipeline.

## structure

```
┌──────────────────────────────────┬───────────────────────────────────┐
│                                  │                                   │
│  CLASSICA · ~$760                │   PROCESSTA · ~$120               │
│                                  │                                   │
│  FUEL                            │   FUEL                            │
│    pyrex 15 mL                   │     PET 30 mL                     │
│    brass filler cap (chained)    │     rubber stopper                │
│    silicone fuel line            │     silicone fuel line            │
│    primer bulb 3 cc              │     primer bulb 3 cc              │
│                                  │                                   │
│  COMBUSTOR                       │   COMBUSTOR                       │
│    cox tee dee .049              │     SH .15 nitro                  │
│    glow plug short ×2            │     glow plug universal ×2        │
│    cox 049 muffler               │     generic muffler               │
│    t-motor 1806 (PMG)            │     emax 1806 (PMG)               │
│    shaft coupling                │     shaft coupling                │
│    k-type thermocouple ×2        │     ds18b20 sensor ×2             │
│    glow plug driver              │     glow plug igniter clip        │
│    prop hub adapter              │                                   │
│                                  │                                   │
│  BUS                             │   BUS                             │
│    schottky bridge 1N5817 ×4     │     schottky bridge 1N5819 ×4     │
│    LTC3119 MPPT eval             │     TP4056 charging module        │
│    Maxwell BCAP0300 ×2           │     MT3608 boost module           │
│    KeepPower 18350 600 mAh       │     generic 18650 3000 mAh        │
│    18350 holder vertical         │     18650 holder                  │
│    sk26 schottky ×2              │     100 F supercap                │
│    SRR1280-470M inductor         │     SMD inductor 47 µH            │
│    output filter cap ×4          │                                   │
│                                  │                                   │
│  COMPUTE                         │   COMPUTE                         │
│    nRF52840 dongle               │     LilyGo T-Display-S3           │
│    Quectel BG95-M3               │     M5Stack CardKB Mini           │
│    BG95 EVB breakout             │     USB-C cable                   │
│    Sharp Memory LCD 2.7"         │     header pins 40-pin            │
│    Sharp LCD breakout            │                                   │
│    BlackBerry Q10 keyboard       │   (no modem — BLE to paired phone)│
│    Solder Party Q10 carrier      │                                   │
│    nano-SIM socket               │                                   │
│    u.fl to sma pigtail           │                                   │
│    quad-band cell antenna        │                                   │
│                                  │                                   │
│  RITUAL                          │   RITUAL                          │
│    analog voltmeter 0–6 V        │     analog voltmeter (generic)    │
│    brass mil-toggle DPDT         │     toggle SPDT                   │
│    chrome flip-guard             │     LED amber 3 mm                │
│    brass hand-crank (custom)     │     pull-cord (salvage or fab)    │
│    incandescent indicator T1-3/4 │     piezo buzzer 3–5 V            │
│    piezo buzzer 30 mm            │     canvas tool pouch             │
│    canvas case (custom-sewn)     │     banana terminals ×2           │
│    brass banana terminals ×2     │     nylon strap                   │
│    leather strap + d-rings       │                                   │
│                                  │                                   │
│  HARDWARE-SHARED                 │   HARDWARE-SHARED                 │
│    M2.5 brass screws kit         │     M2.5 screws assortment        │
│    heat-set inserts ×50          │     heat-set inserts ×25          │
│    silicone gasket sheet 1 mm    │     perfboard 70×90               │
│    aerogel blanket 5 mm          │     dupont jumper bundle          │
│    workshop consumables          │     workshop consumables          │
│    PCB fab JLCPCB 4-layer ×5     │     3D-printed enclosure (PLA)    │
│                                  │                                   │
│  ─────────────                   │   ─────────────                   │
│  TOTAL                  ~$763.50 │   TOTAL              ~$193.85     │
│                                  │   stretch            ~$120        │
│                                  │                                   │
└──────────────────────────────────┴───────────────────────────────────┘
```

## the typesetting

- the whole spread is set in Plex Mono 7pt / 10pt leading. layer headers in Plex Sans Bold 9pt brass.
- the vertical rule down the middle is brass, 0.5pt.
- column totals at the bottom are in Plex Sans Bold 10pt brass.
- spread orientation is horizontal (gatefold across the binding); when the spread is closed, you see only the two cover pages 28 and 29.
- the gatefold fold-out is optional at the vendor; if the vendor cannot do a true gatefold, the same content stays in a regular 28-29 spread (~6pt smaller). spec.md soft-list tracks this.

## bottom of the spread

```
classica and processta are the same project.
the architecture does not move.
the canonical lists live in hardware/mk1/bom-classica.csv and bom-processta.csv.
```

set in Plex Serif italic 8pt / 12pt, centered.

footers: `[carburetor] · 28` and `[carburetor] · 29` brass on each half.

`Q.E.D.`
