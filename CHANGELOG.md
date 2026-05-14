# CHANGELOG

format: [keep-a-changelog](https://keepachangelog.com/en/1.1.0/) with lowercase headings.

## [0.1.0] — 2026-05-13 — the trunk

first public commit. nothing burns yet; the architecture, three editions, and the printed-edizione plan are locked.

### added — architecture

- five-layer architecture: `fuel → combustor → bus → compute → ritual`. `docs/architecture.md`.
- typed contracts at every layer boundary. `packages/sim/src/types.ts` + `python/sim_mini/types.py`.
- 64-byte little-endian telemetry codec at 100 Hz (10 Hz for ritual). `docs/codec-protocol.md`.
- hard constraints locked: no voice, no battery-as-primary, no off-grid charge, no firmware OTA, no microphone, no camera, five layers, three licenses. `docs/hard-constraints.md`.

### added — three editions

- vapore (sim, $0), processta (~$120 maker), classica (~$760 definitive). `docs/editions.md`.
- BOMs for mk1-classica and mk1-processta. `hardware/mk1/`.
- mk1 exploded view. `design/exploded-view-mk1.svg`.

### added — workspace

- pnpm workspace root with strict TypeScript.
- `AGENTS.md` + `PROMPT.md` doubleton for agent handoff.
- `TASTE.md`, `INFLUENCES.md`, `ROADMAP.md`, `CHANGELOG.md`, `CONTRIBUTING.md`.
- three license files: Apache-2.0 (full text), CERN-OHL-S-2.0 (pointer), CC-BY-SA-4.0 (pointer).
- workspace hygiene: `.nvmrc`, `.editorconfig`, `.gitignore`, `.prettierrc`, `tsconfig.base.json`.
- `@carburetor/sim` package skeleton with type contracts; scripts stubbed with informative echo messages until v0.2.

### added — Edizione I (the printed companion)

- spec, spine (32-page sequence), typography, colophon. `press/edizione/`.
- cover-front + cover-back SVG.
- all 32 pages of interior content (manifesto remains user-authored draft + scaffold; the other 28 pages are agent-drafted).
- BOM foldout SVG (pages 28-29).
- PRODUCTION master document with schedule, owner matrix, critical path.
- vendor RFQ template (4 candidates: local riso / Mixam / Newspaper Club / Lulu).
- pricing model (per-unit cost ~$10.60 dom., retail $25, ~$555 surplus → edizione II).
- distribution plan (60 sold / 25 gifted / 15 archive).
- promo & pre-order copy.
- pre-press checklist.
- build pipeline skeleton (paged.js + HTML+CSS; v0.2 will wire paged.js + puppeteer to produce PDF).

### added — docs

- `docs/why.md` — thesis scaffold (final prose user-authored).
- `docs/glossary.md` — locked vocabulary.
- `docs/safety.md` — CO, thermal, fuel handling.
- `docs/implementation-status.md` — live ships/partial/stub matrix.
- `docs/reproducibility.md` — manifest spine and golden fixtures.
- `docs/copy.md` — external marketing copy (taglines, site, edition cards, blurbs).

### prerelease coherence

- every doc reference resolves to a real file or is marked TBD with status.
- `package.json` scripts that aren't yet implemented echo helpful "TBD" messages instead of erroring out.
- `packages/sim` workspace package builds cleanly.
- `python/sim_mini` imports cleanly.

### not yet shipped (tracked in `ROADMAP.md`)

- simulator implementations (state machines, browser playable). 🔴
- firmware skeletons. 🔴
- bench scripts and measured receipts. 🔴
- mk2 hardware. 🔴
- Edizione final manifesto prose (user-authored). ⚠️
- Edizione build pipeline (paged.js + puppeteer end-to-end). 🧪
- Edizione print order. 🔴

see `docs/implementation-status.md` for the live cross-section.

---

`Q.E.D.`
