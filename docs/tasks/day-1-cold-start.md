# day 1 task: reference cold start

status: draft

owner: implementation agent

## intent

turn v0.2 from a plan into a runnable reference path.

the goal is not physical accuracy yet. the goal is a dependency-free,
deterministic simulator spine that a reader can trace from fuel to ritual in
one sitting.

## source taste

- `TASTE.md` §about elegance.
- `docs/engineering-discipline.md`.
- karpathy's microgpt principle: the algorithmic core should be visible before
  efficiency machinery grows around it.

## scope

implement the smallest TypeScript reference path for:

`cold-start-warmup`

the run should:

- construct an initial `DeviceState`.
- advance state with a fixed `tick(dt_s)`.
- move combustor phase from `off` toward `warmup` and `run`.
- raise bus voltage toward the warm-up threshold.
- derive compute mode from the energy state.
- derive ritual stage and `next_user_action`.
- write a manifest-shaped result for the run.

## non-goals

- browser UI.
- firmware.
- measured Cox 049 thermodynamics.
- mk ii catalytic behavior.
- full telemetry binary encoding.
- real bench numbers.
- dependency additions.

## proposed files

- `packages/sim/src/reference.ts`
- `packages/sim/src/scenarios/cold-start-warmup.ts`
- `packages/sim/src/manifest.ts`
- `packages/sim/tests/reference.test.ts`

if a smaller file set becomes clearer while implementing, use the smaller set.

## acceptance criteria

- `pnpm --filter @carburetor/sim build` passes.
- `pnpm sim:test` runs real tests instead of a TBD echo.
- the scenario reaches `ritual.stage === 'live'`.
- bus voltage never exceeds `INVARIANTS.v_bus_max_V`.
- case temperature never exceeds `INVARIANTS.t_case_max_C`.
- the run is deterministic for the same inputs.
- generated output includes a manifest with seed, inputs, outputs, and host
  fields, even if some values are placeholders in v0.2-0.

## first commits

1. `sim: add reference cold-start runner`
2. `sim: add minimal manifest shape`
3. `tests: assert reference cold-start invariants`
4. `docs: mark reference simulator partial`

## risks

- the coarse physics can be mistaken for measured behavior. label constants as
  reference values until bench scripts replace them.
- the file split can grow too early. keep the first implementation readable
  before making it modular.
- the Python mirror can drift. once the TypeScript spine is clear, mirror the
  same scenario in `python/sim_mini/`.

`Q.E.D.`
