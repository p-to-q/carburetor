# @carburetor/sim

the simulator for carburetor. typescript primary surface.

## status

🧪 v0.1 — type contracts complete. simulator implementations TBD (v0.2).

## what's here

- `src/types.ts` — the canonical type contracts for all five layers, the user-event union, the telemetry frame shape, and the INVARIANTS table. mirrors `python/sim_mini/types.py`.
- `src/index.ts` — public entry point. re-exports `./types`.

## what's TBD (v0.2)

- `src/fuel/` — fuel layer simulator (volume/temperature/evaporation model)
- `src/combustor/` — combustor state machine (Cox 049 thermodynamics + catalytic-TEG model)
- `src/bus/` — bus simulator (rectifier + MPPT + supercap/li-ion two-tank model)
- `src/compute/` — compute power model (per-mode current draws)
- `src/ritual/` — ritual stage driver
- `src/headless.ts` — headless runner (for CI)
- `tests/` — vitest unit tests + golden-fixture validation

see `../../ROADMAP.md`.

## development

```sh
pnpm install         # at repo root
pnpm --filter @carburetor/sim build
```

scripts that exist but echo "TBD" until v0.2:
- `pnpm dev` — browser playable
- `pnpm test` — vitest
- `pnpm headless` — headless runner

`Q.E.D.`
