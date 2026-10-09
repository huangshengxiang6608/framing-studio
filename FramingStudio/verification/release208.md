# E2.208 verification — 2026-10-09

Baseline: PR #8 E2.207 commit 5b4e48c8daa5202f661433e38c6533eb92bb4a02, retaining official E2.203 main 5d18359d7110709b14fcecf431e23b88509791f6. Official main, latest release and PR head were checked before work; no new remote changes were found.

## Authorized precision change

The user approved preserving original DL/LL, reactions and intermediate transfers without rounding, using the same data/factors/transfer rules in App and VBA, and truncating only UI output to three decimal places with an ellipsis when further digits remain.

Characteristic G/Q are now the single source. Self-weight, slab reactions, manual loads, span scaling, beam reactions and downstream transfers retain JavaScript double precision. Legacy ug183/uq183 fields no longer override G/Q. Factored values are derived as 1.4G/1.6Q; total reactions, shear and moment no longer have a final ceiling. Combined moment remains the peak of the combined load diagram, not the sum of G/Q peaks at different locations. Native FullAction73 already uses unrounded exported G/Q and the same factors, so no VBA or template edit is needed.

UI force/load results in beam, slab, column and truss reaction panels show three decimal places, truncated towards zero, with an ellipsis for remaining digits. Machine-scale noise at exact thousandths is suppressed only for display. Editable numeric inputs retain their full value; display strings never enter calculations or exports. Geometry, support models, load factors, RC formula/steel rules and report formats are unchanged. Existing project inputs are not rewritten to recover precision already lost by older versions; generated loads are recalculated from their source inputs.

## Validation

- `precision208.cjs`: exact raw self-weight, slab pressure/reactions, 16 generated beams, 10 slabs, 16 downstream beam transfers, 16 RC G23/G24 pairs, old-cache rejection, distinct G/Q moment peaks, span rescaling, negative/tiny/large values and 3dp/ellipsis display.
- `full-loads-vba208.py`: mechanically adapts the supplied FullAction73/Moment73 bodies to a VB.NET compatibility harness, with a fake Range and Math Min/Max/Abs. No algorithm rewrite and no worksheet modification. 102 exported M/V/RA/RB/G/Q comparisons on generated MB/SB and manual CB cases passed at relative tolerance 1e-9. The user's saved CB_2 project was independently recalculated read-only and adds six matching comparisons (108 total). This is source-algorithm execution, **not native Excel/VBA execution**.
- `integration143.cjs`: 55 load assertions plus same-floor/two-storey truss downward-load, invalid-input/export gating and serialization cases passed. Only superseded rounding expectations in loading115-browser were updated.
- `diagrams207.cjs`: closed-form simple-span/CB loads, either fixed end, reversal, partial UDL, coincident point forces, extrema and equilibrium/derivative identity passed. Input fixtures now supply characteristic G/Q instead of pre-factored overrides.
- `beam-independent179.cjs`, `slab-transfer177.cjs`, `self-weight185.cjs`: existing independent-member, manual span, patch, support, region, reversal, self-weight, physical Area and report-input regressions passed with the new precision expectations.
- `diagrams207-ui.cjs`, `self-weight185-ui.cjs`, `column-load-centres186-ui.cjs`: automatic/manual diagrams, keyboard/pointer, either CB root, narrow panels, invalid/empty clearing, raw numeric edit/save round trip, actual column/slab panels and no page errors passed. Screenshots reviewed. No live user browser/project was altered by tests.

The old `rounding183.cjs` and `reaction-rounding207.cjs` entry points now run the comprehensive replacement precision test. Their staged/final ceiling policies were expressly superseded by this request.

## CB_2 examples and limits

Frozen historical rounded G/Q records yield RA 1645.459 kN and M 5565.86025 kN m in both the revised App and supplied VBA function. This checks stale factored-cache rejection.

A full recalculation of the previously supplied project yields RA 1645.0479999999998 kN, DL 1152.8229999999999 kN, LL 492.225 kN and M 5564.4682031249995 kN m. UI: RA 1645.048, DL 1152.823, LL 492.225, M 5564.468…. This differs from the frozen case because all upstream source/transfer rounding is removed. Neither result by itself asserts an RC pass.

Native Excel recalculation/print rendering was not rerun. The previously identified workbook manifest hash mismatch and Excel-open limitation remain outside this calculation change. A failed native verification must not be described as a successful native Excel check.

An exploratory legacy `span130Tests` run still assumes slab-resultant conservation under manual span changes, superseded by E2.179's retained slab intensity. It fails on the unchanged E2.206 baseline too (35.855687 vs 57.66125); it was not used as a release pass or silently rewritten. The current slab-transfer177/beam-independent179/manual-span regressions passed.

## Preservation and delivery

Section A/B report source, number formats, layout, print settings, native VBA routines, ExcelBridge and workbook templates remain byte-identical to E2.207. Only authorized input/result values can differ. Bundle/source and Windows package verification are recorded during packaging. Existing 8783 preview is updated without navigating or reloading the user's tab, and serves no-store responses. Previous local packages are retained.
