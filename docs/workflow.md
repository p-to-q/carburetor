# workflow

carburetor follows the p-to-q working style, but it is intentionally lighter
than `wittgenstein`.

`wittgenstein` is a research and engineering harness with many active agents,
codec lines, orchestration workflows, and doctrine surfaces. carburetor is a
smaller physical-device repository: code must be robust, while hardware,
firmware, design, and print surfaces need clear discipline without heavy
process.

p-to-q's shared posture is experimental craft and research over scale. for this
repo, that means the infrastructure should clarify the arrow from fuel to
device behavior. it should not become the project.

## repository posture

this is a low-code repository until v0.2 proves otherwise.

that does not mean low rigor. it means the first-class artifacts are contracts,
BOMs, diagrams, safety notes, manifests, fixtures, and print files. code is
introduced when it makes those artifacts executable or verifiable.

the operating rule is: keep the repo light, keep the evidence strong.

## phase path

current phase: v0.1 to v0.2.

the infrastructure for this phase should do only five things:

- keep `main` PR-first.
- prove the current TypeScript package builds.
- prove the Python type surface imports.
- prove the edizione build script still runs.
- nudge doctrine and interface changes into review.
- watch npm and GitHub Actions dependency drift without opening Python churn
  before Python has runtime dependencies.

v0.2 adds real simulator tests and the first golden fixture. v0.3 adds bench
gates only after bench scripts exist. release automation waits until releases
contain built artifacts, not just source tags.

## what we inherit

- read before write.
- smallest effective change.
- PR-first changes to `main`.
- CODEOWNERS for doctrine, interface, safety, and workflow surfaces.
- a PR template that asks for scope and validation.
- gentle doctrine guardrails for architecture and protocol changes.
- CI that verifies the surfaces that currently exist.
- Dependabot, but with conservative grouping and no automatic major upgrades.

## what we do not inherit yet

- multi-agent orchestration lanes.
- release automation beyond tagged GitHub releases.
- broad label automation.
- heavy benchmark gates before bench scripts exist.
- reviewdog, CodeQL, or link check as required gates.
- per-team routing for teams that do not exist yet.
- required issue templates for every kind of contribution.

add these only when the repository has enough code, contributors, or bench data
to justify the weight.

## file discipline

borrow from `flatus`: keep the docs surface small enough to hold in working
memory. borrow from `centrifuge-sort`: when one file is the right shape, let it
stay one file.

new process files must earn their place. prefer extending
`docs/engineering-discipline.md`, `docs/workflow.md`, or a dated task note over
creating a parallel governance surface.

## selection rules

when considering a workflow, keep it only if it does one of these:

- prevents `main` from carrying unreviewed doctrine or interface changes.
- proves current code still builds.
- makes a physical safety boundary visible.
- preserves reproducibility.
- helps reviewers understand scope in one sitting.

defer it if it mainly manages scale we do not have yet.

## merge discipline

- changes land through PRs.
- doctrine-bearing surfaces require an independent maintainer review.
- interface changes update TypeScript, Python, and docs together.
- hardware and safety changes name their physical implication.
- docs-only changes still say what was validated.

## current required checks

- `pnpm format:check`
- `pnpm --filter @carburetor/sim build`
- `pnpm sim:test`
- `pnpm edizione:build`
- Python import smoke for `python/sim_mini`

as v0.2 grows code, add real simulator tests, golden fixture validation, and
bench-script checks before browser or firmware work becomes the primary surface.

`Q.E.D.`
