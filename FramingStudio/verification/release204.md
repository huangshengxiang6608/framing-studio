# E2.204 verification — 2026-10-09

Baseline: official main E2.203, `5d18359d7110709b14fcecf431e23b88509791f6`.

The right-click member card now permits editing D for MB, SB, TB and CB. It sends explicit depth changes through the existing engine override/validation path, and checks the generated geometry before accepting a transaction. Invalid and over-limit edits leave the model unchanged, retain the draft and display the input, limiting floor and Structural Zone allowance. The existing shared-Framing and local-zone rules remain in force. Untouched dimensions retain automatic/default or explicit modes; type/width previews preserve a typed D, and blank/reset restores default depth.

## Validation

`node FramingStudio/verification/release204.cjs` passed all 11 programs: the new member-depth UI regression, existing type/default previews, batch beam dimensions, full structural depth, column UI dimensions, unified dimensions, local-zone limits and load surface, depth factors, self-weight, secondary splitting, and unit/hint UI checks.

The new isolated Chrome test covers manual MB/SB/TB/CB, generated MB/SB and transfer TB, exact-limit acceptance, over-limit/zero/negative/out-of-range rejection, full-project rollback, retained draft correction, undo, save/reload, width-only edits, type/default previews, clear/reset, and lower limits on shared floors and local zones. No page errors. The error-state screenshot was inspected: D remains editable with the rejected value and the inline message states 201 mm exceeds 1/F's 200 mm allowance.

306 pre-existing app files remain byte-identical to E2.203, including calculation modules, Section A/B report renderers, native Excel/VBA, ExcelBridge and workbook templates. All bundled content outside app.js and the version labels is unchanged. All 36 marked modules match source and source JavaScript parses.

The Windows host was rebuilt with `compile.ps1 -DesktopOnly`; executable/manifest version is 2.204.0.0. Host behavior is unchanged except version identifiers. Native Excel/VBA computation and printed report rendering were not rerun; their files and rendering code are unchanged. No claim of structural design approval is made by this input-validation change.
