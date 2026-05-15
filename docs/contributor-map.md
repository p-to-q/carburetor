# contributor map

this is the shortest map for a human contributor or an agent arriving cold.

carburetor is not only a codebase. it is a device proposal, a simulator, a
hardware path, a safety record, and a printed artifact. enter through the path
that matches the work.

## first five files

read these before changing anything substantial:

- `README.md` — public surface and current promise.
- `CONTRIBUTING.md` — first PR paths and contribution boundaries.
- `docs/tracks.md` — researcher / engineer / hacker hats.
- `docs/engineering-discipline.md` — how changes are inspected and validated.
- `docs/implementation-status.md` — what ships, what is partial, what is stub.

then read the local surface you are touching.

## if you are wearing the researcher hat

start here:

- `docs/why.md` — thesis scaffold; final prose belongs to the user.
- `INFLUENCES.md` — lineage, taste, prior art, and foils.
- `docs/safety.md` — fuel, carbon monoxide, thermal, and user handling.
- `docs/reproducibility.md` — manifests, fixtures, bench runs.
- `.github/ISSUE_TEMPLATE/research-note.md` — how to leave a claim with a kill
  criterion.
- `.github/ISSUE_TEMPLATE/bench-report.md` — how to submit measured evidence.

output shape:

- a research note, issue, safety update, RFC, ADR, receipt change, or postmortem.
- not a quiet edit that turns a hypothesis into doctrine.

## if you are wearing the engineer hat

start here:

- `docs/architecture.md` — five-layer trunk.
- `docs/codec-protocol.md` — telemetry frame format.
- `docs/hard-constraints.md` — identity locks.
- `packages/sim/src/types.ts` — TypeScript contracts.
- `python/sim_mini/types.py` — Python mirror.
- `.github/workflows/ci.yml` — current verification loop.
- `.github/dependabot.yml` — dependency drift policy.

output shape:

- a small PR with validation named in the body.
- interface changes update TypeScript, Python, docs, and fixtures together.
- workflow changes explain why this repo needs the machinery now.

## if you are wearing the hacker hat

start here:

- `packages/sim/README.md` — simulator surface.
- `python/sim_mini/README.md` — Python prototype surface.
- `hardware/mk1/` — BOMs and physical intent.
- `press/edizione/README.md` — print surface.
- `docs/tasks/day-1-cold-start.md` — bounded cold-start work.
- `.github/ISSUE_TEMPLATE/hacker-demo.md` — propose a small real demo.

output shape:

- one runnable command, buildable artifact, inspectable file, or short demo.
- the PR states what the demo proves and what it does not prove.

## review path

```
issue / task / note
  -> small branch
  -> PR with hat + surface + validation
  -> CODEOWNERS review
  -> CI + golden manifest check
  -> merge
  -> status update or follow-up issue
```

do not skip the status update when a surface changes stage.

## escalation

open an issue instead of a PR when:

- the decision changes a hard constraint.
- the work needs an RFC or ADR.
- the physical safety implication is unclear.
- a receipt number lacks a measurement path.
- the first implementation would require a broad framework.

`Q.E.D.`
