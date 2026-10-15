# E2.286 — Stop interrupted print jobs and share verified A/B RC preparation

If Windows Print Spooler stops while a native Excel/VBA call is blocked, the report worker now detects the interruption on a separate thread and terminates only the independent Excel process it created. The worker reports an incomplete job and does not publish incomplete output as verified. Existing user Excel processes are not attached to or terminated. This handles interruption of the report; it does not repair or restart Windows printer drivers/services. The existing bounded printer-response preflight and original A4 settings remain intact.

A/B jobs from the same model can share an immutable preparation snapshot after the common beams' inputs, reinforcement and original RC results pass verification. B starts from that snapshot, applies its own existing slab/column inputs, and retains its original Check99, load, member and report checks. A's remaining checks continue concurrently. Model, template, bridge, load, member, material or reinforcement changes prevent reuse. Completed reports and the existing live-workbook continuation still reuse their verified results. Daily App edits do not automatically invoke Excel.

Independent design sheets retain separate private inputs and the original equations/layout. Their dependency sheets are created in one operation per member; rewritten references are assigned in contiguous vertical runs rather than one row at a time. Constants and unrelated formulas are not rewritten. The original worksheet-copy, native report generation, final save/reopen and independent-sheet verification remain in place.

## Validation

- A real blocked Excel COM call was interrupted in 1.595 seconds by the injected stopped-service status. Pre-existing Excel processes remained alive and the actual Windows service was not stopped or modified.
- Shared-preparation regression rejects changes to the model identity, material, loads, member selection, manual steel, expected results and column loading; preserves the existing distinct slab/column inputs.
- Native Check pipeline/UI, direct slab representative preflight, column grouping, repeated-report cache identity and local/manual beam RC tests pass. Local edits retain App-only behavior.
- The current model is tested in isolated native Excel runs with fresh caches for each cold trial, then two unchanged repeats. Timing and preservation evidence is recorded in `performance286.json`.
- Original workbook templates/VBA, App calculation/selection modules and native A/B rendering routines are preserved. Only bridge orchestration, private-copy construction, job-sharing metadata and release identifiers change.

The model still has unrelated missing Overall/Deflection wind inputs; successful RC A/B verification does not certify those incomplete chapters.

## Same-model measurements

Two cold trials per version, in 285/286/286/285 order; two unchanged warm generations after each trial. Each cold trial starts with an empty isolated cache. The 13 selected members and all original input/expected-result payloads match after removing sharing metadata. The 10 common beams avoid 1,200 duplicate comparison items; original B-specific and final consistency checks remain.

| Mean measured stage | E2.285 | E2.286 |
| --- | ---: | ---: |
| Native RC verification | 103.21 s | 66.26 s |
| Native A/B generation after verification | 69.06 s | 74.45 s |
| First verification + generation, including App planning | 200.52 s | 169.51 s |
| Unchanged generation, including App planning | 6.13 s | 6.35 s |

The complete first run is 15.46% faster on average (31.01 seconds saved). Individual old/new cold totals were 219.41/181.62 and 167.61/171.42 seconds. Warm generation is essentially unchanged; no warm speedup is claimed. Native output generation itself was not faster, so the gain comes from preparation/RC/copy operations. Measurements include the native host and App planning harness, but not browser PDF painting; they are not a universal latency guarantee.

Both final native trials have zero RC differences, preserve all 34,627 workbook formula cells, and match the report/independent-member values, dimensions, actual styles, print settings and pagination. All 40 PDF pages per trial match at 120 dpi. The comparison permits only native generation/verification timestamp changes and equivalent Excel style-index renumbering; actual style definitions must match. AC2/AC10 remain independent, editable and free of external workbook links. Eight non-positional MB/SB cache records were checked across 296 reinforcement inputs; generated PDF pages contain no Excel cell-error tokens. Unchanged repeats reuse identical workbook hashes and continue the verified live workbooks for the first report.
