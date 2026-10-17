# PR #14 integration verification

This integration resolves the existing PR's conflicts with current official main and the cumulative pending PR chain, without replacing either history.

## Included history

- Retained PR #14: `0969a812fc1f4b1cd3420208be07812e1b2ca7ac` (E2.291 axis insertion and E2.292 wall copying).
- Official main: `f3fa1956683a88b1556866d025eeaf42d7fbab72` (E2.297; includes PRs #15, #16 and #17).
- PR #18: `3c194dd83cf232b4732ead788fb6cbeb85741cc4` (E2.298 CB roots follow resized columns).
- PR #19: `b329fcad435d62730e3f5e99a06e53dd9b47024d` (E2.299 MB network follows columns).
- PR #20: `e648a738c27880570d2f71018680fbe73efc6bed` (E2.300 moved bay recognition with customized SB retention). This head includes all the main/#18/#19 history.

Keep newest E2.300 host binary, C# source, manifest and version record together. This is a combined PR candidate, not a new official release or a direct main merge. Preserve both changelog additions in chronological order. Rebuild bundled HTML using the incoming shell and 38 source markers, retaining PR14's axis CSS and appended unmarked wall helpers. Existing historical verification documents describe their original versions and are not rewritten.

## Integration fixes

1. Axis insertion preserves the physical building outline while splitting cells and axis metadata. Skip the new boundary-cleanup hook for this transaction only, retaining existing diagnostic outside-column records and their saved member/Check/A/B inputs. Genuine outline edits keep cleanup and Undo. A real-browser regression checks both directions of this policy and other-Framing isolation.
2. Windows MIME registry entries can classify PDF.js `.mjs` modules as `text/plain`, preventing the latest report viewer from loading. Declare `.js`/`.mjs` as `text/javascript` in the existing preview handler. The unit/live HTTP regression checks registry overrides, both PDF.js files, unchanged response bytes and no-store caching.
3. Preserve the upstream engine export prefix used by its portable geometry test hooks, while retaining the inserted-axis API.

## Passed validation

`node FramingStudio/verification/pr14-integration.cjs`: **35** model/browser suites passed, plus the MIME regression and byte/content preservation checks.

Coverage: axis insertion, wall copying, original column copying/spacing/deletion, grid snap, member list, column/slab representatives, native-check request/UI, App checks, beam RC, explicit beam types, CB/MB/SB following, geometry/tributary allocation, representative restoration, bay retention, support/reaction transfer and actual 16-page report scrolling. The new boundary interaction regression verifies column/input preservation, genuine outline cleanup, Framing isolation and Undo.

- 38 marked sources match the bundle; all 40 inline scripts parse; retained unmarked wall helpers match their source.
- After removing only the axis-insertion function/export, the complete incoming engine remains unchanged, including all CB/MB/SB/network/bay fixes.
- 63 other JS modules, all 12 native Excel files, ExcelBridge, newest desktop host/source/manifest/version and unrelated HTML/report/print content remain preserved against PR #20.
- Slab and CB fixtures produce identical original geometry, Section A/B load rows and report HTML against the latest incoming baseline.
- Restored the same preview at `http://127.0.0.1:8783/`; no forced user-tab reload or browser-storage reset. Tests use isolated browser contexts and synthetic projects.

No private project is accessed or packaged. Private-model-only historical UI scripts are not part of the portable suite. No native Excel/PDF generation or desktop runtime launch is claimed; the latest incoming host binary is preserved exactly. The PDF viewer regression uses a synthetic 16-page PDF rendered by the shipped PDF.js.
