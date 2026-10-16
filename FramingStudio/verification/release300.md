# E2.300 - Recognize moved primary bays without replacing customized secondary beams

After anchored columns and their primary beams move, saved SB bay coordinates can differ even though the same boundary members still enclose the bay. The old coordinate-overlap check treated that movement as a changed layout and raised the customized-input guard. Match the ordered four boundary member sets with complete edge coverage and a unique old/new correspondence, then verify the existing SBs still lie in the bay and meet its boundary supports. Update only derived bay metadata; do not regenerate, redistribute, renumber or resize those SBs.

Retain boundary identities when a layout is subsequently frozen or a member edited, so repeated resizing can recognize the same bay without depending on the original coordinates. Existing reference-line junction normalization is used to recover historical tags where a CB root was already updated. Missing boundaries, ambiguous matches, genuine subdivisions and disconnected SB ends remain guarded.

Based on E2.299 b329fcad435d62730e3f5e99a06e53dd9b47024d; includes pending PRs #18/#19 and official E2.297. PR #14 remains separate.

Validation:

- `secondary-bay-follow300.cjs`: both orientations, segmented wall boundaries, cached identities, ambiguous candidates, missing sides, disconnected SBs and genuine subdivision.
- Current model F02: 14 bays, all 50 saved SBs at 250 x 550 mm, all 83 beams retained. Generation does not mutate saved project inputs; freeze/reload preserves beam identities, coordinates, widths, depths and explorer/member inputs.
- Repeated freeze then resize of the current model through 750, 1500 and 1000 mm: all 50 SBs and 83 beams remain, without the stale bay warning.
- Complete generated model compared against E2.299: identical after excluding only bay metadata and the resolved stale-bay warnings. No geometry, member result or other warning differences.
- `bay-record246.cjs` passes, including genuine added primary boundaries and customized-input protection; E2.299 MB and E2.298 CB portable follow regressions pass.
- Browser E2.300 loaded the current saved model: the SB bay warning is absent; MB_1/MB_2 boundary-width warnings remain visible. Saved JSON is identical to the pre-test project.
- Desktop host compiled; existing port 8783 serves E2.300 with no-store caching. Loading/RC/selection, ExcelBridge, native workbook/VBA templates and all A/B report code remain byte-identical to E2.299.

Limits: ambiguous or genuinely changed bays still require review. This update does not resolve the separate manual-width boundary conflict, change calculation or selection rules, or certify structural adequacy. Native Excel/PDF generation was not rerun because report code, formulas and formatting are untouched. Private models and screenshots are excluded from the repository and release package.
