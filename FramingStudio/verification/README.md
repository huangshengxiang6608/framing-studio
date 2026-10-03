# Transfer-truss verification

Run from `FramingStudio/verification`. Node.js is required; the browser suites additionally require Playwright and installed Microsoft Edge (`channel: msedge`). Install Playwright in a separate tools directory or make an existing installation available through `NODE_PATH`.

```powershell
node truss-core-tests.cjs
node truss-browser-tests.cjs
node truss-integration-tests.cjs
node truss-downstream-tests.cjs
node truss-zone-tests.cjs
```

Run the browser suite before the integration suite: it creates the synthetic fixture. Generated fixtures, screenshots, workbook jobs and PDFs are ignored by Git. These tests do not use a user's project or change their saved application profile.

For an additional no-truss regression, set `FRAMING_BASELINE_HTML` to the absolute path of an unmodified baseline `assets/index.html` before running the browser suite. The test compares complete geometry, loading output and report pages using the baseline's embedded seed project.

For the native Windows truss workflow, build the app with `source/compile.ps1`, then run this from `FramingStudio/verification` with desktop Excel and WebView2 installed:

```powershell
$trussTestDir = Join-Path (Get-Location) 'native-truss'
New-Item -ItemType Directory -Path $trussTestDir -Force | Out-Null
Copy-Item -LiteralPath 'fixture.framing.json' -Destination (Join-Path $trussTestDir 'fixture.framing.json')
Set-Content -LiteralPath (Join-Path $trussTestDir 'truss-smoke.flag') -Value '1'
$trussApp = (Resolve-Path '../FramingStudio.exe').Path
$trussProcess = Start-Process -FilePath $trussApp -ArgumentList @('--self-test', ('"' + $trussTestDir + '"')) -WindowStyle Hidden -Wait -PassThru
Get-Content (Join-Path $trussTestDir 'result.json')
if ($trussProcess.ExitCode -ne 0) { throw 'Native truss check failed' }
```

Use a fresh output directory for each native run. The app uses an isolated profile beneath that directory. The fixture has no RC members selected for A/B export: the truss workbook is macro-free.

## E2.122 same-floor zone and force solution — 2026-10-03

- The existing 11 core, 8 browser, 7 integration and 15 downstream groups pass, including the no-truss E2.119 comparison.
- 8 additional zone/solution groups pass: independent hand forces, section-envelope projection, multiple-panel joint equilibrium and tamper detection, full-width/partial-span zone coverage, same-floor downward reactions, input/export blocking, A/B solution pages, 3D geometry, UI case selection and undo.
- Fresh E2.122 Windows run: 10 native truss workflow checks pass; A/B workbooks each have 451 comparisons and no differences. The final report wording was subsequently clarified for same-floor reaction transfer and the browser report suite rerun.
- The new synthetic 2 m demo and its A/B truss PDFs are in `示例模型/RC_同层2m_StructuralZone_Demo`. Its full force trace is supplied for inspection. Only TT report content was expanded; RC report modules, Excel templates/VBA and ExcelBridge are byte-identical to E2.121.
- The native test exports the isolated truss only. RC input plans pass browser checks; the existing RC macro limitation below remains unresolved.

## E2.121 RC scheme entry — 2026-10-03

The truss entry now appears under Scheme 1 · RC. A browser check with `scheme2` removed verified the visible RC entry, successful truss calculation, downstream RC A/B input plans, and truss A/B report jobs. Complete loading results and report job content exactly match E2.120 for the same RC-only project. The Windows host was recompiled; calculation, report-rendering and Excel-template files are unchanged from the tested E2.120 release. The RC macro limitation below still applies.

## Results on the E2.120 integration branch — 2026-10-03

- C# desktop and Excel bridge compilation: passed.
- Main regressions: 55 loading assertions, 46 boundary groups plus 5 slab-direction/local-clearance groups, 9 layout groups and 4 support groups passed.
- E2.119 Excel templates/resources, report paper/composition and selected new layout/loading modules: 20 files byte-identical.
- Core: 11 groups passed (section data, material boundaries, independent equilibrium/virtual work, buckling, load envelopes, selection and invalid inputs).
- Browser: 8 groups passed, including complete no-truss geometry/loading/report-page comparison against repository E2.119 (`afa70fa`), UI edits/undo, serialization and rejection of invalid transfer paths.
- Integration: 7 groups passed, including actual floor heights and fixed chord elevations under local clearance edits, physical lower-column A/B inputs, all drawing views, report selection and export planning.
- Windows native truss workflow: 10 checks passed, including A/B PDF preview/export, stale report invalidation, undo and project save.
- Native A/B truss workbooks: 451 comparisons each, zero differences.
- Downstream transfer: 15 groups passed. Includes TT → column → TB → column, further TB → MB/CB → column paths, continuous walls with unsupported column landings, independent force equilibrium, A/B RC export inputs, manual/area overrides, missing support and incomplete upstream inputs. Unaffected branches remain exportable.

The downstream test originally failed against the first PR bundle because BASE-L had no TT provenance. In E2.120 the independent equilibrium expectations apply main's upward 0.01 kN rounding at each beam input, including successive TB / MB / CB transfers. Physical G/Q values reach the exported C26/C27 inputs rather than being replaced by manual area schedules.

## RC macro limitation

The lower-column G/Q propagation and A/B input plans passed JavaScript checks. End-to-end RC macro export remains **unverified in this development environment**. A fresh E2.119 native attempt with the unchanged E2.118 template again failed before calculation at `Workbooks.Open` ("Unable to get the Open property of the Workbooks class"). The truss workbook in that same run passed 451 comparisons; the isolated truss-only A/B workflow passed all 10 checks. With user-authorized retesting, the original E2.108 and E2.109 RC templates failed during macro-enabled `Workbooks.Open` with `0x800A03EC`, before calculation checks could run. Macro-disabled opening succeeded and a Steel template opened with macros enabled. The precise local cause is unresolved.

The [maintainer's review](https://github.com/huangshengxiang6608/framing-studio/pull/1#pullrequestreview-5377552928) independently reports successful native downstream-column A/B exports on the original PR commit `964aa9e`, with 16 / 31 comparisons and zero differences. That result is distinct from the new downstream-input regression tests and is not presented as a fresh native RC run on this revision.

This revision preserves E2.119's Excel templates and VBA byte-for-byte, including the changes supplied by main. It does not change Office security settings or include diagnostic workbook modifications. The previously reported 6,199 native comparisons in the E2.111 changelog are historical baseline evidence, not a new RC validation result for this PR.
