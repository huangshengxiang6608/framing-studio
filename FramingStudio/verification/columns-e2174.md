# E2.174 verification

Base: E2.173 commit 70fff54, retaining upstream E2.172 main d06f814.

- New portable column-anchors174.cjs: exact section-face anchoring on both axes/sides, interior grid face, grow/shrink/reload, legacy inward correction, same-size reapply, explicit/off-grid centres, B-only/generic editor, atomic rejection, adjacent copying, load/selection identity, constrained partial shrink.
- Existing column-resize166, copy-column-reference, column-deferred-boundary, column-parameter-table: passed. Deferred Summary Check remains manual.
- Existing column-split170, bays171, beam-network165 and support-cantilever173: passed.
- integration143: 55 loading and 12 truss integration checks passed; downstream143: 11 checks passed.
- Independent local-file Chrome replay of saved project copy: AC10/C2 at X=20.00 for 2000 mm and X=20.50 for 1000 mm; C1 at X=1.00 / 0.50. No page errors. Private inputs/screenshots excluded from repository.
- Browser navigation and page heading both place transfer truss under Scheme 2; sequential menu numbers verified visually.
- 30 report/template/native files byte-identical to E2.173; all unrelated bundled content unchanged. Modified source modules match embedded app.
- Existing E2.172 native EXE retained under the user's hold on recompilation. Web app/source version E2.174.

Resize changes are applied on the next requested size edit/application, including reapplying the same size; opening the software does not silently rewrite saved project inputs. Ambiguous axis matches do not establish a new anchor; explicit positions remain authoritative.
