# E2.214 verification — 2026-10-10

Baseline E2.213 af870928d875581db4e07d5d016fd576e4c6bafa. Official main 5d18359d7110709b14fcecf431e23b88509791f6, release v2.203 and PR #8 head checked before work and publication.

## Behavior

The user requested independent pass/fail combinations for beam span/depth, actual displacement and RC, with the default list showing displacement failure OR RC failure. The displacement remains the previously approved short-term uncracked DL+LL, gross-section L/250 criterion, not full COP deflection compliance.

Eight known combinations are independently multi-selectable with counts. Default selects the six combinations where displacement or RC fails. Unknown states are not coerced into pass/fail: unknown combinations with a confirmed displacement/RC failure are included by default; unknown without confirmed failure is a separate unselected option. Other member/geometry issues are separately selectable, unselected by default. A presets row restores defaults, selects all beam combinations (including pending), or clears all. Counts reflect the existing floor/kind/status filters. Selection table is collapsible. Span/depth failures with passing displacement retain orange text in both selection table and result rows.

Summary opts into complete beam collection via includePassedBeams. Existing audit callers default to legacy collection; loading, RC and displacement numerical solvers are unchanged. All beams, including original A/B passes, receive the same saved-loading deflection summary. This allows all eight combinations and catches displacement failure even if span/depth passed. Beam filter states independently use raw A status, unrounded delta/L comparison, and raw B status. Original result rows/inputs/reports are preserved. Passed alternatives are not dropped from the collected data. Section B remains independent. Geometric/height/transfer rows remain accessible under other issues.

## Verification

- beam-filters214.cjs runs existing A/B, slab/load/audit, summary-deflection and threshold tests; tests all eight independent classifications, exact six-combination default OR, pending-fail/pending/nonbeam categories, optional complete beam audit including previously omitted all-pass beams, legacy items unchanged, project/report selections unchanged.
- beam-filters214-ui.cjs runs an actual complete audit and verifies previously omitted all-pass beams appear under All beams. Sync/async parity holds. A controlled eight-state plus pending/nonbeam result set is then fed through the real audit completion/UI path; all combinations, additive selection, exact default OR, counts, status/kind intersections, orange display, locating, stale suppression and no project mutation/page errors pass. Narrow viewport screenshot reviewed. This replaces older UI assumptions about default accepted-row visibility; no claim those superseded assertions pass unchanged.
- All 36 bundled modules match source. Changes confined to beam-load-ui, explorer-ui, audit collection/runner plumbing and host/version metadata. Existing numerical loading solver before audit entry points, RC, report renderers/templates, native VBA and ExcelBridge are byte-identical to E2.213. Section A/B report layout/text/formulas as presented/number formats/diagrams/print settings are unchanged.
- Windows host 2.214.0.0 rebuilt; ZIP entries verified against app/source; old release packages retained. Existing 8783 preview receives new assets without forcing reload or opening tabs; no-store response and GitHub asset digest verified.

No native Excel recalculation/printing claimed; earlier native validation limitations remain in release208.md.
