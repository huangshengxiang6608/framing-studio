# E2.221 verification — 2026-10-10

Baseline E2.220 0020453c5a2a226836799fa875bd1690e92a0849. Official main 5d18359d7110709b14fcecf431e23b88509791f6, release v2.203 and PR #8 head checked before editing; no remote-only changes found.

TB structural RC failures show current D, local Structural Zone and whether depth is fully used. Each cloned trial restores the existing per-floor full-depth mode before increasing width in 50 mm steps up to the existing 20000 mm width input bound. All shared-Framing members at the same physical location are checked. Trials regenerate geometry and recompute full self weight, transfer and the existing Section B. Auto-identified TBs retain their underlying category and upper-column transfer. Missing inputs, changed inventory, incomplete width/depth application and exhausted bounds produce reasons instead of a passing recommendation. Advice does not mutate the live project. Existing SB advice and its apply action remain unchanged.

Validation:
- tb-advice221.cjs: real RC failures with spare/full depth, independent accepted-size recalculation and self weight, shared floors with different zones, local zones, missing input, immutable analysis, rendered depth/width/stale UI, and auto-identified TB retaining its MB record and upper-column point transfer after recalculation.
- sb-advice220.cjs, width-advisory219.cjs and beam-filters214.cjs pass, including dependent Summary A/B, slab/support/transfer, deflection and independent filters.
- Package verification compares exact bundled source, original numerical Loading prefix, original BeamSizing83/SBAdvice220 and protected files including engine, report renderers, native Excel/VBA and workbook templates. Windows host rebuilt at 2.221.0.0; package entries and uploaded digest checked.
- Native Excel recalculation/printing and new live browser interaction were not rerun. Actual UI rendering was tested. Preview is updated without forcing reload or changing browser storage.
