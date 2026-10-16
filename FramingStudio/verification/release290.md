# E2.290 verification — 2026-10-16

Baseline: official E2.289 main/release, `58d1fb5f6e9f53a89841b044398476c55fa148ab`. The official main, latest release and open PR heads were checked before editing and again before publishing.

The Member Check list previously cleared selection flags when its x button was clicked, but always reinserted automatic representatives and the current focused member. E2.290 records explicit removals in the existing representative-selection metadata, clears the same Check/A/B flags, suppresses automatic re-selection and removes current focus from the list. Every displayed row has a remove button, including an unchecked representative. Model geometry and calculation inputs are untouched.

Explicit plan selection still shows a member for review. Checking Check, A or B retains it and clears its previous removal marker. Undo restores the previous row and flags. Saved projects retain removal metadata. Automatic ranking and maxima remain unchanged; other winners can still be selected after input changes.

## Validation

- The real-browser regression reproduces E2.289's old behavior: after removing SL-01 the row remains (1 !== 0). On E2.290 the same test passes for all rendered representatives, current focus, manual members, immediate row count, Check/A/B flags, other selections, model geometry, refresh, one-step Undo, saved reopen, a new automatic extraction, explicit re-selection and selecting a different member. Removal alone reuses the current calculation; no browser errors were observed. The screenshot was inspected.
- All eight scoped tests passed: member-list290-ui, column-representatives271, slab-representatives275, report-slab-preflight276, check-native279, check-ui279, summary-app282 and local-rebar285. The native preparation tests mock the bridge; they do not run Microsoft Excel. Detailed results are in release290-results.json.
- 36 marked web modules match source; the unmarked floor-tools101 module matches too. All production source and bundled JavaScript parses. All 65 JavaScript modules other than explorer-ui.js are byte-identical to E2.289. The unchanged portions of explorer-ui.js containing representative ranking, report preparation and rendering were checked against the baseline. Existing UI CSS, native ExcelBridge source/binary, RC workbook and template manifest are also byte-identical.
- Windows desktop compilation succeeded at 2.290.0.0 using DesktopOnly. Native Excel/PDF generation and the full historical regression suite were not rerun for this UI-selection change; the inherited E2.289 failures are not claimed to be fixed. Section A/B layouts, formulas and formatting remain unchanged; deselecting a member changes the report selection as the existing x action did.
- Packaging verifies archive CRC and the per-file SHA256 manifest. Reuse http://127.0.0.1:8783/ without reloading the user's browser or resetting storage; verify served HTML and no-store before delivery.

Run with Node, linkedom/playwright and installed Chrome:

```text
node FramingStudio/verification/release290-integration.cjs
```
