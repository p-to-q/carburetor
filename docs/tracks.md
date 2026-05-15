# tracks

carburetor asks contributors to wear three hats. this is inherited from
`wittgenstein`'s Researcher / Hacker contract, with an added Engineer hat
because this repository crosses software, hardware, firmware, safety, and
print.

the hats are not job titles. they are review postures. one person or one agent
may wear all three, but the PR must show which hat produced which evidence.

## researcher hat

**claim:** carburetor is a research surface for understanding energy in a
modern device by making the energy chain visible, measurable, and falsifiable.

**surface:**

- `docs/why.md` — thesis scaffold; user-authored final prose.
- `INFLUENCES.md` — historical and aesthetic lineage.
- `docs/safety.md` — physical risk, fuel, carbon monoxide, thermal handling.
- `docs/reproducibility.md` — what makes a run or bench measurement comparable.
- `docs/rfcs/` — proposals that need more than one release window.
- `docs/adrs/` — decisions that are expensive to reverse.
- `docs/postmortems/` — failed bench work, wrong assumptions, lessons kept.

**contract:**

- a claim names what would falsify it.
- a number carries units, a measurement method, and sigma when measured.
- a projected number is labeled as projected until bench data replaces it.
- historical precedent is cited by name; folklore does not become doctrine.
- safety notes are updated when a failure mode is learned, not when the product
  copy needs it.

**do not:**

- turn the manifesto into generated prose.
- let a concept render masquerade as a bench-built part.
- ship a receipt row without a script or a documented manual measurement.
- bury a research verdict inside a code change.

## engineer hat

**claim:** carburetor is a robust repository whose interfaces, checks, and
maintenance loops make local changes safe.

**surface:**

- `packages/sim/src/types.ts` and `python/sim_mini/types.py` — shared contracts.
- `docs/architecture.md` — the five-layer trunk.
- `docs/codec-protocol.md` — the telemetry wire format.
- `fixtures/golden/` — deterministic reference runs.
- `.github/` — review routing, CI, dependency drift, and PR shape.
- `docs/engineering-discipline.md` and `docs/workflow.md` — operating rules.
- `docs/implementation-status.md` — the live map of what ships and what is stub.

**contract:**

- every interface change updates TypeScript, Python, and architecture docs
  together.
- every telemetry change updates `docs/codec-protocol.md`.
- every reproducible run writes the manifest spine.
- every safety-relevant hardware or firmware change names the affected boundary.
- CI verifies what exists today; new gates arrive only when the surface exists.
- dependency automation stays conservative until the code surface earns more
  machinery.

**do not:**

- add a sixth layer.
- add orchestration, dashboards, or automation because another p-to-q repo has
  them.
- accept a green build as evidence for a physical claim.
- merge doctrine-bearing changes without an independent review pass.

## hacker hat

**claim:** carburetor must remain hackable: a stranger should be able to make a
small real thing happen without understanding the whole repo first.

**surface:**

- `README.md` — what this is and how to touch it quickly.
- `CONTRIBUTING.md` — first PR paths.
- `packages/sim/` — the smallest executable simulator spine.
- `python/sim_mini/` — the small thermodynamic prototype surface.
- `hardware/mk1/` — BOMs and buildable physical intent.
- `press/edizione/` — the printed artifact as a forcing function.
- `docs/tasks/` — bounded cold-start work.

**contract:**

- prefer one readable reference path before a framework.
- make the first demo honest before making it broad.
- keep setup commands short and truthful.
- leave sharp edges visible when hiding them would make the device less
  understandable.
- when a thing is stubbed, say so in the command output and status table.

**do not:**

- make the repo feel more complete by adding fake surfaces.
- wrap a small script in a subsystem before the script has taught us anything.
- optimize before the algorithmic spine can be printed and understood.
- confuse "playable" with "claimed"; a demo still needs receipts.

## the handshake

```
research note / bench question
  -> RFC or task
  -> engineering contract
  -> small executable change
  -> manifest, fixture, bench row, or postmortem
```

each arrow has a named artifact. if the artifact does not exist yet, the PR
states that explicitly instead of pretending the handoff happened.

## three hats on every meaningful PR

- **researcher hat:** is the claim falsifiable, cited, measured, or clearly
  marked as projected?
- **engineer hat:** are the contracts, safety boundaries, CI checks, and status
  rows aligned?
- **hacker hat:** can a cold contributor understand the path and make one real
  thing happen?

small typo PRs do not need ceremony. doctrine, interface, safety, receipt,
workflow, hardware, firmware, and public-facing changes do.

## when hats conflict

researcher owns what is true. engineer owns what is safe to merge. hacker owns
what is small enough to try.

if the researcher wants a broader claim than the evidence supports, the claim
waits. if the engineer wants a framework before there is a reference path, the
framework waits. if the hacker wants a demo that hides a safety boundary, the
demo waits.

this is the repository's inner loop: truth, safety, play, in that order.

`Q.E.D.`
