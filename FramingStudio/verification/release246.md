# E2.246 — Preserve SB bay records during dimension edits

Saving an automatic SB's B/D rebuilt its saved record from a member object that could lack bay171. This discarded the bay metadata just written by freezeAutoBeams. Later, legacy inference used raw primary endpoints while current bays used normalized support endpoints, producing false boundary-change warnings.

The edit now copies the freshly frozen bay tag into the replacement SB record. Existing missing tags are recovered in the generated model only where the complete saved SB set exactly matches a current bay's independent spacing, direction and raw support-span boundaries. Explicit historical tags, incomplete/mismatched layouts and genuine primary-boundary changes retain the existing repair/guard path. No live project input is changed during recovery; subsequent normal edit/freeze/save preserves the recovered tags.

Validation:
- bay-record246.cjs runs the existing tagged and legacy primary-bay scenarios offline, including MB/TB/CB boundaries, automatic CB preservation, genuine boundary-change protection with customized input, column-dependent CB widths and overrides. New checks cover single and batch B, D and B+D edits from untagged generated members, save/reopen and non-mutating legacy recovery.
- A private copy of the affected 28-floor project was compared against the E2.245 engine offline: 104 model warnings became zero. Complete beam geometry/properties (excluding recovered bay tags), slab/column/wall geometry, panels and explorer inputs match exactly. The original project file was not modified or included in this release.
- beam-batch245, fire241 and offline rebar227 regressions, JavaScript syntax and whitespace checks pass. Windows desktop compiled successfully.
- Package verification checks bundled module bytes and all unrelated tracked files, preserving Section A/B reports, formulas, workbook templates and Excel/VBA rendering.
- Preview is deployed to the existing port 8783 and verified by HTTP version, exact content and no-store headers. No forced reload or browser storage modification; verification of the fix is offline, not a claim of live browser recalculation.
