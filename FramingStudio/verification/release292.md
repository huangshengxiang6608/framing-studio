# E2.292 — Copy selected walls to the upper floor

Baseline: E2.291 commit `d27d7b379ae7773e42d83d7b061cc4d29898fc92`, retaining official E2.290 and the pending axis-insertion update in upstream PR #14.

## Operation and scope

In **牆**, single-click walls, drag a selection box, or select all current-floor walls. Click **複製至上層** in the selection panel. The current view stays on the source floor. The upper floor's Framing receives the walls; every floor sharing that destination Framing uses the same wall data, matching the existing column workflow.

- Retain physical endpoints, thickness and face alignment. Resolve source axes into physical coordinates so unrelated destination axis names cannot move the copied wall.
- When an automatic source face would shift differently beside the destination Opening, store the equivalent explicit face to keep its physical location.
- Skip identical destination walls and same-Framing operations. These no-ops do not add an Undo entry. Allocate a unique ID when a different destination wall already uses the source ID.
- Reject selected references/stale walls, top-floor requests, out-of-bounds target lines, overlap with existing columns and overlap with parallel walls. If one wall in a batch fails, no wall from that batch is applied.
- Allow perpendicular wall joins, consistent with the existing wall model. Keep the existing convention for walls centered on an outer architectural axis.
- Freeze existing destination automatic beam geometry before the first new wall, retaining the target column mode and existing beam arrangement.
- Commit pending wall-name, individual-thickness and default-thickness fields before copying on the first click. Rejected inputs block copying. Retain one-step batch Undo, local backup and project save/reopen.

## Validation

`node FramingStudio/verification/release292-integration.cjs`: all **18** model/browser/regression suites passed.

Coverage includes the new wall-copy model/live-preview UI tests, original single/batch column copying, E2.291 axis insertion, column spacing/deletion, beam snapping, member-list removal, representative selection, report slab preflight, native-check request/UI, Summary App checks and local reinforcement.

Preservation checks:

- 36 marked modules match their sources; the appended wall helper matches the shipped bundle; all 40 inline scripts parse.
- The original column/floor helper code remains intact, with wall-copy functions appended separately.
- 64 other JavaScript modules, all 12 native Excel files and ExcelBridge source are byte-identical to E2.291.
- Unrelated HTML/report/print content and CSS remain preserved. Original slab/CB fixtures produce identical geometry, Section A/B load rows and report HTML.
- Existing user/browser storage is untouched by the isolated browser tests. Reuse the preview at `http://127.0.0.1:8783/` without forcing a user-tab reload.

Windows host rebuilt as **2.292.0.0** with source changes limited to version stamps. Native desktop runtime was not reverified in this update: the prior isolated E2.291 launch timed out without a result. Browser functionality and Windows compilation/version are verified; no native Excel calculation run is claimed. Native Excel/VBA and report templates remain unchanged.

The archived E2.119 boundary-load test discrepancy remains documented in the preceding release's independent baseline diagnostic. Calculation rules and historical tests were preserved.
