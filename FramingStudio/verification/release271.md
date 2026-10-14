# E2.271 — Bottom-storey representative columns

Member Check now selects two representative columns on the lowest storey of the entire model: the maximum ULS axial load among columns receiving tributary transfer-column loads, and the maximum among columns without such loads. It uses the existing accumulated Section B input, including the project factor. It does not select another pair for every Framing.

The existing tributary route now retains source-column provenance through multiple storeys without changing any load weights, areas, forces or design calculation. The UI displays the transfer category and N in kN, and defaults Check/A/B to selected while retaining manual selections and cancellations. Unknown ownership or incomplete demand leaves the relevant maximum unconfirmed. A category absent from the model is not fabricated.

Selected columns use the existing floor/member-named independent Section B Column Check copies. Existing formulas, private inputs and fully editable E2.270 behavior are preserved. Existing one-column-per-workbook batching is retained because the original Section A column input table is shared.

Native verification exposed a prior later-batch Excel export error: HPageBreaks.Add fails when restoring a break at the first row of the narrowed PrintArea. Export now restores the identical saved breaks while the full range is active, then restores the exact original PrintArea. No break positions, hidden rows, formatting, equations, report wording or native VBA rendering routines were changed.

## Validation

- Official main b07f04a6 and PR 10 5e22aff3 unchanged; baseline PR 11 / E2.270 86e4d1d2.
- Representative tests: whole-model bottom floor, two maximum ULS categories, absent category, numeric ties, missing ownership/load, three default flags, changed winner and retained manual cancellation.
- Existing representative-beam/DOM, tributary routing and member-design naming regressions pass. Multi-stage transfers, non-owner zero contribution, zero area overrides and unresolved manual ownership covered.
- Current-model full Check rows match E2.270 exactly after excluding only added provenance metadata.
- Current model: 1/F AC10 (transfer), N = 43,771.25 kN; 1/F AC2 (non-transfer), N = 35,594.453125 kN. Both existing checks are OK (AXIAL ONLY).
- Real browser import and Member Check: both columns appear, all Check/A/B flags selected, N and categories match, no page errors.
- Fresh native combined workbooks: 31 comparisons each, 62 total, zero differences. Original column calculation formulas and independent inputs verified for both named copies; all sheets remain editable.
- First-batch baseline/final comparison: 15,254 original formulas unchanged; A/B cell styles, number formats, row heights, column widths, merged cells, print settings and page breaks unchanged; all five PDF pages retain counts and dimensions.
- Later-batch production A and B jobs succeed: 16 and 31 comparisons, zero differences. Original A page breaks before rows 18/34, hidden rows 1–33 and PrintArea A34:H47 are restored exactly.
- A/B PDFs visually reviewed. Native templates and VBA source are byte-identical to E2.270; JS design equations and RC export plan unchanged. Windows desktop and bridge compile successfully; diff whitespace check passes.

The original column Check remains axial-only. This change adds representative selection, not additional column design criteria.
