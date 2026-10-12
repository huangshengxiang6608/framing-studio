# E2.237 — Independent diameter dropdowns and live member RC

Baseline: E2.236, PR #8 head f8aec5785c643d9d20586feccc3d5af946df87bd. Official main 5d18359d7110709b14fcecf431e23b88509791f6 and latest official release v2.203 checked at start and before publication; no intervening remote changes.

- All 16 main-bar layers now select their own diameter independently; both link diameters also use existing allowed-value dropdowns. Fixed T/@ notation and numeric count/spacing fields remain.
- Existing per-layer C/D steel cells are read and saved without flattening diameters to a shared value. Old single-diameter projects remain compatible.
- The diagram displays required and provided As for both faces and Asv/s for shear and torsion, with the existing corresponding check result.
- Valid edits immediately call the existing Section B beam engine for the current draft and current member. Required values are recalculated from changed effective depth and reinforcement. No full-building run or project/cache mutation occurs during typing. Saving retains the original project transaction and check workflow.
- Invalid drafts, missing current loads and invalid geometry cannot show RC passed. The original single-diameter/two-size-difference design policy remains enforced; independent editing does not waive it.

Validation:
- rebar227.cjs: DOM integration passed, including dropdown option sets, per-layer independence, mixed diameter save/reload, current required/provided values, caret retention, invalid-draft save guards, AUTO restoration, CB face mapping and unchanged project until save.
- rebar-live237.cjs: MB/SB/TB/CB parity with the existing engine, required/provided cell mapping (including computed K76), pass/fail changes, mixed-layer policy, invalid/missing inputs and unchanged result cache.
- link-spacing233.cjs: 36 automatic cases plus manual minimum-spacing regression passed.
- JavaScript syntax, desktop compilation and whitespace checks passed.
- Static SVG layout inspected using input/select surrogates; no live browser interaction test claimed.
- Package guard verifies unchanged engineering calculation code, Section A/B report renderers, workbook, Excel/VBA and unrelated tracked app files byte-for-byte. Report layout and formulas are unchanged.
- Existing preview port 8783 updated without forcing reload or altering browser/project storage; deployment verifies exact bytes and no-store HTTP response.
