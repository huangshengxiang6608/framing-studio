# E2.205 verification — 2026-10-09

Baseline: E2.204 PR #8 commit `014dcde54c91a6c72f665a2ad808576aca3ae571`, retaining official main E2.203 and the beam-depth update. Remote main and PR head were checked before work; no nonlocal source changes were found.

Summary Check now shows independent Section A Span/Depth and Section B RC Check outcomes for each problematic member. A reuses Reports.sizing verbatim (including existing long-span correction); B reuses the existing RC result. A-only failures are included, passing companion results remain visible, both-pass members are omitted from the problem list, and missing input/calculation-required/column N/A states are distinct. Model, height and transfer warnings remain available. RC details are expandable; column size advice stays visible. Recommendations, filters, locate, batch/undo and stale-results behavior remain intact.

## Current validation

Seven targeted programs in release205.cjs pass: integration143, summary-sections205, summary-sections205-ui, audit-filters169, apply-column-advice, member-depth204-ui and beam-surface184. New tests cover all four A/B pass/fail combinations using actual solver outputs, missing input, long cantilevers, column N/A, exact agreement with existing report ratios and RC states, immutable project/report selections, cooperative/synchronous audit parity and cancellation. Existing slab131 core cases also pass. Narrow 1063×704 UI screenshot inspected; A ratio/limit and both statuses fit, details and locate work; no browser errors.

309 pre-existing app files are byte-identical to E2.204, including Section A/B report renderers, engine, RC formulas, native Excel/VBA/ExcelBridge and templates. In loading.js, computation code before and after the audit block is unchanged. Only audit aggregation and its summary UI change. All 36 bundled modules match source; bundled content outside these modules and version labels is unchanged. JavaScript syntax checked. Windows host rebuilt as 2.205.0.0; only host version identifiers changed. Native Excel/print rendering and desktop interaction were not rerun.

## Legacy diagnostic results (not counted as passing)

Three older programs were run on both E2.205 and the untouched E2.204 package and fail identically:

- support132.cjs: core checks pass, then the old UI locator #ex-slab-support-mode132 times out.
- slab131.cjs: core checks pass, then an old UI expectation asserts 3.7 while the field displays 3.75. Its isolated loopback test required running outside the sandbox; that network restriction was resolved before comparison.
- dormant-beams168.cjs: the pre-existing dormant-snapshot equality assertion fails before reaching audit assertions.

These legacy tests were not rewritten to hide the failures. The relevant slab/audit core and batch behavior are covered by the new targeted tests. The initial column-advice visibility regression introduced during this change was fixed and its complete UI/batch/undo regression passes.

## Delivery and preview

The current app/source and Windows package are delivered through existing PR #8 and a fork prerelease pending official merge. Preserve historic release folders. Local preview continues at http://127.0.0.1:8783/ with cache disabled; the user refreshes the existing tab. Do not open a new tab or erase browser/project storage.
