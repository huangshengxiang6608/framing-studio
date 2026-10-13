# E2.257: edit reference positions for selected columns

Baseline: official E2.256 main `b07f04a6ca4fe84940a8071f316aae85e3a688d0`, including PR #9 integration verification. Remote main/releases/open PRs were checked before work; the two commits newer than local E2.256 were fast-forwarded before editing.

The multi-column table now exposes the same reference-position choices as the single-column editor. A row change applies immediately. A separate batch position selector applies to selected current-floor columns in one transaction, preserves B/D and dimension modes, and propagates through their shared Framing. The batch uses the existing axis-position records, placement rules and beam-column binding. It checks the final arrangement together, allowing touching columns to move together without rejecting an intermediate arrangement. Boundary/wall/column conflicts reject the entire edit. Stable column identities retain selection, saved member inputs and Check/A/B flags. A single Undo restores the prior project.

Validation:

- `source/tests/column-position257.cjs`: all nine positions plus reset agree with single-column geometry; current-floor protection, shared floors, unselected columns/Framings, touching batches, atomic boundary/wall/overlap rejection, automatic columns, saved inputs and Check/A/B selection, project reload.
- `source/tests/column-position257-ui.cjs`: actual browser row/batch controls, immediate update, dimensions/selection retained, one Undo, save/reload, reset and rejected batch. No browser errors. Narrow side-panel screenshot inspected; position dropdowns remain visible.
- Existing `column-multiselect.cjs`, `column-parameter-table.cjs` and `column-anchors174.cjs` passed. The table test's outdated blank-B assertion also failed on the unmodified official baseline; updated it to verify the existing E2.201 behavior (restore default size/mode), unchanged D and one Undo.
- All existing app files outside the declared UI/edit helper, version/desktop metadata and refreshed test are byte-identical to baseline. Calculation engines, Section A/B renderers, Excel/VBA, ExcelBridge and workbook templates are unchanged. Bundled content outside the two edited modules and version labels is unchanged.
- Windows desktop host rebuilt as 2.257.0.0. The release ZIP contains current app and source and is verified per file. Native Excel recalculation/printing was not rerun because those files and formulas were not modified.

Editing a column's physical position can change derived geometry and subsequent calculation inputs. This update preserves the calculation rules and report format; it does not promise identical numerical results after an intentional position change.
