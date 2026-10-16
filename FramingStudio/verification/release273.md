# E2.273 — Prevent the reproduced Excel transfer-calculation crash

Baseline: E2.272 / 114fb80c7c0f11af6e5f86b14d36480b89a29a39. Official main b07f04a6ca4fe84940a8071f316aae85e3a688d0, release v2.256, PR 10 head 5e22aff382a7fe5ca74acc490c7b9df66e357076 and PR 11 were checked before investigation and again before publication; no intervening changes were found.

## Cause isolated by controlled tests

The current model reproduced a native Excel access violation (0xc0000005, EXCEL.EXE+0x47a73f), followed by the disconnected COM/RPC errors. Instrumenting FreezeTB79 showed the failure while enabling its first worksheet, before entry into the instrumented VBA calculation functions. Reversing the worksheet order and calling CalculateFullRebuild also reproduced failure. FreezeTB79 is the point where the damaged calculation state is used, rather than an incorrect engineering equation.

The causal application operation is growing the RCLoads73 structured input table after Excel opens the workbook. The original FullAction73 formulas take RCLoads73[#Data] as a Range argument; the workbook also pauses dependent calculation sheets. The following tests used the same model and isolated Excel instances, bypassing the E2.272 recovery wrapper:

- Omit load-table population: 12 consecutive initialization passes.
- Prepare only the two source columns before opening, retaining live load-row expansion: failure on run 7.
- Prepare only the result-table rows, retaining live RCLoads73 expansion: failure on run 2.
- Prepare RCLoads73 rows before opening, leaving the other original operations intact: 8 consecutive passes, 1,200 native comparisons per run.
- Final implementation, using the unchanged original template and preparing only RCLoads73's table/filter bounds in each output copy: 16 consecutive passes, 1,200 native comparisons per run, zero differences and no retries.

These controls isolate the live structured-table expansion as the trigger and remove it from generation. They do not purport to identify a private Microsoft allocation or guarantee that Excel cannot fail for unrelated reasons. Earlier attempts involving retry, manual calculation, activation order, calculation-chain removal and VBA caller lookup are not the basis of this fix.

## Change

Before Excel opens the output copy, set RCLoads73's table and autofilter range to the submitted load-row count. Once open, require that exact range and populate it normally; do not resize this table in the running calculation graph. Keep at least one empty table row when there are no loads. Reject missing or unexpected table schemas rather than modifying unrelated cells.

The packaged workbook is unchanged. No worksheet formula, VBA routine, engineering calculation, adoption/acceptance rule, independent design-sheet behavior, or native A/B rendering routine changes. The helper edits two XML attributes in the output copy. WindowsBase is referenced from the installed .NET Framework for package access. Existing bounded recovery remains a last-resort safeguard, but all validation reported here bypasses it.

## Verification

- Fresh complete native exports of the current model: A1 2,588 comparisons, A2 16, B1 2,571, B2 31; total 5,206, zero differences, no result-cache reuse or recovery attempts.
- Strict comparison with successful original-path controls: A1 20,885 populated original formula/value cells; B1 21,359; A2 19,758; B2 19,741. All match, excluding only existing native audit timestamps and separately tested independent captures.
- Original A/B sheets retain all cell styles, number formats, merged ranges, row heights, column widths, print areas/settings and page breaks. All 29 native PDF pages have identical text, page boxes and rendered pixels at 1.5x scale, including diagrams.
- Independent member sheets retain their original formula coordinates and private input references; 11 first-batch sheets plus the AC10 second-batch sheet are checked. Workbooks remain editable.
- `load-table273.py`: absent-load jobs remain byte-identical; 0/1/75/126-row cases change only the two table/filter bounds. Every worksheet and VBA part remains byte-identical. Missing tables and unexpected columns are rejected.
- All seven existing recovery boundary tests still pass. Recovery is not needed by the new native runs.
- RC template SHA-256 remains 1077faf2e48ab62f5fd1f12d0841db68b4ef0e46edff89f9e7d436c30a9699e0. Removing the preparation helper/call and restoring the old live Resize statement reproduces the E2.272 bridge source exactly.

The existing Overall leftEL and Wind Load missing-input messages remain separate model-input requirements. The preview continues at localhost:8783; no project storage is reset and no browser reload is forced.
