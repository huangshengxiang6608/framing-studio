# E2.265 — Independent Section B member design sheets

Baseline E2.264 / 4620ae19a93f99abf88e16219b693d3b19b224f2. Official main b07f04a6ca4fe84940a8071f316aae85e3a688d0, release v2.256, PR 10 head 5e22aff382a7fe5ca74acc490c7b9df66e357076 and PR 11 were checked before editing. No intervening changes.

## Behavior

When generating Section B or combined A/B workbooks, retain each selected member's original design sheet immediately after the corresponding shared design sheet. Includes slab, cantilever slab, SB, MB, CB, TB and column. Names contain the physical floor and member ID; Excel-invalid characters are removed, names are limited to 31 characters, and collisions get a unique suffix. A-only generation does not add B member sheets.

The user chose read-only independent calculation sheets with formulas, not independent UPDATE/auto-selection controls. Each copy keeps its calculation formulas, layout, dimensions, drawings, print settings and original values. External sheet inputs are private, protected, hidden value captures. Cross-sheet formula references point to those captures. Copied macro controls are disconnected and labelled Read-only design copy. Regenerate from the App to refresh them.

Native beam geometry UDFs and column status resolve the calling worksheet only when it has the explicit local `_RCDesign265` marker. Unmarked original sheets and macro calls retain their original source. CB full-load existence uses the captured load range for marked copies. No calculation algorithm changes. Only six VBA modules and their compiled cache change inside the template; every other ZIP entry, including all original worksheet formulas, styles, objects and print settings, is byte-identical. Updated module sources are retained in source/RC265. Source template SHA-256: 1077faf2e48ab62f5fd1f12d0841db68b4ef0e46edff89f9e7d436c30a9699e0.

## Verification

- Saved current-model example: 1F SB19, 2F SB19, 3F SB56 and 3F TB26. Native original Excel comparison: 1016 checks, zero differences, both baseline and updated output. Final output includes four named calculation sheets in the requested positions.
- Before/after: all 20422 populated original formula/value cells agree, excluding only native audit timestamps. Original A/B merged cells, row heights, column widths, semantic formatting, print settings and page breaks agree. All 13 original PDF pages have identical text and page boxes. Excel renumbers shared style IDs when copying sheets; resolved formatting is compared instead of the internal IDs.
- Read-only reopen of final output, followed by shared Input/selection/reinforcement edits and CalculateFullRebuild: all 83555 cells across the four captured design UsedRanges remain unchanged. Test changes were never saved to the delivered workbook.
- Native additional fixtures: MB 254, CB 254, slab 90, cantilever slab 41, column 31 comparisons, zero differences. Formula data and every captured UsedRange cell are also verified at capture and immediately before saving.
- Native design PDFs visually reviewed: three pages each for SB19 and TB26, including design equations, reinforcement arrangements and existing L/d results. Original print settings retained. Copied cells are protected but formulas remain selectable/readable.
- `member-design265.cjs`: same member ID on different floors retains distinct names; A/B/combined calculation and report inputs deeply equal E2.264 after removing only new sheet-name metadata. `section-a-acceptance262.cjs` passes.
- `member-design265.py`: checks sheet order, protection, formula-coordinate preservation, private source references and job input/result/steel equality in saved output.
- Existing automatic-selection failures remain blocked. N87 remains governed by the existing acceptance policy; no forced OKAY values or report formula edits.

## Delivery

Original A/B report rendering routines and report content are unchanged. Windows E2.265, current source and template are packaged. Existing port 8783 preview is reused without forcing reload or replacing project/browser storage. Example output is a byte copy of native Excel output (SHA-256 683766f83569bcd77abac9bb9a9c6fd47101d9b6cdba662b06f988f773665c37).
