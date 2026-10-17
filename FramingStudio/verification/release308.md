# E2.308 — Move and copy columns within the current Framing

Add **07 柱移動／複製** immediately after **06 柱**. Later navigation entries shift by one (Section A/B are now 18/19; their report contents are unchanged). Select one column or drag a selection box, then move the actual centres left/up/down/right by a distance in metres or copy them by ΔX/ΔY. Positive X points right and positive Y points down, matching the plan coordinates. All floors sharing the current Framing update together.

Moves reuse existing column support bindings and beam-following geometry. Copies keep the original columns, retain section dimensions and size modes, and allocate new IDs without duplicating beams or prior RC checks. Operations are atomic, undoable and saved through the existing project/backup flow. Invalid values, overlapping columns/walls, forbidden zones and out-of-bound sections reject the entire batch. A move that would leave a connected primary beam detached or unable to remain orthogonal is rejected with the beam ID and a suggestion to select the related row of columns. Existing geometric warnings remain visible.

Validation:

- `column-transform308.cjs`: four directions, positive/negative offsets, batch copies, actual centres and sizes, shared-floor scope, other Framing isolation, manual beam width and connected endpoints, atomic failures, auto mode, suppressed columns, saved column inputs and Check/A/B selections, project reopening.
- Current user model, F02: moved the five left-column centres from X=0.75 to 0.85 m and back. All 21 columns and 83 beams remained. Copied AC1 by (+2,+2) m to C4 at (2.75,2.75) m with the original 1500×1500 mm section. Other Framing inputs remained unchanged.
- Actual browser actions on an isolated copy of that model: single selection, drag selection of five columns, four direction buttons, copy, boundary rejection, navigation search and full undo. The exported project after undo exactly matched the original export.
- The inward 0.1 m edge-column move correctly exposes the existing 5.0 m² unclosed slab-edge warning; moving back removes it. A new copied column correctly requires its lower-floor support relationship to be reviewed. These warnings are not marked passed or suppressed.
- Existing `column-position257.cjs`, `cb-column-follow298.cjs`, `mb-column-follow299.cjs` and `secondary-fullspan307.cjs` regressions passed. Legacy Playwright test scripts were unavailable in this environment; equivalent affected UI operations were exercised through the connected browser.
- Windows desktop compiled successfully. Original workbook/VBA, native Excel bridge, calculation/selection modules, and Section A/B report rendering remain byte-for-byte unchanged. Bundled HTML changes are limited to the app UI, column edit helper and version labels.

The original browser tab and its model were not reloaded or replaced. The existing localhost preview is updated for the next user refresh. The private model is not included in the source or Windows package.
