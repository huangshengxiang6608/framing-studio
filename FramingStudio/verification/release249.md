# E2.249 — automatic floor-group application

Baseline: E2.248, f86306bf6903fb57f72707f9d6d0578724ab234e. Official main,
latest release and PR #8 checked before modification; no intervening changes.

Completed floor-group changes (select change or leaving a numeric field) now
call the existing validated applyGroups transaction automatically. The same
applies to total-floor edits and completed deletion of a group. Individual
keystrokes do not repeatedly rebuild the model.

Incomplete new groups, overlapping/gapped ranges and invalid heights remain
drafts with a visible reason. The last valid model is retained until all ranges
are complete and existing validation succeeds. Pending drafts retain retry and
cancel actions; valid edits no longer need a separate Apply button. Transactions,
reconciliation, dimension checks, local-height synchronization, undo and save
validation are retained.

Added a short explanation of blank Framing creation: it carries the current axes
and building footprint without beams/columns/walls. Creation behavior is unchanged.

Validation:
- floor-auto249.cjs executes the production change/add/delete/undo/apply handlers
  and transaction with the actual engine, isolating only drawing/persistence.
  Automatic height, headroom, E&M, FRR, Framing and total-floor updates pass.
  Incomplete ranges, overlap/gap rejection, invalid heights and FRR, correction,
  cancellation, undo and save/reopen preservation pass. Existing save still
  rejects invalid pending groups.
- Existing fire241 regression passes, covering floor FRR, width limits, slab
  minimum, reload, validation rollback and downstream cover/check values.
- JavaScript syntax, desktop build and package checks pass. Bundled HTML is the
  previous version plus only the app.js replacement and version label change.
- All report renderers, Section A/B layout/content, Excel/VBA and templates are
  byte-identical to E2.248. No report presentation changes.

Preview remains on 8783 with no-store caching; no user input/storage replacement
or forced browser refresh.
