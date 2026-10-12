# E2.217 verification — 2026-10-10

Baseline: E2.216, 5b9c22ab3dff9c2a35cef929dfcdebc9320342e1. Official main 5d18359d7110709b14fcecf431e23b88509791f6, latest official release v2.203 and PR #8 were checked before changes. No remote-only updates found.

All manually drawn beam types (MB, SB, TB and CB) can end at the horizontal or vertical projection of their starting point onto an architectural grid or a visible column grid. Hollow circles show these targets after selecting a start. Existing column/member/wall snaps retain priority. Projection coordinates do not create structural supports; ordinary beam classification and missing-support checks remain in effect. The original creation path still rejects invalid paths, openings and overlaps.

The default Summary selection now excludes PFP (Span/Depth passes, short-term deflection fails, RC passes). It remains selectable in the eight-combination table; the failed deflection result and status are unchanged. FFP and RC failures remain selected by default, together with pending cases with a known failure.

Validation:
- `grid-snap217.cjs` executes the shipped snapping functions and actual beam-creation branch against the real engine. Horizontal and vertical beam creation for all four types passes, with no fictitious endpoint column/support. Opening rejection, member snap priority, diagonal/too-distant rejection, zoom tolerance, hidden/visible column grids, deduplication and drawing-mode markers pass.
- `beam-filters214.cjs` passes all eight independent states, PFP default exclusion, pending categories, complete beam collection and unchanged audit classification. Its Section A/B, slab/support/transfer, short-term deflection closed forms and strict unrounded L/250 regressions pass.
- `summary-rc216.cjs` passes independent RC/deflection classification, structural failure/input guards and Summary HTML. The browser test fixture expectations were updated for the new default; no live browser reload or browser-driven test was run, preserving the user's unsaved preview.
- The bundle is verified against exactly the four changed UI modules and version update; all 36 marked source modules match. Calculation engines, Excel/VBA/ExcelBridge, both Section A/B report copies and templates remain byte-identical to E2.216. Native Excel recalculation/printing was not needed or performed.
- Windows host compiled as 2.217.0.0. Current app/source package entries are verified against disk. Previous packages are retained; preview delivery reuses 8783 with no-store caching, without forcing a page reload.
