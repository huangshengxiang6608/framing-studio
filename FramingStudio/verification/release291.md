# E2.291 — Insert axes between arbitrary rows

Baseline: official E2.290, `d5c7cc45c4dfb1ee0603fed7029e4a0a6aba9b0f`.

## Operation

In the X/Y axis table, click **插入** on the later row of the desired interval. Enter the new axis name and its absolute coordinate in metres. The dialog previews the two gaps; **確認插入** commits one undoable transaction. Cancel and Escape do not modify the model.

For axes at 0 m and 9 m, inserting at 3 m produces gaps of 3 m and 6 m. The original axes remain at 0 m and 9 m. Rows can be inserted in any order. Names need not follow numeric or alphabetical order.

- Retain all original axis coordinates and axis-bound member references, including nonzero origins.
- Split building/Opening cells and local-height Area cells while preserving their physical footprints.
- Apply to the current Framing and all floors sharing it. Other Framing grids remain unchanged.
- Preserve Undo, local backup and project save/reopen.
- Commit pending axis name/gap edits before opening the insertion dialog on the first click. Invalid pending edits block insertion.
- Reject duplicate/blank/overlength names, coordinates outside the chosen interval, gaps below 0.001 m and more than 20 axes per direction. Retain invalid dialog drafts for correction.
- Handle exact 1 mm limits using a scale-aware floating-point tolerance, deriving both gaps from the original span total.

## Validation

`node FramingStudio/verification/release291-integration.cjs` passed all 14 applicable suites:

- Axis insertion model and live-preview UI tests.
- Column spacing model/UI; column deletion UI; beam grid snapping.
- Member-list removal, column/slab representative selection and report slab preflight.
- Native-check request/UI, Summary App checks and local reinforcement behavior.

Coverage includes every X/Y interval, arbitrary-order repeated insertion, first/middle intervals, high-origin fractional spans, 1 mm boundaries, existing physical coordinates, sparse building/Opening states, cross-Framing local-height unions, field-edit blur, draft retention, Enter/Cancel/Escape, one-step Undo, local backup and project reopen. The browser tests use isolated contexts and do not touch user project storage.

Preservation gate:

- All 36 bundled modules match their sources and all 40 inline scripts parse.
- 63 other JavaScript modules, 12 native Excel files and the ExcelBridge source remain byte-identical to E2.290.
- All HTML/report/print content outside the three edited modules, axis-table CSS and version strings is preserved.
- Differential checks of original slab/CB fixtures produce identical geometry, Section A/B load rows and report HTML.
- Windows host source changes are version stamps only; the desktop executable was rebuilt as 2.291.0.0. The original Excel bridge, templates and VBA were not rebuilt or edited.
- The isolated native desktop launch did not produce a self-test result within 25 seconds and was terminated. Native runtime success is not claimed. Browser functionality, source/bundle parity and compiled Windows version were verified independently; no native Excel calculation run was performed.

## Archived-test diagnostic

The historical `clearance119.cjs` suite fails before its clearance tests, in its `boundary118Tests` prerequisite: `dead load conserved including roundup 224.125/278.57499999999993`.

`node FramingStudio/verification/legacy-clearance291.cjs` confirms this identical assertion and exact numeric values on the untouched official E2.290 HTML and on E2.291. It is recorded separately and is not counted among the 14 passing release suites. The historical test and calculation rules were not modified to make it pass.
