# hard constraints

what we will not change in v1.

a constraint is **hard** if (a) changing it would invalidate completed bench measurements, (b) changing it would force a layer-interface change in `docs/architecture.md`, or (c) changing it would compromise the project's identity.

constraints not on this list are soft. they will move when the bench tells us to move them.

---

## no voice radio

no voice, either edition. classica speaks cat-m1 / nb-iot data only. processta speaks LoRa mesh (Meshtastic-compatible, sub-GHz). neither has a voice path.

removing voice removes the regulatory burden (no PTCRB carrier certification), the analog amplifier, the audio codec, and the temptation. what is left is text: SMS, Matrix, Signal-CLI, ssh.

you cannot call on it. you can text on it.

## no battery as primary energy store

the combustor (ICE or catalytic TEG) is the primary energy source. the li-ion cell is a buffer — it smooths transients and stores charge between burns. in classica, the 300 F supercap handles TX bursts and the 18350 li-ion holds ~20 minutes of standby. in processta, the LiFePO4 18650 handles both roles (LoRa TX peak is 118 mA — within battery C-rate, no supercap needed).

the engine is the source of energy. this is the project.

## no off-grid charge (classica)

classica: no USB-C power input. the only way to put energy into the device is to pour fuel. the USB-C port is data + firmware only, with VBUS deliberately disconnected from the bus.

processta: USB-C charging is permitted as an alternative to the catalytic TEG. the maker edition is a development platform first and a philosophical statement second. but the TEG path must always work — USB-C is convenience, not a crutch.

## no firmware over the air

firmware updates require physical access (USB-serial). this is a downstream consequence of *no voice radio*: no cellular OTA means no remote attack surface, and the firmware stays small enough to audit by hand.

`firmware/mk1/dist/carburetor-mk1-v0.1.0.bin` will always be small enough to print on a single sheet of paper as a hex dump. that is a real test we run in CI.

## binary telemetry frames at 100 Hz

the frame format defined in `docs/codec-protocol.md` is locked at protocol version 1. future versions get a new sync byte (`0xCC`, `0xCD`, …) and a parallel decoder. existing golden fixtures must remain byte-identical under refactors of the encoder or decoder.

## apache-2.0 / cern-ohl-s-2.0 / cc-by-sa-4.0

three licenses, one for each kind of artifact:

- code — Apache-2.0 (match `wittgenstein`).
- hardware — CERN-OHL-S 2.0 (strong-reciprocal open-source hardware).
- docs — CC-BY-SA 4.0.

will not change.

## five layers

we have considered combining bus and compute, or splitting ritual into perceptible-and-actionable. we are not going to. five is the right number for now.

if you propose a sixth layer in a PR, the burden of proof is on you and it is heavy: name a physical-type transition that does not already live in one of the existing five.

## fuels

- mk i: glow fuel only (methanol + nitromethane + castor oil). standard hobby blends accepted: 10/22, 15/22, 25/22 (% nitro / % castor).
- mk ii: liquid butane only (standard cigarette-lighter refill grade, ≥ 99 % n-butane).

pump gasoline, ethanol, kerosene, diesel — none of these are supported.

## no microphone

we have no microphone in either unit. some people will ask whether they could record audio messages or transmit voice over data. they could not, because there is no mic.

this is a downstream consequence of *no voice radio*.

## no camera

we have no camera. this is not a phone for photographs. it is a phone for text.

## the warm-up is not skippable

both units gate the "live" stage on a real bus-voltage threshold: mk i requires `v_bus_V >= 4.8` for ≥ 5 seconds; mk ii requires the TEG hot face at `≥ 180 °C` for ≥ 5 seconds. neither can be bypassed by firmware.

you wait with the device. the device is built so that this is the experience.

---

## the soft list

these are not hard. they will change:

- the exact SoC (classica: nRF52840; processta: ESP32-S3. either could migrate to nRF54L15).
- the exact radio module (classica: BG95-M3; processta: EBYTE E22-900M22S. the contract is data-only, not the part number).
- the exact display (LS027B7DH01 is current for both; e-ink is future-tracked for mk ii).
- the keyboard (classica: Q10; processta: 5 tactile buttons. form factor may change).
- the supercap value (classica: 300 F, adjusted by bench; processta: none).
- charge controller algorithm (classica: LTC3119 MPPT; processta: BQ25170 CC/CV).
- frame rate of ritual telemetry (currently 10 Hz, may rise to 30 Hz).

if it is on the soft list and you have measured a better number, open a PR.

---

`Q.E.D.`
