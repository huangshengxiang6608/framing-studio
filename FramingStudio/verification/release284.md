# E2.284 — Automatically save completed beam reinforcement edits

The Member Check beam reinforcement editor no longer requires the Save reinforcement and check button. Completing a numeric field with Enter or leaving the field commits the edited arrangement; choosing a diameter commits immediately. Typing still previews locally, so a partially entered count is not committed on every keystroke. Empty/invalid fields, invalid link settings and horizontal clear spacing below 40 mm retain the previous stored arrangement and display the reason.

Commits use the existing project transaction, validation, local backup and undo history. The editor remains mounted during these transactions and incremental App checks, preserving input focus and drafts. Repeated blur without changes does not create an extra transaction. Rapid commits are serialized through the existing audit pipeline, whose snapshot checks reject stale results. Automatic selection can still be restored. Slab and column editors retain their existing save controls.

Automatic saving updates the current project and its browser backup; the existing Save Project command remains responsible for exporting a project file. It does not launch native Excel or generate A/B reports. Native verification remains separately stale after a model edit and retains its existing mismatch checks.

## Preservation

No changes to loading, RC calculations, automatic reinforcement selection, horizontal/vertical spacing rules, native Excel/VBA, templates, original formulas or Section A/B report formatting. Package verification compares all previously tracked app files byte for byte except the three UI modules, bundled HTML, version/desktop build metadata and the adapted UI regression. In particular `checks.js`, `loading.js`, `reports.js`, `rc-plan.js`, ExcelBridge and all original workbook assets remain unchanged from E2.283. No native workbook or PDF regeneration is claimed for this UI-only change.

## Validation

- `rebar-autosave284-ui.cjs`: empty/intermediate drafts, blur and Enter commits, diameter selection, duplicate blur, invalid 40 mm spacing/link input rejection, recovery, rapid edits with fresh final results, stale member protection and zero native Excel calls.
- `rebar-autosave284-browser.cjs`: isolated headless Edge runs the full packaged App; verifies real field focus/blur, App local backup, fresh checks, enabled Undo restoring the prior arrangement, and Restore Automatic. It does not connect to the user's browser or model.
- Updated `manual-spacing283-ui.cjs`: manual count above B/100 still saves through the new commit interaction; invalid spacing cannot be saved.
- Existing Summary App-only, Member native-verification dispatch, automatic/manual spacing, beam acceptance and full/incremental parity regressions pass.
- Desktop-only Windows build and ZIP integrity/preservation checks pass.
