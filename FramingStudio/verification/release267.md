# E2.267 — Shear and torsion link limits

Baseline E2.266 / e1ac73f72e5693c5bd0a15b4bc7aa7fb8233f42a. Official main b07f04a6ca4fe84940a8071f316aae85e3a688d0, release v2.256 and relevant PR 10/11 heads were checked before editing and before publication.

The user confirmed a minimum 10 mm diameter and maximum 250 mm spacing for both shear and torsional links. Denser spacing is allowed; the existing 100 mm minimum spacing remains. Applies to MB, SB, TB and CB.

Automatic selection no longer considers T8 links. Manual input and Summary/Member RC checks reject diameters below 10 mm or spacing outside 100–250 mm. Existing manual values are preserved for correction rather than silently rewritten. A legacy T8 remains visible as a disabled, labelled option; invalid inline edits cannot save the previous valid value. Native Excel export independently checks the link policy before adopting App reinforcement and before accepting fallback native beam results.

Calculation equations, loads, material parameters and section dimensions are unchanged. Reinforcement and effective depth are recalculated from the newly selected inputs using the original formulas. The packaged Excel template, VBA, extracted formula sources and original A/B report rendering code are unchanged. This does not change the original workbook's independent VBA auto-design buttons; generated App reports use checked App reinforcement and retain the native calculations.

Validation:

- 36 automatic cases across MB/SB/TB/CB and 72 manual boundary cases. All automatic links satisfy the limits; invalid manual values fail shared RC checks without mutation. For identical manual inputs, every computed value matches E2.266.
- DOM integration: diameter options, preserved legacy T8 display, failed-policy status, inline typing, 251/300 mm rejection, save guards, layer editing, AUTO restoration and selection preservation.
- Existing link-spacing233, live-rebar237, rebar-legs239 and section-a-acceptance262 checks pass. The live-rebar test fixture was aligned with the existing RC-only preview mode; no acceptance rule changed.
- Native export input guard: 18 diameter/spacing combinations, including exact 10/100/250 boundaries.
- Same saved current-model loads and geometry, with automatically reselected links: A 2,572 and B 2,540 native comparisons, zero differences. B retains ten independent member calculation sheets.
- A retains 15,117 original workbook formulas and thirteen PDF pages; B retains 18,233 formulas and twelve PDF pages. A/B row heights, column widths, merged cells, print settings, page boxes and resolved formatting agree with E2.266. The sole native status colour change is Section B A67, red NOT OKAY to green OKAY after the link input changes; the original colouring rule is unchanged. Input/load tables are unchanged. Result values may change with the authorized reinforcement inputs.

The first native B test interrupted during the existing paused-TB calculation restore, before adopting the new link inputs. A fresh A run and a fresh-directory B retry completed. This update does not claim that the pre-existing intermittent Excel process failure is fully eliminated; failed output was not accepted or delivered. No automatic retry or altered report logic was introduced.

The existing 8783 preview is reused without forcing refresh or modifying project/browser storage. The current Windows package and source are included in the existing PR; historical releases remain available.
