# E2.264 — Section A beam loads share Summary/Member Check and Section B

Baseline: E2.263 / 32543e47f497b3170cc72ad719a13c2abd30cab1. Official main b07f04a6ca4fe84940a8071f316aae85e3a688d0, latest official release v2.256, PR 10 head 5e22aff382a7fe5ca74acc490c7b9df66e357076 and PR 11 baseline were checked before editing and again before publishing; no intervening updates.

## Change

As explicitly requested, selected Section A MB/SB/TB/CB rows now use the same current characteristic G/Q, full-span self-weight, distributed/point loads, actions and successful reinforcement as Summary/Member Check and Section B. Fresh checked results are reused; stale/incomplete results are recomputed. Existing failed RC/automatic-selection/missing-input blocking remains. Failed A's former independent search is not adopted as successful steel.

Only the report-input planner changed. The native report renderer, ExcelBridge, workbook/VBA templates, wording, formulas, formatting, diagrams and pagination rules are unchanged. Original Section A slab/column inputs and all Section B plans are unchanged. Reports can naturally contain different load rows/pages because the authorized beam input data changed. Original red Span/Depth or Excel L/d results are retained, not forced to OKAY.

## Validation

- `beam-loads264.cjs`: MB/SB/TB/CB A/B full load and action equality; previous/current B plans deeply identical; A slab/column plans deeply identical.
- `section-a-acceptance262.cjs`: fresh cache reuse, stale/incomplete cache recomputation, failure blocking, shared successful beam reinforcement, unchanged project/floor metadata.
- `beam-acceptance261.cjs`: four beam categories, N87 not mandatory, status combinations, RC/automatic-selection failures and full/incremental edit parity passed.
- `column-tributary263.cjs`: ownership, accumulated upper-column loads, ambiguity, opening and conservation checks passed; E2.263 is retained.
- Saved current model TB26 (3/F, 1800 x 3200 mm, 30 m): A/B fullLoads deeply identical, all 22 records; zero planner issues; entire B plan identical to E2.263. Full-span characteristic self-weight 141.12 kN/m (ULS 197.568); SL-71 G/Q 7.35/4.5 kN/m; SL-75 G/Q 6.0025/3.675 kN/m.
- Shared Check and native Excel: M = 123940.85105163792 kNm; V = RA = 31418.77504166667 kN. Native original ExcelBridge/templates: old A baseline 259 comparisons, updated A 259, combined A/B 254; zero differences in each. Additional CB A native job: 257 comparisons, zero differences.
- Standalone A versus combined A/B: all 168 populated Section A formula/value cells agree; merged cells, row heights, column widths, styles, number formats, page settings/breaks agree; four A PDF pages (including introduction) have identical text and page boxes.
- Visually reviewed both TB26 A pages and both B pages from native PDF export. Original formulas, load schedule grouping and layout remain; A Span/Depth 28.13 > 20 and B Excel L/d remain NOT OKAY according to their original formulas. Eligibility continues to follow the shared Check rule.
- Delivered combined workbook is an exact byte copy of native output, never resaved by another spreadsheet library. SHA-256: 83e0d56de58c0c72688e8e4779dab5e698f7700b42535c56d99a2be20d684aa0.
- Windows 2.264.0.0 built; packaging verifies all unrelated tracked app files against E2.263 and all 36 embedded source modules against standalone sources.

## Preview and scope

Retain the existing localhost 8783 preview and browser/project storage. No forced reload or new browser model extraction; TB26 verification used the saved model matching the supplied screenshot. Existing unrelated CB_3 Section B differences and missing Overall/Deflection inputs remain outside this change.
