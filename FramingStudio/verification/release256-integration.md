# E2.256 official integration verification - 2026-10-12

Official baseline: E2.203, `5d18359d7110709b14fcecf431e23b88509791f6`.
Integrated PR #8: all 55 commits through `ed88f67a70e23e0250ab918518d9f1de330b3706` (E2.256).
The remote main, latest release and PR head were checked before work and again before publication. No merge conflicts or intervening remote updates were found.

## Included software

The E2.256 runtime, desktop executable, ExcelBridge, templates and production source are retained from PR #8. The integration changes only verification fixtures, a reproducible verification runner, documentation and whitespace in two offline template-repair scripts. No new engineering rule or report layout is introduced by this integration.

The cumulative PR includes editable beam depths, force and short-term deflection diagrams, independent A/B outcomes and filters, beam sizing recommendations, member reinforcement editing, floor FRR rules, batch-edit/audit performance improvements, native report fixes/performance, checked-result reuse, failed automatic slab report exclusion and diagnostic explanations. See CHANGELOG.md for the individual E2.204-E2.256 changes and limitations.

## Current verification

- 70 Node regression programs passed, including dimensions, primary-bay splitting, load precision/transfer, truss downstream paths, diagrams/deflection criteria, FRR, reinforcement UI, full/incremental audit parity, report adoption and slab failure diagnostics.
- Updated older fixtures to explicitly retain their intended 250 mm SB geometry after the E2.243 default migration. Updated expectations for E2.208 full-precision downstream loads and E2.255 exclusion of failed automatic slab selections. The existing migration/failure tests remain enabled; assertions were not bypassed or loosened.
- 36 marked web modules match source, all production JavaScript and inline bundle scripts parse. report-content.js, report-compose.js, reports.js and excel-formulas.js are byte-identical to the official E2.203 baseline.
- RC workbook: all 112 non-VBA OOXML parts are byte-identical to E2.203, including cells/formulas, formatting, row/column dimensions and print setup. The template test checked all 89 VBA modules; only the declared Unicode-safe worksheet lookup and two link-recalculation edits differ. The template manifest hash matches.
- Current native Excel smoke tests used isolated synthetic single-MB jobs: Section A 257 comparisons and Section B 254 comparisons, zero differences. Four PDFs have valid payloads; both workbook download hashes match the native records. Each production worker completed successfully. This is sample coverage, not certification of every model; no new full PDF pixel comparison is claimed.
- Desktop and Excel bridge C# sources compile with the Windows .NET compiler. The delivered PR binary reports version 2.256.0.0. The supplied binary is retained rather than replaced by a timestamp-only rebuild.
- Local 8783 page serves E2.256 with no-store. Loading and Summary Check render without browser errors; no project inputs were edited during browser verification. Existing browser storage was retained.
- Git whitespace checks passed. The ZIP is constructed from tracked app/source files, excludes local QA profiles/reports/private projects, and is CRC-checked with a per-file SHA256 manifest.

Reproduce: install linkedom 0.18.12 for the Node DOM tests and set NODE_PATH, then run `node FramingStudio/verification/release256-integration.cjs`. The workbook audit also requires olefile/oletools and Git history. Native report evidence uses installed desktop Microsoft Excel on Windows.
