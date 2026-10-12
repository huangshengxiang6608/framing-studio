# E2.234 verification

Baseline E2.233: 875f6a4eae4c581d597a2a20a8f4f10c9416f67c. Official main, release and PR #8 were checked before editing and before publishing; no intervening changes (main 5d18359d7110709b14fcecf431e23b88509791f6, release v2.203).

Member Check interface changes:
- Per-layer text inputs live at their corresponding cross-section positions. Enter quantity and diameter as 18T40. Eight layers per face are editable; 0 denotes no bars. Changing T updates the same face's common diameter, preserving the existing single-diameter-per-face rule.
- Shear/torsion links are directly editable on the diagram as legsTdiameter@spacing. Existing allowed diameters and 100 mm minimum spacing are enforced.
- Original input fields remain hidden as the single save/validation backing store. Duplicate editor tables are no longer displayed. Existing save/check and AUTO workflows remain intact.
- Required reinforcement areas use the existing result cells K36 (compression) and K38 (tension), placed on the corresponding upper/lower faces with CB mapping reversed. Missing values show pending. After draft edits, retained old values are explicitly marked previous/pending; no new engineering formula is introduced.
- Typed drafts, including incomplete text, retain keyboard focus and caret. Invalid drafts cannot save stale backing values. AUTO resets draft errors and restores prior automatic fields.

Validation:
- Extended offline DOM suite passes direct diagram edits, character-by-character typing/caret retention, shared face diameter synchronization, sparse/eight-layer backing mappings, invalid quantity/diameter/link guards, hidden duplicate fields, existing save/selection/freshness behavior, exact required-area binding, stale labels and CB upper-tension mapping.
- E2.233 minimum-link-spacing regression passes all 36 beam cases and boundary/legacy checks.
- Standalone SVG geometry was rendered for layout inspection with drawn field-box substitutes (Sharp does not render interactive foreignObject controls). This is not a live-browser screenshot. Interactive behavior was tested through offline DOM with documented linkedom foreignObject shims.
- Desktop Windows build succeeds. Packaging checks bundled modules, ZIP integrity, and all unchanged application/report/template/native Excel/VBA files against baseline.

Delivery verifies same-port preview bytes/no-store headers, PR head and GitHub package digest without forced reload or browser storage changes.
