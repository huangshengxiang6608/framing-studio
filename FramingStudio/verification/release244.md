# E2.244 — Batch SB width performance

Width-only edits of ordinary SBs now reuse one topology snapshot and freeze automatic layout once. Previously each selected beam rebuilt the whole-floor model once for lookup and again inside editSize, plus a further model build for the return value. The optimized path avoids these per-beam rebuilds. Complex edits (type/depth changes, reset, derived split members, transfer/cantilever members) retain the sequential path. Final geometry, FRR width checks, collision/missing-member detection, shared-floor updates and the existing atomic transaction/undo remain in place.

Validation:
- beam-batch244.cjs compares sequential and batch results for 82 SBs over four shared floors: beam geometry/IDs/tokens, slab geometry and columns match; explicit depths, load inputs and both report selections survive save/reload. Invalid mixed batches fail preflight without writes; unsupported edits return to the original path. Manual SB depth is preserved.
- Synthetic core timing on this host: sequential 33,306.7 ms; batch 171.1 ms (about 195×). These are synthetic computation timings, not a measurement of the user's browser or total click-to-paint latency.
- Existing sb-width218, fire241 and offline rebar227 DOM regressions pass. JavaScript syntax, diff whitespace and Windows desktop compilation checked.
- Package verification checks exact bundled source and unchanged unrelated tracked files, including Section A/B rendering, Excel/VBA and workbook templates. Preview verification uses HTTP bytes/version without browser reload or storage changes. No live browser QA claimed.
