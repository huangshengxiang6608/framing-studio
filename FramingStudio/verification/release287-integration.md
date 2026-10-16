# E2.287 integration verification — 2026-10-16

Base: PR #11 E2.286, `b55f288097eaf5aab683899b631fc27e6d6e63c8`.
UI source: PR #12, `21c9c1277b5bb6a73eb2ecc748e55b7c570f7454` (originally based on E2.256).
Official main/release checked before integration and upload: E2.256, `b07f04a6ca4fe84940a8071f316aae85e3a688d0` / `v2.256`. Both PR heads were unchanged. Git merged the two PR histories without conflicts.

## Scope

Retain all E2.286 changes and add the PR #12 screen theme, workflow filtering, command palette, laptop display profiles and WebUI launchers. Compatibility fixes preserve hidden filtered menu entries, select the actual searched member, retain saved panel dimensions, and recognize the 2560×1600 display profile. Panel adjustments use the existing layout state rather than competing CSS overrides.

New theme and scaling rules apply only to the interactive screen shell. Section A/B report views, the report dialog, and print media retain their original styling. The desktop host version is E2.287 (2.287.0.0); only the desktop host was rebuilt.

## Verification

- 36 bundled modules match source; production JavaScript and bundle scripts parse.
- 64 JavaScript calculation/report modules are byte-identical to E2.286. Only `app.js` (member navigation API) and `ui-polish173.js` changed. ExcelBridge source and binary, the RC workbook and template manifest are also byte-identical to E2.286.
- 75 of 84 regression programs passed. The remaining nine fail on pristine E2.286 as well, with identical failure logs after repository-path normalization. They remain failures and have not been bypassed or reclassified as passes. See `release287-results.json` for the exact programs.
- Eight additional tests passed: native-dispatch stub, slab report preflight, local reinforcement, manual spacing, autosave, column position, column spacing and beam acceptance UI tests. The native-dispatch test is a stub test, not a fresh Excel execution.
- Isolated headless browser tests covered all 20 navigation entries, filtering/Enter/Escape, command-palette member selection, project data remaining unchanged after UI actions, saved panel resizing, and nine main pages at three laptop profiles (1280×800, 1560×1040, 1707×1067 CSS pixels). No JavaScript page errors or page-level horizontal overflow were observed; the canvas stayed usable.
- Representative Section A/B report DOM styles match E2.286 in both screen and print media. This is not a full native report/PDF pixel comparison; native Excel/PDF jobs were not rerun for this UI integration.
- Launcher tests confirm reuse only when the served HTML hash matches and the response is no-store. An older/different running service is left intact and causes a clear failure; no process is terminated or browser reloaded.
- The original UI-decoration test now scopes its prohibition on changing field values to the field-decoration routine, since the added search box legitimately updates its own value. The production UI module still has a separate no-project-transaction assertion.

## Reproduction

Use Node with `linkedom` 0.18.12 and `playwright` available through NODE_PATH, Python 3, Windows PowerShell, installed Chrome and the repository history.

```
node FramingStudio/verification/release287-integration.cjs --static-only
node FramingStudio/verification/release287-integration.cjs
node FramingStudio/verification/release287-ui.cjs
python FramingStudio/verification/release287-launcher.py
```

The full integration runner intentionally exits nonzero while the nine inherited regression failures remain. Set CHROME_EXECUTABLE if Chrome is installed elsewhere. Test artifacts are written only under ignored `tmp/` directories. The delivered ZIP includes the app and tracked source, excludes local test profiles/private project files, and has a per-file SHA256 manifest.
