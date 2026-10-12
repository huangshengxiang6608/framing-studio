# E2.240 — Member FRR and actual cover

Baseline E2.239, PR #8 head 5af5c738ce218dde93b7e9d78ef3b627f4d022f8. Official main 5d18359d7110709b14fcecf431e23b88509791f6 and latest official release v2.203 checked before work and publication.

Member Check adds FRR and actual cover directly after effective depth in the existing responsive calculation panel. Ordinary beams/CB use shared fire settings; TB uses its own tbFire setting. Actual cover is read from current RC calculation input G16, not inferred from FRR. The display distinguishes FRR-derived cover from a manual override. Missing/invalid current results do not display a stale cover.

Validation:
- Existing Member Check DOM integration passed, including live metrics and the newly displayed FRR/cover.
- rebar-cover240.cjs passed for MB/SB/TB/CB, FRR 1/2/4 h, automatic/manual cover, field order and unavailable/invalid values.
- Syntax, Windows desktop compilation and diff checks passed.
- Package guards byte-verify unchanged calculations, report rendering, workbook, native Excel/VBA and unrelated tracked files. Section A/B report content and layout are preserved.
- Existing preview at port 8783 is updated without forced reload or storage changes; served bytes and no-store caching are verified. No live-browser visual verification claimed.
