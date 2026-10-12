# E2.255 verification

Baseline: E2.254 `2658bef3e7e3cece524bd4c0ddd905781bb7ebca`, existing PR #8. Official main remains `5d18359d7110709b14fcecf431e23b88509791f6`, latest official release v2.203. Remote main, release and PR were checked before work and publication.

## Scope

The slab solver already detected automatic main/transverse selection failure, but omitted `autoFailed` from its returned result. Its remaining trial steel was consequently available as if it were an adopted automatic result. Ordinary slabs and cantilever slabs now expose the existing failure flag, return no adopted steel when it is true, and describe the failure explicitly. Original formula values, diagnostic inputs, candidate search, failure reasons and pass/fail classification remain unchanged.

RC planning rejects failed automatic slabs before the Section A early-return branch and before all B/Check batches. The failed member is excluded and listed with its reason; other eligible members retain the existing batching behavior. Existing beam/report eligibility is unchanged. Both slab editing entry points use the same failure-aware controls: four reinforcement inputs are blank after automatic failure, and the panel does not call the last trial values provided reinforcement. Explicit manual reinforcement remains visible and distinct from automatic-selection failure, including manual checks that do not pass. Diagnostic formula values remain available with a clear warning.

No ExcelBridge source/binary, workbook template, VBA, formula definitions, A/B report renderer, report wording/layout/formatting, print settings or pagination were changed. E2.254's verified native adoption/verification workflow remains intact for eligible successful cases. This update does not alter calculation formulas or choose different reinforcement.

## Validation

- `slab-selection255.cjs`: 48 automatic plus 48 manual cases across SLAB/CS, four spans, two thicknesses and three FRRs compared against E2.254. All numeric inputs, formula values, statuses and failure reasons are identical. Successful/manual adopted steel and descriptions are identical. Failed automatic results expose no adopted steel. A separate case verifies transverse-selection exhaustion even when main steel and deflection pass.
- Failed ordinary and cantilever slabs produce no RC jobs for A, B or Check and provide an explicit reason. Successful CS report job payloads match the E2.254 planner exactly for A/B/Check. Input projects are not mutated. Manual reinforcement is not mistaken for automatic-selection failure.
- Historical SB/TB audit-output hashes still match E2.246. Repeated edits to width, depth, loads, steel and areas retain full/incremental parity and release cancelled scopes correctly.
- Served/source parity passed for all four changed modules. E2.254 report-adoption freshness/reuse/independent-calculation tests also pass.
- Isolated real browser: completed Summary Check, opened the failed slab in Member Check, verified four empty reinforcement controls and no failed-member A/B/Check jobs. Empty manual save was rejected; explicit complete manual input saved; restoring automatic mode reproduced the failure warning and blank controls. No browser errors. User browser/project storage was untouched.
- Windows DesktopOnly build and whitespace checks passed. Packaging compares every unrelated tracked app/source file against E2.254, including the native Excel bridge and all templates/report-rendering assets. Archive entries are checked against local app/source bytes.

Report preservation is established here by unchanged valid job payloads and byte-identical native bridge, template and report-rendering assets; no new native PDF pixel-comparison run is claimed for this UI/status-only update. Prior E2.254 native report verification remains documented separately.

Delivery updates the existing PR and Windows app/source package and reuses the port 8783 preview, verifying the served E2.255 content with HTTP 200/no-store without forcing the user page to reload.
