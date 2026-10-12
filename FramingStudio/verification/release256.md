# E2.256 verification

Baseline: E2.255 `93f8ebc693ece85176485478c6d30cb4fb45a92e`, existing PR #8. Official main `5d18359d7110709b14fcecf431e23b88509791f6`, latest official release v2.203, PR head and fork release checked before work and again before publication.

## Change

UI-only explanations for failed automatic SLAB/CS selection in the shared Summary/Member slab reinforcement controls. Existing final-trial failure labels and values supply bending K and its limit, L/d and its allowance, shear stress/resistance, main-steel shortage and spacing reasons. Text provides directions for reviewing thickness, span, support/load inputs or reinforcement and explicitly does not promise that one change will pass.

Main-selection failure is distinguished from transverse-selection exhaustion. When main selection failed, the UI states that transverse selection was not reached, so leftover distribution bars and their failure label are not presented as an attempted adopted design. Existing blank reinforcement inputs and failed-member report exclusion remain intact. Successful and explicitly manual results do not show the automatic-failure explanation. No new selection or engineering calculation is performed by the UI.

## Validation and preservation

- `slab-failure256.cjs`: actual failed CS K and deflection numbers; transverse-only exhaustion; successful/manual exclusions; shortage, shear and spacing explanations; unavailable allowance; HTML escaping; no result mutation; source/served parity.
- `slab-selection255.cjs` with E2.255 solver and planner baselines: 48 automatic + 48 manual cases retain numeric inputs, formula results, statuses and failure reasons. Failed members remain excluded from A/B/Check; successful report payloads match exactly; empty failed selections and manual behavior remain intact.
- `report-adoption254.cjs`: fresh Summary/Member reuse, independent parity, stale-input invalidation, clone isolation, missing-result fallback and section separation passed.
- Isolated Edge browser: Summary run, Member Check explanation with numerical evidence and unattempted distribution stage, blank reinforcement fields, blocked failed A/B/Check jobs, blank manual rejection, complete manual save and restore-auto flows passed; no browser errors. Screenshot visually checked. User browser/project storage untouched.
- DesktopOnly Windows build and whitespace checks passed. Package validation compares all unrelated tracked app/source bytes against E2.255, including checks.js, rc-plan.js, formula definitions, ExcelBridge source/binary, workbook templates, VBA and report renderers. Archive contents checked against local files.

Calculation algorithms, candidate ranges, report eligibility rules and all A/B wording, formatting, tables, print settings and pagination are unchanged. No new native PDF pixel comparison is claimed for this UI-only update; preservation is verified through unchanged report/calculation assets and valid report payload parity.

Delivery reuses port 8783 with exact served-version/HTTP 200/no-store verification, without forced reload or browser-storage changes. Windows app/source package and existing PR updated.
