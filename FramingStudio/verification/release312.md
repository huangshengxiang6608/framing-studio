# E2.312 — Clearer column update control

The column settings panel now places the follow-grid control in its own full-width row, with a readable label/help text on the left and a sliding toggle on the right. Default B/D fields occupy a separate equal-width row. Styling is scoped to this panel; the existing checkbox, state and update handler are unchanged. The native checkbox remains keyboard-accessible, with a visible focus outline and reduced-motion support.

Validation:
- Verified visually in the existing browser tab at 1058 x 704; no new tab was created. Toggle row and B/D fields align without horizontal overflow.
- User approved backing up the current project and refreshing the same tab. Backup completed before reload; the original model remained available.
- Space-key toggle changed to fixed positions; one undo restored automatic following. Saved project JSON after the test exactly matches the backup before refresh.
- No browser errors observed. app.js syntax checked; desktop launcher compiled.
- Changes to app.js are limited to the column settings markup. Geometry, calculation, reinforcement selection, Excel/VBA/templates/formulas and Section A/B rendering/formatting are byte-identical to E2.311. Embedded HTML outside this markup, scoped CSS addition and version strings is unchanged.
- Existing localhost port 8783 remains in use. The original model tab is retained and visible.

Windows app/source package supplied as an E2.312 prerelease; existing upstream PR #22 updated, with no upstream merge.
