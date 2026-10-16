# E2.277 — Reuse verified Excel outputs and unchanged report preparation

Baseline: E2.276 / ae4156ac87fa1b2043c51f365779891eee5f3883. Official main, latest release and relevant PR heads are checked before work and publication.

## Problem and behavior

The existing native cache covered individual jobs, but combined AC2/AC10 report generation returned through a separate path before cache lookup/storage. Even unchanged models therefore reopened Excel and merged the column sheets again. The completed combined workbook and its native PDFs now participate in the verified-output cache. A hit copies the verified bytes into a fresh output directory and does not start Excel.

Entries require the complete job and full-model fingerprint, bridge binary, template, template configuration, packaged HTML and culture to match. Every cached file is checked against its SHA-256 manifest; the workbook also must match the successful result's workbook hash, source hash and model fingerprint. Missing/corrupt/incomplete entries become misses. Failed outputs, nonzero differences and zero-check results are not cached. Publication uses immutable private entries and an atomic reference update; manual edits to delivered copies cannot alter the cached originals. Cache failures fall back to normal generation. The UI explicitly labels reused results as not recalculated on this run.

The browser also memoizes the latest unchanged A/B export preparation, with cloned return values. Any project/selection change invalidates that prepared set. Both reports continue to share the fresh Summary/Member Check data and one SLAB/CS preflight.

## A/B sharing investigation

The current A and B payloads are not interchangeable. For example, the native Input D34 value is 5.1 in A and 0 in B; column sheet inputs and the expected result schedules also differ. Combining them into one native calculation would require changing existing report inputs or verification semantics. This update retains separate first-time native A/B checks, running in parallel, and caches each completed output. It does not claim a first-run calculation speedup or a shared native workbook calculation. No engineering solvers, formulas, VBA, template files or original report renderers change.

## Current-model measurements

Measured using the current saved model and the actual desktop/local-preview report host, with a new empty isolated cache. A/B run concurrently; times below are total host wall time, not the sum of both lanes.

| Native A+B generation | Seconds |
| --- | ---: |
| First full generation | 159.38 |
| Same inputs, first reuse | 5.03 |
| Same inputs, second reuse | 4.92 |

Repeated native generation is approximately 32 times faster (about 97% less time). A separate initial test measured 162.46 / 4.97 / 4.91 seconds. Browser-side planning was measured separately: 16.70 seconds from no Check cache, then 0.51 / 0.53 seconds for unchanged inputs, versus roughly 19 seconds before preparation memoization. These are component measurements; they exclude browser transport/PDF painting and must not be presented as a measured click-to-visible total. A page/app restart still needs fresh browser-side Check/preparation data, while the native verified-file cache persists.

## Validation

- Current model export requests before/after preparation memoization are identical, including the model fingerprint. A and B each plan once for repeated unchanged generation. Existing direct A/B/AB preflight tests cover changed-load invalidation, missing input, manual overrides and in-flight changes; local browser transport tests pass.
- Two independent cold native generations each pass 2,607 A and 2,692 B comparisons: 5,299 total, zero differences. Both warm runs return the exact SHA-256 workbook bytes of their cold originals and preserve the original verification time.
- Cache regression tests cover combined outputs, isolated edits, model/selection/section/input/version/template invalidation, corrupt/missing files, incomplete manifests, failed checks, zero comparisons and path traversal.
- Preservation checks cover the combined column sheets, formulas, populated values, number formats, row/column dimensions, merged ranges, print settings, page breaks and absence of external links. Cached workbooks retain independent `1F AC2`, `1F AC10` and B's `2F SL-21` sheet.
- The cached independent slab passes 24 expected result checks. In a disposable copy, bar-diameter edits recalculate its steel area and shared-input edits do not replace its captured member data; restore/save/reopen pass. Official app workbook-open verification confirms both cached A/B workbooks have RC state CURRENT.
- All 43 rendered pages match the E2.276 baseline pixel-for-pixel at 1.5 scale, including the independent slab design export. The original native template remains byte-identical.

Unchanged limitations: Overall/Wind missing inputs are not supplied by caching. Independent member sheets remain editable generation-time snapshots; edits do not write back into the app or regenerate A/B copies. The current model contains no CS; its unchanged capture path is covered by existing regression fixtures. Preview stays at localhost:8783 without forced reload or clearing browser storage. Packages exclude the user's model, output workbooks and private cache.
