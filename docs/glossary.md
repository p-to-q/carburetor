# glossary

vocabulary locked at v0.1. introduce new terms only via a PR with rationale in the description. check this list before naming a new thing.

## architecture terms

- **layer** — one of the five typed transformations in `docs/architecture.md`. exactly five exist.
- **codec** — a typed transformation between two layer states. carburetor has four codecs (the four arrows in the chain) plus the wire codec (binary telemetry frame).
- **contract** — the typed interface at a layer boundary. defined in `packages/sim/src/types.ts` and `python/sim_mini/types.py`.
- **swap** — replacing a layer's implementation without changing its contract.
- **chain** — the full `fuel → combustor → bus → compute → ritual` sequence.

## hardware terms

- **unit** — a single device. `mk i` (field, internal combustion) or `mk ii` (pilot, catalytic + TEG).
- **edition** — an implementation tier. `vapore` (simulator), `processta` (maker, ~$120), `classica` (definitive, ~$760).
- **the fuel layer** — layer 1. a refillable container of chemical potential.
- **the combustor** — layer 2. either an internal-combustion engine (mk i) or a catalytic combustor + TEG stack (mk ii). a Stirling option is future-tracked.
- **the bus** — layer 3. rectifier + MPPT buck + supercap + li-ion buffer. distributes DC.
- **compute** — layer 4. MCU + display + radio (LoRa or cellular). the digital surface.
- **ritual** — layer 5. the user-facing sensory experience: sound, heat, light, weight, scent, pause.
- **burst-charge** — the operating mode where the engine runs for several minutes, dumps energy into the buffer, then shuts off. the phone runs on the buffer thereafter.

## firmware / sim terms

- **frame** — a 64-byte telemetry record. see `docs/codec-protocol.md`. one frame = one snapshot of the device.
- **golden fixture** — a sha-256-pinned reference run stored under `fixtures/golden/<scenario>/`. used as a regression test.
- **manifest spine** — `(git_sha, lockfile_hash, seed, inputs, outputs, host)` recorded with every run. enables byte-precise reproducibility.
- **two surfaces** — `packages/sim/` is TypeScript (primary, browser + headless), `python/sim_mini/` is Python (polyglot prototype). both implement the same contracts.
- **scenario** — a named simulator run with frozen inputs. examples: `refuel-and-text-for-an-hour`, `flameout-recovery`, `low-fuel-warning`, `cold-start-warmup`.

## status markers (taxonomic, not decorative)

these are the ONLY emoji used in this project.

- 🧪 — prerelease / experimental. implementation exists but is not validated.
- ⚠️ — partial / measured at bench-prototype scale but not pinned. numbers may move.
- ✅ — ships / receipts complete / σ pinned in fixtures.
- 🔴 — known broken / stub / do not depend on.

## project register

- **receipts (not claims)** — every published number points to a measurement script that produced it. numbers carry `± σ` when σ is known.
- **wooden computer co., ltd.** — the legal parent entity. used in colophons and footers.
- **p-to-q** — the research practice that hosts this project. brand `[p → q]`.
- **wittgenstein** — the org's first project. carburetor is the second. they share architectural inheritance, not aesthetic inheritance.
- **Q.E.D.** — the recurring closer. inherited from p-to-q. used at the end of docs, manifestos, and the colophon.

## things we deliberately do not say

- "literally" — except when meaning is literal mechanical.
- "let's" — manifesto register prefers imperative.
- "just" — as a softener. ("just press X" implies effort minimization we cannot promise.)
- emoji in prose. emoji only as taxonomic status markers in tables.
- exclamation marks. anywhere.
- "feat:" / "fix:" / conventional-commits prefixes. we use scope, not type.
- "synergy", "leverage", "stakeholder", "ecosystem", "journey" — any startup-deck noun.

## things we deliberately do say

- the device. (not "the product".)
- the user. (not "the customer".)
- builders. (not "stakeholders".)
- fuel. (not "energy source".)
- warm-up. (not "boot time".)
- crank. (not "power button".)
- pour. (not "refuel" as a verb when describing a person's action.)

`Q.E.D.`
