# E2.210 verification — 2026-10-09

Baseline: PR #8 E2.209 commit 4a689c2bcb0e14e6c487f857abb65b0899812cae, retaining official E2.203. Existing preview/package and PR baseline were verified. Official main/release/PR are rechecked before publication.

## Approved scope and source

Short-term gross-section elastic beam deflection by double integration, characteristic DL+LL, simply supported ordinary beams and confirmed-root CB cantilevers. The user specifically requires E from Hong Kong Concrete COP 2013 (2020 Edition), Table 3.2, **For general use**: C20 through C100 = 18.7,20.5,22.2,23.7,25.1,26.4,27.7,28.9,30.0,31.1,32.2,33.2,34.2,35.1,36.0,36.9,37.8 kN/mm². These are literal table entries, not the overall-building column or equation approximations. Source: https://www.bd.gov.hk/doc/tc/resources/codes-and-references/code-and-design-manuals/CoP_SUC2013c.pdf (printed p.16).

Material follows existing Section B routing: ordinary beam/CB use common beam fcu; TB uses tbFcu. B and D are actual member dimensions in m; I = BD³/12 in m⁴. EI = E × 10^6 × I in kN m². Unsupported/missing material or non-positive dimensions produces a prompt while leaving valid SFD/BMD available.

Each load interval has M(t)=M0+V0 t-q t²/2. Analytic polynomial integrals produce rotation and displacement; two constants enforce zero displacement at simple supports or zero displacement/rotation at the fixed cantilever end. The displayed sign is downward positive, delta''=-M/EI. Characteristic G/Q are used directly; ULS factors and legacy factored caches never enter this curve. Station values come from exact polynomials. Maximum displacement uses the zero-slope location for a positive-load simple span, or the cantilever free end; sampled SVG segments are presentation only. Both CB roots, reversed coordinates and partial line loads are supported.

No cracking, creep, shrinkage, support displacement or root flexibility is included. The UI states this and does not infer a code deflection pass, replace L/d checks, or change Section B status. This is not the detailed RC curvature route in COP 7.3.5–7.3.6. Existing ULS diagrams, loads, reactions, RC results, reports and native Excel outputs are untouched.

## Verification

- deflection210.cjs: all 17 table values, TB/CB material routing, simple UDL and central point closed forms, CB UDL/free/interior point closed forms at either root and reversed, partial UDL plus point forces compared with independent point-load Green-function quadrature, slope differentiation, zero-slope maximum, reversed curves, cubic depth scaling, units, legacy-cache rejection, zero loads, invalid geometry/material/span/root and input immutability.
- deflection210-ui.cjs extends the existing isolated diagrams207 browser harness: actual auto/manual panels, original ULS readouts, either CB root, vertical/reversed orientation, empty/invalid loads, numeric/slider/pointer delta synchronization, invalid station recovery, material routing, missing-grade prompt, narrow panel/no overflow, full-precision load editing, no project mutation and no page errors. Screenshot reviewed.
- diagrams207.cjs: existing ULS closed forms, jumps, extrema, equilibrium and moment/shear derivative checks pass.
- All 36 marked bundle modules match source. Bundle changes restricted to beam-load-ui and version labels. All existing non-UI/non-version app files are byte-compared to E2.209, including protected Section A/B rendering, ExcelBridge, native VBA, workbook templates and calculation modules.
- Windows host rebuilt as 2.210.0.0. ZIP integrity and every package entry are checked. Existing 8783 preview is updated without opening or forcibly reloading a tab; no-store response and GitHub asset digest verified at delivery.

Native Excel recalculation/printing was not rerun for this standalone UI calculation; earlier native validation limitations remain in release208.md. No claim is made that this graph resolves them.
