# E2.251 verification

The local browser preview can generate Section A/B reports through the packaged Windows Excel worker. It uses the existing Excel job, PDF export and report composition paths. A per-run isolated WebView2/data folder keeps browser projects and the desktop user's stored project separate. Progress, verified results and downloadable workbooks return through a loopback-only, same-origin API with an in-memory token. Static/offline browsers without that service retain the Windows handoff instructions.

Member Check floor success for a checked beam is now RC pass AND (Span/Depth pass OR actual short-term deflection pass), using the existing check classifiers and deflection result. Stale/incomplete results are not shown as passed. Non-beam checks retain their existing predicate. No design formulas or required/provided values are changed.

Two native RC report defects were reproduced: the template manifest contained an outdated hash even though the actual RC workbook matched the official E2.172 artifact; and GenerateCopy's literal Chinese worksheet name failed on the local Traditional Chinese Excel installation (subscript out of range, followed by runtime error 91 in cleanup). The manifest is updated, and that single sheet lookup uses ChrW(&H6284). The compiled VBA performance cache is invalidated so Excel recompiles the repaired source. No security settings are changed.

Preservation:
- All 112 non-VBA OOXML parts of the RC workbook remain byte-identical to E2.250, including sheet contents, formulas, formatting, row heights, widths, print settings and pagination.
- All 89 VBA module sources were compared. Only one worksheet lookup expression changes; the other 88 modules are byte-equivalent after decoding. No rendering logic or report wording changes.
- ExcelBridge.cs/ExcelBridge.exe, report-content.js, report-compose.js, report paper assets and all other workbooks remain byte-identical. The C# worker reuses the original report generation/export functions.
- `source/repair-report-sheet251.py` reproduces the workbook patch from the exact baseline without an Excel save. Developer dependencies: olefile and oletools. Use separate input/output paths.

Validation:
- floor-status251.cjs: all eight RC/span/deflection combinations, unknown/stale/missing inputs and unchanged non-beam checks.
- local-report251.cjs: browser capability, enabled A/B/AB buttons, authenticated dispatch/polling, record delivery and disconnected completion.
- preview-server251.py: token/origin/Host checks, one active worker, cursor handling, unregistered workbook rejection and worker exit.
- report-template251.py: all workbook parts, all VBA source modules and manifest integrity.
- Existing report-handoff248.cjs, member-navigation248.cjs and representative250.cjs regressions pass.
- Real Windows Excel via the HTTP API: Section A and B both succeeded with 17 and 96 compared fields respectively, zero differences, valid PDF payloads and workbook download hashes. This is a regression fixture, not validation of every possible model.
- Headless Edge displayed the actual generated PDFs through unchanged ReportCompose and WorkspacePages. Section A composed three pages, Section B two pages; no browser exceptions or composition fallbacks. Native PDF pages and browser screenshots were visually checked.
- JavaScript/Python syntax, Windows desktop build, Git whitespace and package preservation checks pass.

Local preview startup (Python 3.9+ and installed Microsoft Excel on Windows):

```
python source/preview-server251.py --root . --port 8783 --data ../LocalReports
```

The existing local preview is updated at port 8783 without forcing a reload or touching user browser storage. Generated reports stay on the local machine. The Windows app remains usable directly without the preview service.
