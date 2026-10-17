# E2.303 - Preserve cantilever tips when connecting an MB

Adding an inset edge MB previously pulled the receiving CB free end back to the MB centreline. The drawing shortened the CB while its saved reference span stayed unchanged. The beam-network geometry pass now uses the existing CB root resolver to retain the free-end station. The MB connects to the CB; column/root following, manual widths, explicit fixed positions and the existing overlap/Opening guards remain in effect. Manual root selections and unresolved conflicts still use the existing resolver.

Validation:
- `cb-tip303.cjs`: 24 combinations covering both orientations, reversed CB endpoints, column/wall/manual roots and saved snapshots; unchanged CB tips, MB support paths, widths, span/geometry preservation and save/reopen; actual overlap and Opening rejection.
- The current project was tested locally with three connecting-MB widths. Existing CB tips were unchanged, physical lengths matched calculation spans and MB/CB support paths remained connected. Private project data and screenshots are excluded from the repository/package.
- Actual browser drawing on an isolated project copy, undo and reverse-direction drawing were exercised, then exported and checked through the geometry/span regression. The original tab and project inputs were preserved. The reverse-direction new-beam fixture excludes the removed beam's direction-specific support overrides; existing user overrides remain respected.
- Beam-network, CB-column-follow, beam-type/force-transfer, cantilever-support, wall-beam-junction, wall-beam-snap, wall-boundary, secondary-bay and geometry-consistency regressions pass. The beam-type test's old endpoint expectation was corrected: a section joint lies at the inset MB centreline inside the retained CB tip. Its existing force-transfer and reaction-conservation checks still pass; the loading formulas were not edited.
- Imported PR #23 (`187af0c`) preserves the independent fix for outer UI enlargement on Section A/B pages. Browser checks confirmed unchanged header, navigation, toolbar and scale-control dimensions when switching to both report pages; no browser errors were recorded.
- Calculation/selection modules, Excel templates, VBA, ExcelBridge and report routines remain byte-identical. The new geometry change leaves bundled HTML outside the engine module and version metadata unchanged relative to the integrated baseline. The Windows host was rebuilt with version metadata only.

Geometry-dependent outputs may change when the corrected model is recalculated. No calculation formula, reinforcement-selection rule or A/B report format was changed. Native Excel report generation was not rerun for this geometry-only update.

This branch retains the E2.301 drawing/snap fixes from PR #21, E2.302 wall-boundary fixes and PR #23's UI-only correction. It updates PR #22; official main remains unchanged until merge.
