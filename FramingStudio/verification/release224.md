# E2.224 verification — 2026-10-11

Baseline E2.223 ef9393cde98c6537bd4de054f71e161631196279. Official main 5d18359d7110709b14fcecf431e23b88509791f6, release v2.203 and PR #8 checked before editing; no remote-only updates.

Drawing-only closure fix uses original member centreline endpoint-to-interior contacts to identify a supporting primary beam. An incoming non-CB member no longer erases that support's outline. Incoming member sides still trim against its support. Crossing, collinear and corner contacts do not acquire this priority; CB precedence stays unchanged. Applied only when drawingOffsets191 is supplied (geometry/review canvas, printing and SVG). Functional geometry and report rendering without drawing offsets are unchanged.

The column inspection schedule removes its upper-load header/cells, retaining floor, area, current and cumulative DL/LL. Cumulative values still include upper loads; diagram and calculations are untouched.

Validation:
- closure224.cjs verifies the 1500 mm junction after a 750 mm move in both axes/endpoint orders, incoming-side trimming, exclusions and immutable model.
- drawing-support197.cjs updated only to allow the newly authorized support-outline priority; other geometry, loads, native report, restore and reload assertions pass. drawing-cb198.cjs, review192.cjs and review193.cjs pass.
- User-supplied project reproduced offline: F04 MB14's lower edge now spans x=19.5–21 at y=14.5. All non-review member/report shapes match E2.223 exactly; project unchanged. C1 column panel renders 25 real schedule rows, four cells per row and no upper-load column.
- Exact source/bundle verification and protected-file comparison preserve engine/loading/RC modules, Section A/B report renderers, workbook templates and native Excel/VBA. Windows host rebuilt at 2.224.0.0.
- Live browser visual checks are unavailable due browser URL policy; no workaround used. Native Excel recalculation was not run for this display-only change. Existing preview updated without reload or storage changes.
