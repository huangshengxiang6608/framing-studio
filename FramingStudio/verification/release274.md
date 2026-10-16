# E2.274 — Deliver representative columns in one Excel workbook

Baseline: E2.273 / e89c74f661c92eb0bc36a80fb80c4b1971f7d5b4. Official main, latest release and open PR heads were checked before changes and again before publication. The native RC template remains unchanged.

## Behavior

Selecting AC2 and AC10 previously produced two files because the original Excel design uses one shared column input context. A/B report jobs now collect additional column-only parts into the first compatible workbook. The native calculations still run independently with their original inputs and acceptance rules; a failing part prevents delivery of the combined result.

The combined Section B workbook contains both `1F AC2` and `1F AC10` immediately after the original column design sheet. Each retains its original equations, editable cells and private captured inputs. The combined Section A workbook likewise includes independent native column-loading calculation sheets. The additional column's original report copy is retained as `Section A 抄 - AC10` or `Section B 抄 - AC10` inside the corresponding workbook. The main report and the added column report keep their original layouts; no report rows are concatenated or redesigned. The composed preview uses the exact native PDFs in the same order.

The merge copies each additional column's dependency sheets together, gives private captures unique names, rejects external workbook links, and compares formulas and values before saving and after reopening. Original shared calculation/design sheets remain the first part's context. Independent sheets remain snapshots: changing one does not write back to the app or regenerate the report copies.

Single-column exports, Member Check exports and existing beam-capacity batching are unchanged. Reference chapters are rendered once. Source templates, native VBA/rendering routines and engineering equations are unchanged; the E2.273 input-table preparation remains in use.

## Validation

- The current model was saved from the existing preview. Fresh plan inputs, members, loads and native report numbering match the preceding successful two-file generation exactly.
- Combined native exports: Section A 2,604 comparisons; Section B 2,602; total 5,206, zero differences. Both outputs reopen and pass private-sheet formula/value comparisons without external links.
- Preservation audit against the unmerged native outputs: A 21,006 and B 62,661 populated formula/value cells preserved. Original report number formats, effective styles, merged ranges, row heights, column widths, print areas/settings and page breaks are unchanged. Excel may compact blank cell styles into identical inherited column styles; effective formatting is compared.
- Re-exporting the original print areas from merged workbooks produces 22 pages pixel-identical to the corresponding unmerged full-sheet exports (7 A, 15 B, at 1.5x scale). The per-member preview PDFs are copied byte-for-byte without regeneration.
- Disposable-copy recalculation tests change AC10's input and confirm only its corresponding result changes. Editing the shared Input load table does not change either captured column's axial load. Both A/B independently retain AC2 = 35,594.453125 kN and AC10 = 43,771.25 kN for the tested model.
- `column-workbook274.cjs` covers A/B grouping, original input immutability, one-column and Check behavior, existing beam capacity limits, multiple additional columns and reference-page deduplication.
- `column-workbook274.py` audits saved workbooks and all original populated formulas/values plus effective report/design styles. `column-isolation274.ps1` tests independent recalculation and exports layout controls from disposable copies.
- Existing loopback report transport, seven recovery boundary cases and E2.273 load-table preparation tests pass.

The existing Overall/Wind missing-input messages are separate model-input requirements. Neither this change nor a successful RC export supplies those missing inputs. The preview remains at localhost:8783 and project storage is retained.
