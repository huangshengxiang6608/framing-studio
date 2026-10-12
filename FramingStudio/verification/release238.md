# E2.238 — Current beam RC calculation values

Baseline: PR #8 E2.237 a7749e366d8e489e93e1ece0435b25c9bc5a9639. Official main 5d18359d7110709b14fcecf431e23b88509791f6 and latest official release v2.203 checked before work and publication.

The Member Check reinforcement card now displays effective depth d (mm), bending coefficient K (dimensionless), and beam shear stress v (N/mm²). These are the existing G29, K30 and K51 calculation results, formatted with the existing display helper. No formulas are reimplemented. The display follows current member draft evaluation; invalid or missing values show pending instead of stale or zero values. The responsive panel sits above the diagram.

Validation:
- Member Check DOM integration passed, including three pending metrics before calculation, exact live-result display, immediate effective-depth changes after reinforcement changes, and clearing stale metrics for invalid input.
- Live RC tests passed for MB, SB, TB and CB; displayed values match their existing calculation cells.
- JavaScript syntax, Windows desktop build and diff checks passed.
- Package verification compares unrelated tracked app files byte-for-byte against E2.237, including calculation code, report renderers, workbook and Excel/VBA. Section A/B report content and layout remain unchanged.
- Existing preview on port 8783 is updated without forcing a reload or modifying project/browser storage. Deployment verifies exact served bytes and no-store caching.
- DOM tests were performed offline; no live-browser visual inspection claimed.
