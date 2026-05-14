# reproducibility

every run, every bench measurement, every fixture in this repo is reproducible from a clean checkout. this document explains the contract that makes that true, and the discipline that keeps it true.

## the manifest spine

every simulator run or bench run produces `artifacts/runs/<id>/manifest.json`:

```json
{
  "git_sha": "abc123def456...",
  "lockfile_hash": "sha256:0123...",
  "seed": 42,
  "start_us": 1747000000000000,
  "end_us":   1747000060000000,
  "inputs": {
    "scenario": "refuel-and-text-for-an-hour",
    "fuel_volume_mL": 15.0,
    "ambient_C": 22.0
  },
  "outputs": {
    "engine.wav":  "sha256:0123...",
    "scope.svg":   "sha256:4567...",
    "fuel.csv":    "sha256:89ab...",
    "combustor.csv": "sha256:cdef..."
  },
  "host": {
    "os":      "darwin-23.4.0",
    "arch":    "arm64",
    "node":    "20.11.1",
    "python":  "3.11.7"
  }
}
```

if two runs share `(git_sha, lockfile_hash, seed, inputs)`, the simulator MUST produce identical `outputs`. this is enforced by `pnpm sim:test` and `pytest python/`.

## golden fixtures

`fixtures/golden/<scenario>/` contains the sha-256-locked reference for each scenario:

```
fixtures/golden/cold-start-warmup/
├── manifest.json     pin: sha256 of run.cbf + each csv
├── run.cbf           binary telemetry, 64-byte frames
├── fuel.csv          decoded
├── combustor.csv     decoded
├── bus.csv           decoded
├── compute.csv       decoded
├── ritual.csv        decoded
└── README.md         what this scenario tests and why
```

a refactor that changes a layer's internal logic but preserves its public type contract MUST produce byte-identical fixture output. when this is not possible because the change is intentional (you fixed a real bug, you updated a thermo coefficient), the PR must regenerate the fixture and explain in the commit message what changed and why.

## bench runs

bench runs (`scripts/bench/`) write to `artifacts/runs/<id>/` with the same manifest schema. the `± σ` you see in `README.md` is computed over the 12 most-recent successful bench runs of each measurement script.

a bench measurement is considered **valid** when:

1. the manifest is fully populated.
2. the host matches the bench host configuration in `scripts/bench/host.yaml`.
3. the receipt's σ is below the threshold defined in `scripts/bench/<measurement>/config.yaml`.

invalid runs are kept under `artifacts/runs-invalid/` for forensics, not aggregated into receipts.

## what counts as reproducible

reproducible:
- binary telemetry frames
- decoded CSVs
- generated SVG (oscilloscope traces, exploded views)
- synthesized engine.wav (fixed-seed oscillator + fixed harmonic table)
- screen captures (rendered with deterministic timestamps and normalized whitespace)
- print PDFs (Edizione) — generated from markdown + svg + CSS, paged.js with deterministic mode

NOT reproducible (intentionally, these are layer-5 phenomena):
- the engine note recorded from a real Cox 049 (each unit sounds slightly different)
- the exact castor-oil residue pattern after a bench session
- the smell
- the weight of a specific built unit (varies with assembly tolerances)
- subjective user impressions

these live in `artifacts/recordings/` and are tagged with the unit's serial number, the date, and a brief textual context. they are reference, not regression.

## the discipline

three rules:

1. **every assertion in a receipt comes from a script under `scripts/bench/`.** no number is hand-typed.
2. **every script writes a manifest.** no script outputs without one.
3. **every PR that changes a fixture changes only what it intends to change.** if you refactor layer A and fixture B changes unexpectedly, you have introduced an unintended dependency. fix the refactor or fix the architecture.

`Q.E.D.`
