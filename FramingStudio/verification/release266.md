# E2.266 — Restore paused transfer calculations before report export

Baseline: E2.265 / dfe4d9137c64ecff5f913e023529d59f7b04bebf. Official main b07f04a6ca4fe84940a8071f316aae85e3a688d0, release v2.256, PR 10 head 5e22aff382a7fe5ca74acc490c7b9df66e357076 and PR 11 were checked before editing and again before publishing.

## Failure and fix

The saved failing request contains ten beams across 1/F–4/F, including SB19, SB56, MBs, CB_3 and TB26. A fresh native run reproduced EXCEL.EXE access violation 0xc0000005. COM then returned 0x800706BA. Step instrumentation located the failure at the false-to-true EnableCalculation transition for paused transfer calculation sheets in AdoptAll254. It also reproduced with an older template, so the failure is not established as an E2.265 formula or member-copy regression. Generic worksheet activation, different activation order and single-threaded calculation were not sufficient fixes.

The bridge now calls the original TransferUI79.FreezeTB79 routine to restore the paired transfer sheets before entering its manual-calculation adoption scope. Subsequent selection, reinforcement, Check and report routines are unchanged. Fresh A and B runs and an additional uncached A repetition passed. The shipped Excel template and every VBA module are byte-identical to E2.265; no experimental VBA/caller changes are shipped.

Two associated export issues were addressed:

- Excel normalized mixed member-specific formulas during bulk ListObject Formula assignment, even with AutoFillFormulasInLists disabled. This replaced the CB span-source column C and cantilever argument with the first row's non-CB formulas, producing fourteen comparison differences. Reapply only cells that differ from the existing intended formula array, then verify the complete array. The formula builder, FullAction73 and calculation inputs are unchanged.
- Dynamic null checks on a disconnected Excel COM object could throw again while writing the original failure result. CLR reference checks preserve result.json and the useful error. A numerical mismatch cannot be returned as a verified RC export.

## Validation

- Same saved current-model inputs: A 2,572 and B 2,540 native comparisons, zero differences. No result-cache reuse in regression runs. Expected values include CB load results and the unchanged N87 results.
- A versus original-template control: 20,831 original populated formula/value cells agree apart from native audit timestamps. Original A/B worksheet formatting, row/column dimensions, merged cells, print settings and page breaks agree; thirteen PDF pages have identical text and page boxes.
- B versus original E2.265 template/native-flow control: 21,301 original populated formula/value cells agree apart from audit timestamps; original report formats and twelve PDF pages agree.
- Ten independent design sheets retain their formula coordinates and private references; 1,200 captured input/result cells match. Read-only reopen, shared-input changes and CalculateFullRebuild leave all 226,355 cells in their UsedRanges unchanged. Test edits were not saved.
- Added read-only export-stability266.py to validate fresh native results, mixed CB/MB/SB/TB formula preservation, spans and complete load results.
- The browser preview remains at 127.0.0.1:8783 with no-store responses. The saved failing A request completed through the actual preview worker: 2,572 comparisons, zero differences, twenty output file entries including the nine existing additional report pages. This final A output also passed the 20,831-cell and thirteen-page preservation comparison.

Section A/B template, equations, wording, render routines, diagrams and formatting remain unchanged. Existing Overall and Wind Load missing-input warnings are outside this RC export fix and are not bypassed.
