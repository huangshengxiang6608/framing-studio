# E2.230 — Combined acceptance criterion for size recommendations

Baseline: E2.229, fb68413495b7455fd7927831cc86f432962403e5.

SB/TB suggestions require RC success AND either the current Section A span/depth
check or the existing short-term uncracked deflection check (strict delta < L/250).
This uses the user's Section A method; it does not substitute a new COP L/d method.
The RC/shear-link, Section A and deflection calculation methods are unchanged.

Members with RC success but failures on both serviceability paths are now eligible
for suggestions. SB depth increases in existing 50 mm steps up to the most
restrictive shared-floor/local Structural Zone before width increases. TB trials
retain the existing full-zone depth-first mode before trying widths. Every trial
recalculates geometry, self weight and transfer. Shared SB common sizes are checked
again on all SBs before application is offered. Unknown required inputs or infeasible
sizes yield a reason instead of a valid recommendation. Applied/pending ordering,
undo and explicit recheck workflow remain intact.

Validation:
- size-criterion230.cjs: all eight RC/Section A/deflection combinations, strict
  L/250 equality, unavailable data; actual SB and TB sizing with controlled
  deflection summaries; Section A-only and deflection-only acceptance routes;
  RC-pass members receive advice when both other checks fail; width follows depth.
- sb-advice220, tb-apply222: actual solver, shared/local zone constraints,
  immutable trials, common sizes, absent inputs, no feasible size, atomic apply.
- batch228, treatment229: mixed recommendations, sequential apply, filters,
  pending status, sorting and undo.
- incremental228: full/incremental equality across changed inputs and sizing trials.
- beam-filters214, check-sync226: load/span/deflection and synchronized report data.
- DesktopOnly compilation; exact embedded module check and ZIP validation;
  unchanged report functions, all other tracked app files and native Excel/VBA
  assets verified against baseline. Browser DOM tests run offline; preview version
  and no-store HTTP response verified without forced reload or storage changes.

Saved-project regression: cloned 新项目.framing (68).json, set the F03 SB starting
dimensions to 250 × 600 mm, and ran the complete recommendation search. The
common recommendation was 250 × 750 mm for all 82 SBs, within a 3200 mm zone.
All 82 passed the new acceptance criterion after applying it to a clone. SB51
had RC OK, Section A ratio 20.0083333333 > 20, and short-term deflection
41.9462352551 mm < 49 mm. Thus it passes through the deflection alternative.
Incremental and uncached full audit results after application were exactly equal.
The original saved project and unsaved browser state were not modified.
