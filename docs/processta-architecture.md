# processta — hardware architecture

the ~$120 edition. ESP32-S3 + LoRa SX1262 + Sharp Memory LCD.
powered by butane catalytic TEG (mk ii) or USB-C (dev/daily use).

---

## system block diagram

```text
                          ┌─────────────────────────────────────┐
                          │         butane catalytic            │
                          │         combustor (mk ii)           │
                          │                                     │
                          │    catalyst ──► TEG module          │
                          │    (Pt/Al₂O₃)    (Bi₂Te₃)         │
                          │                   │                 │
                          │         0.1–0.3W sustained DC       │
                          └───────────────────┼─────────────────┘
                                              │
                    USB-C ────────────┐       │
                    (5V, alt power)   │       ▼
                                     ▼  ┌──────────────┐
                                        │ BQ25504-class│
                                        │ TEG harvester│
                                     ▼  └──────┬───────┘
                              ┌──────────────────────┐
                              │   power management   │
                              │   BQ25170 + 3.3V rail│
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
- light sleep: ~0.8 mA
- active / modem-sleep at 80 MHz: ~25 mA
- SPI master for both LCD and LoRa
- well-supported: Arduino, ESP-IDF, MicroPython, Meshtastic

### radio: SX1262 via EBYTE E22-900M22S (~$4)

- 868/915 MHz LoRa, +22 dBm TX (not the M30S 1W variant — overkill)
- TX: 118 mA, RX: 4.6 mA, sleep: 0.16 µA
- IPEX antenna connector, SMD mount
- SPI interface to ESP32-S3
- Meshtastic-compatible (can join existing mesh networks)
- range with tuned external antenna: 5–15 km line of sight, 1–3 km urban
- compact spring/PCB antenna is a close-range/default packaging option, not
  the range claim
- proven combination: TTGO T-Beam, Heltec V3, Heltec Wireless Tracker
  all use ESP32-S3 + SX1262

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

### power management: TI BQ25170 (~$0.80)

- single-cell linear charger
- input: 3.0–6.6V operating (30V tolerant, suspends charging >6.6V)
- configurable charge current: 10–800 mA (set via ISET resistor)
- charge voltage: 3.6V for LiFePO4 (configurable via VSET resistor)
- tiny: SOT-23-6 package
- USB-C path charger, not the low-voltage TEG harvester front end

### TEG energy harvester: BQ25504-class boost front end (~$3)

- cold-start capable boost/MPPT stage for low-voltage TEG input
- buffers intermittent TEG output before the LiFePO4 charger/power path
- required because a buck regulator cannot start from the sustained
  sub-volt TEG regime
- bench decision remains open between BQ25504, LTC3108, or an equivalent
  thermoelectric harvester IC

### antenna: 868/915 MHz spring or PCB trace (~$0.50)

- IPEX-to-SMA pigtail + tuned external antenna for kilometer-scale range
- spring antenna for compact, short-range form factor
- or PCB trace antenna for flush design after RF tuning

---

## BOM estimate

| component | part | qty | unit cost | total |
|---|---|---|---|---|
| MCU module | ESP32-S3-WROOM-1-N8 | 1 | $3.00 | $3.00 |
| LoRa radio | EBYTE E22-900M22S | 1 | $4.00 | $4.00 |
| display | Sharp LS027B7DH01 | 1 | $13.00 | $13.00 |
| battery | LiFePO4 18650 1100mAh | 1 | $5.00 | $5.00 |
| charger IC | TI BQ25170DSGR | 1 | $0.80 | $0.80 |
| TEG harvester | BQ25504-class boost/MPPT | 1 | $3.00 | $3.00 |
| voltage regulator | 3.3V LDO (AP2112) | 1 | $0.30 | $0.30 |
| PCB | 4-layer, 60×100mm (JLCPCB) | 1 | $3.00 | $3.00 |
| antenna | 915 MHz SMA or spring | 1 | $1.50 | $1.50 |
| buttons | tactile switches (5×) | 5 | $0.10 | $0.50 |
| connector | USB-C (power only) | 1 | $0.40 | $0.40 |
| enclosure | injection-molded ABS | 1 | $8.00 | $8.00 |
| passives | caps, resistors, etc. | — | $1.00 | $1.00 |
| battery holder | 18650 spring clip | 1 | $0.30 | $0.30 |
| **subtotal (BOM)** | | | | **$43.80** |
| assembly (PCBA, JLCPCB) | | | | $5.00 |
| packaging | | | | $3.00 |
| **COGS** | | | | **~$52** |
| **retail (2.5× markup)** | | | | **~$120** |

---

## power budget

### idle (listening for LoRa messages)

```text
ESP32-S3 light sleep:     0.8 mA
SX1262 RX duty cycle:     4.6 mA × 1% = 0.046 mA (CAD mode)
LCD static:               0.015 mA
──────────────────────────────────
total idle:               ~0.86 mA

battery life (idle):      1100 mAh / 0.86 mA = 53 days
```

### active messaging (compose + send)

```text
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

```text
TEG output (peak, cold start):    0.5–1.0W (ΔT ~100°C)
TEG output (sustained, passive):  0.1–0.3W (ΔT collapses to 30–50°C)
after harvester losses:           ~60–80% to storage, pending bench
at 3.2V sustained:                19–75 mA charge current
idle draw:                        0.86 mA
──────────────────────────────────
net charge rate (worst case):     ~18 mA
time to full from 50%:            550 mAh / 18 mA = 31 hours
```

the TEG provides ~35–100× more power than LoRa idle draw. the cold-side
thermal management limits sustained output (passive fins can't reject
heat fast enough in a phone-sized enclosure), but even worst-case 0.1W
has room above idle after harvester losses. the fuel becomes a "top off
whenever" ritual rather than a "must refuel now" emergency.

note: the bottleneck is cold-side heatsinking, not the catalyst or TEG
module. a larger fin area or thermally conductive case back could push
sustained output toward 0.3–0.5W. this is a mechanical design problem,
not an electrical one.

---

## firmware architecture (future)

```text
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
- LoRa antenna: rear-mounted stub for range, internal spring for close range
- 5 buttons: up, down, select, back, power
- display window: centered, slightly recessed
- battery door: rear, tool-less

this is not a slab. it has character. it looks like a field instrument,
not a consumer gadget.
