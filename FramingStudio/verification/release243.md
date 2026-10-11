# E2.243 — FRR width filter and 300 mm SB default

Summary Check has a dedicated “FRR 梁寬不通過” filter with a scoped count. It is included in Default Problems and All Beams; Clear deselects it. Structured audit dimensions determine this category rather than matching error-message text. Duplicate FRR geometry messages are suppressed when the beam's check item already contains the same width failure. Rechecking after fixing width removes it from this category.

Existing 250 mm global/per-Framing SB defaults migrate once to 300 mm. The same normalization handles new projects from the seed. Other custom defaults, individual member widths, frozen member overrides and subsequent user edits remain intact. A persisted marker prevents repeat migration after save/reload. Beams following default widths use the updated default as expected.

Validation: fire-filter243.cjs covers audit classification/counts/presets, deduplication, repaired member removal, migration and preservation. fire241.cjs, sb-width218.cjs and Member Check offline DOM regression passed. JS syntax, whitespace and Windows compilation checked. Packaging verifies bundled source and preserves unrelated files, Section A/B report renderers, Excel/VBA and workbook templates. Existing preview updated by HTTP byte/version verification; no live browser QA claimed.
