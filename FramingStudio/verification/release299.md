# E2.299 - Synchronize primary beam ends before boundary validation

Column resizing could leave an entire primary-beam chain at its previous position when one manually widened segment crossed the floor boundary. Resolve connected primary ends together, including perpendicular receiving spans without their own column anchor. Retain synchronized geometry and manual widths when the footprint crosses the building boundary or an opening, and list the affected members for review. Invalid, reversed, disconnected and overlapping moves remain guarded; explicitly fixed positions stay fixed.

Automatic beam width now resolves the stored column identity before reading its section, so shrinking a column beyond its historical beam-end coordinate does not silently fall back to the generic beam width. The existing minimum-support-width rule is unchanged. Logical load references and member identities are retained.

Based on E2.298 / PR #18, which includes official E2.297 main f3fa1956683a88b1556866d025eeaf42d7fbab72. This PR includes the pending E2.298 fix as well. PR #14 remains separate.

Validation:

- `mb-column-follow299.cjs`: 8 combinations of orientation, endpoint order and record source; boundary-conflicting chains and adjacent main/SB ends remain synchronized; manual widths, fixed positions, references and repeat stability are checked.
- Current model F02: all columns resized through 1000, 750, 500, 1500, 2000 and back to 1000 mm. The four right-edge MB records stay joined at the actual end-column centres, all 83 beams and CB_3 remain, manual middle widths stay 1500 mm, and saved models reload identically. Boundary warnings identify the actual displayed members.
- Browser E2.299: batch 500 mm and 2000 mm column edits, saved outputs independently checked against the engine; original saved model restored with complete JSON equality. At original dimensions the previous 5.8 m2 strip warning is replaced by explicit boundary warnings for MB_1/MB_2. The customized secondary-bay guard remains.
- Existing beam-network, CB-column-follow, column-anchor, beam-type, support-cantilever and unified-member regressions pass. The old beam-network test export hook was updated to the current module export prefix.
- Windows desktop host compiled. Preview at port 8783 serves the new bundle with no-store caching.
- Loading/RC calculation and selection modules, ExcelBridge, workbook/VBA templates and A/B report/rendering sources are byte-identical to E2.298. Only geometry, version metadata, desktop host and tests/documentation changed.

Limits: retained boundary conflicts still require a geometry decision; they are not a passed structural check. Individual resizing can produce unequal column centre lines or other existing support warnings; this change does not introduce diagonal members, alter support classification or bypass overlap checks. Geometry-dependent numerical results may change with the corrected member locations. Native Excel/PDF generation was not rerun; neither formulas nor report rendering was modified. Private model files and screenshots are excluded from the repository and Windows package.
