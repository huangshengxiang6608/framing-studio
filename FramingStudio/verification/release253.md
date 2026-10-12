# E2.253 verification

Baseline: E2.252 commit `343a64001746ed44b886c256f6c7022274fd30ab` on existing PR #8. Official main remains `5d18359d7110709b14fcecf431e23b88509791f6`, latest official release remains v2.203. Checked before work and again before publication; no intervening remote changes.

## Change and preservation

RC PDF export previously applied Palette84 (including whole-sheet table borders and every drawing) before each individual member PDF. It now finalizes the existing member/subsection labels before export and applies that same formatting once. The individual PDF exports reuse the prepared copy. Other report types retain their original formatting path.

All native calculation calls, comparisons, readiness gates, full-load restoration checks, reinforcement selection, formulas and VBA are unchanged. The RC template and manifest are byte-identical to E2.252 (RC workbook SHA256 `a104cfefb60fbd4fab3f7e50aed573d52d98264f70380064152dbdd3971829fb`). Original A/B report generation, numbering text, borders, colors, diagrams, row heights, column widths, print settings and page-break restoration are retained. UI assets differ only in the displayed version. This change does not substitute Summary/Member Check values for unverified native Excel intermediate calculations; the existing App-to-Excel comparisons remain mandatory.

## Native and output comparison

Same ten-member user request: 360.778 seconds in E2.252 versus 273.248 seconds in E2.253, saving 87.530 seconds (24.3%) on this host. This is one comparative run, not a guarantee for every model. Both runs used the full native calculation path, not a completed-job cache hit. 158 App/Excel comparisons passed with zero differences.

`source/tests/report-equivalence253.py` compared all 21,404 populated formula/value cells (numeric tolerance 1e-12; explicitly identified native Now/Format(Now) audit timestamps excluded), both report sheets' cell formatting, merged ranges, row/column dimensions, print setup, headers/footers and page breaks. All matched. All 20 PDF files / 23 pages matched in extracted text, page/crop boxes and every rendered pixel at 120 dpi.

Additional old/new native runs:

- Section A single beam: 17 App/Excel comparisons; 19,622 workbook formula/value cells; 2 PDFs / 3 pages, identical pixels and report formatting.
- Section B three beams, including manual reinforcement: 288 App/Excel comparisons; 19,840 workbook formula/value cells; 4 PDFs / 4 pages, identical pixels and report formatting. Baseline 60.015 seconds, candidate 51.812 seconds.

The extra synthetic continuation batch (`first=false` with hidden introductory rows) failed while restoring page breaks on the unchanged E2.252 baseline after exporting all three member PDFs. It was not used as evidence of a successful equivalence test and is not repaired by this performance-only change. The normal first-batch A/B tests above completed successfully.

The actual request also passed the authenticated local HTTP worker, PDF file checks and workbook download SHA256 verification. The unchanged browser composer displayed 23 source pages as 15 final pages with zero fallbacks or browser errors in an isolated browser. The user's preview and storage were not reloaded or changed during testing.

Windows build, Python syntax checks and diff whitespace checks passed. Release packaging verifies every unrelated tracked app/source file against E2.252 and compares archive entries to local files. Publish app/source through the existing PR and retain the same preview address `http://127.0.0.1:8783/` with no-store responses.
