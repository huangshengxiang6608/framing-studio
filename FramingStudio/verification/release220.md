# E2.220 verification — 2026-10-10

Baseline E2.219 d3d41afe1a1efbb13ac8e8637d21515fc3980cf5. Official main 5d18359d7110709b14fcecf431e23b88509791f6, release v2.203 and PR #8 head were checked before editing; no remote-only updates found.

Summary Check optionally computes SB recommendations. It searches common physical members across every shared-Framing floor, increasing depth by 50 mm (including the exact zone cap), then width under the existing automatic sizing cap. Trials clone the project and rerun geometry, self weight, load transfer and unmodified Section B. RC uses the existing Summary structural criteria, independent of L/d and dimensional advisories. Manual loads and reinforcement remain intact.

The maximum B and D includes existing larger SBs, and is separately recalculated for all SBs in the Framing. Incomplete input, a lower local/shared-floor depth allowance, changed beam inventory, unsuccessful geometry/application or exhausted sizing limits prevent an actionable common suggestion. Apply updates all current SB widths/depths and Framing defaults together through the existing undo transaction, clears stale results, and requires a fresh whole-building check. No model edits occur while producing recommendations. Uniform SB success does not certify receiving primary beams; the whole-building check must be rerun.

Validation:
- sb-advice220.cjs: real RC failing beam, depth first, width only at depth cap, no feasible dimensions, self-weight recalculation, common maximum across differing shared-floor loads, existing larger members preserved, all manual overrides, generated/frozen SBs, immutable search, atomic over-limit rejection, local zone, 28 shared floors/cooperative yields, save/reopen and undo snapshot, HTML presentation and stale controls.
- width-advisory219.cjs, sb-width218.cjs, summary-rc216.cjs and beam-filters214.cjs pass, including dependent A/B, slab/support/transfer, short-term deflection and independent filter regressions.
- Package validation checks exact source/bundle equality, preservation of the original numerical Loading solver and original BeamSizing83 implementation, and byte identity of protected existing files including engine, Section A/B report renderers, Excel/VBA/ExcelBridge and workbook templates. Windows host rebuilt at 2.220.0.0; ZIP entries and uploaded digest verified.
- Native Excel recalculation/printing and live browser interaction for new controls were not run. UI output was tested by rendering its actual function; existing browser storage and unsaved input are preserved without forced reload.
