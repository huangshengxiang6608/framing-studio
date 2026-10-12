# E2.252 verification

Baseline: E2.251, commit `ab6b3c48cfd9d0f4638092f0a63c3370c63ff93a`.

## Correction

The reported ten-member RC copy exceeded the fixed five-minute worker limit during native Check99. Instrumented isolated copies identified repeated fixed-load evaluation and whole-workbook recalculation for every trial link spacing. The unmodified diagnostic needed about 1,010 seconds to reach the subsequent transfer-member step.

The bridge now computes the fixed RC load results once and temporarily disables calculation only on that sheet during native reinforcement trials. Before saving, it restores calculation, performs CalculateFull, and compares all ten columns of each held row. A change rejects the result. Error handling restores calculation before saving any failed partial workbook. Formulas remain intact.

Native Links84 still fully recalculates whenever a link diameter changes. For spacing-only trials it calculates the original provided-area cell (K58 or K76), then the original status cell (N59 or N77). The enclosing routine still performs CalculateFull. Search order, available sizes, spacing limits, formulas and acceptance criteria are unchanged.

RC worker time limits are five minutes for a single member plus one minute per additional member, capped at thirty minutes. Non-RC limits stay at five minutes. Progress repeats the current native step with elapsed seconds every fifteen seconds.

## Validation

- Instrumented candidate on the actual ten-member request: successful workbook, 158 comparisons, zero differences, 11 native PDF files, approximately 353 seconds. Private model inputs and generated reports remain local and are not packaged.
- 288 native Excel link candidates across MB, SB, CB and TB: provided area and pass/fail exactly match CalculateFull.
- Native fixed-load hold and restoration succeed; changing a source span during the hold raises a verification error and restores calculation.
- Empty, single-member, ten-member and oversized batch budgets remain bounded.
- Local browser A/B/AB dispatch and transport, loopback authentication/origin/path/concurrency, and floor-status regression tests pass.
- Existing small A/B examples generated through the Windows worker and HTTP service: 113 comparisons, zero differences, valid PDFs and workbook download hashes. Headless Edge composed and rendered both copies without errors or fallbacks.
- The workbook preservation regression verifies all 112 non-VBA OOXML parts remain byte-identical. Relative to E2.251, only two lines in SteelPolicy84 change; all other 88 VBA modules, including report generation and rendering, are preserved. The template manifest hash is updated.
- Windows compilation succeeds. The package audit checks unchanged source/assets outside the declared update and validates every packaged byte.

## Final production verification

The actual request also passed through the newly compiled Windows application and isolated HTTP service: 158 comparisons, zero differences, 20 PDF files including the nine existing supplementary chapters, matching workbook download hash, and successful completion events. Native generation and final load restoration took approximately 361 seconds; it continued correctly beyond the former five-minute limit. Headless Edge composed the 23 source pages into 15 pages using the unchanged report composer, with zero fallbacks or JavaScript errors, and rendered the preview successfully.

Official main (`5d18359d7110709b14fcecf431e23b88509791f6`), official latest release (`v2.203`) and PR #8 head were checked before implementation and again before publication; no intervening remote change was found. The existing preview address and browser/project storage are retained.
