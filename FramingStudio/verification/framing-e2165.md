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
