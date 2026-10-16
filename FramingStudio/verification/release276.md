# E2.276 — Complete slab representative selection before A/B export

Baseline: E2.275 / 4a7b9d9d762710ef4b9957c10af57f94ee3cbbe2. Official main, latest release and relevant PR heads are checked before work and publication.

## Behavior

Previously, automatic SLAB/CS selection ran when Member Check was opened. Generating reports directly could therefore omit the representative slab and its named calculation sheet. A, B and combined A+B generation now complete that selection before planning the export, without requiring a visit to Member Check.

The preflight reuses fresh, complete Section B Check results or runs the existing audit when results are absent or stale. It selects the maximum absolute moment separately for SLAB and CS across the whole model, using the existing selection rules. It preserves manual overrides and beam/column selections. Missing moment data or model edits during preparation stop generation with an explanation rather than exporting incomplete or stale selections. Combined A+B generation shares one prepared snapshot.

No engineering calculations, native templates, VBA, Excel bridge source, report formulas or rendering routines change. Existing independent-sheet capture produces the corresponding named slab sheet after its original Section B design sheet, with editable formulas and private captured inputs. Existing AC2/AC10 combined-workbook delivery remains unchanged.

## Validation

- Direct A, B and A+B generation is exercised through the actual ExcelSync entry point without rendering Member Check. Tests cover SLAB/CS, Check/A/B flags, cache reuse and invalidation, preserved beam/column flags, manual deselection, missing data, concurrent model edits, duplicate clicks and fresh report snapshots.
- The saved current model has 28 floors and 1,810 ordinary slabs; no CS. A test clone with the automatic slab selection removed selects 2/F SL-21 automatically before A+B export. Its existing design moment is 21.2175 kNm/m. All 4,537 Check rows and native job input payloads match E2.275, apart from transient selection state.
- Native Excel generation from the captured direct-export request passes 2,607 A and 2,692 B comparisons: 5,299 total, zero differences. B contains `2F SL-21` immediately after `Section B Slab Check`; both combined workbooks retain independent `1F AC2` and `1F AC10` sheets.
- Saved-workbook preservation checks pass for 21,044 A and 63,827 B populated formula/value cells. Original report and independent-sheet formats, merged ranges, dimensions, number formats, print settings and page breaks are preserved. No external workbook links.
- All 24 expected independent SL-21 result cells match. In a disposable copy, direct bar-diameter edits recalculate steel area while shared Input edits leave the slab's captured inputs and results isolated. Restore, save and reopen pass. The app's official workbook-opening verification passes for both A and B with RC state CURRENT.
- All 43 generated PDF pages match the corresponding E2.275 pages pixel-for-pixel at 1.5 scale (25 A-run pages and 18 B-run pages, including the independent slab design export).
- Existing slab, beam and column representative selection and local report transport regression tests pass. Native template SHA-256 remains `1077faf2e48ab62f5fd1f12d0841db68b4ef0e46edff89f9e7d436c30a9699e0`.

Independent sheets remain generation-time snapshots: editing them recalculates their formulas but does not write back to the app or regenerate report copies. Existing Overall/Wind missing-input messages are separate and remain unresolved by this change. Current-model native validation covers SLAB; CS preflight is covered by regression fixtures, with its unchanged native capture previously verified in E2.275.

The preview remains at localhost:8783. Deployment preserves browser storage and does not force a reload or discard pending user input.
