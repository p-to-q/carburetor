# 03-mk-units · pages 20-23

two spreads. mk i first (photo left / spec right). mk ii second, mirrored (spec left / photo right).

---

## page 20 (left, full-bleed image)

**placeholder until a built unit exists.** at v0.1 there is no built mk i to photograph. options:

- a render produced from `hardware/mk1/enclosure/` (TBD)
- a hand illustration in the brass + K palette
- a photograph of the breadboard prototype, three-quarter view

caption (bottom-inside corner, Plex Mono 7pt brass):

> mk i · field · 2026 · prototype

## page 21 (right, spec table)

set in Plex Mono 9pt / 13pt. brass vertical rule between the two columns.

```
MK I · FIELD                              [carburetor]
─────────────────────────────────────────────────────────
combustor       cox tee dee .049 · 2-stroke glow · 0.81 cc
                78–108 W shaft @ 22,000 rpm · 14 g
fuel            glow fuel · methanol + nitromethane + castor
                15 mL pyrex tank · brass chained filler cap
power           BLDC outrunner (PMG) → schottky bridge
                → LTC3119 MPPT buck → 300 F × 2 supercap
                || 18350 li-ion 600 mAh buffer
compute         nRF52840 · 64 MHz · Zephyr
modem           Quectel BG95-M3 · cat-M1 / nb-IoT / 2G
display         Sharp Memory LCD 2.7" · 400 × 240 · 50 µW static
keyboard        BlackBerry Q10 · 35 keys · i²c via Solder Party
case            10 oz olive canvas · brunswick green · brass
                terminals · brass hand-crank (recoil + magneto)
─────────────────────────────────────────────────────────
weight loaded   ~650 g
warm-up         ~10 s (prime + crank + ignite)
runtime / fill  ~8 hours of text
audible at 1 m  ~85 dBA muffled
ritual          loud · fragrant · theatrical
```

footer: `[carburetor] · 21` brass.

---

## page 22 (left, spec table)

mirror layout. Plex Mono 9pt / 13pt. brass vertical rule, mirrored to the right side this time.

```
MK II · PILOT                             [carburetor]
─────────────────────────────────────────────────────────
combustor       butane catalytic combustor · 400–600 °C
                + 3 × bismuth-telluride TEG (series-parallel)
fuel            liquid butane · ≥ 99 % n-butane
                30 mL refillable cartridge
power           TEG → schottky bridge → buck regulator
                → 100 F supercap || 18350 li-ion buffer
compute         nRF52840 · 64 MHz · Zephyr
modem           Quectel BG95-M3 · cat-M1 / nb-IoT / 2G
display         2.9" E-Ink · 296 × 128
keyboard        custom silicone keymat + 2 rotary encoders
case            anodized aluminum unibody · slate-grey
                with one honda-red accent at the fuel cap
─────────────────────────────────────────────────────────
weight loaded   ~280 g
warm-up         ~45 s (catalyst preheat to 380 °C)
runtime / fill  ~24 hours of text
audible at 1 m  < 30 dBA
ritual          silent · slow · meditative
```

footer: `[carburetor] · 22` brass.

---

## page 23 (right, full-bleed image)

**placeholder until a built unit exists.** options:

- a render from `hardware/mk2/enclosure/` (TBD)
- a hand illustration

caption (bottom-inside corner):

> mk ii · pilot · 2026 · prototype

---

## the small print across the spreads

both units share the same five-layer architecture and the same telemetry codec. only the combustor and the display differ at the layer-implementation level. everything else — modem, MCU, power architecture, ritual stage machine — is identical.

this is the project's most-load-bearing statement: **two physical forms, one architecture.**

`Q.E.D.`
