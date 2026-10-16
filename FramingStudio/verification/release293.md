# E2.293 verification — 2026-10-16

Baseline: official main / v2.290, d5c7cc45c4dfb1ee0603fed7029e4a0a6aba9b0f. PR #14 at 0969a812fc1f4b1cd3420208be07812e1b2ca7ac contains E2.292 axis insertion and wall-copy work; it remains separate and is not included.

This release promotes the verified local column/wall area and geometry fixes. Production JavaScript is unchanged from that local delivery. Release metadata and source bundle markers are updated; the area UI test reads the current version instead of a temporary local title. The desktop launcher is rebuilt with version 2.293.0.0; its runtime logic is unchanged. Section A/B report code, drawing code, formula modules, ExcelBridge and workbook/VBA templates are byte-identical to the baseline.

## Validation

- Nine area/allocation groups cover offset edge columns, dimensions, order, rotation, translation, openings/deleted slabs, unresolved ownership, zero/overlap cases, wall-only support, cancelling area errors, and propagation to Check/report inputs.
- The saved 21-floor fixture has 440 column instances with positive areas; no missing, overlapping or outside allocation. Column schedules and existing report/Check inputs agree.
- Eight geometry groups cover cleanup scoped to one Framing, boundary retention, reversible outline edits, repeated-warning grouping, horizontal/vertical column-wall spans, explicit fixed positions, independently assigned loads and saved reload.
- The fixture's 85 outside-column warnings and eight obsolete short-beam warnings become zero after explicit cleanup and existing protected beam normalization. All 440 column instances pass their existing axial-only checks; other structural checks are not claimed to pass.
- Browser tests cover temporary location outlines without project mutation, one-step Undo, separated geometry/member filters, Save Project and reload, and subsequent outline changes. Related column resize, deletion, deferred-boundary and member-list regressions passed on the same local code.
- The deferred-boundary test now explicitly selects the other-member category. Its prior filter assumption failed on both the pre-change and modified builds.
- Release validation includes fresh focused tests, source/bundle matching, JavaScript parsing, desktop version/build, report preservation, archive CRC/hash manifest and the existing no-store preview at port 8783.

## Limits

Native Microsoft Excel/PDF and full desktop interaction were not rerun. The full historical regression suite was not rerun. The existing loading-column-area assertion (109.0625 vs 120) and the later wall-tributary158 manual-width assertion reproduce on baseline and are not fixed here. column-outline160 requires a missing historical fixture. No private project or diagnostic dump is published.

Run from the repository root with Node and Playwright dependencies:

```text
node FramingStudio/source/tests/wall-column-allocation.cjs [saved-project-path]
node FramingStudio/source/tests/geometry-consistency-local.cjs [saved-project-path]
node FramingStudio/source/tests/wall-column-allocation-ui.cjs <saved-project-path>
node FramingStudio/source/tests/geometry-consistency-local-ui.cjs <saved-project-path>
```

The full saved-project assertions use the locally retained diagnostic fixture; it is intentionally not distributed. Synthetic cases run without that fixture. Original projects and earlier packages remain unchanged.

The area tests use the earlier retained area fixture with fixed AC6/AC16 expectations; the geometry tests use the later edited project. Substituting the later project into the area fixture assertions is not a valid comparison. Both matching fixture suites pass.
