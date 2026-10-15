# E2.283 — Manual beam horizontal clear spacing in the App

Member Check manual reinforcement can exceed floor(B/100), while each occupied layer must retain at least 40 mm horizontal clear spacing. App geometry, live preview, saved RC check and App report context use the same manual rule. The editor identifies the physical top/bottom face, layer, bar arrangement and calculated gap; invalid spacing cannot be saved. The 40 mm boundary is inclusive. Vertical layer gaps and effective-depth equations are unchanged.

Automatic reinforcement keeps its previous width/100 cap, candidate sequence, layer counts and spacing checks. Manual layer counts remain independent.

## Explicit Excel boundary

The user explicitly required Excel to retain its original rules. ExcelBridge, workbook template, VBA, worksheet formulas and A/B rendering/formatting are unchanged. Consequently manual arrangements accepted by the App may still fail the old Excel fit rule. Existing native difference reporting/blocking remains; this release does not claim these arrangements match Excel or guarantee A/B generation for them.

A binary VBA edit attempt failed validation before writing the template; further binary rewriting was rejected by approval review. The fallback native-edit probe opened a disposable copy without changing it and found VBA project access unavailable. The user then instructed that Excel remain unchanged. All proposed bridge changes were reverted; hashes confirm the template and VBA are unchanged. No Excel trust setting was changed.

## Validation

- Desktop build succeeds.
- `manual-spacing283.cjs`: all four beam kinds; 12 automatic baseline cases are exactly equal to E2.282. Manual 20T40 above the old cap is evaluated, vertical depth is identical, 22T40 fails with 37.905 mm, exact 40 passes, below 40 fails, single-bar and cantilever face labels pass. The unmodified Excel-equivalent predicate still rejects the arrangement above the old cap, as intended.
- `manual-spacing283-ui.cjs`: real DOM input/save events verify live calculation, saving/reloading 20 bars, layer-specific error for 22 bars, blocked invalid save, and recovery.
- `link-policy267.cjs`: 36 automatic and 72 manual link cases pass.
- `beam-acceptance261.cjs`: four beam kinds, 27 status combinations, seven RC failure cases and full/incremental parity pass.
- Summary App-only and Member native-dispatch UI regressions pass. Native-request/checkpoint/mid-flight-edit regressions pass with simulated replies.
- Package preservation compares every previous tracked app file, allowing only the explicitly edited App modules, bundle and version/build metadata. Original Excel assets and native report code are byte-identical.
- No new native workbook/PDF generation was claimed for this App-only release.
