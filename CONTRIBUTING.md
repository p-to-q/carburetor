# contributing

thank you for reading this. you can help in five ways.

## 1 — build a unit

build a processta or classica, take photos, file a postmortem. `docs/postmortems/YYYY-MM-DD-<your-handle>.md`. tell us what broke, what was hard, what the BOM got wrong. this is the most valuable contribution you can make.

## 2 — file a measurement

if you have a bench setup (oscilloscope, multimeter, USB-PD analyzer, decibel meter, thermocouple), run one of the `scripts/bench/` measurements and send us the manifest. we will fold your numbers into the receipts table with attribution.

## 3 — fix a typo, dead link, malformed code block

open a PR. branch name `fix/<short-name>`. commit prefix `docs:` or `code:`. no further discussion needed.

## 4 — propose a layer-internal improvement

a change inside one of the five layers (fuel / combustor / bus / compute / ritual) that does NOT change the layer's public type contract.

- open a branch `feat/<short-name>`.
- update the relevant `packages/sim/src/<layer>/` (or `python/sim_mini/<layer>.py`).
- add tests under `packages/sim/tests/` or `python/sim_mini/tests/`.
- update any golden fixtures that change ONLY if the change is intentional. otherwise the fixture stays put and your refactor must preserve byte-identical output.
- open a PR with a clear scope line in the title.

## 5 — propose an interface change

a change that touches `types.ts` + `types.py` + `docs/architecture.md` and possibly `docs/codec-protocol.md`. this is a high-bar PR.

- open a branch `feat/<short-name>`.
- update **both** type files in the same commit.
- update `docs/architecture.md` and bump the relevant section.
- if the wire format changes, bump `protocol version` in `docs/codec-protocol.md` and document the migration.
- update all golden fixtures.
- write a brief RFC in `docs/rfcs/NNNN-<title>.md` (`Status: Draft`).
- open a PR. expect review.

## what is NOT a valid contribution

- changing a hard constraint without first removing it from `docs/hard-constraints.md` via its own PR with rationale.
- adding emoji to prose.
- adding hype copy or AI-toned marketing.
- adding voice / microphone / camera / OTA / wireless charging features.
- adding a sixth layer.

## the register

commits, comments, PR descriptions: lowercase-leaning, terse, declarative, no exclamation marks. examples in `AGENTS.md`.

## the license

by contributing, you agree your code is Apache-2.0, your hardware is CERN-OHL-S-2.0, and your docs are CC-BY-SA-4.0. see `LICENSE`, `LICENSE-HARDWARE`, `LICENSE-DOCS`.

`Q.E.D.`
