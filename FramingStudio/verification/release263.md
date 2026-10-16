# E2.263 — Column loads follow tributary ownership

Baseline: E2.262 / 6f44af5b4538721151e832eac5d350c849218e42. Official main b07f04a6ca4fe84940a8071f316aae85e3a688d0 (v2.256), PR 10 5e22aff382a7fe5ca74acc490c7b9df66e357076 and PR 11 checked before editing; no intervening updates.

## Behavior

Per the user's clarified column design method, an offset upper column contributes 100% to the lower column whose clipped tributary polygon contains the upper column's physical centre. Column-area accumulation no longer uses TB lever arms, beam support choices or end reactions. Continuous column stacks retain direct continuity. Shared edges/overlaps or absence of an owner remain unresolved; no arbitrary split or double assignment. Manual area schedules/overrides follow the same ownership chain once. Existing slab/beam load analysis is separate and unchanged.

Updated the Member Check column-area explanatory text and project instructions. No changes to A/B report wording, formulas, layouts, rendering routines, ExcelBridge or templates. Changed column inputs legitimately update values in their original fields.

## Validation

- `column-tributary263.cjs`: unique ownership without beams, continuous columns, multi-stage transfers, conservation, manual schedules, overrides including zero, ambiguity blocking (also with overrides), opening exclusion, polygon rather than bounding-box membership, order independence, scoped cache parity.
- Current saved model: C1's 25 source floors (4–28/F) each contribute 59.109375 m² at weight 1 to 3/F AC10; none to AC16. AC10 upper DL 14777.34375 / LL 4433.203125 kN; total DL 16853.75 / LL 5304.6875 kN. AC16 retains its own DL 1909.6875 / LL 954.84375 kN.
- Both selected columns pass the existing axial check. AC10 UI schedule, shared Check and original report input schedule agree.
- Current model, before/after: all 4074 non-column rows in Section A and all 4074 non-column rows in Section B are deeply identical, including complete loading, actions, results and errors.
- Native Microsoft Excel, original ExcelBridge/templates: AC10 A 16 comparisons and B 31 comparisons, zero differences, both successful. A J36 = 32082.75 kN; E38 = 40103.4375 kN (existing project factor). Native B result OKAY (AXIAL ONLY).
- `area-parity247.cjs`: all four scoped/unscoped/mutated-input scenarios passed. `section-a-acceptance262.cjs` passed. Existing full/incremental six-edit sequence and cancellation checks passed.
- The historical E2.246 fixed hashes in `audit-performance247.cjs` are already stale on the E2.262 baseline. Direct old/new complete SB and TB audit-output comparisons have zero differences; the unrelated historical hashes were not rewritten.
- Updated the old loading115 midpoint-transfer assertion: a shared boundary now requires confirmation instead of a 50/50 TB split. Remaining fixture assertions pass.
- Windows desktop build 2.263.0.0, source/bundle equality and protected-file byte equality checked by packaging script.

## Preview

Updated files are served at the existing localhost port 8783 with no-store responses. The user's current browser tab/model/storage are retained. A browser model-download attempt was denied; no alternate extraction or forced reload was performed. Tests used the last saved current-model snapshot; no new live edits were imported or overwritten.
