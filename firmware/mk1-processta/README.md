# firmware/mk1-processta

target hardware: **mk i · processta edition** (ESP32-S3 + onboard TFT + M5 CardKB + BLE serial to paired phone, NO MODEM).

## status

🔴 stub. directory exists; firmware not yet written.

## planned stack

- **rtos**: ESP-IDF with FreeRTOS (current candidate). Arduino framework acceptable for low-effort builds.
- **language**: Rust (preferred, via `esp-rs`). C acceptable for ESP-IDF native code.
- **build**: `cargo` + `esp-idf-sys` build system, or `idf.py` for the C path.

## planned module layout (mirrors `docs/architecture.md`)

```
firmware/mk1-processta/
├── README.md                this file
├── Cargo.toml               rust workspace (TBD)
├── sdkconfig                esp-idf config (TBD)
├── src/
│   ├── main.rs              top-level event loop
│   ├── combustor.rs         layer 2 — engine RPM via hall sensor, glow plug control
│   ├── bus.rs               layer 3 — TP4056 charge monitor, MT3608 boost control, soc estimation
│   ├── compute.rs           layer 4 — TFT driver (ST7789), i2c keyboard, BLE serial bridge
│   ├── ritual.rs            layer 5 — stage state machine, LED indicators
│   ├── safety.rs            thermal limit, CO sensor optional
│   ├── ble_bridge.rs        bridges incoming/outgoing SMS to paired smartphone
│   └── telemetry.rs         emits 64-byte frames over USB-serial @ 100 Hz
└── dist/
    └── carburetor-mk1-processta-v0.1.0.bin
```

## the modem question

processta has NO cellular modem. cellular work happens on a paired smartphone, which connects to the carburetor over BLE serial. the smartphone runs a small companion app (or just uses a BLE serial terminal) that:

- receives SMS notifications from the phone's normal SMS subsystem
- relays them as BLE serial messages to the carburetor
- accepts outbound text from the carburetor and submits them to the phone's SMS app

this means: **the carburetor processta literally cannot communicate without a paired phone.** the phone is acting as a cellular peripheral, the carburetor as the user-facing terminal. this is the project's "you cannot call on it" rule taken even further.

a future variant could swap BLE for a real cat-M1 modem (SIM7080G is cheap and globally available); proposals via issue or PR.

## reference hardware

see `../../hardware/mk1/bom-processta.csv` for the parts list.

## doing the work

```sh
# (when ready)
cd firmware/mk1-processta
cargo install espup
espup install
cargo build --release
cargo espflash flash --monitor
```

`Q.E.D.`
