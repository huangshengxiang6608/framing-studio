# Section A/B navigation — stable shared UI scale

Baseline: published E2.300 main `f9ac54addd0fc8cd89ab919c18f725ecff37a8c4`. Pending PR #21 is kept independent; no calculation, MB placement or wall-snap changes are included here.

## Cause and fix

Opening Section A/B intentionally disables `data-ui-shell287` to protect original report presentation. That condition also gated shared header/navigation/layout-toolbar styling, so the surrounding UI reverted to larger default controls. At 1440 × 900 with saved 90% scaling, the layout toolbar grew from 31 to 46 CSS pixels and its scale selector from 21 to 37 pixels.

Keep shared header, navigation, layout controls and their base interactive styling active under the existing `data-ui-scale` setting, independently of the protected report scope. Keep their inherited font size at the chosen scale. Preserve the original condition for workspace/report content and keep every new rule inside the existing screen-only media block. No JavaScript or report markup is changed.

The patch retains the published host binary/source/manifest/version as E2.300. It changes the supplied web assets and their CSS source only; the uniquely named UI-fix package distinguishes this candidate without modifying shared version stamps in the independent pending PR.

## Validation

- `source/tests/report-ui-scale302-ui.cjs`: seven viewport/DPR/preference cases; real Section A/B navigation and repeated returns to Loading/Axes; stable header/navigation/toolbar/control sizes and saved preferences; unchanged project JSON. Covers 1440×900 at 90% and 110%, 1280×800 at auto/DPR2.25, 1560×1040 with 14.6-inch profile/DPR2, 1707×1067 with 16-inch profile/DPR1.5, 1920×1200 at 100%, and 1024×768 at 95% with the original menu toggle.
- Every case replays published-main HTML in an isolated baseline browser, reproduces its original enlargement, compares protected A/B screen and print styles, and compares the original PDF canvas pixels and dimensions exactly.
- `source/tests/report-scroll296-ui.cjs`: actual 16-page PDF scrolling, background progress, canvas identity, reading anchor, stale print blocking, A/B switching, replacement PDF and navigation pass.
- `source/tests/report-handoff248.cjs`: browser project-save/Windows handoff, native A/B/AB generation and busy guards pass.
- `verification/report-ui-scale302.cjs`: all HTML/scripts/report/print content outside the edited CSS is byte-preserved; 67 existing JS modules, all 12 native Excel files, ExcelBridge and newest host files/version are unchanged. All 40 inline scripts parse.

Tests use isolated contexts and synthetic PDFs. User project data, saved settings and historical packages remain intact. Existing preview remains `http://127.0.0.1:8783/`; no forced reload. Native Excel/PDF generation and desktop launch are not rerun because their code and binary are unchanged.
