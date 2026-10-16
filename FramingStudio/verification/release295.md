# E2.295 — Restore default representative members explicitly

After removing default members, ordinary Check updates correctly preserve the user's exclusions. Member Check now offers `重新抽選預設代表構件` to restore the current confirmed beam, column and slab representatives and their Check/A/B selections. Other manually selected members remain selected. Ordinary updates, missing-demand guards and deterministic maximum-selection rules are unchanged.

The action reuses current App results; stale inputs use the existing representative preparation path. It respects cancellation and input changes, does not launch native Excel, and commits the selection through the existing undo/save transaction. Incomplete groups remain unresolved rather than being forcibly selected.

This PR also retains E2.294's column-result display fix: columns omit Span/Depth and beam deflection cards while retaining RC results and reasons. Baseline: official E2.293 main `471c66f5c037fe014054ee46ddbdfabb35f85849`, plus verified E2.294 `0121f355d980128baa401facf8acaa1acd9d7552`. Separate open PR #14 is unchanged.

Validation:

- Restore regression passed for MB/CB/TB/SB, columns, SLAB and CS; persisted deletions, manual extras, incomplete groups, repeated restore, subsequent manual changes and changed winners are covered.
- Existing column and slab representative tests passed, including global maxima, transfer ownership, missing inputs, manual overrides and bundle/source parity. JavaScript syntax and Windows desktop build passed.
- Current 2019 model: empty list restored to 10 representatives with all 30 Check/A/B boxes selected. Removed G/F MB37 and unchecked G/F SB56's A report; a normal full Summary Check (3,883 members) retained both choices. Explicit restore returned the same 10 members, displayed values and all selections.
- Saved model comparison: only `selected`, `reportA`, `reportB` and representative-selection metadata changed. Geometry, loads, reinforcement and settings are identical.
- 537 other pre-existing application files are byte-identical to E2.294, including Excel templates, ExcelBridge, calculation/selection-rule modules and all A/B report sources. No formulas, report layout, print settings or pagination routines were changed. Native Excel/PDF generation was not rerun for this selection UI change.
- Existing port 8783 preview serves the exact E2.295 bundle; current model is preserved. Windows package includes app and source.
