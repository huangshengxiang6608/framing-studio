# E2.236 — Separate reinforcement numeric fields

Based on PR #8 E2.235 (40f95e21aa6501fdbff7c4c895a299e0f0049edb). Official main remains 5d18359d7110709b14fcecf431e23b88509791f6; latest official release remains v2.203, checked before publication.

Each main reinforcement layer now has separate quantity and diameter inputs with a fixed T. Shear and torsion each have separate legs, diameter and spacing inputs with fixed T and @. Edits retain their draft and caret; invalid drafts block saving. Diameter changes synchronize the same face without changing quantities or the opposite face. Existing minimum spacing of 100 mm, required steel areas, save/check path and restore-automatic button are preserved.

Validation:
- rebar227.cjs: passed DOM integration, 38 numeric fields, fixed symbols, independent quantity changes, shared diameter synchronization, invalid draft/save protection, CB face mapping, RC freshness, saved steel cell mapping and automatic restoration.
- link-spacing233.cjs: passed 36 automatic cases and manual spacing checks.
- JavaScript syntax check and Windows desktop compilation passed.
- Static SVG layout inspected with foreignObject input surrogates; this is not live browser interaction testing.
- Packaging verifies all unrelated tracked app files byte-for-byte against the baseline, including Section A/B report code, workbook and native Excel/VBA assets. Bundled HTML is verified as only the changed UI module plus version stamp.
- Preview is deployed to the existing port 8783 without reloading tabs or changing project/browser storage; HTTP content and no-store caching are verified by deployment.

No calculation, report presentation or workbook changes.
