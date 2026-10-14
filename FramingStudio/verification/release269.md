# E2.269 — Compression bar counts and Member Check steel ratios

Baseline E2.268 / c8684748a69c51fd8e51a59e9f0fe92eee157abb. Official main b07f04a6ca4fe84940a8071f316aae85e3a688d0, latest official release v2.256, PR 10 and PR 11 were checked before editing and again before publication. No intervening remote change was found.

Automatic MB/SB/TB/CB compression reinforcement now uses the tension face's first-layer bar count on every occupied compression layer, even when compression area demand is small or zero. Each face retains its selected diameter and the number of layers needed for its area. The existing equal-layer tension policy, maximum eight layers, clear-spacing/section-fit checks, original per-face area limit and link requirements remain enforced. Manual reinforcement stays independent on both faces and each layer.

Member Check displays Steel ratio below the provided area for each face: 100 times the total provided area of all its layers divided by the gross beam section B times D. Ratios use unrounded bar areas and display three decimal places; they update with manual draft edits and show pending when inputs are invalid or unavailable. Cantilever physical-face reversal is retained. This is an interface addition; no report text or fields were added.

Validation:

- 108 automatic cases across MB/SB/TB/CB and multiple section sizes/moments: 92 successful, 16 explicitly failed. All successful occupied layers on both faces match the tension first-layer count and remain within the original 4% area limit. Twelve cases increase compression count. Identical manual inputs produce identical complete calculation results to E2.268.
- equal-layers268, link-policy267 (36 automatic and 72 manual cases), rebar-live237, rebar227 and section-a-acceptance262 tests pass. DOM tests additionally verify live ratio updates and clearing invalid values. Headless rendering confirms no overlaps between area, ratio and status labels.
- The eight previously eligible selected members in the saved current-model fixture remain eligible. Compression changes include 1/F MB9 and 2/F MB9 from 4T25 to 15T25, 2/F CB_3 from 7T25 to 15T25, and 4/F MB9 from 6T20 to 15T20. Tension arrangements are retained. Previously failed 1/F and 2/F SB19 remain subject to their original area limits and are not forced into the verified export.
- A fresh native Excel combined A/B run completes 2,032 App/Excel comparisons with zero differences. Load/input tables are identical to the E2.268 verification fixture. Eight independent member design sheets preserve formula coordinates and private inputs; 960 input/result cells verified.
- 17,953 original workbook formulas remain identical. A/B report fonts, fills, borders, alignments, number formats, row heights, column widths, merged cells, print settings and page breaks match the same-member baseline. Twenty-three PDF pages retain page counts and paper dimensions. Updated MB and CB B-copy pages were visually inspected. Native Excel L/d text remains as calculated, including NOT OKAY where applicable; it was not overwritten to force agreement with the separate App acceptance route.
- The report templates, extracted calculation equations, ExcelBridge source/binary, VBA and native report renderers are unchanged. The desktop build changes only version metadata apart from the updated embedded web app/source. The package retains corresponding source and tests.

The first isolated Excel verification instance exited with the previously observed RPC interruption during startup. A fresh isolated retry completed successfully; this change does not claim to repair that intermittent Excel startup issue. Original workbook standalone VBA auto-design buttons are unchanged; App exports adopt the checked member inputs.

The existing preview at port 8783 is reused. Browser storage and project files are not modified, and no page reload is forced.
