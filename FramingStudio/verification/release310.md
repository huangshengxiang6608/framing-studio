# E2.310 — Direct column-spacing entry

Column spacing X/Y fields use direct decimal text entry without spinner arrows. Clearing a field removes that direction's optional restriction. Enter or leaving the field commits through the existing validation/generation transaction. Change and focusout share a no-op guard so one edit creates one undo record. Preserve the spacing panel during its transaction to keep the clicked input, caret and tab order alive instead of replacing the fields. Invalid text or range values remain visible with an unapplied-input error.

Validation:
- Current user model tested in an isolated browser copy; production tab/storage were not modified or reloaded.
- Single click, keyboard Backspace clearing, decimal entry, moving X to Y and Tab to the next Framing field verified.
- Invalid alphabetic entry rejected with an inline error; subsequent correction accepted.
- Clearing both F01 directions persisted with no columnSpacing258 record; original gridline placement restored 16 columns from 4. Original engine rules are unchanged.
- Three valid edits required exactly three undo operations. Exported restored model equals the original project JSON.
- Existing column-spacing258.cjs checks passed; app.js syntax checked; Windows desktop launcher compiled.
- All preexisting files outside the UI controller, embedded controller and version/launcher metadata are byte-identical to E2.309. HTML outside the controller and version strings is unchanged. Calculation, selection, native Excel templates/formulas/VBA and A/B report rendering/formatting are preserved.
- Preview remains at port 8783. Do not force-reload the user's tab; retain unsaved inputs. Keep the right browser panel visible during future work, per user preference.
