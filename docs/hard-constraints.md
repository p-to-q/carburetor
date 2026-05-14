# hard constraints

what we will not change in v1.

a constraint is **hard** if (a) changing it would invalidate completed bench measurements, (b) changing it would force a layer-interface change in `docs/architecture.md`, or (c) changing it would compromise the project's identity.

constraints not on this list are soft. they will move when the bench tells us to move them.

---

## no voice radio

mk i and mk ii both speak cat-m1 / nb-iot / 2G-fallback **data only**. no voice.

removing the voice front-end removes the regulatory burden (no PTCRB carrier certification for voice paths), the analog amplifier, the audio codec, and roughly half the modem's idle current. what is left is SMS, Matrix, Signal-CLI, ssh.

you cannot call on it. you can text on it.

## no battery as primary energy store

the li-ion buffer is a capacitor, not a battery. it is sized to hold one engine burst plus modem TX transients. it does not, by itself, power the phone for more than ~20 minutes of standby.

the engine is the source of energy. this is the project.

## no off-grid charge

no USB-C power input. no wireless charging. the only way to put energy into the device is to pour fuel.

people will ask. the answer is no.

(the USB-C port on the device is data + firmware only, with VBUS deliberately not connected to the bus.)

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

- the exact SoC (nrf52840 → possibly nrf54L15 or esp32-s3 if the power budget demands).
- the exact modem (bg95-m3 → sim7080g acceptable in regions where bg95 is unavailable).
- the exact display (LS027B7DH01 → e-ink panel for mk ii).
- the keyboard (q10 → silicone T9 for mk ii).
- the supercap value (300 F → adjusted by bench).
- mppt setpoint algorithm.
- frame rate of ritual telemetry (currently 10 Hz, may rise to 30 Hz).

if it is on the soft list and you have measured a better number, open a PR.

---

`Q.E.D.`
