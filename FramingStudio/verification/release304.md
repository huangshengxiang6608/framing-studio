# E2.304 — Keep secondary beams attached when a primary beam is resized

Changing an inset MB width could move its centreline onto an old coordinate-based SB suppression record. The same secondary beam could disappear at one width and return at another. Width edits now freeze the visible secondary topology and retain receiver identities for each attached endpoint. Only physical endpoints follow the resized primary; member IDs, logical input references, spacing and manual dimensions remain intact.

Explicit single-member and batch deletions retain a separate deleted snapshot record, with the same receiver identities. Regeneration checks these records at their current attached positions, so resizing does not restore a deleted SB. Legacy suppression records are preserved conservatively; this update does not automatically restore previously absent secondary beams. Explicit secondary-layout rebuilding remains the existing user-controlled operation.

Validation:

- 64 synthetic combinations: both orientations, manual/automatic secondary beams, four widening/narrowing widths, no deletion, single deletion, batch deletion and deleting the whole secondary set. Verified identities, spacing, endpoints, member inputs and save/reopen.
- Current project tested through repeated 300/400/500/600 mm edits: 43 existing SBs stay 43; four legacy deletions stay suppressed. A diagnostic copy with all 47 saved SBs visible also retains all 47 across the same widths.
- Actual isolated browser operations on the current project: MB_4 300 → 600 → 300 mm retains 88 total beams. Deleting SB41 then repeating 600 → 300 mm retains 87; opening the saved file also retains 87. Exported geometry confirms surviving SB ends coincide with the MB centreline and remain connected.
- Prior CB-tip/span, column-following, beam-network, beam-type, cantilever-support, centred/offset wall snapping, wall-boundary, secondary-bay, geometry consistency and wall-copy regressions pass. Genuine overlap and Opening-crossing guards remain enabled.
- Existing loading/RC/reinforcement modules, Excel workbooks, VBA/bridge and original Section A/B rendering are byte-for-byte unchanged. Bundled HTML outside the geometry module and version label is preserved. No engineering formula, reinforcement-selection rule or report layout change.

Based on E2.303 (`10e7c35`); retains the E2.302 exterior-wall, E2.303 CB-tip and previously integrated PR #23 UI-scaling changes. Current project data and screenshots are local validation artifacts and are not included in the repository/package. The existing localhost preview is updated in place without forcing the user's original tab to reload.
