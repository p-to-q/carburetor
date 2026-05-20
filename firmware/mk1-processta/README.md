# firmware/processta

target hardware: **processta edition** (ESP32-S3 + SX1262 LoRa + Sharp Memory LCD + catalytic TEG / USB-C power).

## status

🔴 stub. directory exists; firmware not yet written.

## planned stack

- **rtos**: ESP-IDF with FreeRTOS (current candidate). Arduino framework acceptable for low-effort builds.
- **language**: Rust (preferred, via `esp-rs`). C acceptable for ESP-IDF native code.
- **build**: `cargo` + `esp-idf-sys` build system, or `idf.py` for the C path.
- **meshtastic**: processta implements Meshtastic-compatible messaging. the firmware either runs the Meshtastic device firmware directly (ESP32-S3 is a supported target) or implements the Meshtastic protobuf message format for mesh interoperability.

## planned module layout (mirrors `docs/architecture.md`)

```
firmware/processta/
├── README.md                this file
├── Cargo.toml               rust workspace (TBD)
├── sdkconfig                esp-idf config (TBD)
├── src/
│   ├── main.rs              top-level event loop (wake → check LoRa RX → check buttons → update LCD → sleep)
│   ├── combustor.rs         layer 2 — TEG temperature monitoring, catalyst state machine
│   ├── bus.rs               layer 3 — BQ25170 charge status, LiFePO4 SOC estimation, TPS562200 monitoring
│   ├── compute.rs           layer 4 — Sharp LCD SPI driver, 5-button input, LoRa SX1262 driver
│   ├── ritual.rs            layer 5 — stage state machine, LED indicators
│   ├── radio.rs             SX1262 LoRa driver — TX/RX/CAD, Meshtastic message format
│   ├── safety.rs            thermal limit (TEG hot face), BQ25170 fault detection
│   └── telemetry.rs         emits 64-byte frames over USB-serial @ 100 Hz
└── dist/
    └── carburetor-processta-v0.1.0.bin
```

## the radio

processta uses LoRa mesh (SX1262, 868/915 MHz) via the EBYTE E22-900M22S module. it communicates with other carburetors and any Meshtastic-compatible node within range (5–15 km line of sight, 1–3 km urban).

there is no cellular modem and no SIM slot. processta cannot send SMS, cannot reach the internet, and cannot call anyone. it can send and receive text messages over LoRa mesh. this is the project's "you cannot call on it" rule made physical.

BLE is available (ESP32-S3 has it built in) for pairing with the Meshtastic phone app, which can relay messages to the internet if you choose. but the device works without it.

## reference hardware

see `../../docs/processta-architecture.md` for the hardware architecture and BOM.

## doing the work

```sh
# (when ready)
cd firmware/processta
cargo install espup
espup install
cargo build --release
cargo espflash flash --monitor
```

`Q.E.D.`
