# E2.222 verification — 2026-10-10

Baseline E2.221 d2d1d19f52c7fa95fa30e5c069b89ec147aed5bb. Official main 5d18359d7110709b14fcecf431e23b88509791f6, release v2.203 and PR #8 checked before editing; no remote-only changes.

Adds Apply this TB to valid Summary TB recommendations. The action uses the existing undo transaction and changes only the selected physical beam in the shared Framing. B uses its recommendation; D follows the full per-floor/local Structural Zone, exactly as the advisory trial. Shared-floor effects are stated next to the control. A cloned trial checks inventory, target dimensions, zone caps, no shrinking, shared-floor count and unchanged unrelated beam dimensions before committing the Framing. The handler rejects stale/busy checks and requests a fresh whole-building check after applying. Native RC, loading, reports and SB behavior remain unchanged.

Validation:
- tb-apply222.cjs includes existing tb-advice221 real RC fixtures, then exercises application with spare/full depth, width fallback, different shared-floor zones and local zones, save/reopen and undo snapshots, unrelated dimensions and loading inputs, recalculated RC, original auto-TB MB category and upper-column transfer.
- Invalid, unavailable, stale-depth/zone/member/shared-count and undersized recommendations reject atomically. Actual action handler tested with an undo transaction host and stale stamp; actual button render tested for busy, missing and stale states.
- sb-advice220.cjs and beam-filters214.cjs pass with dependent A/B, load-transfer and short-term-deflection regressions.
- Exact bundled source and protected-file checks preserve prior numerical Loading, original sizing code, engine, report renderers, workbook templates and native Excel/VBA. Windows host rebuilt at 2.222.0.0; ZIP entries and uploaded digest verified.
- Native Excel recalculation and live browser interaction were not rerun. Existing preview is updated without forced reload or storage changes.
