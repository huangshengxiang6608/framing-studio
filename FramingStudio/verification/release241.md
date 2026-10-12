# E2.241 — Floor FRR, beam width and slab thickness limits

Floor groups now have an FRR selector (1, 2, 4 hours or inherit existing material settings). Explicit floor FRR governs all RC beam types on that floor, including TB, their calculation cover and Member Check FRR display. Legacy projects retain ordinary/TB material inheritance.

Fire Safety Code 2011 (2024), Table E6, printed page 170: minimum RC beam width is 200 mm for 60/120 minutes and 280 mm for 240 minutes. Source: https://www.bd.gov.hk/doc/en/resources/codes-and-references/code-and-design-manuals/fs_code2011.pdf#page=179

Per-Framing SB defaults, global beam defaults, individual/batch beam edits and newly generated beam dimensions reject insufficient widths. Shared Framing uses the highest applicable FRR. Failed application transactions retain the original model. Existing undersized beams remain loadable, receive model diagnostics and cannot obtain a passing RC check; increasing FRR does not silently resize them. This adds the specified width check, not a complete fire-resistance certification.

Slab input thickness has a project minimum of 200 mm (user requirement, not attributed to Table E6). Defaults, individual and batch slab edits reject lower values. Existing thinner slabs remain loadable with diagnostics.

Validation:
- fire241.cjs: FRR inheritance, TB override, shared floor maximum, width boundary values, rejected mutation rollback, slab boundary and atomic rejection, save/reload, legacy diagnostics, actual Loading cover 30/50/80 mm, invalid FRR and insufficient-width design rejection.
- sb-width218.cjs: manual/automatic/frozen SB default width, explicit override, shared floors, reset and serialization.
- rebar-cover240.cjs: 4 beam kinds × 3 FRRs × automatic/manual cover.
- rebar227.cjs: offline DOM integration for live Member Check/rebar edits and state preservation.
- JavaScript syntax, diff whitespace and Windows desktop compilation.
- Package verification compares all unrelated tracked files against E2.240, including Excel/VBA, report renderers and workbook templates; verifies bundled source and ZIP contents.

No live browser interaction performed. Existing preview is updated by file deployment and HTTP byte/version verification without resetting storage or forcing reload. Section A/B report presentation is preserved.
