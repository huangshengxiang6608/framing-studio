# E2.250 verification

Member Check automatically lists the greatest absolute Section B design moment for every Framing / displayed MB, CB, TB or SB kind / actual depth in mm, comparing all assigned floors. Equal peaks use floor then natural member ID and token as deterministic tie-breakers. Missing moment/load results are explicitly pending and never automatically checked as a confirmed maximum. The table displays D and |M|.

Confirmed representatives default to Check, Section A and Section B selection. Persisted per-checkbox ownership/overrides distinguish automatic choices from user selections. Changing winners removes only prior automatic choices; manual choices and cancellations survive recomputation and JSON round-trip. No beam inputs or dimensions are changed.

The existing full Check output is reused when current. Otherwise the existing cooperative solver computes current actions without dimension recommendation trials. Input fingerprint/cancellation prevents stale results from being committed. Selecting/clearing checkboxes does not rerun the calculation. Full Summary Check remains available for sizing recommendations.

Validation:
- representative250.cjs: all four types, separate Framing and depth groups, negative/zero M, deterministic ties, incomplete results, three default flags, manual overrides, ownership replacement, JSON round-trip, real-engine UI flow, cross-floor navigation, unchanged input reuse, changed loading, shared full-audit reuse and stale in-flight result rejection.
- member-navigation248.cjs: top table, cross-floor navigation, independent Check/A/B selection, removal and collapse retention.
- report-handoff248.cjs: browser handoff and native A/B/AB dispatch/busy guards.
- Private 28-floor regression fixture: 4,537 members, 10 groups across MB/SB/CB/TB, all 10 confirmed, 21.21 seconds without a pre-existing result; solver leaves input unchanged. Private fixture excluded from package.
- JavaScript syntax, Windows DesktopOnly build and Git whitespace checks pass.
- Package preservation checks verify all unrelated tracked files and report rendering portions of explorer-ui.js remain byte-identical. Native Excel/VBA, report templates and Section A/B layout/presentation remain unchanged. Selection scope changes are explicitly requested.
