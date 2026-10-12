# E2.218 verification — 2026-10-10

Baseline: E2.217, eaecaa344dddb98bea523a086037f7e1d35307d4. Official main 5d18359d7110709b14fcecf431e23b88509791f6, official release v2.203 and PR #8 were checked before editing; no remote-only updates were found.

The per-Framing SB table now includes default B and displays the effective width immediately. An optional `sbWidth` value overrides the common SB width for that Framing only. Clearing the field removes the override. Both manual beams following defaults and automatic/frozen SB layouts consume the same value; explicit individual beam widths are retained. New manual drawing and the existing reset-size operation use the same fallback. Values outside 1–20000 mm are rejected by project validation, with the existing transactional rollback/input feedback and undo behavior.

Validation:
- `sb-width218.cjs`: manual, automatic and frozen SB widths; shared floors; isolation of other Framing types; explicit member overrides; reset to Framing default; common-default fallback; save/reload roundtrip; invalid inputs; unchanged primary beam geometry/dimensions.
- `grid-snap217.cjs`, `beam-filters214.cjs` and `summary-rc216.cjs` pass, including actual beam creation, original Section A/B and load-transfer fixtures, deflection closed forms/thresholds, independent RC results and filter defaults.
- Only engine.js (SB default resolution/validation), app.js (parameter inputs and drawing fallback), their bundle copies, version metadata and desktop host change. Original report renderers, templates, Excel/VBA, RC formulas and Summary classification remain unchanged. Result values may reflect user-entered SB width changes.
- Windows host is rebuilt as 2.218.0.0. All package entries and source/bundle consistency are verified. The existing 8783 preview is updated with no-store responses and no forced browser refresh. Native Excel recalculation and printing were not performed; no new browser tab was opened.

The user's current F03 MB_1 issue was inspected through the existing preview: the displayed reason is beam width 1500 mm exceeding the connected-column width limit 1000 mm. Its Section A ratio 4.5 < 20 and short-term deflection 0.369… < 48 mm pass. No check rule was changed in response to that inspection.
