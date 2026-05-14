# sim_mini

carburetor — python prototype counterpart to `packages/sim/`.

## status

🧪 v0.1 — type contracts complete. simulator implementations TBD (v0.2).

## what's here

- `types.py` — canonical type contracts (mirror of `packages/sim/src/types.ts`).
- `__init__.py` — public exports.
- `pyproject.toml` — package metadata.

## what's TBD (v0.2)

- `thermo.py` — Cox 049 Otto-cycle thermodynamics
- `combustor.py` — combustor state machine in python
- `bus.py` — bus simulator
- `compute.py` — compute power model
- `ritual.py` — ritual stage driver
- `telemetry.py` — frame decoder
- `tests/` — pytest unit tests + golden-fixture validation

see `../../ROADMAP.md`.

## install

```sh
cd python/sim_mini
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

## test

```sh
pytest          # will pass when tests exist; currently empty
mypy .          # type check
ruff check .    # lint
```

`Q.E.D.`
