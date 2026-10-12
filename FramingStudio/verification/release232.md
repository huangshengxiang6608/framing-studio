# E2.232 verification

Baseline: E2.231, commit ae51dd25fc8a88f86de51a1113a0cc6abfd71dfe. Official main, release and PR #8 were checked before work and before publishing; no intervening updates were found (main 5d18359d7110709b14fcecf431e23b88509791f6, official release v2.203).

Member Check only:
- Actual deflection uses the same 22 px bold, padded, coloured left-border result treatment as L/h. The existing short-term uncracked L/250 calculation, strict threshold and number formatting are unchanged. Missing and stale data remain pending.
- Cross-section diagrams show layer numbers, actual bar quantities/diameters, upper/lower face roles, and shear/torsion links. Diagram height adapts to layer count; schematic dots are explicitly distinguished from actual quantities. Click/Enter/Space on labels focuses the existing editor. Editors and original saving/validation remain available.
- The Check checkbox is retained. It still controls selected-member tracking, floor status and B-copy readiness; Summary Check evaluates all members independently of the selection.

Validation:
- Extended offline Member Check DOM suite passes: deflection pass/fail/exact limit/missing/stale; eight-layer labels; sparse layers; CB upper tension mapping; click/keyboard editor focus; draft/save validation; unchanged Check/A/B selection freshness and AUTO restoration.
- Check synchronization/race suite passes, including unchanged report scopes and no automatic resizing.
- Dense eight-layer and sparse-layer SVGs rendered with Sharp and visually inspected. Live browser automation was unavailable; these are standalone rendered diagrams, not browser screenshots.
- Windows desktop compilation succeeds.
- Packaging verifies embedded modules, all unchanged tracked application files, report renderer/export handlers and ZIP contents against source. Section A/B report presentation and Excel/VBA are unchanged.

Delivery verification checks the existing preview's exact served bytes and no-store headers, GitHub PR head, and uploaded package digest without reloading the user's tab or changing project storage.
