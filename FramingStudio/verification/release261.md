# E2.261 — Beam selection and report acceptance

Baseline: E2.260 acb4d258368fc7c04de17ae8871eea7aa751e5a1, retaining the E2.257 column-position and E2.258–E2.260 column-spacing work. Official main b07f04a, latest official release v2.256, PR #10 head 5e22aff and PR #11 head acb4d25 were checked before editing and again before publication. No intervening remote changes were found.

## Behavior

The application beam solver now selects reinforcement against the existing RC checks, without adding steel solely to satisfy Excel L/d N87. Summary status, Member Check floor badges and beam report eligibility use RC AND (Span/Depth OR Actual Deflection). Genuine RC selection failure, missing input and failure of both serviceability alternatives remain blocked. FRR width rejection and all slab/cantilever-slab selection rules remain intact.

Excel N87 is still calculated and displayed by its original formula and may truthfully read NOT OKAY. No status cell or formula is overwritten to make it pass. Fresh checked results continue to be adopted into editable Excel input/steel cells by the existing E2.254 flow. Section A retains its existing load convention; Section B can reuse the fresh shared B-check snapshot. Direct legacy solver calls without the new application acceptance option retain legacy selection behavior.

Automatically selected reinforcement and consequent calculated numbers may change because N87 no longer drives additional reinforcement. Given identical input and steel, all formula values remain identical. Candidate diameters, maximum layers, geometric fit, RC formulas and report presentation were not changed.

## Validation

- `beam-acceptance261.cjs`: MB/SB/TB/CB with N87 NOT OKAY and valid RC; identical formula values for identical steel; passing/failing A and B report gates; all 27 P/F/unknown overall-status combinations; seven RC failure checks; missing data, real inadequate manual steel and failed-selection rejection; full/incremental audit parity through repeated load changes.
- `beam-acceptance261-ui.cjs`: isolated real Chrome session imports a fixture, runs the actual full-audit button and checks the Member floor badge and selected-member A/B plans. RC pass + Span/Depth fail + actual-deflection pass is accepted; both serviceability failures are rejected. N87 stays NOT OKAY. No page errors. User browser storage and project were not touched.
- Existing `report-adoption254`, `summary-sections205`, `slab-selection255`, `slab-failure256`, `floor-status251` and `beam-filters214` tests passed, including freshness invalidation, reuse parity, strict unrounded L/250 boundary, retained slab formulas and failure behavior. The optional linkedom-based `audit-ui247` runner could not start because linkedom is absent; actual-browser audit-button coverage above passed.
- Four automatic-selection native Microsoft Excel jobs (MB/SB/TB/CB): 254 App/Excel comparisons each, zero differences, N87 formula and NOT OKAY value retained.
- Ten additional native runs compare E2.260 and E2.261 using the same explicit steel: SB A and B, MB B, TB B and CB B. Each run has its own empty cache. Eight B runs each perform 256 comparisons; the two A runs each perform 259, with zero differences.
- Report equivalence checks compare both report sheets' formulas/values, cell styles, number formats, row/column dimensions, merged cells, print areas/titles, margins, headers/footers and page breaks. PDF page count, text, boxes and rendered pixels are also compared. The four new automatic B outputs are additionally compared with the old same-steel manual outputs. Only native generation timestamps are normalized. Workbooks are inspected read-only, never resaved by the comparison tools.
- Original workbook templates, ExcelBridge executable/source, native VBA/report routines and other report modules are byte-identical to E2.260. All 36 marked bundled modules and the unmarked RC planner match their source; unrelated bundled content is unchanged except version labels.
- Windows host rebuilt as 2.261.0.0. Package contents and SHA-256 verified. Preview deployment uses the existing 8783 address, preserves project/browser storage, does not reload the user's page and verifies HTTP 200 with no-store and exact served bytes.

These checks validate implementation equivalence on regression fixtures. They do not certify every user model or imply that N87 has passed. Existing project inputs and saved manual reinforcement are retained; refresh the app and recalculate checks before generating new reports.
