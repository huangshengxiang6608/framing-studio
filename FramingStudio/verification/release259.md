# E2.259 — Separate Column Spacing page

Based on E2.258 commit 3248225f88532370f7ae79a06dc58e635fba43cb, retaining E2.257 and E2.258 PR changes. Official main remains E2.256 b07f04a; releases and PR #10/#11 heads were checked before editing.

Moved the existing per-Framing Column Spacing table from Floors into its own sidebar page between 02 Floors and 03 Regions. Existing numbered pages keep their numbers. Data fields, validation, automatic column generation and calculation behavior are unchanged.

The existing real-browser spacing test now navigates to the separate page, checks its placement and removal from Floors, and passes immediate application, invalid rollback, Undo, persistence/reopen, clearing, shared-Framing isolation and manual-mode checks without page errors. The full-page screenshot was inspected.

Engine, report, workbook/VBA, ExcelBridge and engineering calculation files remain byte-identical to E2.258. All bundled source modules match their source. Windows host version 2.259.0.0 compiled; app/source ZIP contents and checksums verified. Native Excel recalculation was not rerun for this UI-only move.
