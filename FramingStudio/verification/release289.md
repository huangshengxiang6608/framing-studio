# E2.289 verification — 2026-10-16

Baseline: official main/release E2.288, `6410f2f4c6c0c7058b0757059a18cdd2e057a645`. Main, latest release and open PRs were checked before development and again before publishing; no intervening changes were present.

## Changes

- Remove the separate Column grid panel. The existing per-Framing Column Spacing X/Y fields generate evenly divided light-purple reference axes across the outer architectural bounds. Use floor(length/minimum) divisions so reference spacing is at least the input, except when the entire extent is smaller than the input, where only its bounds exist. Hide references coincident with blue axes to retain their blue appearance.
- Automatic columns use only user-entered blue-axis intersections. Reference axes and saved legacy independent grids do not generate columns. Blank inputs generate no supplemental references. Existing physical centre offsets, same-row/column minimum-distance filtering, manual mode, manual placements, exclusions and shared-Framing behavior remain.
- Preserve manual beam snapping to visible reference coordinates without manufacturing a column or structural support. The grid-snap regression now supplies the reference grid using Column Spacing instead of the removed independent-grid control.
- Apply automatic deletion exclusions after minimum-spacing selection. This prevents deletion from repopulating nearby candidates that were previously rejected by spacing. Retain deleted automatic positioning records as spacing reservations; explicit re-layout remains available. Deleting a manually added column at a blue intersection also suppresses its automatic replacement.
- Unify single, popup and multi-column deletion, clear stale selection, and prevent an edited field's blur event from replacing the delete button before its first click. Keep one-step Undo and other-floor reference protection.

## Reproduced deletion causes

On E2.288, deleting the first automatic column in a spacing-filtered grid removed its exclusion before candidate filtering, allowing nearby candidates to appear in its place. In another real-browser reproduction, editing a column dimension then clicking Delete caused the input change to rerender the panel, losing the first delete click. Both scenarios now pass dedicated tests, including saved project reopening.

## Verification

- Column-spacing domain tests passed: blue-only automatic columns, evenly spaced reference axes, blank/independent X/Y values, actual centre distances, equality, manual-position rejection, shared floors, other Framing isolation, openings, exclusions, deletions, manual dimensions, manual mode, save/load and all automatic single deletions preserving the other selected columns.
- Real headless Chrome checks passed for spacing inputs, rollback feedback, Undo, reference-axis rendering and visibility, first-click deletion after editing, single/popup/batch/all deletion, no automatic replacement, shared floors, save/reopen and upper-floor reference protection. No page errors occurred. The final E2.289 screenshot was visually inspected.
- 96 regression programs ran: 83 passed; 11 reproduced existing assertion failures on pristine E2.288; 2 require missing historical local fixtures. All 13 non-passing logs matched pristine E2.288 after repository-path normalization. No failed test is reported as passing. See `release289-results.json`.
- The 11 inherited assertion failures are audit-performance247, check-sync226, compression-count269, equal-layers268, member-navigation248, rebar227, representative250, sb-advice220, summary-rc216, column-deferred-boundary and column-delete-many. The added older column-delete-many regression expects beam geometry/kind to stay identical after deleting supports; E2.288 already reclassifies/reanchors some beams. This separate existing beam behavior was not changed in this column-only update. column-centres159 and column-outline160 lack their historical fixtures.
- All 36 marked bundled modules match source; the unmarked floor-tools101 module also matches. Production source and bundled JavaScript parse. Apart from app.js, engine.js and floor-tools101.js, all 63 JavaScript modules are byte-identical to E2.288. Existing UI CSS, ExcelBridge source/binary, RC workbook and template manifest are byte-identical.
- Windows desktop compilation succeeded at 2.289.0.0 using DesktopOnly. ExcelBridge was not rebuilt. Native Excel/PDF generation was not rerun. Section A/B report rendering and templates remain unchanged; requested model changes can update existing result fields.
- Reuse the existing preview at http://127.0.0.1:8783/ without forced reload or storage reset. Packaging verifies its served HTML matches the final app and uses no-store.

## Reproduction

Use Node with linkedom/playwright and installed Chrome, Python 3, PowerShell and repository history:

```text
node FramingStudio/source/tests/column-spacing258.cjs
node FramingStudio/source/tests/grid-snap217.cjs
node FramingStudio/source/tests/column-spacing258-ui.cjs
node FramingStudio/source/tests/column-delete289-ui.cjs
node FramingStudio/verification/release289-integration.cjs --static-only
node FramingStudio/verification/release289-integration.cjs
```

The complete runner intentionally returns nonzero for inherited failures/missing fixtures. The release archive includes the Windows app, tracked source, SHA256 manifest and verification record; historical folders and unrelated local untracked user files are preserved.
