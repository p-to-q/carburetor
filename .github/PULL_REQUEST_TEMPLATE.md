<!--
carburetor is lighter than wittgenstein. keep PRs small, inspect the relevant
surface first, and state exactly what was verified.

House style: docs/engineering-discipline.md and TASTE.md.
-->

## summary

<!-- 1-3 bullets: what changed, why it matters. -->

## scope

- [ ] one focused change set
- [ ] no unrelated cleanup or formatting churn
- [ ] docs/status updated if a surface changed stage
- [ ] doctrine/interface changes are called out explicitly
- [ ] added workflow/tooling only if it protects review, safety, reproducibility, or current build health

## surface

- [ ] simulator / TypeScript
- [ ] Python prototype
- [ ] docs / repo process
- [ ] hardware / BOM / design
- [ ] firmware
- [ ] edizione / print

## hat

- [ ] researcher — claims, citations, bench evidence, safety findings
- [ ] engineer — contracts, CI, reproducibility, fixtures, boundaries
- [ ] hacker — small demos, first-run experience, local scripts, buildable artifacts

## validation

<!-- delete rows that do not apply. -->

- [ ] `pnpm --filter @carburetor/sim build`
- [ ] `pnpm sim:test`
- [ ] `pnpm golden:check`
- [ ] `pytest python/`
- [ ] `pnpm edizione:build`
- [ ] golden fixture diffs are intentional and documented
- [ ] safety implications checked against `docs/safety.md`

## reviewer notes

<!-- risks, follow-ups, or what you intentionally did not do. -->
