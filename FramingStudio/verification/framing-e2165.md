# E2.165 validation

This PR combines the E2.144–E2.165 RC updates with the existing Transfer Truss
implementation on main. The desktop host and Excel bridge executables and native
sources are byte-identical to main; no EXE was rebuilt.

## Beam connection regression

Run from the repository root:

```powershell
node FramingStudio/source/tests/beam-network165.cjs
```

This portable test covers column-to-transfer-beam main spans, connected main
chains, secondary endpoints, opening-side wall-face connections, stable member
IDs and load reference lines, repeat generation, boundary and overlap rejection,
rejected target propagation, disconnected receiving beams, manual beams and
conflicting column offsets.

A private F03 project copy was also replayed locally: MB26-1/2/3 align at
X = 24.25 m; SB28–SB34 end at X = 20.25 m and retain the wall face at X = 16 m.
All 108 beam IDs remain present, with no new model warnings or missing-load-input
results. The private project and browser screenshots are not included in Git.
The existing beam-centres164 browser replay also passed (column resize, larger
position changes, reload, invalid placement and preserved load inputs).

## Other checks passed

- Column parameter, beam parameter and slab thickness table browser regressions.
- Column 4% limit, 2.5% target size advice, deferred Check and boundary handling.
- Loading legend editing, rotated labels, column footprint loading and 3D controls.
- Wall tributary/load conservation, same-bay slab direction and duplicate-beam replay.
- `verification/truss-core-tests.cjs`: 11 groups.
- `verification/integration143.cjs`: 55 existing load assertions and 12 integration groups.
- `verification/downstream143.cjs`: 11 downstream reaction/provenance groups.
- All 30 marked bundled source modules match their source files; all 38 script blocks parse.

Several historical browser replay tests require Playwright, Chrome and private
baseline/project files under `tmp/`; they are local reproductions rather than
self-contained CI tests. The new beam-network165 test has no such requirement.

## Report preservation

The v109 workbook differs from main only in five previously authorized column
reinforcement-limit cells: C30, C40, L16, L17 and L18 on sheet18. After excluding
those cells, the worksheet XML is identical. All other ZIP entries, VBA, layout,
row heights and print settings are unchanged. The E2.165 connection fix itself
does not change report rendering or the workbook.

These regressions verify program behavior; a project still needs an explicit
full-building Check after geometry changes. Existing engineering failures are
not converted to passing results by this update.

## E2.166 follow-up

`source/tests/column-resize166.cjs` passes for manual and automatic columns,
shared floors, legacy enlarged centres, grow/shrink after reload, B-only resizing,
explicit positioning, custom offsets and atomic rejection. Column parameter
table, deferred Check/boundary, beam-centres164 and beam-network165 regressions
also pass. E2.166 changes no report, workbook or native executable files.

## E2.167 follow-up

`source/tests/member-labels167.cjs` passes in both the local preview and the
Transfer Truss integration. It checks seven independent view switches, display
marks, millimetre sizes, mark-above-size ordering, vertical-member rotation,
visibility filtering and an unchanged project after toggling. The rendered
column/beam labels were visually inspected. Report renderers, workbook templates,
calculation modules and native binaries are unchanged from E2.166.

## E2.168 follow-up

Dormant automatic snapshots outside the current model or conflicting with current
beams no longer emit MODEL warnings. dormant-beams168 passes in both versions:
physical members and saved records are unchanged; manual geometry errors and
existing member Check failures remain visible. beam-network165 also passes.
Report, workbook, loading/strength calculation and native binary files are unchanged.

## E2.169 follow-up

The browser regression audit-filters169 reproduces a stale MODEL filter hiding
119 current rows before the fix, then passes in both versions after the fix.
Removed options reset to all; valid filters, empty intersections, new statuses and
empty results remain consistent. The resulting table was visually inspected.
The real column-deferred-boundary regression also passes. Report/calculation/
geometry modules, workbook templates and native binaries are unchanged.
