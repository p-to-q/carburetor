# engineering discipline

this document establishes the working principles for carburetor development.
it adapts the discipline used in `p-to-q/wittgenstein`, but specializes it for
a fuel-driven device with a simulator, hardware artifacts, firmware, and a
printed edizione.

---

## read before write

inspect the relevant code, docs, fixtures, and nearby patterns before editing.

this means:

- understand the existing layer contract before changing a layer.
- check `docs/hard-constraints.md` before changing behavior that affects identity.
- check `docs/implementation-status.md` before treating a stub as shipped.
- check `docs/codec-protocol.md` before touching telemetry bytes.
- check both language surfaces before changing shared types.

then make the smallest effective change that solves the problem.

## change discipline

make the smallest effective change.

- preserve existing behavior unless the change requires modifying it.
- do not bundle unrelated cleanup with a fix.
- prefer editing existing files over creating new ones.
- do not invent public APIs without a real caller.
- if a second thing is worth fixing, track it separately.

### carburetor constraints

because the doctrine is load-bearing:

- do not add a sixth layer.
- do not change a hard constraint without updating `docs/hard-constraints.md`.
- do not change an interface without updating both `packages/sim/src/types.ts`
  and `python/sim_mini/types.py`.
- do not change telemetry bytes without updating `docs/codec-protocol.md`.
- do not change golden behavior without updating the paired fixture manifest.
- do not ship a receipt number without a script and a measured sigma.

### documentation surfaces

not every document has the same authority. classify the surface before editing:

- active guidance: `AGENTS.md`, `PROMPT.md`, `CONTRIBUTING.md`, this file.
- locked doctrine: `docs/hard-constraints.md`, `docs/architecture.md`,
  `docs/codec-protocol.md`, ratified ADRs when they exist.
- live status: `docs/implementation-status.md`, `ROADMAP.md`.
- historical receipts: changelog entries, postmortems, bench manifests,
  golden fixture manifests.
- author-owned prose: `docs/why.md` and manifesto prose.

do not quietly promote historical notes into active guidance. do not bury a
doctrine change inside implementation work. if a document changes role, say so.

## agency and scope

high agency is useful when it has the right target.

### distinguish three kinds of truth

- locked doctrine: hard constraints, architecture contracts, protocol bytes,
  ratified ADRs, and active invariants.
- execution hypothesis: the current best implementation path written in a task,
  issue, or plan.
- open exploration: research notes, design options, and sketches.

the common failure mode is treating an execution hypothesis like locked
doctrine. challenge it when code, tests, measurements, or prior art prove it
weak.

### how to widen scope

if you expand beyond the original task, name the expansion:

- bug fix.
- drift correction.
- engineering improvement.
- doctrine challenge.

bug fixes and drift corrections may be folded into the current change when they
are tightly coupled. engineering improvements are acceptable when they make the
current work materially safer or clearer. doctrine challenges need an RFC, ADR,
or explicit maintainer discussion.

## architecture

simple and explicit design.

- composition over proliferation.
- one readable reference path before clever module splits.
- direct implementations before abstractions.
- units in field names.
- data flow visible enough to trace in one sitting.

the first simulator implementation should expose the algorithmic spine. every
optimization, UI wrapper, and hardware-specific refinement comes after that
spine is legible.

## low-code repository discipline

carburetor is low-code by design at this stage. most of the value is in the
contracts, BOMs, drawings, safety notes, manifests, and bench receipts. do not
measure progress by lines of code.

- code exists to make the energy chain testable, reproducible, and inspectable.
- documents are not decoration; they are part of the build surface.
- a small reference implementation is better than a broad framework with no
  fixture.
- prefer a single dependency-free path until the shape is proven.
- do not add apps, agents, dashboards, or orchestration because wittgenstein has
  them.
- when in doubt, add a manifest, a test, a checklist, or a clearer status row
  before adding a subsystem.

### code belongs where it proves something

add code when it does at least one of these:

- runs a reference scenario.
- checks an invariant.
- writes or validates a manifest.
- decodes or encodes telemetry.
- resolves a BOM or bench measurement.
- makes a printed or visual artifact reproducible.

do not add code just to make the repo feel like software. p-to-q projects are
allowed to be source-shaped in different ways.

## hardware, design, and firmware discipline

carburetor is lighter than wittgenstein as a software repository, but its
non-code surfaces carry physical risk. treat them with the same review
seriousness, not the same process weight.

### hardware and BOM

- every part change names the reason: availability, safety, cost, measured
  performance, or edition fit.
- BOM rows should keep vendor, part number, quantity, and edition intent clear.
- do not replace a safety-relevant part with a cheaper substitute without a note
  in `docs/safety.md` or the relevant BOM comment.
- schematics and PCB work should land with source files, rendered exports when
  useful, and a short bring-up note.

### design files

- visual drawings are not decoration; they are inspection surfaces.
- every physical part shown in a drawing should have a corresponding name in
  docs, BOM, or glossary.
- if a drawing is aspirational, label it as such. do not let a concept render
  masquerade as a bench-built part.
- design changes should preserve the five-layer legibility: a reader should be
  able to point to fuel, combustor, bus, compute, and ritual in the artifact.
- edizione files are production artifacts. treat typography, covers, foldouts,
  and print specs as source, not collateral.

### firmware

- firmware changes must preserve physical-update-only assumptions.
- no OTA path, microphone path, camera path, or charge path can appear as an
  incidental convenience.
- safety state should be explicit: undervoltage, thermal high, flameout, and
  fuel low should be states a reviewer can find.

### circuits and boards

- schematic changes must name the rail, signal, or safety boundary they affect.
- PCB changes should include the source file and, when useful, a rendered export
  or screenshot for review.
- power-path changes touch safety. route them through `docs/safety.md` and, if
  they affect interfaces, `docs/architecture.md`.
- connector pinouts are contracts. changing one should update docs and any
  firmware assumptions together.

## robustness

never hide errors. never silently swallow exceptions unless a comment explains
why preserving the failure would be less correct.

external data and physical inputs must be scrutinized:

- user events are untrusted input.
- bench manifests must name the host, git sha, lockfile hash, seed, inputs, and
  outputs.
- invalid voltage, thermal, and phase states should be hard to create.
- safety failures should surface as state, not disappear into logs.

printability is a feature. code, manifests, fixtures, and error records should
be easy to inspect.

## testing and validation

do not claim success without evidence.

preference order:

1. focused tests for the behavior changed.
2. golden fixture validation for deterministic simulator behavior.
3. type checking and linting.
4. build checks.
5. manual verification, named explicitly.

state exactly what you verified. if a check was not run, say so.

### carburetor checklist

- [ ] `pnpm --filter @carburetor/sim build` passes when TypeScript changes.
- [ ] `pnpm sim:test` passes once simulator tests exist.
- [ ] `pytest python/` passes when Python simulator code changes.
- [ ] golden fixture diffs are intentional and documented.
- [ ] manifest output includes git sha, lockfile hash, seed, inputs, outputs,
      and host.
- [ ] interface changes update TypeScript, Python, and architecture docs
      together.
- [ ] protocol changes update `docs/codec-protocol.md`.
- [ ] safety changes update `docs/safety.md`.

## no drive-by refactor

stay on task.

avoid:

- renaming unrelated symbols.
- moving files unnecessarily.
- reformatting unrelated sections.
- changing stylistic patterns without a local reason.
- mixing cleanup with implementation unless it directly improves correctness,
  safety, or maintainability.

if cleanup is warranted, track it separately.

## reporting

commit messages and PR descriptions should state:

1. what changed.
2. why.
3. how it was validated.
4. remaining risks.

keep it concise and technical. no fluff.

example:

```text
sim: add reference cold-start runner

Adds a dependency-free cold-start-warmup runner that advances the five layer
states from fuel to ritual and writes a manifest. This gives v0.2 a readable
reference path before browser or firmware work.

Validated:
- pnpm --filter @carburetor/sim build
- pnpm sim:test

Risk: the physics model is intentionally coarse; bench-calibrated constants
will replace it later.
```

## success looks like this

- the change is minimal, readable, and testable.
- behavior is preserved unless change was required.
- failures surface with context.
- tests pass, or the missing checks are named.
- no unrelated cleanup is bundled in.
- a reviewer can understand the intent without asking what the change is for.

`Q.E.D.`
