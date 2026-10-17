# E2.306 — Repair stale load regions and concave slab load transfer

Saved coordinate load areas could retain wall footprints after geometry changed, leaving otherwise valid floor loading blocked by an obsolete area boundary. Normalization now subtracts only wall occupancy inside valid floor area, retaining the original selection and load inputs. Genuine outside-building, Opening, overlap and empty-region errors remain visible.

An automatically identified nonrectangular slab previously propagated its unsupported rectangular Excel RC check into receiving beam load errors. Load transfer now integrates the net slab polygon in strips against actual supported edges, routes SB end reactions to the receiving primary beams, and assigns residual beam-top loading once. RC eligibility remains separate: a nonrectangular slab still requires a separate design check. Missing loads and unresolved supports continue to block incomplete analysis. Existing rectangular design-span loading and column tributary ownership are preserved.

## Validation

- New synthetic regression covers both axes, reversed member endpoints, net polygon force balance, exact receiving beam loads, unique SB end-reaction transfers, RC pending state, missing loads, outside-building/Opening guards, immutable analysis and idempotent saved-area repair.
- Passed slab-transfer177, slab-load223, slab-centres175 (including loading126/slab131 cases), irregular-secondary305, secondary-width304 and report-slab-preflight276 regressions.
- Unaffected complete SB/TB audit results match E2.305 exactly. The historical audit-performance247 expected hash predates the baseline and already differs on E2.305; its stale hash is not reported as a passing test. Legacy Playwright wrappers cannot run because their dependency is unavailable; actual browser loading/import/export and full Check were exercised separately.
- Current user-model floor audit: 58 beam force/moment balances and 66 unique inter-beam endpoint transfers passed; maximum force difference below 3e-12 kN. Independent physical floor dead/live load conservation passed within 1e-6 / 1e-4 kN respectively. Physical area bookkeeping and existing design-centre-span load conventions were checked separately, not incorrectly equated.
- Actual browser import, loading-complete indication, save and full Check completed. Saved input differences are confined to repaired load-area records. Private model data and screenshots are excluded from this package and PR.
- Full-building validation still reports an existing upper-floor tributary-ownership gap, leaving a transfer beam's accumulated upper-column load unresolved. Local slab/SB contributions are verified; this release does not label the unresolved full-building total as passed.

Original Excel/VBA, workbook templates, reinforcement selection and Section A/B report wording, formulas, formatting and native rendering are unchanged. The Windows launcher and source package are versioned E2.306. Includes all earlier PR #22 updates and the already integrated PR #23 changes; official main is not merged by this update.
