# E2.258 — Framing column-spacing limits

Baseline: official main E2.256 `b07f04a6ca4fe84940a8071f316aae85e3a688d0`, plus the existing E2.257 PR #10 commit `5e22aff382a7fe5ca74acc490c7b9df66e357076`. Official main/latest release and open PR heads were checked before work. PR #10 is retained.

The 02 Floors page now has a table below the floor groups with one row per Framing, its assigned floor ranges, X/Y maximum column centre spacing in metres, and current automatic/manual mode. Edits apply on change/blur, persist with the project, and undo. Blank leaves that direction unrestricted by this new setting. Invalid/non-positive/nonfinite values, limits above 500 m, or subdivisions requiring more than 40 axes in either direction reject the transaction.

Automatic column placement subdivides each existing architectural or independent-column-grid interval using a ceiling interval count. Original grid anchors are retained. Supplemental columns have separate identifiers. Existing column identities, individual sections and suppression records are retained in tested cases. Explicit manual mode stores the limits without moving its columns. Existing opening, wall, exclusion, manual-placement and minimum-spacing rules still apply. Aligned, consecutive actual columns over the configured X/Y bound generate model issues; this is not a guarantee of a feasible column layout across openings or constrained locations. The feature does not force columns into prohibited geometry.

Validation:

- New domain regression: independent X/Y settings, exact boundary, interval subdivision, existing independent grids, shared-Framing floors, other-Framing isolation, reset, persistence, manual mode, invalid limits, axis-count guard, exclusion/suppression and reported remaining violations, stable existing identifiers and individual B/D.
- Real Chrome UI: immediate application, invalid rollback, Undo, save/reopen, clearing and manual mode. No page errors. Narrow panel screenshot reviewed.
- Entire generated-model equality against E2.257 for unconfigured seed and independent-column-grid projects.
- Existing regressions passed: column-position257, column-position257-ui, column-parameter-table, column-anchors174, copy-column-adjacent, copy-column196, column-resize166, bays171 and auto-transfer.
- Existing column-mode-no-beams, add-column-no-beams and column-delete-many tests fail identically on the unmodified E2.257 bundle. They were not rewritten to hide the failures. The legacy beam-centres164 test cannot run because its old fixture HTML/project is unavailable.
- Windows desktop executable compiled as 2.258.0.0; ExcelBridge was not rebuilt.
- Existing report, workbook/VBA, engineering check and load-calculation files compared byte-for-byte against E2.257. Only app/engine UI and automatic column geometry, version metadata, desktop executable and new tests/documentation are in scope. All bundled module copies checked against their source.

No native Excel recalculation or A/B regeneration was necessary or claimed. Enabling automatic spacing may change physical geometry and consequently downstream input values. Report presentation, native Excel/VBA rendering and design formula behavior are unchanged.
