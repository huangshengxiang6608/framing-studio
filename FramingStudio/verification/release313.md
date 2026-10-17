# E2.313 — Grid-cell selection for no-column zones

The Regions page offers **自由矩形** and **軸網格選** for no-column input. Free rectangles remain the default and retain their existing draw/erase/coordinate-edit behavior. Grid mode supports clicking one architectural grid cell or dragging through cells, including intervening cells crossed by a fast pointer move. Repainting is idempotent. Grid erase/all/clear operate only on grid-created rectangles and preserve existing free rectangles, even when they overlap.

Grid selections are saved as ordinary no-column rectangles with a source marker. The existing exclusion rules are reused unchanged: interior points are excluded from automatic column placement; boundary/corner points remain eligible, and existing manual-column conflicts follow the original checks. Drawing cancellation rolls back a grid stroke; a completed stroke is one undo operation. Building/Opening inputs and other Framing data are unchanged.

Validation:
- Actual current project tested in the original 8783 browser tab; no new tab created. Saved a fresh backup before reloading the same tab.
- F02 had three existing free rectangles. Clicking one cell saved its exact 5–47 m by 0–5 m bounds. Dragging across five cells and erasing the first retained four grid rectangles and all three original free rectangles.
- All/clear grid selection and six successive undo actions worked. Free rectangle dragging was separately exercised and undone. Final saved project JSON exactly equals the pre-refresh backup.
- no-column-grid313.cjs passed: click, continuous drag, erase, all/clear, duplicate prevention, free-zone preservation, outside-grid and diagonal-corner handling, save/reopen, and full Engine.generate output parity against equivalent ordinary no-column rectangles.
- app.js syntax and diff checks passed; no browser errors observed; Windows desktop launcher compiled.
- Changes are limited to region input UI/helpers and version metadata. Geometry/calculation engine, reinforcement selection, Excel/VBA/template/formula files and A/B report rendering/formatting remain byte-identical to E2.312. Embedded HTML outside the two changed modules and version strings is unchanged.

Windows app/source delivered as an E2.313 prerelease through existing upstream PR #22. No upstream merge performed. Original model is restored; existing tab remains on the Regions / no-column grid-selection controls.
