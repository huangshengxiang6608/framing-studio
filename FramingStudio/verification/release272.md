# E2.272 — Recover Excel disconnects during transfer initialization

Baseline: E2.271 / 9c31ac5ba86c261d77f1c692d6895185ca3b85d1. Official main b07f04a6ca4fe84940a8071f316aae85e3a688d0, release v2.256, PR 10 head 5e22aff382a7fe5ca74acc490c7b9df66e357076 and PR 11 were checked before work and again before publication. No intervening remote changes were found.

## Reproduced failure and scope

The current-model A batch fails inside TransferUI79.FreezeTB79(false), before any numerical comparison. That original VBA routine re-enables Section B Transfer Beam Check and _TB Analysis. Excel disconnects at this EnableCalculation transition; the initiating DISP_E_EXCEPTION (0x80020009) is followed by RPC unavailable (0x800706BA). The original process has no usable workbook. A successful Summary/Member Check therefore does not prevent this export-engine failure.

The unchanged original path reproduced one failure in six short runs. Moving the transition into manual calculation, moving it earlier, clearing the output calculation-chain cache, postponing load-sheet suspension, and experimental VBA context/activation changes did not reliably eliminate it. None of those experiments is shipped. This identifies the native initialization boundary, not a proven internal Microsoft fault instruction or a calculation/formula error.

## Shipped change

Keep the complete original Excel worker, template, VBA and calculations unchanged. At the reproduced pre-verification RC disconnect only, restart the same input in a fresh managed AppDomain and new isolated Excel.Application. Static caches and COM references are not reused. Permit at most three attempts total; preserve failed attempts and errors. Relay retry progress to the existing UI and publish the final status after its workbook/PDF files have been copied into place.

Do not retry numerical differences, an error after comparisons start, a partial usable workbook, later calculation stages, or other report types. Exhausted retries remain failed. This is bounded recovery from the intermittent native crash, not a claim that Excel's internal crash has been removed.

## Validation

- Native Excel, current submitted model, no result-cache reuse: A batch 1 2,588 comparisons; A batch 2 16; B batch 1 2,571; B batch 2 31. Total 5,206, zero differences.
- Controlled-disconnect diagnostic: gracefully closed only the newly created, identity-checked test Excel/workbook and injected the disconnect condition. Attempt two then naturally reproduced the real FreezeTB79 crash. Attempt three completed all 2,588 comparisons, zero differences. Fault injection is absent from the release binary/source.
- Original A first-batch output: 20,885 populated formula/value cells match the E2.271 control, excluding existing native audit timestamps. Original B: 21,359 cells match. A/B layout, row heights, column widths, styles, merged cells, print areas/settings and breaks are unchanged. Fourteen A PDF pages and thirteen B PDF pages have identical text and page boxes. The recovered diagnostic A output passes the same strict comparison.
- Independent B calculation sheets: 11 first-batch sheets plus the second-batch AC10 sheet; 1,262 input/result cells verified, original formula coordinates and private references preserved. Workbooks remain editable.
- Seven deterministic recovery tests cover successful retry, three-attempt exhaustion and refusal to retry validation differences, later-stage errors, partial workbooks, started comparisons and non-RC reports. Every retry receives byte-identical job input.
- The original worker body and every calculation/export function are byte-identical after removing the new recovery wrapper. The RC workbook SHA-256 remains 1077faf2e48ab62f5fd1f12d0841db68b4ef0e46edff89f9e7d436c30a9699e0. All original templates/VBA and report-rendering source remain unchanged.

Existing Overall leftEL and Wind Load missing-input warnings are separate model-input requirements and are not bypassed. The existing localhost:8783 preview is updated without forcing a browser reload or modifying project storage.
