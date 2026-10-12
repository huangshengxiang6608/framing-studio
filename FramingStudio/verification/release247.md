# E2.247 — full-building Check performance

Baseline: E2.246, commit 25a7b2aa3c1b718a7ee104c4ebb80d64d661cc25.
Integrated the independently tested side-audit-performance patch after verifying
both source baseline hashes. Official main/release and PR #8 were checked first;
no intervening remote changes were found.

## Change and scope

Column transfer routes are shared per receiving floor inside the existing
immutable project/model snapshot. Parsed column inputs are shared inside that
snapshot. Existing reference-counted release removes these maps when the scope
ends, including cancellation. Calls outside a snapshot keep call-local maps.
Repeated sizing checks are reused only for the same project and solved-row
objects within one recommendation search. New candidates have separate rows.

No RC formula, design candidate order, load transfer range, geometry or report
format was changed. The UI still clones the project before checking and rejects
results if the user changes its inputs during a run. The existing full and
incremental Check buttons use the optimized calculation modules.

## Validation

- `audit-performance247.cjs`: SB/TB full audit output matches E2.246 golden
  hashes. With FRAMING_PERFORMANCE_BASELINE pointing to the two original source
  files, the complete output, model generation count and RC call count also
  match the reference runtime. Repeated changes to the same project object
  (B, D, loads, reinforcement, column area overrides), incremental/full output
  parity and cancellation scope release pass against E2.246.
- `area-parity247.cjs`: manual column areas, upper-floor overrides, transfer
  columns and unsupported columns match the reference; scoped/unscoped results
  agree after changing inputs.
- `incremental228.cjs`: unchanged and modified inputs, materials, support,
  columns, geometry, report scope, upper-floor replay, TB recommendations and
  cancellation regressions pass.
- `audit-ui247.cjs`: offline DOM integration through the actual Summary Check
  button handlers passes for full Check, B/D changes, incremental Check,
  cancel and restart; full and incremental detailed output agrees. Requires
  linkedom through NODE_PATH. This is not a real-browser timing measurement.
- Private 28-floor, 4,537-member project: integrated core run 51.065 seconds;
  the previous E2.246 reference run was 161.804 seconds. Complete output hash
  remains `94d555bacec321fde6356b28c7d7284c5b1c49a89aa9a336f42b96d934a54e3d`.
  Model regeneration remains 7, RC evaluations 994 and RC cache hits 3,793.
  Input project unchanged. Private project data is not included.
- Timing is a single local offline run, excluding browser rendering, and is
  not a general performance guarantee or independent validation of RC formulas.
- Windows desktop build passes. Package validation compares protected tracked
  files byte-for-byte against E2.246 and verifies the HTML contains only the
  two intended module replacements plus the release version change. Section A/B
  rendering, Excel/VBA/template and report layouts remain unchanged.

The preview continues at http://127.0.0.1:8783/ with no-store responses. Deployment
does not force a browser refresh or modify the user's saved project/storage.
