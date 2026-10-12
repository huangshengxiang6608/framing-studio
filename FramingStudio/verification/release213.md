# E2.213 verification — 2026-10-10

Baseline: E2.212 commit 9fe6cf4fcc82d3e66b376607a82a19e0160cb091. Official main/release and PR #8 head checked before work and publication; no unknown updates.

Summary display only: restore original Section A Span/Depth title, ratio/limit, span/depth and reason. An original NOT OK is orange (#b85c00) only when the existing approved short-term deflection alternative passes. Deflection OK/not passed and numeric L/250 inequality follow the original result. Both failing remains red; stale remains pending/amber with no old deflection inequality. Section B, filtering, thresholds and stored original results do not change.

Verification used the existing deflection-criterion212-ui.cjs isolated-browser harness, with temporary additional assertions for restored Span/Depth/ratio/limit, orange accepted original failure, green deflection OK, correct text ordering, and red unresolved failure. Original UI tests also pass for strict equality, independent RC failure, status filter, locating, missing/stale suppression, no input mutation and no page errors. Narrow screenshot reviewed. No new numerical tests needed: no numerical changes.

Bundle changes restricted to explorer-ui.js and version labels. All 36 modules match source. All other existing app files outside host/version updates byte-identical to E2.212, including beam-load solver, loading/RC, native VBA, ExcelBridge and both Section A/B report copies/templates. Their wording, formatting, diagrams, table geometry, print settings and pagination remain untouched.

Windows host rebuilt as 2.213.0.0, all ZIP entries verified against app/source. Existing 8783 preview updated with no-store HTTP without forcing reload or adding a tab. PR head and uploaded asset digest verified. Earlier native Excel validation limitations remain; no native Excel rerun claimed.
