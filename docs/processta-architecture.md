# processta — hardware architecture

the ~$120 edition. ESP32-S3 + LoRa SX1262 + Sharp Memory LCD.
powered by butane catalytic TEG (mk ii) or USB-C (dev/daily use).

---

## system block diagram

```
                          ┌─────────────────────────────────────┐
                          │         butane catalytic            │
                          │         combustor (mk ii)           │
                          │                                     │
                          │    catalyst ──► TEG module          │
                          │    (Pt/Al₂O₃)    (Bi₂Te₃)         │
                          │                   │                 │
                          │              0.5–1.5W DC            │
                          └───────────────────┼─────────────────┘
                                              │
                    USB-C ────────────┐       │
                    (5V, alt power)   │       │
                                     ▼       ▼
                              ┌──────────────────────┐
                              │   power management   │
                              │   BQ25170 or LTC3119 │
                              │                      │
                              │   charge: LiFePO4    │
                              │   rail: 3.3V buck    │
                              └──────────┬───────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
                    ▼                    ▼                    ▼
           ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
           │  ESP32-S3    │    │  SX1262      │    │  Sharp LCD   │
           │  WROOM-1     │    │  LoRa module │    │  LS027B7DH01 │
           │              │    │  (EBYTE E22) │    │  2.7" 400×240│
           │  MCU + BLE   │◄──►│  sub-GHz     │    │  SPI         │
           │  SPI master  │    │  868/915 MHz │    │              │
           │              │────►│              │    │              │
           └──────────────┘    └──────────────┘    └──────────────┘
                    │
                    ▼
           ┌──────────────┐
           │  LiFePO4     │
           │  18650 cell  │
           │  3.2V 1100mAh│
           │  = 3.5 Wh    │
           └──────────────┘
```

---

## key components

### MCU: ESP32-S3-WROOM-1 (~$3)

- dual-core Xtensa LX7, 240 MHz
- 512 KB SRAM, 8 MB flash (N8 variant)
- BLE 5.0 (for phone pairing / config)
- deep sleep: 7–10 µA
- modem sleep (80 MHz): 25 mA
- SPI master for both LCD and LoRa
- well-supported: Arduino, ESP-IDF, MicroPython, Meshtastic

### radio: SX1262 via EBYTE E22-900M30S (~$5)

- 868/915 MHz LoRa, +22 dBm TX
- TX: 118 mA, RX: 4.6 mA, sleep: 0.16 µA
- IPEX antenna connector
- SPI interface to ESP32-S3
- Meshtastic-compatible (can join existing mesh networks)
- range: 5–15 km line of sight, 1–3 km urban

### display: Sharp LS027B7DH01 (~$15)

- 2.7", 400×240 pixels, monochrome
- reflective — readable in direct sunlight, no backlight
- static power: ~50 µW (effectively zero)
- refresh power: ~500 µW at 1 Hz
- SPI interface, 3.3V
- the "sharp memory LCD feel" — black on silver-gray

### battery: LiFePO4 18650 (~$4)

- 3.2V nominal, 1100 mAh = 3.5 Wh
- cycle life: 2000+ cycles (vs 500 for Li-ion)
- intrinsically safe (no thermal runaway)
- charge to 3.6V, discharge to 2.5V
- fits standard 18650 holder

### power management: TI BQ25170 (~$1.50)

- single-cell linear charger
- input: 4.35–13.5V (handles TEG and USB-C)
- configurable charge current: 10–350 mA
- charge voltage: 3.6V for LiFePO4 (configurable via resistor)
- tiny: SOT-23 package

### antenna: 868/915 MHz spring or PCB trace (~$0.50)

- spring antenna for compact form factor
- or PCB trace antenna for flush design
- IPEX-to-SMA pigtail for external antenna option

---

## BOM estimate

| component | part | qty | unit cost | total |
|---|---|---|---|---|
| MCU module | ESP32-S3-WROOM-1-N8 | 1 | $3.00 | $3.00 |
| LoRa radio | EBYTE E22-900M30S | 1 | $5.00 | $5.00 |
| display | Sharp LS027B7DH01 | 1 | $15.00 | $15.00 |
| battery | LiFePO4 18650 | 1 | $4.00 | $4.00 |
| charger IC | TI BQ25170 | 1 | $1.50 | $1.50 |
| voltage regulator | 3.3V LDO (AP2112) | 1 | $0.30 | $0.30 |
| PCB | 2-layer, 60×100mm | 1 | $2.00 | $2.00 |
| antenna | spring 868/915 MHz | 1 | $0.50 | $0.50 |
| buttons | tactile switches (5×) | 5 | $0.10 | $0.50 |
| connector | USB-C (power only) | 1 | $0.40 | $0.40 |
| enclosure | injection-molded ABS | 1 | $8.00 | $8.00 |
| passives | caps, resistors, etc. | — | $1.00 | $1.00 |
| battery holder | 18650 spring clip | 1 | $0.30 | $0.30 |
| **subtotal (BOM)** | | | | **$41.50** |
| assembly (PCBA) | | | | $8.00 |
| packaging | | | | $3.00 |
| **COGS** | | | | **~$53** |
| **retail (2.3× markup)** | | | | **~$120** |

---

## power budget

### idle (listening for LoRa messages)

```
ESP32-S3 light sleep:     0.8 mA
SX1262 RX duty cycle:     4.6 mA × 1% = 0.046 mA (CAD mode)
LCD static:               0.015 mA
──────────────────────────────────
total idle:               ~0.86 mA

battery life (idle):      1100 mAh / 0.86 mA = 53 days
```

### active messaging (compose + send)

```
ESP32-S3 active (80 MHz):  25 mA
SX1262 TX (+22 dBm):      118 mA  (for ~1 second per message)
LCD refresh:                0.15 mA
──────────────────────────────────
total during TX:           ~143 mA (for ~1 second)
total during compose:       ~30 mA (for ~30 seconds)

energy per message:        30 mA × 30s + 143 mA × 1s = 1043 mAs = 0.29 mAh
messages per charge:       1100 / 0.29 = ~3,800 messages
```

### TEG-powered continuous

```
TEG output (realistic):    0.5–1.0W
at 3.2V:                   156–312 mA charge current
idle draw:                 0.86 mA
──────────────────────────────────
net charge rate:           155–311 mA
time to full from 50%:     550 mAh / 155 mA = 3.5 hours (worst case)
```

the TEG provides vastly more power than LoRa consumes. the fuel
becomes a "top off whenever" ritual rather than a "must refuel now"
emergency. this is the right energy relationship.

---

## firmware architecture (future)

```
main loop:
  1. wake from light sleep (every 5 seconds, or on LoRa interrupt)
  2. check LoRa RX buffer → process incoming messages
  3. check button state → handle UI events
  4. update LCD if state changed
  5. if TX queued: wake SX1262, send, return to RX
  6. return to light sleep

Meshtastic compatibility:
  - implement Meshtastic protobuf message format
  - support mesh routing (store-and-forward)
  - BLE interface for phone app pairing
```

---

## physical design direction

- form factor: ~65 × 110 × 18 mm (credit card width, slightly thicker)
- weight: ~120g with battery (no supercap needed)
- brunswick green enclosure (#2D4A3E) — matches the brand
- exposed brass terminals / screws — visual continuity with classica
- USB-C port on bottom (charging + serial debug)
- LoRa antenna: internal spring or rear-mounted stub
- 5 buttons: up, down, select, back, power
- display window: centered, slightly recessed
- battery door: rear, tool-less

this is not a slab. it has character. it looks like a field instrument,
not a consumer gadget.
