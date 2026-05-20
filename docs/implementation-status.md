# implementation status

what ships, what is partial, what is stub. this is the project's live cross-section. **update this file whenever a status changes.**

## legend

- ✅ ships — production-ready, has tests where applicable, receipts measured.
- 🧪 prerelease — implementation present, awaiting bench / build validation.
- ⚠️ partial — exists but incomplete or unmeasured.
- 🔴 stub — placeholder only.

---

## architecture & docs

| item                       | status | location                                            |
| -------------------------- | ------ | --------------------------------------------------- |
| architecture (five layers) | ✅     | `docs/architecture.md`                              |
| codec protocol             | ✅     | `docs/codec-protocol.md`                            |
| hard constraints           | ✅     | `docs/hard-constraints.md`                          |
| editions comparison        | ✅     | `docs/editions.md`                                  |
| glossary                   | ✅     | `docs/glossary.md`                                  |
| safety                     | ✅     | `docs/safety.md`                                    |
| reproducibility            | ✅     | `docs/reproducibility.md`                           |
| contributor map            | ✅     | `docs/contributor-map.md`                           |
| tracks                     | ✅     | `docs/tracks.md`                                    |
| copy (external marketing)  | ✅     | `docs/copy.md`                                      |
| engineering discipline     | ✅     | `docs/engineering-discipline.md`                    |
| workflow                   | ✅     | `docs/workflow.md`                                  |
| why (thesis scaffold)      | ⚠️     | `docs/why.md` — user authors final prose            |
| vapore UX spec             | 🧪     | `docs/vapore-ux.md` (PR #43)                        |
| vapore audio spec          | 🧪     | `docs/vapore-audio-spec.md` (PR #43)                |
| vapore sim spec            | ✅     | `docs/vapore-spec.md`                               |
| parameter validation       | 🧪     | `docs/research/parameter-validation-2026-05-20.md`  |
| RFCs                       | 🔴     | `docs/rfcs/` — directory not present at v0.1        |
| ADRs                       | 🔴     | `docs/adrs/` — directory not present at v0.1        |
| postmortems                | 🔴     | `docs/postmortems/` — directory not present at v0.1 |

## types & contracts

| item             | status | location                       |
| ---------------- | ------ | ------------------------------ |
| TypeScript types | ✅     | `packages/sim/src/types.ts`    |
| Python types     | ✅     | `python/sim_mini/sim_types.py` |
| INVARIANTS table | ✅     | both files                     |

## simulator

| item                                | status | location                                                     |
| ----------------------------------- | ------ | ------------------------------------------------------------ |
| `@carburetor/sim` package           | 🧪     | `packages/sim/` — TS core builds and tests                   |
| fuel layer simulator                | 🧪     | TS + Python prerelease; temperature responds to case heat    |
| combustor state machine             | 🧪     | TS + Python prerelease; fuel burn coupled to shaft power     |
| bus simulator                       | 🧪     | `packages/sim/src/bus/` — TS prerelease                      |
| compute power model                 | 🧪     | TS + Python prerelease; mode-derived signal / RSSI           |
| ritual stage driver                 | 🧪     | TS + Python prerelease; runtime guarded when engine is off   |
| vapore browser simulator            | ⚠️     | `packages/vapore/` — static shell exists, sim loop not wired |
| headless simulator                  | 🧪     | TS + Python prerelease; `headless.ts` / `headless.py`        |
| python thermo (Cox 049)             | 🔴     | TBD v0.2                                                     |
| telemetry codec TS                  | 🧪     | `packages/sim/src/telemetry.ts` — encode/decode with SHA-256 |
| telemetry codec Python              | 🧪     | `python/sim_mini/telemetry.py` — encode/decode with SHA-256  |
| golden fixtures                     | 🧪     | `fixtures/golden/` — 4 scenarios, codec under review (#44)   |
| golden manifest checker             | ✅     | `scripts/tools/verify-golden.mjs`                            |
| cross-language sim comparison       | 🧪     | `scripts/tools/compare-sim-headless.mjs`                     |

## firmware

| item                   | status | location                                          |
| ---------------------- | ------ | ------------------------------------------------- |
| classica skeleton  | 🔴     | `firmware/classica/` — Zephyr + nRF52840, TBD v0.2c |
| processta skeleton | 🔴     | `firmware/processta/` — ESP-IDF + ESP32-S3, TBD v0.2c |
| mk ii firmware     | 🔴     | not on v0.2 path                                     |

## hardware

| item                       | status | location                                            |
| -------------------------- | ------ | --------------------------------------------------- |
| BOM (classica)             | ✅     | `hardware/mk1/bom-classica.csv`                     |
| BOM (processta)            | ⚠️     | `hardware/mk1/bom-processta.csv` — pre-LoRa, stale  |
| processta architecture     | 🧪     | `docs/processta-architecture.md` (PR #43)            |
| processta BOM (in-doc)     | 🧪     | `docs/processta-architecture.md` — LoRa BOM, $49 COGS |
| schematic (KiCad)          | 🔴     | TBD v0.3, processta first                            |
| PCB                        | 🔴     | TBD v0.3, 4-layer 60×100mm (JLCPCB)                 |
| enclosure CAD              | 🔴     | TBD v0.3, injection-molded ABS                       |
| exploded view (SVG)        | ✅     | `design/exploded-view-mk1.svg`                       |
| mk ii combustor BOM        | 🔴     | TBD v0.4                                             |

## edizione I (print)

| item                        | status | location                                                                    |
| --------------------------- | ------ | --------------------------------------------------------------------------- |
| README                      | ✅     | `press/edizione/README.md`                                                  |
| PRODUCTION master           | ⚠️     | `press/edizione/deferred-v0.2/PRODUCTION.md` — deferred until bench data    |
| spec                        | ✅     | `press/edizione/spec.md`                                                    |
| spine (32-page sequence)    | ✅     | `press/edizione/spine.md`                                                   |
| typography rules            | ✅     | `press/edizione/typography.md`                                              |
| colophon                    | ✅     | `press/edizione/colophon.md`                                                |
| vendor RFQ template         | ⚠️     | `press/edizione/deferred-v0.2/vendor-rfq.md` — deferred                     |
| pricing model               | ⚠️     | `press/edizione/deferred-v0.2/pricing.md` — deferred                        |
| distribution plan           | ⚠️     | `press/edizione/deferred-v0.2/distribution.md` — deferred                   |
| promo & pre-order copy      | ⚠️     | `press/edizione/deferred-v0.2/promo-and-preorder.md` — deferred             |
| print checklist             | ⚠️     | `press/edizione/deferred-v0.2/print-checklist.md` — deferred                |
| cover front                 | 🧪     | `press/edizione/cover-front.svg`                                            |
| cover back                  | 🧪     | `press/edizione/cover-back.svg`                                             |
| page 1 frontispiece notes   | ✅     | `press/edizione/00-frontispiece.md`                                         |
| page 3 contents             | ✅     | `press/edizione/00-contents.md`                                             |
| manifesto scaffold          | ✅     | `press/edizione/01-manifesto.md`                                            |
| manifesto first-draft prose | ⚠️     | `press/edizione/01-manifesto-draft.md` — user reviews                       |
| pages 8-19 architecture     | ✅     | `press/edizione/02-architecture.md`                                         |
| pages 20-23 mk i + mk ii    | ✅     | `press/edizione/03-mk-units.md` (photo placeholders)                        |
| pages 24-25 receipts        | ✅     | `press/edizione/06-receipts.md`                                             |
| pages 26-27 three editions  | ✅     | `press/edizione/04-editions.md`                                             |
| pages 28-29 BOM foldout md  | ✅     | `press/edizione/05-bom-foldout.md`                                          |
| pages 28-29 BOM foldout svg | 🧪     | `press/edizione/05-bom-foldout.svg`                                         |
| page 31 influences          | ✅     | `press/edizione/07-influences.md`                                           |
| page 32 close               | ✅     | `press/edizione/08-close.md`                                                |
| build pipeline (paged.js)   | 🧪     | `press/edizione/build-scripts/` — scaffold runs; full pdf pipeline TBD v0.2 |
| print PDF (final)           | 🔴     | TBD W-09 (~2026-07-15)                                                      |
| print order placed          | 🔴     | TBD W-06 (~2026-08-05)                                                      |
| pre-order page live         | 🔴     | TBD W-04 (~2026-08-19)                                                      |

## bench / receipts

| receipt                       | status       | location                                 |
| ----------------------------- | ------------ | ---------------------------------------- |
| fuel-to-USB efficiency (mk i) | ⚠️ projected | `scripts/bench/fuel-to-wh.py` TBD v0.2   |
| warm-up time (mk ii)          | ⚠️ projected | `scripts/bench/warmup.py` TBD v0.2       |
| state-machine totality        | 🔴           | `scripts/bench/totality.ts` TBD v0.2     |
| BOM resolvability             | 🔴           | `scripts/bench/bom-resolve.ts` TBD v0.2  |
| power-mode current draws      | 🔴           | `scripts/bench/power-modes.py` TBD v0.3  |
| acoustic signature            | 🔴           | `scripts/bench/acoustic.py` TBD v0.3     |
| thermal soak                  | 🔴           | `scripts/bench/thermal-soak.py` TBD v0.3 |
| case temp at user grip        | 🔴           | TBD v0.3                                 |
| radio TX peak current         | 🔴           | TBD v0.3                                 |
| li-ion holdup at idle         | 🔴           | TBD v0.3                                 |

## workspace hygiene

| item                                        | status |
| ------------------------------------------- | ------ |
| `package.json` workspace root               | ✅     |
| `pnpm-workspace.yaml`                       | ✅     |
| `tsconfig.base.json`                        | ✅     |
| `.gitignore`                                | ✅     |
| `.nvmrc`                                    | ✅     |
| `.editorconfig`                             | ✅     |
| `.prettierrc`                               | ✅     |
| `LICENSE` (Apache-2.0)                      | ✅     |
| `LICENSE-HARDWARE` (CERN-OHL-S-2.0 pointer) | ✅     |
| `LICENSE-DOCS` (CC-BY-SA-4.0 pointer)       | ✅     |
| `PROMPT.md`                                 | ✅     |
| `AGENTS.md`                                 | ✅     |
| `README.md`                                 | ✅     |
| `ROADMAP.md`                                | ✅     |
| `CHANGELOG.md`                              | ✅     |
| `CONTRIBUTING.md`                           | ✅     |
| `docs/contributor-map.md`                   | ✅     |
| `docs/tracks.md`                            | ✅     |
| `TASTE.md`                                  | ✅     |
| `INFLUENCES.md`                             | ✅     |
| `CODE_OF_CONDUCT.md`                        | ✅     |
| `SECURITY.md`                               | ✅     |
| `.github/CODEOWNERS`                        | ✅     |
| `.github/PULL_REQUEST_TEMPLATE.md`          | ✅     |
| `.github/ISSUE_TEMPLATE/`                   | ✅     |
| `.github/workflows/ci.yml`                  | ✅     |
| `.github/workflows/doctrine-guardrail.yml`  | ✅     |
| `.github/dependabot.yml`                    | ✅     |
| `scripts/tools/verify-golden.mjs`           | ✅     |

## prerelease readiness

at v0.1, the following must be true (all currently ✅):

- ✅ every doc references either a real file or marks the reference as TBD with status
- ✅ `package.json` scripts that won't work yet echo "TBD" instead of erroring out
- ✅ `packages/sim` builds (`pnpm --filter @carburetor/sim build`)
- ✅ `python/sim_mini` imports cleanly (no missing names)
- ✅ all Edizione spine files exist
- ✅ all license files present
- ✅ no dangling references in edizione production files (moved to deferred-v0.2/)
- ✅ README, PROMPT, AGENTS are the only files a new agent needs to read first

`Q.E.D.`
