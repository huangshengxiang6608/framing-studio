# E2.239 — Preserve automatic shear-link leg counts

Baseline: E2.238 e4701126f97fb95e43060641140fc196407c5174. Official main 5d18359d7110709b14fcecf431e23b88509791f6 and latest official release v2.203 checked at start and before publication.

Automatic E58 was derived by the calculation engine but omitted from the returned steel object. The editor consequently used its default two legs; subsequent manual draft evaluation and saving used that incorrect value. Beam results now explicitly return the computed E58. The editor also recovers E58 for older cached beam results using the unchanged engine getter. Explicit manual values, including two legs, take priority.

Validation:
- Exact TB reproduction: 18 legs T16@175 exports E58=18; required Asv/s=20.437 and provided=20.681, N59=OKAY. Explicit manual two legs retains E58=2 and correctly fails with provided=2.298.
- rebar-legs239.cjs: all four beam types, missing-E58 cache recovery without cache mutation, unrelated reinforcement edits, JSON save/reload and manual-override preservation passed.
- rebar227.cjs: actual editor fields, old cached results, editing another rebar field, save/reload and restore AUTO preserve derived leg count; existing DOM checks passed.
- rebar-live237.cjs and link-spacing233.cjs passed.
- Syntax, Windows desktop compilation and diff checks passed.
- Calculation change is limited to including existing computed E58 in the exported steel object; the getter, selection logic and formulas are unchanged. Section A/B report renderers, workbook, native Excel/VBA and unrelated app files are byte-verified unchanged.
- Existing preview updated on port 8783 with exact served-byte and no-store checks; no forced tab reload or storage modification. No live-browser interaction test claimed.

Existing projects with an explicit saved E58=2 retain that manual value; restoring automatic selection obtains the current computed reinforcement.
