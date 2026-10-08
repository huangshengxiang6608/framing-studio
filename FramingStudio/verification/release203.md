# E2.203 integration verification — 2026-10-08

Baseline: PR #6, E2.202, `87018f5593a07d7e8f4356c1f88f3f4e7dbd963a`.
Merged interface changes: PR #5, `ee8359f750870391541b4293d1f8f7a46df6f684`.

## Scope and conflict resolution

The integration keeps E2.202 as its first parent. Conflicts in `app.js`, the bundled page and `CHANGELOG.md` were resolved by keeping E2.202 functionality and adding PR #5 presentation changes. E2.201/202 explicit/default dimension behavior and live beam-type previews remain intact. The existing bay, support, load-transfer, truss and drawing calculations are unchanged.

The E2.202 bundle had placed `measure189.js` and `review-layout191.js` inside the `app.js` replacement marker. Re-running the synchronizer removed them and caused a startup exception. Each unchanged module now has its own marker; all 36 marked modules are synchronized.

Windows now checks unsaved applied edits as well as unapplied floor/member inputs, an open Loading editor and invalid inputs before allowing a quiet close. An open Loading editor is conservatively treated as unfinished work. Cancelled/failed file saves do not clear the desktop unsaved flag. A close review that cannot read page state keeps the window open. Loading regions still use their existing Save Loading Region / Cancel controls; the close button does not silently apply them.

## Automated checks

Run `node FramingStudio/verification/release203.cjs` from a full Git checkout. All 26 test programs passed. They cover units and hints, truss solving/downstream loads, default and manual dimensions, primary-bay splitting, drawing offsets/selection, slab/support spans, reactions, self-weight and rounding. Logs are written under `tmp/release203`.

- 300 pre-existing app files are byte-identical to the pinned E2.202 baseline, including calculation modules, report modules, native Excel/VBA sources, ExcelBridge and workbook templates.
- Report HTML outside the app/UI additions and version is unchanged.
- All 36 bundled module bodies match source; all source JavaScript parses.
- Windows host builds successfully with .NET Framework; executable and manifest version is `2.203.0.0`, page version is `E2.203`.
- Git whitespace verification uses `core.whitespace=cr-at-eol` to respect the existing mixed LF/CRLF sources.

## Interactive checks

- Browser: page starts after rebundling; unit suffixes/tooltips appear without changing the layout. A negative axis distance remains visible with an adjacent validation message and `aria-invalid`; correcting it clears the error. The test edit was undone.
- Windows: tested the compiled host in an isolated profile using the built-in seed model. Opening an unfinished Loading editor triggers Yes/No/Cancel on close; Cancel retains the page. A test LL of 3 kPa was applied using the existing region control. Cancelling the file-save dialog leaves the project unsaved and the next close still prompts. Choosing Yes and saving a `.framing.json` file succeeds; the subsequent close exits without another prompt.
- Test profiles, synthetic saved projects and QA launchers are excluded from the release package.

Native Excel/VBA calculation and printed report rendering were not rerun. Their binaries, sources, templates and report content were verified unchanged; this integration does not add actual RC deflection calculations or change engineering checks.
