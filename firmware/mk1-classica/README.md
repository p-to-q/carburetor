# firmware/mk1-classica

target hardware: **mk i · classica edition** (nRF52840 + BG95-M3 + Sharp Memory LCD + BlackBerry Q10 keyboard).

## status

🔴 stub. directory exists; firmware not yet written.

## planned stack

- **rtos**: Zephyr (current candidate). NuttX is acceptable for ports.
- **language**: Rust (preferred). C++ acceptable for low-level shims.
- **build**: `west` (Zephyr's meta-tool) with a Cargo subcomponent for the Rust portions.

## planned module layout (mirrors `docs/architecture.md`)

```
firmware/mk1-classica/
├── README.md                this file
├── west.yml                 zephyr manifest (TBD)
├── Cargo.toml               rust workspace (TBD)
├── prj.conf                 zephyr kconfig (TBD)
├── boards/                  custom board definitions (TBD)
├── src/
│   ├── main.rs              top-level event loop
│   ├── combustor.rs         layer 2 — engine RPM, glow plug, flameout detection
│   ├── bus.rs               layer 3 — MPPT control, supercap monitoring, li-ion gauge
│   ├── compute.rs           layer 4 — display, modem driver, keyboard scan
│   ├── ritual.rs            layer 5 — stage state machine, voltmeter PWM, lamp
│   ├── safety.rs            CO sensor, thermal limit enforcement, lockouts
│   └── telemetry.rs         emits 64-byte frames over USB-serial @ 100 Hz
└── dist/
    └── carburetor-mk1-classica-v0.1.0.bin    (printable as hex dump on one A4)
```

## reference hardware

see `../../hardware/mk1/bom-classica.csv` for the parts list.

## the small print

every firmware module implements the type contracts from `packages/sim/src/types.ts`. firmware emits telemetry frames in the format defined in `docs/codec-protocol.md`. firmware does NOT implement the fuel layer (no firmware for the tank); it observes fuel state via the sight-glass sensor.

## doing the work

```sh
# (when ready)
cd firmware/mk1-classica
west init -l .
west update
west build -b carburetor_mk1_classica
west flash
```

`Q.E.D.`
