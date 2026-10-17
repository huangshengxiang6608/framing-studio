# E2.294 — Show applicable checks in column result rows

Summary Check previously displayed `Section A · Span/Depth` with `N/A` for columns. Column result rows now omit that block and the beam deflection block, while retaining the column RC result, reasons, size warnings and stale-result indication. Member Check already excludes columns from its Section A span/depth card; that behavior is retained.

This is a presentation-only change based on official E2.293 main `471c66f5c037fe014054ee46ddbdfabb35f85849`. The separate open PR #14 is not included.

Validation:

- 42 render cases cover fresh/stale results and OK, NOT OK and INPUT REQUIRED states. All beam/slab output remains identical; column RC details and warnings remain visible.
- JavaScript syntax check and Windows desktop build passed.
- 536 other tracked application files are byte-identical to the baseline, including calculation/selection code, Excel templates, ExcelBridge and all A/B report sources. The bundled page differs only in the two UI expressions and version strings.
- The existing preview at port 8783 serves the exact E2.294 bundle with no-store caching. The current 2019 model was saved before refresh and restored from its existing backup.
- Live 2019 model: App Check completed for 3,883 members; all 38 displayed column result rows omit Span/Depth. AC17 retains its NOT OK result and column-size recommendation in both Summary and Member Check. No dimensions or reinforcement recommendations were applied.

No native Excel calculation or PDF regeneration is needed for this UI-only change. Original Excel formulas, A/B wording, formatting, print settings and pagination code are unchanged.
