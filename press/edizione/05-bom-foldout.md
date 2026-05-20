# 05-bom-foldout · pages 28-29

a gatefold spread that reproduces both BOMs side by side, layer-grouped, with a brass vertical rule between the two BOMs.

the actual artwork is `05-bom-foldout.svg`. this markdown documents the layout for the build pipeline.

## structure

```
┌──────────────────────────────────┬───────────────────────────────────┐
│                                  │                                   │
│  CLASSICA · ~$760                │   PROCESSTA · ~$120               │
│                                  │                                   │
│  FUEL                            │   FUEL / HEAT                     │
│    pyrex 15 mL                   │     butane catalytic heater       │
│    brass filler cap (chained)    │     Pt/Al2O3 catalyst             │
│    silicone fuel line            │     Bi2Te3 TEG module             │
│    primer bulb 3 cc              │     passive cold-side fins        │
│                                  │                                   │
│  COMBUSTOR                       │   RADIO                           │
│    cox tee dee .049              │     E22-900M22S / SX1262          │
│    glow plug short ×2            │     868/915 MHz LoRa              │
│    cox 049 muffler               │     +22 dBm TX                    │
│    t-motor 1806 (PMG)            │     SMA or spring antenna         │
│    shaft coupling                │     Meshtastic-compatible         │
│    k-type thermocouple ×2        │                                   │
│    glow plug driver              │                                   │
│    prop hub adapter              │                                   │
│                                  │                                   │
│  BUS                             │   BUS                             │
│    schottky bridge 1N5817 ×4     │     LiFePO4 18650 1800 mAh        │
│    LTC3119 MPPT eval             │     BQ25170 charger               │
│    Maxwell BCAP0300 ×2           │     TPS562200 input buck          │
│    KeepPower 18350 600 mAh       │     AP2112 3.3 V regulator        │
│    18350 holder vertical         │     USB-C power connector         │
│    sk26 schottky ×2              │     18650 spring clip             │
│    SRR1280-470M inductor         │                                   │
│    output filter cap ×4          │                                   │
│                                  │                                   │
│  COMPUTE                         │   COMPUTE                         │
│    nRF52840 dongle               │     ESP32-S3-WROOM-1-N8           │
│    Quectel BG95-M3               │     Sharp LS027B7DH01             │
│    BG95 EVB breakout             │     5× tactile switches           │
│    Sharp Memory LCD 2.7"         │     passives                      │
│    Sharp LCD breakout            │                                   │
│    BlackBerry Q10 keyboard       │   (LoRa mesh, no cellular modem)  │
│    Solder Party Q10 carrier      │                                   │
│    nano-SIM socket               │                                   │
│    u.fl to sma pigtail           │                                   │
│    quad-band cell antenna        │                                   │
│                                  │                                   │
│  RITUAL                          │   ENCLOSURE / UI                  │
│    analog voltmeter 0–6 V        │     injection-molded ABS          │
│    brass mil-toggle DPDT         │     brunswick green finish        │
│    chrome flip-guard             │     recessed display window       │
│    brass hand-crank (custom)     │     bottom USB-C opening          │
│    incandescent indicator T1-3/4 │     rear battery door             │
│    piezo buzzer 30 mm            │     internal antenna option       │
│    canvas case (custom-sewn)     │                                   │
│    brass banana terminals ×2     │                                   │
│    leather strap + d-rings       │                                   │
│                                  │                                   │
│  HARDWARE-SHARED                 │   HARDWARE-SHARED                 │
│    M2.5 brass screws kit         │     4-layer PCB 60×100 mm         │
│    heat-set inserts ×50          │     PCBA assembly                 │
│    silicone gasket sheet 1 mm    │     packaging                     │
│    aerogel blanket 5 mm          │                                   │
│    workshop consumables          │                                   │
│    PCB fab JLCPCB 4-layer ×5     │                                   │
│                                  │                                   │
│  ─────────────                   │   ─────────────                   │
│  TOTAL                  ~$763.50 │   BOM subtotal        ~$41.20     │
│                                  │   COGS                ~$49        │
│                                  │   retail target       ~$120       │
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
