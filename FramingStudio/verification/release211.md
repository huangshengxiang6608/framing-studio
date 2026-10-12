# E2.211 verification — 2026-10-09

Baseline: E2.210 commit 40e720dc5f85a3874641ded0174019556c4325f5 on existing PR #8. Official main 5d18359d7110709b14fcecf431e23b88509791f6 / release v2.203 and PR head checked before work and before publishing. No unknown remote updates.

## Scope

The user explicitly chose to show maximum deflection, location and assumptions alongside the existing A/B results, retaining both original verdicts. This is not permission to replace a failed span/depth check with a short-term gross-section pass.

The UI supplies a read-only optional beam summary callback to the cooperative audit runner. It consumes the completed audit loading snapshot, including resolved self weight, automatic/manual/extra line and point loads and saved span. Right-root CB schedules are converted back from root-based to raw-A coordinates, then the same screen orientation and E2.210 solver are used. Only scalar summary values are retained; no project data, loads, RC result, report output or pass/fail decisions change. Default audit callers retain their original output exactly.

The UI shows maximum absolute displacement in mm and x in m from the labelled left/top A/B end, matching the member graph. Expandable assumptions show characteristic DL+LL, uncracked constant rectangular BD³/12, simple/confirmed-root cantilever model, span, section, grade and HK Concrete COP Table 3.2 For general use E. It explicitly excludes cracking, creep, shrinkage and support movement. No deflection limit or code pass is inferred. Missing loading, support or material displays pending, never zero as a substitute. Stale results are hidden until recomputation, including after batch changes. Existing A/B filtering and problem-list membership are preserved; both-pass members remain omitted.

## Validation

- summary-deflection211.cjs includes summary-sections205 regressions: all four A/B combinations, report ratio/limit and RC status parity, A-only failure retained, both-pass omitted, slab/support/transfer checks and no project/report-selection mutation. Added tests compare original audits with enriched audits after stripping only the companion; actual loading fixtures match independently reconstructed graph schedules. Independent UDL and CB tip-load closed forms cover either fixed end and reversed vertical coordinates, grade routing and missing inputs.
- summary-deflection211-ui.cjs extends the original isolated Summary UI harness: real audit rendering and A/B verdict preservation; sync/async enriched audit parity; maximum/location/assumptions; pending and stale-value suppression; filters and locate; no project mutation/page errors; narrow viewport screenshot reviewed.
- Existing deflection210.cjs and diagrams207.cjs pass (closed forms, partial loads, both CB roots, extrema, equilibrium, materials, scaling and invalid inputs).
- Bundle restricted to beam-load-ui.js, explorer-ui.js, loading.js audit callback plumbing, audit-runner132.js and version labels. All 36 marked modules match source. All other existing app files outside host/version updates byte-identical to E2.210, including protected reports, native VBA, ExcelBridge and workbook templates. Loading solver before audit entry points remains byte-identical.
- Windows host rebuilt as 2.211.0.0. ZIP entries verified against current source/app. Preview updated on the existing 8783 address with no-store response and no forced user-tab reload. GitHub asset digest checked after upload.

Section A/B report wording, formulas as presented, table geometry, number formats, diagrams, print settings and pagination are preserved. No native Excel execution is claimed; earlier Excel validation limitations remain documented in release208.md.
