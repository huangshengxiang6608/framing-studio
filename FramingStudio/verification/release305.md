# E2.305 — Generate secondary beams at wall junctions and in closed concave bays

A beam ending on a wall face could be assigned to an overlapping primary beam centreline when building the bay graph. This left a false gap beside the wall. Bay closure now prefers a verified physical wall contact and uses the same wall reference station. Actual member geometry and span calculations retain their existing rules.

Closed L/U-shaped regions are now recognised in addition to the existing rectangular primary-beam bays. Secondary spans stop and split only at actual primary beams or walls. Internal grid lines used to describe the region are not supports and are not added to calculation panels. Open perimeters, genuine gaps, overlaps and Opening restrictions remain guarded. Ambiguous secondary-area settings receive a diagnostic.

Saved secondary layouts retain their region identity alongside the existing endpoint bindings and explicit deletion records. Widening/narrowing, freezing and save/reopen preserve manual deletions. The existing explicit layout-reset operation is unchanged.

Validation:

- Synthetic L/U regions, both orientations and X/Y/automatic directions; actual endpoint support and splitting at actual internal primaries. Open perimeters, real 10 mm gaps and Opening boundaries are rejected.
- Full geometry fixtures cover physical wall contacts, reversed wall endpoints, selected L-shaped areas, no virtual calculation bays, deletion, freezing, save/reopen and non-restoring regeneration.
- Current-model local validation restores four upper and three lower secondary beams, increasing the total from 51 to 58. All seven have actual beam/wall receivers at both ends. Deleting one in each region retains 56 after widening/narrowing and save/reopen.
- Actual isolated browser operations confirm both restored regions, deletion and reopening the saved project. The original browser model is unchanged: before/after exported model data are identical.
- Existing secondary-width tests (64 combinations), prior-project width/deletion cases, CB-tip, beam-network, column-following, beam-type, cantilever support, wall snapping/boundary, bay-following, geometry-consistency and wall-copy regressions pass.
- Existing loading/RC/reinforcement modules, Excel templates, VBA/bridge and original Section A/B rendering are byte-for-byte unchanged. Bundled HTML outside the geometry module and version label is preserved. This is a geometry-generation fix, not a change to engineering formulas or report formatting.

Based on E2.304 (`7af30ad`), retaining E2.302–E2.304 and the previously integrated PR #23 interface changes. Private project files, coordinates, screenshots and model-specific test data remain local and are excluded from the public repository and package. The existing localhost preview is updated without forcing the user's tab to reload.
