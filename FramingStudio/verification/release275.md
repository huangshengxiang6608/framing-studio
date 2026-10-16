# E2.275 — Select representative slabs across the whole model

Baseline: E2.274 / 40a3cf97638751b6245d95721c966425b78b8835. Official main, latest release and relevant open PR heads were checked before work and before publishing.

## Behavior

The Member Check representative table now automatically selects one ordinary SLAB and one cantilever slab CS with the greatest absolute design moment across every floor. The two types remain separate and use their corresponding native Section B design sheets. Equal moments use floor and numeric member-mark ordering. Selection reads the existing Check result D22 in kNm/m; it does not add a solver or change engineering equations.

Both types default to Check, A and B selected. Saved manual selections/deselections remain authoritative. Missing moment/load data prevents automatic confirmation of that category's maximum. A failing maximum is never replaced by a smaller passing slab; existing generation checks still apply. The table includes slab thickness and distinguishes slab kNm/m from beam kNm.

Existing Section B capture creates an editable independent formula sheet after the native slab design sheet, with private captured inputs and inactive copied macro buttons. No changes were needed to the Excel bridge source, native templates, VBA, calculation code, report rendering or report layouts. The previous AC2/AC10 combined-workbook behavior is retained.

## Validation

- Saved the user's current model from the existing preview. Fresh before/after audits match all 4,537 Check rows exactly. Across 28 floors and 1,810 slabs, the winner is 2/F SL-21, M = 21.2175 kNm/m, Check OK. This model has no CS.
- Actual Member Check DOM integration confirms 13 representatives, 2/F SL-21, 200 mm thickness, 21.218 displayed moment and all three checkboxes selected.
- Native current-model export: Section A 2,607 comparisons and Section B 2,692 comparisons; 5,299 total, zero differences. Each section remains one combined workbook containing AC2 and AC10. B contains `2F SL-21` immediately after `Section B Slab Check`.
- Saved-workbook preservation audit: 21,044 A and 63,827 B populated formula/value cells match the native parts. Original report and independent design formats, merged ranges, row heights, column widths, number formats, print settings and page breaks are preserved; per-member native PDFs are copied byte-for-byte. No external workbook links.
- SL-21 independent sheet: all 24 expected result cells match Excel. In a disposable copy, changing bar diameter recalculates reinforcement area; changing shared Input loads does not overwrite its private inputs/results. Restore, save and reopen pass. No Excel cell errors in the saved independent slab sheet.
- Separate automatic CS fixture: 41 native comparisons, zero differences; all 24 expected cells also verified after reopening. Its independent `1F SL-01` sheet uses `Section B Cantilever Slab Check`, recalculates direct edits and remains isolated from shared input edits.
- The app's official `--verify-open` path opens A, B and CS workbooks successfully with saved RC state CURRENT. Six printed design pages (three SLAB, three CS) were visually reviewed using the original print areas.
- Regression coverage: global SLAB/CS maxima, highest floor, signed moments, deterministic ties, missing data, manual overrides, changed winners and failing maxima. Existing representative-beam/column selection, shared-audit reuse/stale-result rejection, and 48 automatic plus 48 manual slab cases pass.

Independent sheets remain generation-time snapshots: edits recalculate their own formulas but do not write back to the app or regenerate A/B report copies. Existing Overall/Wind missing-input requirements remain separate from successful RC generation. Preview stays at localhost:8783; browser storage and unsaved edits are preserved without forced reload.
