# codec protocol

the binary frame format every non-ritual layer of carburetor emits over USB-serial at 100 Hz. ritual frames are emitted at 10 Hz (the human nervous system does not require more).

the host decodes these frames into CSV (one file per layer per run), WAV (for synthesized engine notes), PNG (for final screen state), SVG (for oscilloscope traces). see `docs/architecture.md` for context.

---

## frame layout (64 bytes total)

```
offset  size  name           type    notes
------  ----  -------------  ------  -----------------------------------------
0       1     sync           u8      0xCB ("carburetor")
1       1     version        u8      protocol version; v1 = 0x01
2       2     seq            u16le   monotonic, wraps at 65535
4       8     t_us           u64le   monotonic µs since device boot
12      1     layer          u8      1=fuel 2=combustor 3=bus 4=compute 5=ritual
13      1     kind           u8      layer-specific kind enum (below)
14      2     flags          u16le   layer-specific bit flags
16      32    payload        bytes   layer-specific (see below)
48      8     sha256_prefix  bytes   first 8 bytes of sha-256(bytes 0..47)
56      8     reserved       bytes   zeros in v1
```

all multibyte fields are little-endian. `f16` is IEEE 754 half-precision (binary16).

---

## kind enums

```
fuel
  0x01  glow_methanol_nitro_castor
  0x02  butane_liquid
  0x03  gasoline                     // future

combustor
  0x10  cox_049
  0x11  catalytic_teg
  0x12  stirling                     // future

bus
  0x20  ltc3119_buck
  0x21  bq25798                      // alternate

compute
  0x30  nrf52840_bg95
  0x31  esp32s3_bg95                 // alternate

ritual
  0x40  user_present
  0x41  user_absent
```

---

## flags

bit positions (u16le, bit 0 = LSB):

```
all layers
  bit 0   layer_valid               // 1 if the layer is reporting truthfully

combustor
  bit 1   running
  bit 2   fuel_low_warning
  bit 3   thermal_high_warning
  bit 4   flameout_detected_in_window

bus
  bit 1   mppt_locked
  bit 2   supercap_at_or_above_4_4V
  bit 3   li_ion_at_or_above_3_5V

compute
  bit 1   modem_registered
  bit 2   tx_in_progress
  bit 3   screen_dirty

ritual
  bit 1   user_input_pending
  bit 2   waiting_on_user
```

unused bits are reserved and shipped as zero.

---

## payloads

### fuel (layer = 1, 32 bytes)

```
offset  size  name                    type   units / notes
------  ----  ----------------------  -----  ------------------------------
0       4     volume_mL               f32    millilitres remaining
4       2     temperature_C           f16    
6       2     vapor_pressure_kPa      f16    
8       2     water_contam_pct        f16    glow fuel, 0–10
10      22    reserved                       zeros
```

### combustor (layer = 2, 32 bytes)

```
offset  size  name                    type   units / notes
------  ----  ----------------------  -----  ------------------------------
0       4     rpm                     u32    mk i; 0 for mk ii
4       2     hot_C                   f16    
6       2     cold_C                  f16    mk ii; 0 for mk i
8       2     exhaust_dB_1m           f16    
10      2     shaft_W                 f16    mk i only
12      2     thermal_W               f16    both
14      2     electric_W_raw          f16    pre-rectifier
16      4     runtime_s               u32    since last ignite
20      4     fuel_consumed_mL        f32    since last refuel
24      1     phase                   u8     enum (below)
25      7     reserved                       zeros
```

combustor phase enum:

```
0  off
1  prime
2  ignite
3  warmup
4  run
5  cooldown
6  flameout
7  fuel_low
8  thermal_high
```

### bus (layer = 3, 32 bytes)

```
offset  size  name                    type   units / notes
------  ----  ----------------------  -----  ------------------------------
0       2     v_bus_V                 f16    supercap bus
2       2     i_bus_A                 f16    
4       2     v_li_V                  f16    li-ion bus
6       2     i_li_A                  f16    signed
8       2     soc_li_pct              f16    0–100
10      2     soc_cap_pct             f16    0–100
12      2     t_case_C                f16    
14      4     e_in_J                  f32    cumulative
18      4     e_out_J                 f32    cumulative
22      10    reserved                       zeros
```

### compute (layer = 4, 32 bytes)

```
offset  size  name                    type   units / notes
------  ----  ----------------------  -----  ------------------------------
0       1     mode                    u8     enum (below)
1       2     mcu_mA                  f16    
3       2     modem_mA                f16    
5       2     lcd_uA                  f16    
7       2     signal_dbm              f16    negative
9       1     rssi_bars               u8     0..4
10      2     queued_messages         u16    
12      4     uptime_s                u32    
16      16    reserved                       zeros
```

compute mode enum:

```
0  sleep
1  idle
2  rx
3  tx
4  compose
5  engine_attn
```

### ritual (layer = 5, 32 bytes)

```
offset  size  name                              type   units / notes
------  ----  --------------------------------  -----  ------------------------------
0       1     stage                             u8     enum (below)
1       2     dB_at_ear                         f16    
3       2     case_C                            f16    
5       1     scent                             u8     0=none 1=castor 2=butane
6       2     minutes_runtime_remaining         f16    
8       2     minutes_until_refuel              f16    
10      22    next_user_action_utf8             utf-8  null-padded
```

ritual stage enum:

```
0  cold
1  priming
2  cranking
3  warmup
4  live
5  cooldown
6  refuel_needed
```

---

## decoders (reference implementations)

```typescript
// packages/telemetry/src/decode.ts
export function decodeFrame(buf: Uint8Array): TelemetryFrame {
  if (buf.length !== 64) throw new Error('frame must be 64 bytes');
  if (buf[0] !== 0xCB) throw new Error('bad sync byte');
  if (buf[1] !== 0x01) throw new Error('unsupported protocol version');
  // ... (see actual implementation in packages/telemetry/)
}
```

```python
# python/sim_mini/telemetry.py
def decode_frame(buf: bytes) -> TelemetryFrame:
    assert len(buf) == 64, "frame must be 64 bytes"
    assert buf[0] == 0xCB, "bad sync byte"
    assert buf[1] == 0x01, "unsupported protocol version"
    # ... (see actual implementation in python/sim_mini/)
```

both decoders are validated against `fixtures/golden/codec/*.bin` (sha-pinned binary frames). a frame whose `sha256_prefix` does not match `sha-256(bytes 0..47)[:8]` is rejected.

---

## artifact rendering

a host running:

```sh
pnpm decode --in run.cbf --out artifacts/run.42/
```

produces, deterministically:

```
artifacts/run.42/
├── manifest.json         git_sha, lockfile_hash, seed, start_us, end_us
├── fuel.csv              one row per fuel frame
├── combustor.csv         one row per combustor frame
├── bus.csv               one row per bus frame
├── compute.csv           one row per compute frame
├── ritual.csv            one row per ritual frame
├── engine.wav            synthesized engine note from combustor.rpm at 44.1 kHz
├── screen.png            final screen capture
└── scope.svg             4-trace oscilloscope of v_bus, i_bus, v_li, t_case
```

every artifact is byte-deterministic given identical input. `wav` is synthesized via a fixed-seed oscillator + fixed harmonic table; `png` and `svg` are emitted with normalized whitespace, deterministic timestamps, and stable sorting.

---

`Q.E.D.`
