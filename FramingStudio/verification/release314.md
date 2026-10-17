# E2.314 — Physical column sections at no-column boundaries

Columns whose reference point lay on a no-column boundary previously extended into the zone. Placement now checks the actual rectangular section, allows touching without positive overlap, and tries outward half-section offsets for automatic columns. Manually drawing at an edge preserves the selected reference point and tries an upward/outward placement. If none fits the zone, building, walls and other columns, the add is rejected.

Existing manual or frozen columns remain present with an explicit section-conflict issue. Explicit position changes, same-Framing move/copy and adjacent-floor copies use the same section test. Manual deletion records remain intact. No-column zone edits bind existing primary-beam column connections before regeneration. Manual drawing at an upper/lower reference-column point can now add a current-floor column; it does not edit the reference column.

Validation:
- New no-column-section314 regression: automatic upper-edge contact, retained grid reference, impossible placement suppression, manual add at the boundary, rejected inward offset with rollback, retained existing/frozen conflicts, section-based move rejection, deletion/save/reopen, and synchronized connected MB centre with manual width retained.
- Existing no-column-grid313, column-controls311, column-position257, column-transform308, column-spacing258, mb-column-follow299 cb-column-follow298 and copy-column196 suites passed.
- Current user model, F02 / 1/F: painted the grid cell X=5–47 m, Y=5–12 m. Automatic AC6 moved to physical centre (5, 4.5) m with a 1000 x 1000 mm section, touching the zone at Y=5 m without overlap.
- Actual original-browser-tab operation: deleted AC6, manually clicked the same (5, 5) m reference point despite the lower-column marker, and added C1 at (5, 4.5) m with the Up position. Down was rejected with a visible conflict message and the original centre retained. Saved test model has no unreported no-column overlaps. Other Framing input records remain unchanged.
- Undid all test edits and compared exported model 159 against pre-test backup 155: exact JSON equality. Original preview tab at port 8783 retained; no new browser tab. Model has eight Framing types; all section conflicts were audited.
- Legacy standalone column-reference-selection browser test could not start because its Playwright dependency is absent; reference-point manual drawing was verified through actual operations in the original Codex browser tab instead.
- Desktop launcher compiled successfully. Package/embedded-source consistency and preservation checks cover all unchanged preexisting app files. Native Excel/VBA code, workbook templates, calculation modules, and Section A/B report content and formatting are unchanged. Geometry changes can change resulting analysis values; no calculation equation was changed.

Baseline: PR #22 E2.313, 7bf7651. Official main f9ac54a, release v2.300, and PR #21/#23 heads were unchanged at the pre-publication check. Earlier PR #22 changes remain included. This is a PR preview release, not an upstream main merge.
