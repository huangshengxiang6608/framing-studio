# E2.311 — Column placement actions and optional grid following

The column page replaces the auto/manual mode dropdown with **自動布柱**, **手動加柱**, and **隨軸網自動更新**. Automatic placement is a single action; manual drawing remains available with either checkbox state. Disabling following stores the current automatic-column layout so later grid or spacing changes do not regenerate it. A one-shot placement can update that layout while leaving following disabled. Existing projects retain their previous following/fixed state.

Manual additions, explicit positions, size overrides and deletion records are retained. Enabling following or generating once validates a trial project; incompatible protected positions or new overlap/boundary conflicts reject the operation with an explanation. Existing beam binding and synchronization are reused. The operation is undoable once, and activating the drawing tool does not create an empty undo record. Column-spacing labels/help distinguish automatic updating from fixed positions.

Validation:
- Current user project tested in an isolated visible browser copy, without changing or reloading the production tab/storage.
- With following disabled, entering X/Y spacing 7 m retained all 16 F01 columns; one-shot placement produced 4 columns and kept following disabled.
- Re-enabling/disabling following and six successive undo actions restored the original 16 columns. The saved restored project is exactly equal to the original project JSON.
- Manual-add button activates drawing without creating an undo record; old mode dropdown is absent. No browser errors observed.
- New column-controls311.cjs regression passed: frozen geometry, persistence, one-shot, resumed following, manual additions/positions/sizes, default-size restoration, deleted columns, legacy manual projects and atomic conflict rejection.
- Current-model offline checks additionally passed changed-axis fixed positions, other Framing preservation, manual addition/editing and conflict rejection.
- Existing column-spacing258.cjs and column-transform308.cjs passed, including connected MB endpoints and retained manual widths. The older Playwright-based column-mode harness could not run because its dependency is unavailable; actual UI verification used the connected browser instead.
- app.js syntax checked; Windows desktop launcher compiled.
- No calculation or reinforcement-selection equations changed. All preexisting files outside the column UI/geometry modules, embedded versions of those modules and launcher/version metadata are byte-identical to E2.310. Remaining HTML is byte-identical after version normalization. Native Excel/VBA/templates/formulas and Section A/B rendering/formatting are unchanged.
- Preview remains at port 8783 without forced reload. Keep the user's right browser panel visible and retain existing model/pending inputs.

Delivery: Windows app and source are included in the E2.311 prerelease package; update existing upstream PR #22. This is not an upstream merge or official release.
