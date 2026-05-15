# AGENTS.md

> the long primer. for the short paste-into-agent brief, see `PROMPT.md`.
> for project background and onboarding, also read `README.md` and `docs/architecture.md`.

---

## what this file is

`AGENTS.md` is the contributor's deep-dive guide — written for agents (Claude Code, other coding agents) but useful for any human contributor too. it documents the file map, the workflows, the conventions, and the small project-specific details that take time to discover.

inherited pattern: `wittgenstein` repo, the org's first project, has the same `AGENTS.md` + `PROMPT.md` doubleton. we keep both. they serve different purposes:

- `PROMPT.md` — paste-able onboarding. ~2500 words. read once.
- `AGENTS.md` — reference primer. ~3000 words. read on demand.

---

## file map

```
carburetor/
├── PROMPT.md                  paste-into-agent onboarding
├── AGENTS.md                  this file
├── README.md                  public-facing hero / product page
├── ROADMAP.md                 v0.1 → v0.2 → v1.0
├── CHANGELOG.md               version history
├── CONTRIBUTING.md            human contributor guide
├── CODE_OF_CONDUCT.md         community standards (TBD)
├── SECURITY.md                security policy (TBD)
├── TASTE.md                   project-specific taste section
├── INFLUENCES.md              the loose canon for this project
├── LICENSE                    Apache-2.0 (code)
├── LICENSE-HARDWARE           CERN-OHL-S-2.0 (hardware)
├── LICENSE-DOCS               CC-BY-SA-4.0 (docs)
├── package.json               pnpm workspace root
├── pnpm-workspace.yaml
├── tsconfig.base.json         strict TS config base
├── .nvmrc                     pinned node version
├── .editorconfig
├── .gitignore
├── .prettierrc
│
├── docs/
│   ├── architecture.md        the five layers; load-bearing
│   ├── codec-protocol.md      the 64-byte telemetry frame format
│   ├── hard-constraints.md    what will not change
│   ├── editions.md            vapore / processta / classica comparison
│   ├── glossary.md            locked vocabulary
│   ├── safety.md              CO / thermal / fuel handling
│   ├── implementation-status.md   ships / partial / stub matrix
│   ├── reproducibility.md     manifest spine, golden fixtures
│   ├── contributor-map.md     researcher / engineer / hacker entry map
│   ├── tracks.md              researcher / engineer / hacker contract
│   ├── why.md                 thesis (scaffold — user-authored prose)
│   ├── rfcs/                  numbered RFCs (TBD)
│   ├── adrs/                  numbered ADRs (TBD)
│   ├── notes/                 design notes, sketches
│   └── postmortems/           what didn't work and why
│
├── design/
│   └── exploded-view-mk1.svg
│
├── packages/                  pnpm workspaces, TypeScript primary
│   ├── sim/                   @carburetor/sim — the simulator
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── types.ts       canonical type contracts
│   │   │   ├── fuel/          (TBD)
│   │   │   ├── combustor/     (TBD)
│   │   │   ├── bus/           (TBD)
│   │   │   ├── compute/       (TBD)
│   │   │   ├── ritual/        (TBD)
│   │   │   └── headless.ts    (TBD)
│   │   └── tests/             (TBD)
│   ├── telemetry/             @carburetor/telemetry — codec decoder (TBD)
│   └── cli/                   @carburetor/cli — pour, ignite, monitor (TBD)
│
├── python/
│   └── sim_mini/              polyglot prototype, Python
│       ├── __init__.py
│       ├── pyproject.toml
│       ├── types.py           canonical type contracts (Python mirror)
│       ├── thermo.py          Cox 049 Otto-cycle (TBD)
│       ├── combustor.py       (TBD)
│       └── tests/             (TBD)
│
├── hardware/
│   ├── mk1/
│   │   ├── bom.csv            redirect to bom-{classica,processta}.csv
│   │   ├── bom-classica.csv   ~$760 USD, ideal parts
│   │   ├── bom-processta.csv  ~$120 USD, maker parts
│   │   ├── schematic/         (TBD: KiCad)
│   │   ├── pcb/               (TBD)
│   │   └── enclosure/         (TBD: FreeCAD)
│   └── mk2/                   (TBD)
│
├── firmware/
│   ├── mk1-classica/          Zephyr/Rust on nRF52840 + BG95 (TBD)
│   └── mk1-processta/         ESP-IDF/Rust on ESP32-S3 (TBD)
│
├── fixtures/
│   └── golden/                sha-256-pinned reference runs (TBD)
│
├── press/
│   └── edizione/              the printed zine — v1 in progress
│       ├── README.md
│       ├── spec.md            trim, paper, binding, color
│       ├── spine.md           32-page sequence map
│       ├── typography.md      fonts, leading, margins
│       ├── colophon.md        masthead, contributors, edition
│       ├── cover-front.svg
│       ├── cover-back.svg     (TBD)
│       ├── 01-manifesto.md    scaffold — user-authored prose
│       └── build/             generated PDFs (gitignored)
│
├── artifacts/                 per-run outputs (gitignored by default)
│   ├── runs/<id>/
│   │   ├── manifest.json
│   │   ├── fuel.csv
│   │   ├── combustor.csv
│   │   ├── bus.csv
│   │   ├── compute.csv
│   │   ├── ritual.csv
│   │   ├── engine.wav
│   │   ├── screen.png
│   │   └── scope.svg
│   └── recordings/            non-reproducible artifacts (photos, sound)
│
└── scripts/
    ├── bench/                 measurement scripts (TBD)
    └── tools/                 ad-hoc utilities (TBD)
```

---

## how to set up dev

```sh
# clone
git clone https://github.com/p-to-q/carburetor
cd carburetor

# node
nvm use            # reads .nvmrc → node 20.11
pnpm install

# python
cd python/sim_mini
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
cd ../..

# verify
pnpm lint
pnpm sim:test      # will fail until sim is implemented; that's expected
pytest python/     # will fail until Python sim is implemented; that's expected
```

---

## the layer discipline

every change touches exactly one layer, or it is an interface change. an interface change is a PR with a higher bar — it must update both `packages/sim/src/types.ts` and `python/sim_mini/types.py`, must touch `docs/architecture.md`, must regenerate `fixtures/golden/`, and should ideally update `docs/codec-protocol.md` if the wire format changes.

**single-layer changes** are normal and welcomed. example commits:

```
combustor: tighten flameout detection window from 200 ms to 150 ms
bus: switch supercap discharge model to two-term exponential
compute: add `engine_attn` mode and route LCD redraw priority
ritual: emit minutes-remaining estimate based on V_li_V slope
```

**interface changes** are rarer:

```
contract: add `cold_C` to CombustorState (mk ii catalytic stack)
contract: rename `state` → `phase` in CombustorState
codec: bump protocol version to v2 (new sync byte 0xCC)
```

---

## branches & commits

- `main` is the only long-lived branch.
- working branches: `feat/<name>`, `fix/<name>`, `docs/<name>`, `edizione/<name>`, `bench/<name>`.
- commit messages: terse, lowercase-leading-verb, scope-prefixed. examples:
  - `sim: add otto-cycle peak-power lookup`
  - `firmware/mk1-classica: route v_bus undervoltage to safe-mode`
  - `docs: clarify the "no voice" rationale`
  - `edizione: lock cover-front svg`
  - `hardware/mk1: add aerogel thermal blanket to BOM`
- **no emoji in commits. no exclamation marks. no "feat:" / "fix:" conventional-commits prefixes** — we use scope, not type.

---

## testing

two test surfaces:

```sh
pnpm sim:test       # vitest — TS unit tests + golden-fixture validation
pytest python/      # pytest — Python unit tests + golden-fixture validation
```

both surfaces share `fixtures/golden/`. a TS-only refactor must produce byte-identical fixture output as the previous Python run, and vice versa.

**golden-fixture pattern.** when adding a new state machine or simulator scenario:

1. implement it.
2. run it once, capture the binary output to `fixtures/golden/<scenario>/run.cbf`.
3. record `sha256(run.cbf)` in `fixtures/golden/<scenario>/manifest.json`.
4. commit both. all future runs of this scenario must match this hash.

---

## the receipts table

`README.md` carries a CI-gated `Receipts (not claims)` table. every row:

```
| what                            | number          | verify             |
|---------------------------------|-----------------|--------------------|
| fuel-to-usb efficiency (mk i)   | 5.4 ± 0.3 %    | pnpm bench:fuel-to-wh against fixtures/golden/cox-049/manifest.json
```

- numbers carry `± σ` when σ is measured. `~5 %` is not acceptable.
- if a number is projected (not yet bench-measured), prefix with ⚠️.
- if a number is rejected by CI, prefix with 🔴 and open an issue.
- when CI verifies, change ⚠️ → ✅.

`scripts/bench/` contains the actual measurement scripts. each writes to `artifacts/runs/<id>/manifest.json` with the manifest spine.

---

## the manifest spine

every script or simulator run writes:

```json
{
  "git_sha": "abc123...",
  "lockfile_hash": "def456...",
  "seed": 42,
  "start_us": 1747000000000000,
  "end_us":   1747000060000000,
  "inputs": { ... },
  "outputs": {
    "engine.wav": "sha256:0123...",
    "scope.svg":  "sha256:4567..."
  },
  "host": {
    "os": "darwin-23.4.0",
    "arch": "arm64",
    "node": "20.11.1",
    "python": "3.11.7"
  }
}
```

if two runs share `(git_sha, lockfile_hash, seed, inputs)`, they MUST produce identical `outputs`. this is the reproducibility contract.

---

## the doc cadence

- **architecture.md** is the trunk. update it when adding a layer or changing an interface. never update it without also touching `types.ts` + `types.py`.
- **codec-protocol.md** is the wire format. update it when payload bytes shift.
- **hard-constraints.md** is the lock. update it when you propose a new lock or unlock an old one.
- **editions.md** is the comparison. update it when an edition gains or loses a feature.
- **glossary.md** is the vocabulary. update it before introducing a new term in any other doc.
- **implementation-status.md** is the live cross-section. update it whenever a status changes (this is the most-updated doc).
- **contributor-map.md** is the cold-entry map. update it when onboarding paths or issue templates change.
- **tracks.md** is the three-hat contract. use it for researcher / engineer / hacker review posture on meaningful PRs.
- **safety.md** is the operational manual. update it when you learn something about CO / thermal / fuel that wasn't there before.
- **why.md** is the thesis. **do not generate prose. leave scaffold beats for the user.**

---

## working with the user

the user is the project's author. they make naming, register, and identity decisions. you make engineering, structural, and implementation decisions. friction zones:

- **the user owns the manifesto.** scaffolds yes; final prose no.
- **the user names projects.** you propose; they decide.
- **you own type signatures and protocol bytes.** propose changes in a PR; they review.
- **you own the receipts table.** if a number is wrong, fix it; the user will not catch this.
- **the user pivots aesthetic and tone.** when they redirect, redirect.

when the user says "继续" or "ship it," ship the next item in `ROADMAP.md`. when they say "等一下" or "调整一下," stop and ask.

---

## things you should write proactively

- **postmortems** for any feature that failed at the bench. `docs/postmortems/YYYY-MM-DD-<title>.md`.
- **RFCs** for any decision with a >2-week window. `docs/rfcs/NNNN-<title>.md` with `Status: Draft`.
- **ADRs** for any decision that is reversible only at high cost. `docs/adrs/NNNN-<title>.md`.
- **tests** for any function that does not have them.
- **golden fixtures** for any state machine or scenario you add.
- **safety notes** in `docs/safety.md` as you learn the failure modes.
- **status updates** in `docs/implementation-status.md` — this should be live.

---

## things to never do

- never violate a hard constraint without first opening a PR to remove the lock from `docs/hard-constraints.md` with rationale.
- never generate final marketing prose. scaffolds only.
- never ship a number without σ.
- never add a sixth layer.
- never break a golden fixture without a paired update to `fixtures/golden/<scenario>/manifest.json` and a note in the PR.
- never use emoji in prose (only in taxonomic status tables).
- never use AI-toned hype copy. you will be redirected.

---

## the brand surface

the wordmark is `[carburetor]` with the square brackets, lowercase, monospace-feeling.

the parent brand is `[p → q]`. visually we sometimes recycle the square brackets but we do not lean on the implication arrow as the project's metaphor.

the recurring closer is `Q.E.D.` — inherited from p-to-q.

the parent legal entity is **Wooden Computer Co., Ltd.** — used in footers and the colophon.

primary domain (target): **carburetor.wtf**.

repo: **github.com/p-to-q/carburetor**.

---

## one last thing

the project's success criterion is not "did we ship a phone that runs on gas." the criterion is **"can we hand a stranger one of these and have them understand what energy is, in three minutes, by holding it."** every architecture decision, every doc, every PR should be evaluated against that.

`Q.E.D.`
