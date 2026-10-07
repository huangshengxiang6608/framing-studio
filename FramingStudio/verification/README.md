# E2.143 verification

The supplied E2.142 Windows package is the compatibility baseline. Current computational suites (Node.js, no browser automation):

```
node FramingStudio/verification/truss-core-tests.cjs
node FramingStudio/verification/integration143.cjs
node FramingStudio/verification/downstream143.cjs
```

Set FRAMING_BASELINE_DIR to an extracted original E2.142 FramingStudio directory to compare four no-truss model snapshots (geometry, A/B loads, issues and existing report figures). All four passed on 2026-10-06. The integration suite also runs 55 existing loading assertions and 12 truss integration groups; core and downstream suites each pass 11 groups.

Native ExcelBridge ran the generated excel143/job.json: 451 comparisons, zero differences. The Truss workbook is standalone and macro-free. Original workbook templates and report/VBA files were compared byte-for-byte with E2.142. Browser UI inspection verified input changes, undo and absence of console errors; JSON project serialization was checked computationally. A full native GUI save/PDF workflow was not verified.

Older browser test files imported from PR #1 are retained as historical development tests. Their A/B report insertion expectations and baseline versions do not describe E2.143. E2.143 intentionally preserves original Section A/B report layouts and blocks the incompatible Section A area-table export for truss-affected columns. Use the suites above for this release.
