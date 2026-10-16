# E2.288 verification — 2026-10-16

Baseline: official main/release E2.287, `df956bb86c501afc7f1c4cfe0a346f2a220661c2`. Main, latest release and open PRs were checked before development and before publishing; no intervening changes were present.

## Change

Column Spacing X/Y now means minimum physical column centre-to-centre distance in metres, along the corresponding grid row/column. Physical offsets and individual section sizes are applied before enforcing the minimum. It is not a minimum clear face distance or a maximum span.

Blank directions retain the architectural/adopted independent grid. The old hidden automatic-placement spacing filter does not override blank values. Explicit manual column mode only stores the settings. Existing alignment checks remain separate.

Supplemental column axes remain available: divide each existing interval using `floor(interval/minimum)` subdivisions, retain original axes, then remove automatic column candidates which violate the physical centre minimum. Architectural axes are never changed. Added axes use the existing light-purple column-grid display and its visibility toggle in the app; report drawing code is unchanged.

Manual additions, explicit placements and selected transfer positions are protected. Conflicting protected centres reject the transaction through existing inline error feedback. Building/opening/exclusion data, deleted column records, manual dimensions and retained column IDs remain unchanged. Original automatic columns filtered by a minimum reappear when that setting is cleared; individually deleted columns remain deleted.

## Verification

- The targeted domain test passed: blank gridlines; independent X/Y limits; equality; actual centre offsets versus face/reference spacing; explicit-position rejection; supplemental axes; shared floors; other Framing isolation; manual mode; save/load; exclusions/deletions; original IDs and sizes.
- The headless Chrome test passed: real input changes and rendering, error feedback/model rollback, Undo, reopening saved settings, clearing, manual mode, visible supplemental axes and the existing hide/show toggle. No JavaScript page errors were observed. The E2.288 screenshot was inspected.
- 95 regression programs were attempted: 83 passed, ten reproduced existing assertion failures on pristine E2.287, and two could not run because their historical private fixtures were absent. All 12 non-passing logs matched pristine E2.287 after repository-path normalization. No failed test was treated as passing. Exact results are in `release288-results.json`.
- The ten inherited assertion failures are audit-performance247, check-sync226, compression-count269, equal-layers268, member-navigation248, rebar227, representative250, sb-advice220, summary-rc216 and column-deferred-boundary. The last is an additional older browser regression, not a new production change. column-centres159 and column-outline160 require unavailable historical fixtures.
- All 36 bundled modules match source and production/bundled JavaScript parses. Apart from `engine.js` and `app.js`, all 64 JavaScript modules are byte-identical to E2.287. The existing UI CSS, ExcelBridge binary/source, RC workbook and template manifest are byte-identical.
- The Windows desktop host compiled successfully at version 2.288.0.0 using DesktopOnly. ExcelBridge was not rebuilt. Native Excel/PDF generation was not rerun; report code/templates/formats remain unchanged, while model-dependent values can change with the requested column placement.
- The existing preview address remains `http://127.0.0.1:8783/`. Verify its served HTML hash/version and no-store header without forcing a browser reload.

## Reproduction

Use Node with linkedom and playwright, installed Chrome, PowerShell, Python 3 and Git history. From the repository root:

```text
node FramingStudio/source/tests/column-spacing258.cjs
node FramingStudio/source/tests/column-spacing258-ui.cjs
node FramingStudio/verification/release288-integration.cjs --static-only
node FramingStudio/verification/release288-integration.cjs
```

The complete regression runner intentionally exits nonzero for inherited failures and missing historical fixtures. The package contains the current Windows app and tracked source plus a SHA256 manifest; private local models, generated test artifacts and historical release folders are not overwritten.
