# E2.216 verification — 2026-10-10

Baseline: E2.215, 10c7346aae7b89ad234c8ce5c668af475e842d6a. Official main 5d18359d7110709b14fcecf431e23b88509791f6, latest official release v2.203, and PR #8 were checked before changes. No remote-only updates found.

Summary beam RC now evaluates the seven existing reinforcement/shear/torsion result cells independently of N87 (L/d). Only the known automatic-selection failure and next-width advisory caused solely by L/d are suppressed when every structural cell is OKAY. Actual width violations, detailing constraints, unknown failures, incomplete calculations and missing inputs remain visible. Slab and column classification is unchanged. This changes Summary classification/filtering, not the solver, reinforcement search or report output.

Validation:
- `source/tests/summary-rc216.cjs`: actual CB_1 inputs reproduce original N87 = NOT OKAY, G87 = 7.88 and G86 = 7.56. Summary RC is OK; short-term deflection remains failed and default-visible (PFP). All seven structural failures, unknown/geometry/width errors, missing inputs, incomplete check cells, slab preservation and input immutability pass. Summary HTML independently shows RC passed and short-term deflection failed.
- `source/tests/beam-filters214.cjs`: existing Section A/B, slab/support/transfer, deflection closed forms, unrounded L/250 thresholds and all eight independent result/filter combinations pass. Existing fixture comparison excludes the intentionally removed L/d reason.
- The bundle is checked against exactly loading.js and explorer-ui.js plus the version update; all 36 marked source modules agree. The numerical loading code before the Summary adapter, checks.js, formula ASTs, Excel/VBA/ExcelBridge, and Section A/B renderers/templates are unchanged. No report wording, formulas, number formats, geometry or pagination modified.
- Windows desktop host rebuilt to 2.216.0.0. ZIP contents checked against current app/source. Prior packages retained. Preview delivery uses existing 8783 address and no-store responses without reloading the user's unsaved project.

Native Excel recalculation, printing and live browser reload were not performed for this Summary-only classification change.
