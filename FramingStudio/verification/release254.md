# E2.254 verification

Baseline: E2.253 commit `bdd9109793a0205b4b35f98354f536172ac6bb27` on PR #8. Official main remains `5d18359d7110709b14fcecf431e23b88509791f6`; latest official release remains v2.203. Remote main, release and PR head were checked before work and before publication, with no intervening changes.

## Reuse and preservation

Section B report planning can reuse the completed Summary/Member Check snapshot only if the whole calculation input fingerprint is still current, the snapshot is Section B, and every requested member has design inputs. Missing or stale data uses the existing App calculation. Selection-only changes do not invalidate calculations; snapshots are cloned. Section A keeps its existing load convention.

The native bridge adopts calculated reinforcement through existing editable, non-formula cells and the original VBA save/load routines. Adopted reinforcement is recorded as Manual in the generated workbook's internal design cache to prevent another automatic steel search. The user's App project and its reinforcement mode are not changed. Dimension/load inputs continue through the original input schedules. Native formula cells are retained, not replaced by App answers. Excel still recalculates and checks its original formulas; the optimization removes repeated selection, not independent verification.

Inputs, adopted steel and original formula results are compared before Check99 and again after native checking. Incomplete steel layers/results, wrong worksheet/member mapping, formula strings and numerical mismatches stop generation. Native readiness checks, final Check99, fixed-load restoration verification and original A/B rendering remain in place. If a requested manual value conflicts with a protected formula (for example a shear-leg count different from the formula), generation stops with the difference rather than overwriting that formula or changing the requested reinforcement.

Automatic CS reinforcement remains on the original native path: one baseline CS fixture already disagrees with the App on distribution-bar diameter (native C57=10, App=12). It was excluded from adoption and from successful equivalence claims. Columns also retain their existing path; A slab/CS/CB retain their existing convention. No unrelated calculation or selection algorithms were changed.

The workbook templates, VBA, report generation code, wording, headings, formulas as presented, diagrams, formatting and pagination are unchanged. RC template SHA256 remains `a104cfefb60fbd4fab3f7e50aed573d52d98264f70380064152dbdd3971829fb`. Generated workbook internal cache modes differ intentionally; whole-workbook byte/value identity is not claimed.

## Verification

- The same ten-member actual Section A request completed through the production local HTTP/Windows worker in **105.628 seconds**, versus **273.248 seconds** in E2.253 (61.3% less). This was a full native run, not a completed-job cache hit. Timing is one comparison on this host, not a guarantee for all models. 2,318 App/Excel comparisons passed with zero differences; workbook download hash was verified.
- Both report sheets' cells/formulas, formatting, merged ranges, row heights, column widths, print setup, headers/footers and page breaks matched. All **20 PDFs / 23 pages** matched text, page boxes and rasterized pixels at 120 dpi. Only explicitly identified run timestamps are normalized in workbook comparisons.
- Individual Section B MB, SB, TB and CB cases each passed 254 native comparisons; the ordinary slab case passed 90. All five baseline/candidate pairs preserved both report sheets and all **10 PDFs / 10 pages**, including pixels.
- A three-MB Section B job including manual reinforcement passed 762 comparisons with zero differences; both report sheets and **4 PDFs / 4 pages** matched E2.253, including pixels. The final compiled binary also passed this job.
- Negative native tests rejected a wrong action, a protected formula/leg-count conflict, a missing required result and a formula string. The final binary also rejected a missing steel-layer value before report export. No successful copy is returned for these cases.
- `report-adoption254.cjs` verifies actual Summary audit snapshot reuse against an independent report calculation, cloning/input immutability, selection-only reuse, invalidation after width/depth/steel/FRR/load changes, missing-member fallback, A/B convention separation, automatic-CS legacy routing, and served/source parity.
- The unchanged browser PDF composer rendered the actual 23 source pages as 15 final pages with zero fallbacks or browser errors in an isolated browser. User browser storage and pending inputs were not reloaded.
- Windows build and whitespace checks passed. Packaging verifies all unrelated tracked app files against E2.253, including every template and native VBA asset, and verifies every ZIP entry against the corresponding source/app file.

`source/tests/report-equivalence254.py` performs report equivalence checks using the E2.253 formatting/PDF comparison machinery. Private project data and diagnostic workbooks remain outside the release. The previously documented synthetic continuation-batch page-break restoration issue is unchanged by this update.

Delivery updates the existing PR, app/source package and port 8783 preview with HTTP 200/no-store verification, without forcing a user reload.
