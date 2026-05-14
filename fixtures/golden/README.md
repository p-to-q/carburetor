# fixtures/golden

sha-256-pinned reference runs for the simulator and the firmware.

## what lives here

each scenario is its own subdirectory:

```
fixtures/golden/<scenario>/
├── manifest.json         { run identity + sha-256 pin of every output }
├── run.cbf               binary telemetry (64-byte frames)
├── fuel.csv              decoded
├── combustor.csv         decoded
├── bus.csv               decoded
├── compute.csv           decoded
├── ritual.csv            decoded
├── engine.wav            synthesized engine note (mk i scenarios only)
└── README.md             what this scenario tests and why
```

## planned scenarios (v0.2)

- `cold-start-warmup` — pour 15 mL, prime, crank, observe warmup until `v_bus >= 4.8 V` for 5 s, transition to `live`.
- `refuel-and-text-for-an-hour` — full one-hour session: cold start, register on cellular, send 12 messages, run engine when buffer < 30 %, end with engine off.
- `flameout-recovery` — engine flames out mid-run; bus enters `engine_attn`; user re-cranks; check state machine completeness.
- `low-fuel-warning` — fuel drops below threshold; ritual emits warning; refuel resets state.

each scenario has a fixed `seed` and frozen `inputs`. byte-identical reproducibility is the contract.

## the discipline

read `docs/reproducibility.md`. a fixture changes ONLY when:

1. the layer's intentional behavior changed (and the PR documents why), OR
2. the wire format changed (and a new protocol version was bumped).

if a fixture changes for any other reason, the refactor introduced a hidden dependency. fix the refactor.

`Q.E.D.`
