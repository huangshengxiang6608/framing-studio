# E2.207 verification — 2026-10-09

Baseline: E2.206 PR #8 commit f73f9cc3a1a25f6e8467877490f6708730f55943, retaining official E2.203 main. Remote main/PR/release were checked before work.

## Change and scope

Adds read-only SFD/BMD below the beam load diagram, driven by the displayed ULS load records. Existing MB/SB/TB simply-supported and CB cantilever assumptions remain. Concentrated loads create exact shear jumps; piecewise uniform loads produce linear shear and quadratic moment segments. Exact interval roots locate moment extrema; no coarse sampling is used. A/B orientation, physical plan reversal and either CB fixed end are supported. Positive moment is sagging and plotted below the axis; shear is positive above. Cursor/keyboard slider reads sections and both sides of a point load. Empty/invalid/unresolved inputs clear stale diagrams. These are vertical-load effects, not a continuous-frame analysis or an RC pass result.

User-authorized rounding: factored beam DL/LL reactions and moment components retain precision; total reaction/design moment is ceiled to two decimals after combination. Raw factored reaction components survive beam-to-beam transfer. Existing characteristic-load, slab and self-weight stages remain. Ordinary-beam design M remains the peak of the combined loading, not the sum of separate DL/LL peak values. UI displays up to six decimals with an ellipsis for additional precision; computation never uses formatted strings. Section A/B layout, wording, formulas-as-presented and native Excel/VBA are unchanged.

## Independent reference comparison

The Efficient Engineer's companion article for the requested video explains equilibrium and the sagging-positive convention, including a 6 m simply-supported beam with 15 kN at 2 m and 6 kN at 4 m (RA 12, RB 9 kN). This is an independent closed-form regression, not the basis for blindly copying a drawing.
https://efficientengineer.com/shear-force-and-bending-moment-diagrams/

MIT Roylance notes confirm section equilibrium, load discontinuities and piecewise integration. Sign conventions differ between texts; this UI states its own convention explicitly.
https://ocw.mit.edu/courses/3-11-mechanics-of-materials-fall-1999/resources/mit3_11f99_statics/

HK Concrete Code 2013 (2020 edition), Table 2.1, gives 1.4G + 1.6Q for adverse gravity loads in combination 1. This is not all code load combinations. Clauses 6.1.2.2–3 require an applicable analysis or conditional coefficients for continuous beams; the existing simple-span model is not claimed to be that analysis.
https://www.bd.gov.hk/doc/en/resources/codes-and-references/code-and-design-manuals/CoP_SUC2013e.pdf

Source comparison: Loading.actions uses static equilibrium and exact zero-shear roots. Its M/V feed SectionB.beam G23/G24 (checks.js), followed by existing RC/deflection checks. The companion FullAction73 VBA uses the same simple-span/cantilever equilibrium method, but exported characteristic G/Q are refactored rather than carrying the app's upstream factored components. This known difference was disclosed and has not been silently patched.

## Validation

Passed: diagrams207.cjs; reaction-rounding207.cjs; diagrams207-ui.cjs; updated rounding183.cjs; self-weight185.cjs; self-weight185-ui.cjs; integration143.cjs. The legacy rounding test changes only assertions superseded by the user-approved rule. Coverage includes UDL/partial/overlapping loads, concentrated and coincident loads, zero load, equilibrium and dM/dx=V, reversed endpoints, both CB roots, different G/Q peak locations, raw precision through 16 generated beam transfers and Section B G23/G24. UI covers the actual automatic beam panel, high-precision components, pointer/keyboard stations, invalid/empty/manual edits, narrow widths, no project mutation and no page errors. Screenshots inspected.

Saved CB_2 load example: DL reaction 1153.075 + LL 492.225 => total 1645.30 kN; DL moment 3949.411875 + LL 1615.921875 => total 5565.34 kN m. The unrounded curve peak magnitude is 5565.33375. Full project regeneration can additionally change downstream values because intermediate beam reaction components now retain precision.

Generated geometry and complete Section A calculation output on the shared-floor automatic/manual fixture are exactly identical to E2.206. All 36 marked modules and the unmarked beam-loads module match source. Bundle outside authorized modules and version unchanged. 312 pre-existing files are byte-identical, including report renderers, RC formulas, ExcelBridge, VBA, templates and all print/layout settings. Windows rebuilt as 2.207.0.0; ZIP entries and bytes verified.

## Limits and diagnostics

Native Excel/print rendering and desktop interaction were not rerun. The previously disclosed App/native rounding path difference remains: the saved CB_2 data give 5565.86025 kN m by the supplied VBA formula on exported G/Q; this is a source-derived calculation, not a native Excel run. No report/template change was made.

Optional truss-downstream-tests could not run: bundled Edge did not launch; a Chrome-only runtime fallback then reported the legacy missing verification/fixture.framing.json. No assertions were bypassed. integration143 passed its 55 existing loading assertions and same-floor/two-storey truss downstream integration cases.
