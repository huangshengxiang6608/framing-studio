# E2.231 — Member deflection and selection freshness

Baseline E2.230: f03a988cd7c654d2eeee5aec81ace0d5d406c521.

The Member Check Section A card now shows actual (short-term uncracked) deflection,
maximum displacement, L/250 limit and pass/fail from the same solver as Summary.
Absent or stale calculation results show pending instead of presenting an old pass.

Check/A-copy/B-copy selections previously changed the complete project signature,
causing current RC results and automatic reinforcement to disappear. Freshness now
compares the inputs excluding only those three selection maps. Selected rows are
resynchronized with the current Check map, and scope-only changes preserve Summary
freshness. All other input changes still invalidate results. Report renderers and
report selection rules are unchanged.

Re-selecting the original AUTO mode no longer marks an unchanged card dirty.
Returning to original AUTO restores its calculated fields; genuine manual edits
remain pending until saved and checked.

Validation:
- Extended real rebar227 DOM test: current Check/A/B selection retains identical RC,
  bars and deflection; checked-row synchronization; selection undo; Summary stays
  fresh; no-op AUTO and returning to AUTO; actual input changes invalidate RC and
  deflection. Existing editing, saving, CB mapping and error tests also pass.
- check-sync226: concurrency, failure, cancellation and stale calculation guards;
  selected report scopes and unchanged native export preflight.
- batch228, treatment229: suggestion ordering, batch application, undo and filters.
- beam-filters214 and size-criterion230: independent results and sizing criterion.
- Desktop compiler, exact source embedding, package byte verification and protected
  files/report-function checks. No report, Excel/VBA or calculation formula edits.
- Offline DOM testing; preview verified by exact served bytes and no-store headers.
  No forced browser reload or project storage changes.
