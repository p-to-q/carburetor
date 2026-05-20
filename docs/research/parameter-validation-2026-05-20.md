# Parameter Validation Research — 2026-05-20

Comprehensive research comparing the simulator's model constants against
real-world data. Sources include academic papers, datasheets, hobbyist
measurements, and commercial product data.

---

## 1. Cox .049 Engine (mk i — classica edition)

### Thermal Efficiency

| Parameter | Model Value | Real-World | Assessment |
|---|---|---|---|
| Brake thermal efficiency | 12.5% | 10–15% (Michigan Tech thesis, AIAA) | **Accurate** |
| Waste heat ratio | 7.0 (87.5% heat) | ~85–90% heat loss at this scale | Reasonable |

Sources: Wiesenfarth 2012 (Michigan Tech), Menon & Cadou 2019 (AIAA)

### Shaft Power

| Parameter | Model Value | Real-World | Assessment |
|---|---|---|---|
| Shaft power (full run) | ~45W implied | 40–70W depending on variant | Conservative, OK |
| Babe Bee (stock, 25% nitro) | — | ~60W at 15,000 RPM | Closest to our use case |
| TeeDee (performance) | — | 78W at 22,000 RPM | Higher performance variant |
| Electrical output cap | 7.2W | Plausible given 0.65 coupling | Reasonable |

### Fuel Consumption — CRITICAL ERROR FOUND

| Parameter | Model Value | Real-World | Assessment |
|---|---|---|---|
| Fuel energy density | 18,720 J/mL (18.72 MJ/L) | **12,000–13,000 J/mL** | **~45% too high** |
| Burn rate (computed) | ~1.15 mL/min | 2–6 mL/min measured | **Too low by 2–4x** |

**Root cause**: `GLOW_FUEL_CHEMICAL_W_PER_ML_PER_S` is set to 18,720.
Real glow fuel (75% methanol, 25% nitromethane, 15–20% oil by volume)
has ~12–13 MJ/L volumetric energy density.

- Pure methanol: 15.7 MJ/L
- Pure nitromethane: 12.9 MJ/L
- Mixed with oil displacement: 12–13 MJ/L

**Recommended fix**: Change constant to 12,500. This yields:
- Burn rate: ~1.7–2.0 mL/min (low end of real data, defensible)
- 5 mL tank runtime: ~2.5–3 minutes (vs current ~4.3 minutes)

### RPM Range

| Parameter | Model Value | Real-World | Assessment |
|---|---|---|---|
| Warmup RPM | 12,000 | 4,000–10,000 unloaded | Slightly high for warmup |
| Full run RPM | 18,000 | 15,000–18,000 loaded | Correct |
| Note | — | Cox .049 has no throttle; no true idle | Model should reflect this |

### Generator Coupling

| Parameter | Model Value | Real-World | Assessment |
|---|---|---|---|
| Shaft-to-electrical efficiency | 0.65 | 0.60–0.80 depending on setup | Slightly conservative |
| At hobby scale (brushless as generator) | — | 0.60–0.70 typical | 0.65 is spot-on |

### Noise and Safety

| Parameter | Model Value | Real-World | Notes |
|---|---|---|---|
| Noise level | 86 dB | 95–105 dB unmuffled, 85–90 with muffler | OK if Cox QZ muffler used |
| Indoor operation | — | **Infeasible** (CO, formaldehyde) | Must route exhaust outdoors |
| Vibration | — | Severe at 18k RPM | Rubber isolation mandatory |

---

## 2. Butane TEG System (mk ii — processta edition)

### TEG Efficiency Chain

```
Butane (28.4 kJ/mL) → Catalytic combustion (85–95%)
  → TEG conversion (3–5% of thermal) → DC-DC (85–90%)
  = Overall: 2–4% fuel-to-electrical
```

### Achievable Power at Phone Scale

| Configuration | Power Output | Notes |
|---|---|---|
| Single 56mm TEG module, passive cooling | 0.5–1.5W | deltaT ~80–120°C realistic |
| Single module, active heatsink + fan | 1.5–2.5W | Fan consumes 0.2–0.5W |
| Two modules, larger form factor | 2–3W | No longer phone-sized |
| Academic bench results | 8–10W | Meso-scale, lab conditions |

**Verdict**: 0.5–1.5W continuous is realistic for a phone-sized device.

### Butane Fuel Properties (verified)

| Property | Model Value | Verified Value | Status |
|---|---|---|---|
| Vapor pressure (25°C) | 243 kPa | ~243 kPa | **Correct** |
| Energy density | — | 28.4 kJ/mL liquid | — |
| Burn rate for 10W thermal | — | ~1.3 mL/hr | — |

### Comparable Products

| Product | Power | Method | Status |
|---|---|---|---|
| BioLite CampStove 2+ | 3W peak | Wood-fire TEG | Active, $150 |
| FlameStower | 2–3W | Flame TEG blade | Discontinued |
| PowerPot V/X | 5–10W | Stove-top TEG | Active, pot-sized |
| **Kraftwerk** | Claimed 10W | Butane SOFC | **Failed** — never shipped |

The Kraftwerk failure is instructive: they promised 10W from a pocket
device using SOFC (40–60% efficient, far better than TEG's 3–5%) and
still couldn't deliver.

---

## 3. Electronics Power Budget

### ESP32 Power Consumption (verified)

| Mode | Current | Notes |
|---|---|---|
| Deep sleep (timer) | 6–10 µA | ESP32, S3 similar |
| Light sleep | ~0.8 mA | CPU suspended, RTC on |
| Modem sleep (80 MHz) | 20–31 mA | No radio |
| Active (240 MHz) | 30–68 mA | CPU only |
| WiFi TX (802.11b) | 240 mA | Peak |
| WiFi TX (802.11n) | 180 mA | — |
| WiFi RX | 95–100 mA | — |
| BLE TX | 130 mA | — |

### Project Model vs Reality

| Mode | Model | Realistic | Assessment |
|---|---|---|---|
| sleep | 2 µA MCU + 3 µA modem = 5 µA | 6–10 µA deep sleep | Slightly optimistic |
| idle | 5 mA MCU + 8 mA modem | 20–30 mA modem sleep | **Modem draws more** |
| tx | 5 mA MCU + 600 mA modem | 180–350 mA (depends on tech) | See below |

### Specific Modem Modules (with datasheets)

| Module | Tech | PSM Sleep | Idle/eDRX | TX Peak | RX |
|---|---|---|---|---|---|
| Quectel BG95-M3 | Cat-M1/NB-IoT/GNSS | ~3 µA | 10–15 mA | 350–490 mA | ~50 mA |
| SIMCom SIM7080G | Cat-M1/NB-IoT | 3.2 µA | ~10 mA | 300–490 mA | ~50 mA |
| Nordic nRF9160 | Cat-M1/NB-IoT (SiP) | 2.7 µA | ~6 mA | 230 mA | ~45 mA |
| SX1262 (LoRa) | LoRa sub-GHz | 0.16 µA | — | 118 mA (+22dBm) | 4.6 mA |

**Key finding**: Project models modem TX at 600 mA — this matches LTE Cat-1
(e.g., Quectel EC25) but is too high for Cat-M1/NB-IoT/LoRa. The nRF9160
at 230 mA TX is the lowest cellular option. LoRa at 118 mA is 5x lower.

**nRF9160 is notable**: it integrates its own ARM Cortex-M33, so it could
potentially replace the ESP32-S3 entirely — single-chip solution for
Cat-M1 messaging with 2.7 µA PSM sleep.

### LoRa as Alternative to Cellular

**Strong fit for this project:**
- TX: 118 mA at +22 dBm, 45 mA at +14 dBm (vs 230–490 mA cellular)
- RX: 4.6 mA (vs 40–80 mA cellular) — **10–17x lower**
- Sleep: 0.16 µA (vs 2.7 µA cellular) — **17x lower**
- No subscription fee, no SIM card
- Meshtastic: 2–5 days on 1000 mAh battery with light-sleep intervals
- ESP32-S3 + SX1262 is a proven combination (TTGO T-Beam, Heltec V3)
- Eliminates need for supercap buffer (118 mA TX vs 600 mA doesn't need it)

**Trade-offs**: Low data rate (~1–5 kbps typical), no guaranteed delivery,
limited to short text messages (~200 bytes), requires nearby mesh peers
or gateway for internet. But for a "phone you refuel" that sends
slow, deliberate messages, this fits the ritual philosophy.

**Dual-radio option**: nRF9160 (Cat-M1 fallback) + SX1262 (LoRa primary).
LoRa for everyday mesh messaging, cellular for emergency or gateway.

### Sharp Memory LCD

| Model | Size | Resolution | Static Power | Refresh Power | Notes |
|---|---|---|---|---|---|
| LS013B7DH03 | 1.28" | 128×128 | ~15 µW | ~175 µW @ 1Hz | Project's current model |
| LS027B7DH01 | 2.7" | 400×240 | ~50 µW | ~500 µW | **Phone sweet spot** |
| LS044Q7DH01 | 4.4" | 640×480 | — | >1 mW | Too power-hungry |

The project's LCD model (~50–250 µA) matches the 1.28" panel well.
For a phone-sized display, the 2.7" 400×240 is more realistic but draws
~2–3x more power. Still under 1 mW — negligible vs modem/MCU.

### Energy Storage (detailed)

**Supercap: 600J target**

Two 300F/2.7V EDLC cells in series = 150F at 5.4V.
Usable energy (5.4V → 4.4V operating window): ~735J.
Physical size per cell: **35mm dia × 62mm tall** (D-cell size).
Two cells = significant volume but feasible in a ~650g phone.
ESR: 3–6 mΩ — adequate for 600 mA TX transients (<4 mV sag).

**If using LoRa**: 118 mA TX eliminates the need for supercap entirely.
A small ceramic cap (100 µF) handles the transient. This saves ~140g
and ~70 cm³ of volume — a major form factor improvement.

**LiFePO4: 8000J = 2.2Wh**

| Cell Size | Capacity | Energy | Fits 8kJ? |
|---|---|---|---|
| 14500 (AA) | ~600 mAh @ 3.2V | 1.9 Wh = 6.9 kJ | Close, slightly under |
| 18350 | ~600 mAh @ 3.2V | 1.9 Wh = 6.9 kJ | Same |
| 18650 | ~1100 mAh @ 3.2V | 3.5 Wh = 12.6 kJ | More than enough |

Charging from 5–7W generator: LiFePO4 1C max (0.6A × 3.2V = 1.9W).
Surplus charges supercap simultaneously.

**Hybrid management ICs**: TI BQ25570 (energy harvesting PMIC, dual-path
supercap + battery), LTC4041 (supercap backup), BQ25170 (simple
LiFePO4 charger).

---

## 4. Simulator Architecture (Reference Patterns)

### Recommended Loop Architecture

```
Accumulator pattern ("Fix Your Timestep"):
- Each rAF: add elapsed_ms * ACCELERATION * 1000 to accumulator_us
- While accumulator >= STEP_US: step simulation, drain accumulator
- Cap accumulator to prevent spiral of death (e.g., max 5 steps/frame)
- Render once per frame from latest state
```

### Layer Coupling Pattern

Sequential bottom-up propagation per tick (from HOMER Energy / CircuitJS):
1. Fuel layer consumes from tank
2. Combustor reads fuel, produces shaft/electric/heat
3. Bus reads electric input, manages storage, provides voltage
4. Compute reads voltage, decides mode, consumes current
5. Ritual reads all layers, determines stage

One-tick delay between layers is acceptable and improves stability.

### Audio Synthesis Pattern

```
Engine sound = oscillator(RPM/60 * 1) + oscillator(RPM/60 * 2)
             + noise(filtered) + waveshaper(grit)
             → gain(proportional to RPM) → output

RPM changes: linearRampToValueAtTime for smooth frequency transitions
Primer: short filtered noise burst (click-thunk)
Crank: ratchet noise envelope
```

---

## 5. Priority Fixes for the Simulator

### P0 — Must Fix (model is wrong)

1. **Fuel energy density**: 18,720 → 12,500 J/mL
   - Files: `packages/sim/src/combustor/index.ts`, `python/sim_mini/combustor.py`
   - Impact: burn rate changes from 1.15 → ~1.7 mL/min
   - Golden fixtures must be regenerated after this change

2. **Modem TX current**: 600 mA → technology-appropriate value
   - If LoRa: 120 mA
   - If LTE Cat-M1: 300 mA
   - File: `packages/sim/src/compute/index.ts`, `python/sim_mini/compute.py`

### P1 — Should Fix (model is inaccurate)

3. **Idle mode current**: MCU 5 mA + modem 8 mA is too low for ESP32-S3
   - Realistic idle (modem sleep, CPU 80 MHz): ~25 mA total
   - Adjust MODE_CURRENTS table

4. **Cox .049 has no idle**: Engine is either at full RPM or off
   - The combustor model's "run" phase should be at ~15,000+ RPM always
   - No throttle position modeling needed — it's binary

### P2 — Nice to Have

5. **Warmup RPM**: 12,000 is slightly high for initial crank
   - Could start at 8,000 and ramp to 15,000+

6. **LoRa evaluation**: Consider switching the processta edition from
   cellular to LoRa — dramatically reduces power requirement, no subscription,
   and "mesh messaging" fits the project's ethos better.

---

## Sources

- Michigan Tech thesis: Wiesenfarth 2012 (micro glow-ignition two-stroke)
- AIAA: Menon & Cadou 2019 (nitromethane performance enhancement)
- Cox Engine Forum: real-world power/consumption measurements
- MIT silicon microcombustor TEG (IEEE, Schaevitz et al.)
- Meso-scale catalytic combustor TEG (ScienceDirect 2021)
- BioLite CampStove 2+ specs, FlameStower specs
- Kraftwerk Kickstarter postmortem
- TEG1-12611-6.0 datasheet (thermoelectric-generator.com)
- ESP32 datasheet (Espressif), lastminuteengineers.com measurements
- Semtech SX1262 product page
- Nordic nRF9160 product page
- Eaton supercapacitor catalog
- CircuitJS source / Gaffer on Games "Fix Your Timestep"
