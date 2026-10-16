# E2.296 verification

Baseline: official E2.293 / 471c66f5c037fe014054ee46ddbdfabb35f85849; include PR #16 E2.295 / 8b82a779947b92b7a34ff4fa89a264d0adb109d4 without altering its column-result UI and explicit representative-restore changes. PR #14 remains separate.

## Scope

Explicit type application persists independently of automatic CB/TB classification. Untouched beams retain automatic classification. Perpendicular beam-end section contact is separate from strict generic point/column contact. Support choices, summaries, geometry checks and reaction transfer share the same resolved station. No node/connection moment-capacity validation is claimed. Missing, ambiguous and cyclic support graphs remain unresolved. An explicit type still receives detected upper-column loads.

## Passed

- `beam-type294.cjs`: four groups covering manual/snapshot beams, shared floors, reload/freeze, type changes, retained load identity, X/Y and reversed endpoints, physical end contact, dead/live reaction conservation, manual support parity, no positive-gap or parallel snapping, receiver extent, ambiguity and cycles; unverified type override blocks Check; upper-column loads retained.
- `beam-type294-ui.cjs`: real card apply, size-only edit, invalid dimension draft, reset dimensions, one-step Undo, Save Project/reopen, support labels and no page errors.
- Existing `unified-members175.cjs`, `support-cantilever173.cjs`, `auto-transfer.cjs` (34 assertions), `drawing-support197.cjs`, `slab-transfer177.cjs`, `geometry-consistency-local.cjs`, and `verification/ui173.cjs` passed.
- The screenshot's X=40 / Y=9.75 to 0 geometry was reconstructed only in a private in-memory copy. It now retains MB with CB_2 and CB_1 support labels. Private project data is not included in the release.
- `representative-restore295.cjs`: PR #16 representative restoration passed.
- `report-scroll296-ui.cjs`: real 16-page PDF; continuous mouse-wheel scrolling during 60 ms background progress, canvas identity/height, wrapped status visual anchor, disclosure choice, stale print blocking, A/B switching, new PDF replacement and navigation; zero page errors. Original viewer reproduces the scroll reset.
- Windows desktop build, source/bundle matching, syntax and preservation checks. Native host is version-only; ExcelBridge is unchanged.

## Preservation and limits

All Section A/B report-content generation sources, native rendering code, formulas, workbook/VBA templates, print and pagination code remain byte-identical. Drawing changes only add two informational rows in the member context card; plan/3D/report diagrams are unchanged. PR #16's explorer UI and verification file are retained.

The old `member-depth204-ui.cjs` test times out because its member popup is not visible after applying the first MB dimension. This reproduces on unmodified E2.293. The new focused browser test reopens the card and verifies the actual apply/invalid/reset/undo/save workflows. No native Excel report generation or full historical suite was run. The viewer regression uses a synthetic PDF with the shipped PDF.js renderer. The preview-only refresh fix is included: same-document progress changes retain the PDF container/canvases, disclosure state and reading position; a new PDF replaces the old viewer. Report markup, CSS, PDF page painting and native report generation are unchanged.
