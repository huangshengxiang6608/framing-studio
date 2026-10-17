# E2.307 — Restore full-span slab loading on secondary beams

E2.306 allowed concave slabs to transfer load despite their pending rectangular RC design, but used net-face load extents on receiving secondary beams. That conflicted with the user's established full-span design convention. SB slab lines now cover the receiving SB calculation span, including manual beam spans. Concave strips use their actual supported centre-distance loads; geometry still determines recipients and preserves internal load transitions and actual gaps. Non-SB beam interval mapping and physical area tracing retain their existing behavior.

Slab centre-distance loading already includes the corresponding side of the SB top. Those half-footprints are claimed before residual SDL/LL is assigned, so a two-sided SB does not receive the same beam-top loading again. Full-section beam self-weight and existing reinforcement rules are preserved. Missing inputs/supports still block incomplete transfer; nonrectangular Excel slab RC remains pending. This explicitly supersedes the E2.306 net-polygon-only **SB design-transfer** behavior described below, while retaining the Area 1 repair and physical-area bookkeeping.

## Validation

- Synthetic tests passed for X/Y orientation, reversed endpoints, full-span slab groups, piecewise load levels, internal gaps, manual beam spans, non-SB mapping and beam-top deduplication. E2.306 concave conservation tests now explicitly exercise physical Area tracing; their fixture input is cloned to prevent cross-test mutations.
- Passed slab-transfer177, slab-load223, slab-centres175 and report-slab-preflight276 regressions, including A/B/native input parity, manual slab spans, cantilevers, missing supports, loading assignments and report freshness.
- Fresh current-model export: both slabs feeding the inspected SB cover 0–6.50 m, each at G/Q = 7.35/4.50 kN/m (ULS 10.29/7.20). No residual beam-top SDL/LL line remains on that SB. With unchanged self-weight, ULS end reactions are both 133.7505 kN and maximum moment is 217.3445625 kN m. The actual browser automatic-load command shows these values and full extents.
- Independent force/moment equilibrium passed for all 58 beams in the isolated target floor and all 66 unique beam-end transfers; maximum force difference below 2e-12 kN. The inspected SB has identical results in the full-building run, and its reaction appears once on the receiving TB.
- Physical floor accounting remains unchanged and balances within 1e-6 kN dead / 1e-4 kN live. Design-span loading is the explicitly requested convention and is not asserted to equal net physical mass. Full-section self-weight conventions are not revised.
- An existing upper-floor tributary-ownership gap still leaves the receiving TB's accumulated full-building load unresolved. This update verifies the local SB contribution, not an overall structural pass.

Private model exports and screenshots remain local. Original Excel/VBA, template formulas, RC selection and Section A/B report content, formatting and rendering are unchanged. Windows app/source package: E2.307. PR #22 remains unmerged and retains earlier changes, including integrated PR #23.
