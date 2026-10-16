# E2.280 — Continue native RC reports in the verified Excel session

Baseline: E2.279 / `3b3dbd0a5360ac6b505cadeffcb50749e7820e81`. Official main/release and open PR heads were checked before work; main remains `b07f04a6ca4fe84940a8071f316aae85e3a688d0`, official latest release v2.256, PR 11 contains this successor line, and PR 10 remains `5e22aff382a7fe5ca74acc490c7b9df66e357076`.

## Change

Summary/Member Check still performs the same native RC verification for the union of selected Check/A/B members. Once verified, its private STA worker can retain the workbook in memory for five minutes. The host receives verified Check completion independently of process exit. A matching report request continues that exact COM workbook, without an intermediate Save/Close/Open or repeated member selection. A/B retain their respective input contexts; this does not combine incompatible A/B source inputs into one calculation state.

At most four idle workers are retained per cache/user. Idle expiry or capacity limits use the existing durable verified checkpoint and release the owned Excel instance. Only application-owned instances are used; user-opened Excel is never attached or terminated. Exact model/job/selection/template/binary/HTML/culture identity is checked at continuation. Missing or interrupted sessions cannot certify unchecked outputs. Repeated Check can reuse a still-open verified session. Completed outputs continue to use the immutable E279 cache and manifest/hash validation.

When both parts of a two-column report already have live verified workers, they generate independently in parallel, then merge in the existing deterministic order. The original column-merge logic, independent-sheet verification, saved-workbook reopening, native report macros, PDF export and print settings remain intact. AC2 and AC10 retain independent calculation sheets. Report UI distinguishes a live continuation from a completed-file cache hit. Printed reports have no UI additions.

## Validation

- Current model was saved from the existing browser without reloading or changing inputs. SHA-256 `f68d8e952475ac8737b32a3cccdb18dd776c3379466a50e360a74e2f0d437c0b` matches the E279 benchmark model.
- Final native run: Check 5,159 comparisons; A 2,607 plus B 2,692 = 5,299 output comparisons; zero differences. Every report part continued its corresponding Check worker PID. Repeated live Check succeeded without releasing the workbook, consumed registrations were removed, and repeated report workbook bytes match exactly.
- Real cross-process tests exercise live continuation, repeat Check, model/input/template invalidation, owner PID, single consumption, idle timeout, bounded capacity, failure propagation and registration cleanup. Existing immutable-cache tests cover corrupt/missing outputs, incomplete manifests, zero/failed comparisons, changed inputs/software/template, isolated user edits and path traversal.
- The actual Member Check UI button, busy/result/stale states and exact Check/report job inputs passed existing E279 tests, including edits during verification and interrupted/missing native records.
- A separate CS fixture verifies both live continuation and idle-expiry fallback with the original native calculation pipeline. The current model itself has no CS.
- Against E279 outputs: all 15,709 A-workbook and 18,918 B-workbook formulas are preserved. Report/independent-design values match, excluding only the native verification clock text. All 25 A pages and 19 B pages are pixel-identical at 120 dpi. AC2/AC10 private formulas, member steel inputs and absence of external links are checked. Delivered workbooks are reopened in native Excel without running regeneration macros.
- Mathematical/selection engines, Excel templates/VBA and original report-renderer sources are byte-identical to E279; packaging checks every protected baseline file. This changes lifetime, dispatch and status reporting, not engineering calculations or reinforcement rules.

## Measured timing and limits

Native-host wall times on the same current model, with A/B lanes concurrent. These exclude App audit/planning and browser display time. Functional repeat-live-Check testing is a separate operation and is not included in the first Check+report sum.

| Operation | E2.279 | E2.280 |
| --- | ---: | ---: |
| First native Check | 110.84 s | 105.24 s |
| First A+B generation after Check | 92.79 s | 86.93 s |
| First Check + generation | 203.63 s | 192.17 s |
| Repeat Check while workbook remains open | — | 3.79 s |
| Repeat Check using completed files | 6.59 s | 6.18 s |
| Repeat A+B using completed files | 4.79 s | 5.10 s |

The final first-run total is 11.46 seconds (5.6%) shorter than E279. It remains 22.01 seconds (12.9%) longer than the previously measured direct-generation route (170.17 seconds). This is a modest improvement, not an overall first-run speedup over the old direct route. Native report generation, PDF output and final merge/reopen verification still take time; none was removed to produce a faster number. Development runs measured 189.82 seconds for serial live continuation and 195.22 seconds during parallel-path development; these are not substituted for final-release measurements.

After idle expiry the app can use the verified on-disk checkpoint, so saving/reopening is still required on that fallback. The no-intermediate-save/open guarantee applies to a valid live continuation, not every future export. Software/template/model changes require fresh verification.
