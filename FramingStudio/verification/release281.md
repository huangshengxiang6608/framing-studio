# E2.281 — Batch native Excel formula reads without changing calculations or reports

When Check was followed by A/B generation, keeping Excel open removed intermediate file operations but left thousands of per-cell COM reads. Independent member-sheet capture repeatedly read each formula, and column-report merging inspected every cell of the rendered report for formulas. The same current model now completes the first native Check plus A/B generation in 155.17 seconds, versus 185.60 seconds in the before-change run in this session (16.4% shorter).

Baseline: E2.280 / `08a6ff9bd1cf043fcdd3a239c0a849844a2098cb`. Official main remains `b07f04a6ca4fe84940a8071f316aae85e3a688d0`, latest official release v2.256, and PR 10 remains `5e22aff382a7fe5ca74acc490c7b9df66e357076`. PR 11 contains the E2.280 successor line. Remote heads are checked before work and again before publication.

## Changes and measured bottlenecks

- Independent design-sheet capture reads the formula matrix once, then uses Excel's actual `SpecialCells` areas to preserve formula membership and traversal order. Literal strings starting with `=` are excluded. Only changed formula references are written back, individually, using the original private-input capture rules. No mixed input/formula rectangle is overwritten. Area addresses are read separately because a single multi-area Excel address can truncate at 255 characters.
- The merge guard now queries `UsedRange.HasFormula` once. Only explicit `false` passes; all-formula, mixed, null or unknown results stop the merge. This replaces per-cell checks without removing the guard. A's guard took 34.42 seconds before and 0.02 seconds after.
- Per-stage diagnostic timings cover native macros, member capture, verification, PDF generation, final save, merge and reopening. They do not appear in the printed reports.

Measured B independent-sheet capture fell from 54.82 to 43.73 seconds across its two Check workers. B's main native report macro still took 17.69 seconds and PDF output 20.48 seconds; its final save took 1.25 seconds. A's final merge save/close and reopen together took 2.86 seconds. Remaining time also includes original RC macros, private input-sheet creation, native Excel/print initialization and verification. These are per-worker measurements, sometimes nested or concurrent, and must not be added as if serial wall time.

The native `Check99` at the verified checkpoint boundary remains (about 11.3 seconds in the main B lane). A/B retain their own input contexts. Native PDF printing, A4 validation, final saved-workbook reopening and all verification remain. Printer drivers, templates, formulas, reinforcement rules and report-renderer routines are unchanged.

## Validation

- Current model SHA-256: `f68d8e952475ac8737b32a3cccdb18dd776c3379466a50e360a74e2f0d437c0b`, matching the E279/E280 comparison model. Saved from the existing browser; inputs/storage were not changed and the tab was not reloaded.
- Native Check: 5,159 comparisons. Generated A: 2,607; B: 2,692; total 5,299, zero differences. Every report part continued its corresponding Check worker. Repeat Check/report cache paths and worker-registration cleanup passed. Repeated report workbook bytes are identical.
- Native formula-read regression test compares the old and new enumeration, including order, for all eight original slab/CS/beam/column design/loading sheets, plus merged cells, noncontiguous areas, error formulas, literal `=` text and a scalar formula. Formula-free, mixed and all-formula merge guards pass their expected outcomes.
- Existing actual Member Check UI test and Check/report request tests passed, including identical preparation inputs, busy/verified/stale states, edits during verification and interrupted/missing native records.
- The current model has no CS. A separate native CS fixture passed 19 A and 121 B comparisons, live continuation, repeat Check and repeated report reuse.
- All 15,709 A-workbook and 18,918 B-workbook formulas match E280. Report/independent-member values match, excluding only the native verification clock text. All 25 A and 19 B PDF pages match pixel-for-pixel at 120 dpi. Report dimensions, styles, print settings and page breaks match. AC2/AC10 private sheets, member steel inputs and absence of external workbook links are checked.
- Delivered workbooks are reopened by native Excel, remain `CURRENT`, require no regeneration macros and retain their file hashes.
- Packaging checks every protected E280 source/template file for exact identity. Mathematical engines, selection rules, workbook templates/VBA and report renderers are byte-identical. Runtime changes are confined to formula access, the equivalent merge guard and diagnostics.

## Timing

Seconds of native-host wall time, same model, with concurrent A/B lanes. App audit/planning and browser display are excluded. The separate repeat-live-Check test is excluded from the first Check+report sum. These are measured runs, not a guaranteed duration on other computers or printer environments.

| Operation | E2.280 remeasured before change | E2.281 |
| --- | ---: | ---: |
| First native Check | 104.09 | 87.31 |
| First A+B generation after Check | 81.51 | 67.86 |
| First Check + generation | 185.60 | 155.17 |
| Repeat Check while workbook is open | 3.76 | 3.92 |
| Repeat Check from completed files | 6.59 | 6.68 |
| Repeat A+B from completed files | 4.82 | 4.93 |

The before/after reduction is 30.43 seconds (16.4%). E2.280's previously published first-run measurement was 192.17 seconds; its remeasurement here was 185.60 seconds, illustrating run-to-run variability. The older direct-generation route previously measured 170.17 seconds; E2.281's 155.17 seconds is about 15 seconds (8.8%) shorter, but that historical run was not repeated in this session. Repeat-cache times are effectively unchanged. No computation, verification or print step was omitted to obtain the improvement.
