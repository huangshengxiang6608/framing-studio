# E2.215 verification — 2026-10-10

Baseline E2.214 636f2ae8e4c472a1b76214ce16872bf0a0e34913. Official main 5d18359d7110709b14fcecf431e23b88509791f6, release v2.203 and PR #8 checked before changes and publication.

Only Summary UI status styling changes: orange #c65300, red #e60000, font-weight 700. Orange continues to mean span/depth failure with passing short-term deflection. Red marks failures. Combination selection and result tables use consistent colors. White-background sRGB contrast ratios: 4.527:1 orange and 4.811:1 red. No criterion or solver changes.

Verification: existing beam-filters214-ui.cjs passed with updated orange expectations. An isolated harness also asserted red RGB(230,0,0), weight 700, and captured the FPF row; screenshot inspected. Complete audit, sync/async parity, default OR, all eight checkbox combinations, pending/nonbeam and additive selection, status/kind intersections/counts, orange display, locate/immutability/stale suppression and narrow layout passed.

All 36 bundled modules match source. Bundle difference restricted to explorer-ui and version. Existing app files outside the explicit UI/test/version/host allowlist are byte-identical to E2.214, including numerical calculations, Section A/B report rendering, workbook templates, native VBA and ExcelBridge. No report wording, formulas as presented, number formats, geometry, print settings or pagination changes.

Windows host 2.215.0.0 rebuilt, package entries checked against source/app, and previous packages retained. Existing 8783 preview updated without opening a tab or forcing reload. Published package digest and PR head checked. No native Excel recalculation or printing claimed for this visual update.
