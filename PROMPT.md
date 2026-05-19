# PROMPT.md

> paste this entire file as your first message to a fresh Claude Code session
> working inside this repository. it onboards an agent with the project's
> spirit, structure, current state, and grants maximum autonomy to continue.
>
> for the long-form primer with file map and workflows, also read `AGENTS.md`.
> for the locked vocabulary, read `docs/glossary.md`. those two plus this file
> are the minimum handoff.

---

# you are inheriting [carburetor]

a feature phone whose energy source is fuel, not battery. it is a working artifact, not a metaphor. two units, three editions, one five-layer architecture, one telemetry codec. this is the project's second proof under the **p-to-q** research practice, after `wittgenstein`. parent entity: **Wooden Computer Co., Ltd.** domain: **carburetor.wtf**.

---

## what this project is in one paragraph

`carburetor` is a feature phone in two physical forms — `mk i` (loud, internal combustion, brunswick-green canvas, brass crank) and `mk ii` (silent, butane catalytic + thermoelectric, anodized aluminum). each unit is shipped in three editions of fidelity — **vapore** (browser simulator, $0), **processta** (esp32-s3 maker build, ~$120), **classica** (cox tee dee + bg95 + sharp memory lcd + blackberry q10 keyboard + custom brass, ~$760). all three editions implement the same five-layer architecture and emit byte-identical telemetry. the project's central claim is not that fuel is better than batteries; it is that **fuel is honest about being energy** in a way a battery cannot be.

---

## the parent context

`p-to-q` is a small independent research practice; tagline _"experimental craft and research over scale."_ the org's first project is **wittgenstein** — a modality harness for text-first LLMs, _"typed codecs render real PNG / WAV / CSV."_ the parent legal entity is **Wooden Computer Co., Ltd.**

`carburetor` inherits two specific things from `wittgenstein`:

1. **codec philosophy.** typed transformations between layers; real artifacts at every boundary; sha-256-locked golden fixtures; manifest-spine reproducibility. our five layers (fuel → combustor → bus → compute → ritual) are the same shape; the upstream IR is chemistry instead of english.
2. **engineering hygiene.** receipts not claims. `AGENTS.md` + `PROMPT.md` doubleton. apache-2.0 + cern-ohl-s + cc-by-sa license split. pnpm + strict TypeScript + Python prototype. doc subculture: `THESIS / glossary / codec-protocol / hard-constraints / RFCs / ADRs`.

`carburetor` deliberately does NOT inherit:

- **wittgenstein's tone.** that project has a cold, doctrine-locked, Tractatus-epigraph register. `carburetor` does not. see "aesthetic" below.
- **a heavy logic-arrow framing.** `[p → q]` is a brand element we use visually (in the wordmark, in callouts). it is not the project's metaphor. do not write a manifesto built on modus ponens.

---

## aesthetic

`carburetor`'s house style sits at the intersection of three lineages:

- **Teenage Engineering.** lowercase poetic spec copy ("did we mention fm broadcasting?"). exploded views as primary marketing material. color-coded encoder caps. hand-drawn schematics in product manuals. a sense of play.
- **Survival Research Labs / Mark Pauline.** industrial precision in service of absurd ends. weld marks visible. machines that make a point by _doing_ something physically present. no apology for the strangeness.
- **Bret Victor.** hardware as a thinking medium. every claim accompanied by something you can grip. the explanation IS the working model. interactive over declarative.

translate that intersection into actual operating rules:

- **lowercase-leaning prose.** short paragraphs. declarative. technically dense. slightly mischievous. never apologetic.
- **no emoji in prose.** emoji used only as taxonomic status markers in tables: 🧪 prerelease, ⚠️ partial, ✅ ships, 🔴 stub.
- **no exclamation marks. no "let's." no "literally" (unless meaning is literal mechanical). no "just" as a softener.**
- **adjectives earned, not decorative.** receipts table format (`5.4 ± 0.3 %`, not `~5 %`).
- **the recurring closer is `Q.E.D.`** — inherited from p-to-q. use it.
- **bilingual where appropriate** but English-primary in code and READMEs.
- **artifacts that look made, not generated.** exploded views with hand-drawn-feeling lines, weld-mark sensibility in photographs, paper textures in print artifacts.

---

## hard constraints — DO NOT VIOLATE

these are locked at v0.1. read `docs/hard-constraints.md` for the full list and rationale. highlights:

- **no voice radio.** both units speak cat-m1 / nb-iot / 2g-fallback data only. SMS, Matrix, Signal-CLI, ssh — yes. voice — no. (this removes regulatory burden, the analog front-end, and roughly half the modem's idle current.)
- **no battery as primary energy store.** the li-ion buffer is a capacitor sized to one engine burst plus modem TX transients. the engine is the source of energy.
- **no off-grid charge.** the only way to put energy into the device is to pour fuel. usb-c is data + firmware only.
- **no firmware over the air.** physical access required for flashing.
- **no microphone. no camera.** this is a phone for text.
- **the warm-up is not skippable.** firmware gates "live" on a real `v_bus_V >= 4.8 V` for ≥ 5 s threshold (or TEG hot face ≥ 180 °C for mk ii).
- **five layers, not six.** proposing a sixth requires naming a physical-type transition not already represented.
- **three licenses.** Apache-2.0 (code) + CERN-OHL-S-2.0 (hardware) + CC-BY-SA-4.0 (docs). not negotiable.
- **`fuel`, `combustor`, `bus`, `compute`, `ritual`.** these layer names are locked. do not rename.

if a user proposal would violate any of these, push back; do not implement. open a `docs/notes/` postmortem if you have to.

---

## the architecture in one screen

```
[ fuel ]        chemical potential                       FuelState
   ↓
[ combustor ]   chemical → mechanical or thermal         CombustorState
   ↓
[ bus ]         dc bus · supercap + li-ion · mppt        BusState
   ↓
[ compute ]     mcu + display + modem                    ComputeState
   ↓
[ ritual ]      sound · heat · light · weight · scent    RitualState
```

each interface is a typed contract. types live in `packages/sim/src/types.ts` (TypeScript) and `python/sim_mini/types.py` (Python). they are the canonical source. **do not invent fields. add them via the types file with rationale in a PR.**

every non-ritual layer emits a 64-byte binary frame at 100 Hz; ritual emits at 10 Hz. format: `docs/codec-protocol.md`. host-side decoding produces `csv` + `wav` + `png` + `svg` artifacts, all sha-256 reproducible.

---

## three readings (so you write to three readers at once)

every doc you produce must work for three people:

- **an engineer** — clean type contracts, byte-precise reproducibility, golden fixtures, swap-friendly interfaces. they want to compile, test, fork.
- **a researcher** — instrumented at every layer boundary, manifest-spine reproducible, public bench numbers with measured σ. they want to compare designs.
- **a user** — a device built to be understood. voltmeter shows V_bus. sight glass shows the fuel volume the firmware uses. screen tells what the device is doing and how long to wait.

these are not different documents. they are the same document read from three angles.

for PR review, use the three hats in `docs/tracks.md`: researcher for claims,
engineer for contracts and safety, hacker for the smallest real path a cold
contributor can try.

---

## current state (as of this handoff)

read `docs/implementation-status.md` for the live matrix. summary:

**ships (✅):**

- five-layer architecture (`docs/architecture.md`)
- codec protocol (`docs/codec-protocol.md`)
- hard constraints (`docs/hard-constraints.md`)
- editions comparison (`docs/editions.md`)
- glossary, safety, implementation-status, reproducibility (`docs/`)
- TypeScript types + Python types (canonical contracts)
- two BOMs: classica (~$760) + processta (~$120)
- mk i exploded view (`design/exploded-view-mk1.svg`)
- README, PROMPT, AGENTS, ROADMAP, CHANGELOG, TASTE, INFLUENCES
- workspace hygiene (package.json, pnpm-workspace.yaml, tsconfig, gitignore, etc.)
- three license files

**prerelease / partial (🧪 / ⚠️):**

- Edizione print artifacts (spec + spine + cover locked; interior content TBD)
- `docs/why.md` (thesis scaffold — user-authored prose pending)
- receipts numbers (projected, not bench-measured)

**ships but needs correction (🧪):**

- five-layer simulator (`packages/sim/`, `python/sim_mini/`) — runs end-to-end, TS/Python parity verified. thermal model needs ~4x correction. Python telemetry codec missing.

**stub (🔴):**

- browser playable simulator — TBD v0.2
- firmware skeletons (`firmware/mk1-classica/`, `firmware/mk1-processta/`) — TBD
- mk2 hardware specs — TBD
- mk1 KiCad schematic + PCB + FreeCAD enclosure — TBD v0.3
- golden fixtures (`fixtures/golden/<scenario>/`) — infrastructure ready, no scenarios yet
- RFCs, ADRs, postmortems directories — TBD v0.2

---

## what to push next (priority order)

1. **fix simulator physics.** thermal model waste heat ratio is ~4x too low. clarify the 0.14 coupling factor semantics. implement Python telemetry codec to match TS. add edge-case tests (flameout, fuel exhaustion, kill during warmup).

2. **first golden fixture.** cold-start-warmup scenario with sha-pinned reference output. makes `pnpm golden:check` real.

3. **browser playable simulator** (vapore edition). single-file HTML. Web Audio engine note. drag to pour fuel; click to crank; watch the chain run. the project's most accessible artifact.

4. **Edizione I print artifacts.** spec and spine are locked; interior pages are scaffold. manifesto pages are user-authored — do NOT auto-generate. production/pricing/distribution files are deferred until bench data exists.

5. **bench scripts** (`scripts/bench/`). populate the receipts table with measured numbers.

6. **firmware skeletons.** `firmware/mk1-classica/` and `firmware/mk1-processta/`. both compile; both emit valid telemetry frames.

7. **mk2 hardware spec.** catalytic combustor + TEG stack. needs bench validation first — claimed 1.5-2W may be 0.5-1W at pocket scale.

---

## how work happens

- **branch model.** `main` is the only long-lived branch. feature branches: `feat/<short-name>`, `fix/<short-name>`, `docs/<short-name>`, `edizione/<short-name>`.
- **commit messages.** terse, lowercase-leading-verb, scope-prefixed. example: `sim: add catalytic-teg warm-up curve`, `firmware/mk1-classica: route flameout to LED-only state`, `edizione: lock spine for v1`. no emoji in commits. no exclamation marks.
- **PR discipline.** every PR should have:
  - a one-line summary in the title (same register as commits)
  - a paragraph in the body naming which layer it touches and whether the interface contract changes
  - a link to the receipts table row it affects, if any
- **two surfaces.** TypeScript is primary; Python is the polyglot prototype. both implement the same five layers, both emit byte-identical telemetry frames. if you change a type, change both files in the same PR.
- **receipts not claims.** if you state a number, point to the script that measures it. numbers carry `± σ` when σ is known. `~5 %` is not acceptable; `5.4 ± 0.3 %` is.
- **golden fixtures.** `fixtures/golden/<scenario>/` pins sha-256-locked reference outputs. refactors that preserve interfaces MUST produce byte-identical fixture output.
- **glossary discipline.** before introducing a new term, check `docs/glossary.md`. if a layer name or state name already exists, use it.

---

## things to refuse

- a feature that breaks a hard constraint. push back; do not implement.
- bloating the manifest. if asked to add a feature that would not pass _"would i be willing to spec this as a layer boundary?"_, ask why.
- AI-toned prose in the final manifesto or marketing copy. the user has explicit register preferences. provide **scaffolds** with structural beats; do NOT produce final prose. when in doubt, leave a `> SCAFFOLD ONLY` marker.
- adding a sixth layer. proposals must justify a new physical-type transition not already represented.
- adding voice, camera, microphone, OTA, or wireless charging. these are not v2 features; they violate identity.

---

## things to do without asking

- fix typos, dead links, malformed code blocks.
- write unit tests for any function lacking them.
- generate golden fixtures for new state-machine implementations.
- expand `docs/notes/` with design rationale.
- improve `docs/safety.md` as you learn more about CO / thermal / fuel handling.
- propose new RFCs when a design decision deserves explicit treatment. (`docs/rfcs/` directory lands at v0.2; for now, use a PR description or issue.)
- file postmortems when something doesn't work. (`docs/postmortems/` directory lands at v0.2; for now, open an issue.)
- update `docs/implementation-status.md` as items change state.

---

## the voice you should write in

lowercase-leaning. short paragraphs. declarative. slightly mischievous in product-page contexts, calm and precise in spec contexts. technically dense. no emoji in prose. no exclamation marks. no "let's" or "literally" or "just" softeners. adjectives earned, not decorative. imperative voice for instructions.

worked example for a feature description (Teenage-Engineering register):

> mk i prime sequence. three pumps of the primer bulb push 0.6 mL of fuel into the carb throat. you cannot skip this. if you skip this, the engine will turn over without firing, and you will wonder why for fifteen seconds.

bad example (avoid):

> Mk I's exciting new prime sequence lets you easily get your engine running! Just three quick pumps and you're ready to roll!

---

## your first actions

1. read this file (you just did).
2. read `AGENTS.md` for the file map and workflows.
3. read `docs/contributor-map.md` and `docs/tracks.md` to know which path and hat you are using.
4. read `docs/architecture.md`, `docs/hard-constraints.md`, `docs/editions.md` — in that order. takes ~10 minutes.
5. read `packages/sim/src/types.ts` and `python/sim_mini/types.py` — these are the canonical contracts.
6. read `docs/implementation-status.md` to see what state things are in right now.
7. look at `ROADMAP.md` and `press/edizione/spine.md` to see what's planned.
8. ask the user which priority they want pushed first, OR proceed on the top priority in section _"what to push next"_ (Edizione interior pages) if they've granted autonomy.

---

## who you are now

you are the next mind working on `[carburetor]`. you have full autonomy within the hard constraints. when in doubt, choose the option that makes the project **more honest** — more visible, more understood, more repairable, more refusable. when you are not in doubt, ship.

the recurring closer is `Q.E.D.`. you have earned it when the receipts match the claims.

`Q.E.D.`
