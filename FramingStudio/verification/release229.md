# E2.229 — Recommendation treatment status and ordering

Baseline: E2.228, commit 1fa96d50bd1362a91894ae9eaed1497ac8f41ccf.

Summary Check now separates recommendation application from calculation freshness.
Unapplied recommendations remain first; applied SB/TB/column recommendations move
to the end of the filtered list and show “已套用建議 · 待複查”. Previous RC and
deflection results retain their colours and values with an explicit “上次” label.
Applying a suggestion returns the inner list to its start, preserves sidebar scroll
and filters, and does not run a check. Undo restores application state and order.
Unrecognized project changes invalidate the old advice and application badges.

SB advice explicitly states that its search criterion is RC, with deflection and
span/depth checked separately. No sizing, RC, shear-link, load or deflection
calculation changed. The earlier shear-link review remains on hold.

## Validation

- treatment229.cjs: real mixed SB/TB audit and DOM; pending TB remains red and first
  after SB application; previous deflection remains visible; sequential actions,
  duplicate guards, filters, manual-edit invalidation and undo.
- batch228.cjs: sequential TB/SB apply without a check, sorting/scroll, explicit
  incremental check and undo.
- sb-advice220.cjs and tb-apply222.cjs: sizing and atomic application regressions.
- check-sync226.cjs, rebar227.cjs, beam-filters214.cjs: shared check/report data,
  reinforcement editor, independent result filters and calculation guards.
- DesktopOnly compiler; exact module-to-bundle comparison; ZIP byte validation.
- Byte preservation check of unchanged tracked app files, including all report,
  workbook and Excel/VBA assets; unchanged embedded report functions.
- Local browser automation remains unavailable under its URL policy. DOM checks
  run offline; HTTP verification checks the served version and no-store headers.

## Dimension investigation

Read-only trials used the previously supplied 新项目.framing (68).json, with all
F03 SB sizes varied on cloned inputs and beam loads recalculated. This is not a
claim about unsaved browser input. F03 has 82 SBs in that file.

| SB51 B × D | RC | Short-term deflection | L/250 |
| --- | --- | --- | --- |
| 250 × 650 mm | OK | 63.2481944627 mm | 49 mm: fails |
| 400 × 750 mm | OK | 28.3932809940 mm | 49 mm: passes |

At 250 × 650 all 82 SB RC checks passed, while 32 failed short-term deflection.
At 400 × 750 all 82 RC and short-term deflection checks passed. This establishes
why an RC-only recommendation can be smaller; it does not establish that 400 × 750
is the minimum acceptable size. The original project file was not edited.
