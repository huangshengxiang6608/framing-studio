# E2.270 — Editable Excel outputs and directly typed beam counts

Baseline E2.269 / a00e5cddbbe6c3ab11bb9cf4c4d1ff776318a08d. Official main b07f04a6ca4fe84940a8071f316aae85e3a688d0, latest release v2.256 and relevant PR 10/11 heads were checked before changes and before publication. No intervening remote change was found.

Independent member sheets previously inherited bar-count validation lists from the native beam designs and were explicitly protected after capture. That protection also prevented users from unhiding P:BQ (the hidden columns between O and BR). The user's latest request supersedes the earlier read-only requirement.

Generated workbooks now remove worksheet/workbook protection, selection restrictions and scroll restrictions. Very-hidden calculation sheets become ordinarily hidden so Excel's Unhide command can reveal them. Existing hidden columns and initial sheet visibility are otherwise retained; no dimensions or print layout are changed. All cells, including calculation formulas, are editable. Private member inputs and disconnected copied UPDATE controls remain independent of the original shared design. Their label now states “Independent calculation sheet”.

Both faces' eight beam layers use typed non-negative whole-number counts at C40:C47 and C110:C117. The old 2–14 dropdown list is replaced by integer validation, allowing values such as 0, 18 or 19. This applies to original MB/SB/TB/CB design sheets and their member copies. Diameter selection and all native equations/design limits are unchanged. Changes made to an exported workbook are local to that workbook, not synchronized into the App model.

Validation:

- A fresh native combined A/B run for the same eight eligible current-model members completes 2,032 numerical comparisons with zero differences.
- Native Excel tests on a disposable copy verify 59 unprotected sheets and 192 direct-entry count cells. Zero and integers above the old list limit validate; negative and fractional counts do not. Changing a TB count recalculates its original area equation and restoring the count restores its result. Formula cells can be edited. P:BQ columns and hidden calculation sheets can be revealed. Save/reopen retains editability, validation, formula restoration and unhidden columns.
- 17,953 original workbook formulas, identical load tables, A/B report styles, row heights, column widths, merged cells, print settings and page breaks agree with the E2.269 output. Twenty-three PDF pages retain page count and paper dimensions. Eight independent calculation sheets preserve formula coordinates and private inputs, with 960 input/result cells verified.
- All 97 VBA module source texts in the two generated workbooks match. Production Excel templates, extracted calculation definitions and native VBA/report source files are byte-for-byte unchanged. Only export editing permissions, beam-count validation, copied-control labels, version metadata, tests and instructions changed. The bridge binary is rebuilt, so old protected outputs cannot be reused from its versioned export cache.

The original 8783 preview is reused without clearing browser/project storage or forcing reload. Previously downloaded/open workbooks are not overwritten; users can use the newly generated editable workbook or regenerate with E2.270. This update does not alter calculation acceptance or repair unrelated Excel startup instability.
