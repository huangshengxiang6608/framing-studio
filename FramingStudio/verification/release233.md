# E2.233 verification

Baseline E2.232: 264b5948a100668c8f17b9c93d06e383a37570f0. Official main 5d18359d7110709b14fcecf431e23b88509791f6 and latest official release v2.203 were checked alongside PR #8 before work and before publishing.

Changes:
- Add an accessible × action in the first column of the selected-members table. It removes only that floor/member's Check, A-copy and B-copy selections, through the existing undo transaction. Model geometry, saved member inputs, current selection and fresh calculation results remain intact.
- Apply the user's project policy: automatic shear/torsion link spacing candidates stop at 100 mm, then use the existing larger-diameter search. Unsatisfied cases remain failed. This is a project selection rule, not a new code-of-practice claim.
- Manual input minimum and save validation are 100 mm for both link types. Imported legacy values are not silently changed; recalculation reports a project-minimum failure, including in independent Summary RC classification.

Validation:
- Extended offline Member Check DOM integration passes: × removes all three scope flags, removes the row, retains model/member data and RC result, and snapshot undo restores it; both spacing fields declare min=100 and reject saving 75 without changing project data.
- New link-spacing233 suite passes 36 MB/SB/CB/TB shear/torsion demand cases. All automatic spacings are >=100 mm. A known T8@75 torsion case now uses T10@125 and passes. Overload remains failed. Manual 50/75/99 triggers a retained RC reason; 100 does not trigger that minimum rule. Legacy inputs remain byte-equivalent.
- Existing Summary independent-RC and combined RC/(Section A or deflection) sizing suites pass.
- Windows desktop compiles. Bundle and ZIP verified against source. Unrelated application files, formula ASTs, report renderers, workbook templates and Excel/VBA routines are protected by byte checks.

No live browser automation was used. Delivery verifies localhost exact bytes/no-store and GitHub package digest without reloading the user's tab or changing storage.
