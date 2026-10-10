# E2.212 verification

Baseline: E2.211 commit 9564aea88036fec909d29bfade57fdde91af32cf; official main 5d18359d7110709b14fcecf431e23b88509791f6 / release v2.203 and PR #8 checked before work and publication.

## Explicitly approved scope

The user clarified that a failed span/depth check should be accepted when the calculated maximum deflection is less than L/250, with minimal display. After being told that existing double integration is short-term uncracked gross-section deflection, the user explicitly confirmed: use this short-term criterion and label it accordingly, with Section B independent. This supersedes the E2.211 display-only preference for this Summary UI; protected report copies remain unchanged.

Eligible beam Summary rows (MB/SB/TB/CB, A status NOT OK or CALC. REQUIRED) compare the existing saved-load maximum in mm against L*1000/250. Both values must be valid; comparison uses raw numbers, strictly less than, without rounding. Invalid/missing inputs and non-beams cannot receive the alternative. Section A's Summary cell becomes short-term deflection OK/not passed with the numeric inequality and a brief uncracked-model label. Section B retains its original result. Only if the alternative passes AND B is OK does the displayed row status/filter become OK (SHORT-TERM). Original audit results, report results and project are not mutated. Original A-problem rows remain available in the list, including accepted alternatives; both-pass original rows remain omitted. Pending/stale results do not display an old numeric acceptance.

## COP scope check requested by user

Buildings Department Concrete COP 2013 (2020 edition), 7.3.1, printed p106: L/250 relates to sag relative to supports under quasi-permanent loads (appearance/general utility), for beams, slabs and cantilevers. L/500 is normally the limit for post-construction deflection to prevent adjacent-part damage, with limits adjusted for sensitivity. These are different deflection quantities, not beam-versus-slab limits. Direct code deflection is governed by 7.3.5/7.3.6 including RC curvature and time effects. This UI's explicitly approved short-term DL+LL/gross-section check is not that full verification, and does not claim to check L/500.

Source: https://www.bd.gov.hk/doc/en/resources/codes-and-references/code-and-design-manuals/CoP_SUC2013e.pdf
The HKIE explanatory handbook 7.3.1 (printed p128) also explains that deformation before adjacent parts are connected does not cause their subsequent damage.

## Validation

- deflection-criterion212.cjs runs all summary-deflection211 and summary-sections205 numerical/audit regressions, then tests the user's 12.25 m / 28.510... mm example, exact L/250 equality, just above/below with raw precision, zero loads, independent B failures, missing inputs, unsupported element types, and no mutation.
- deflection-criterion212-ui.cjs: real audit results, short-term alternative and compact inequality, independent B failure, accepted-status filtering and locating, equality rejected, pending and stale suppression, narrow viewport screenshot reviewed, no project mutation/page errors.
- E2.205/E2.211 UI tests asserting superseded display-only labels are superseded by the E2.212 UI test; not claimed as passing unchanged. Their underlying numerical/classification tests still pass.
- Bundle changes restricted to beam-load-ui.js and explorer-ui.js plus version labels. Loading/RC/deflection numerical solvers unchanged. All 36 marked modules match source; existing protected files including both report renderers, workbook templates, native VBA and ExcelBridge byte-identical to E2.211.
- Windows host rebuilt as 2.212.0.0, package contents checked against source/app. Existing 8783 preview updated without forced reload/new tab; no-store HTTP and uploaded asset digest verified.

Native Excel recalculation/printing not rerun or claimed; earlier native validation limitations remain in release208.md.
