# E2.296 — Locate geometry issues without changing the current page

Clicking a geometry issue's Locate button on the Columns page previously forced navigation to Summary Check. Locate now preserves the originating page while setting the target floor/Framing, showing the plan and highlighting the member with the existing geometry overlay. Columns also shows the existing focus notice and Close Geometry Locate control. Summary Check keeps its existing behavior within Summary Check.

Only two UI expressions in `app.js` and the corresponding bundled page changed, plus version metadata and the rebuilt Windows host. Calculation/selection rules, geometry diagnostics, Excel templates, ExcelBridge, all A/B report sources, formulas, formatting and print/pagination rules are unchanged.

This PR retains E2.294's column-result display fix and E2.295's explicit representative-selection restore button. Built on official E2.293 main `471c66f5c037fe014054ee46ddbdfabb35f85849`, with E2.295 `8b82a779947b92b7a34ff4fa89a264d0adb109d4`. Separate PR #14 is unchanged.

Validation:

- JavaScript syntax and Windows desktop compilation passed.
- Byte comparison confirms 539 other pre-existing application files are unchanged. Reversing the two UI edits and version text reproduces the original source/bundle exactly.
- Current model: locating F02 / 2/F CB_3 stays on Columns and highlights the ungenerated record. Closing the focus removes the notice without changing page.
- Summary Check: starting at F01, locating CB_3 switches to F02 / 2/F while remaining on Summary Check; the existing focus notice identifies CB_3. Saved project JSON before/after navigation is identical.
- Existing port 8783 serves the exact E2.296 bundle with no-store caching; current model saved before refresh and restored.
- Native Excel and PDF generation were not rerun for this navigation-only change.
