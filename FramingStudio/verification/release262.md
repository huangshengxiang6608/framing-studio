# E2.262 — Section A eligibility uses the current shared Check

Baseline: E2.261, commit 6832e75e27ae77c0b0a092e6b2c302dda26b5cd8. Official main b07f04a, official release v2.256, PR #10 head 5e22aff and PR #11 head 6832e75 were checked before editing and before publication. No intervening changes were found.

## Change

Section A previously applied the report gate to its separately calculated A-load design, even when Summary/Member Check had already accepted the same beam. Beam eligibility now uses the current shared B-check row, matched by floor and member token. Fresh completed results are reused; absent, stale or incomplete cached results are recomputed through the existing B-check calculation. RC AND (Span/Depth OR Actual Deflection) remains required. Failed or incomplete checks are not waived.

Section A still computes and reports its original A loads, sizing formulas and actual statuses. Its calculation rows are not replaced by B-check values. Failed A automatic reinforcement is not adopted into Excel as a successful steel selection. Section B planning and calculations are unchanged, as are slab selection rules, workbook templates, ExcelBridge, native VBA and all report rendering modules.

## Verification

- New `section-a-acceptance262.cjs` reproduces A automatic selection failure with B Check passing; verifies A eligibility, original A loads/input cells, no failed reinforcement adoption, no project mutation, fresh B reuse, stale/missing cache recalculation and rejection of actual Check failures.
- Existing `report-adoption254.cjs`, `beam-acceptance261.cjs` and `slab-failure256.cjs` passed, covering cache invalidation, original formula values, serviceability OR logic, genuine RC failures and retained slab failure handling.
- The user's saved current model reproduces the four E2.261 exclusions (SB19 at 1/F, 2/F and 4/F, plus SB56 at 3/F). E2.262 includes all ten selected RC members, including TB26. The complete selected A calculation rows, selected B calculation rows, B report plan and shared Check decisions are JSON-identical before/after. The model remains private and is not committed.
- Native Microsoft Excel generated the ten-member A job: 1,598 App/Excel comparisons, zero differences. A-load SB19 selection failure remains truthful internally and is not adopted as valid steel. A sizing NOT OK results are retained where applicable.
- A separate native run with the exact previous successful six-member job passed 1,290 comparisons. Compared against the previous output: both report sheets' 387 populated formula/value cells, styles, row heights, column widths, merged cells, print settings and page breaks match. Seven native PDFs (ten pages) have identical text, page boxes and rendered pixels. Only native generation timestamps were normalized. Workbook inspection was read-only; no resaving or format restoration was performed.
- All 437 unrelated tracked app files are byte-identical to E2.261. Bundled content changes only the RC planner and version labels. Windows host rebuilt as 2.262.0.0.
- Existing 8783 preview updated to E2.262, preserving browser storage and the current model. Browser title and restored selected-beam values were verified. User resumed interactive testing; no further browser edits were made.

## Remaining unrelated issues

This change addresses RC Section A eligibility. Existing missing Overall/Deflection inputs still prevent those separate sections. The previously observed Section B CB_3 load-results mismatch is outside this change and has not been waived or fixed. This update does not claim that all project reports pass.
