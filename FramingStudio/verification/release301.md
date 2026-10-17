# E2.301 — Wall/beam drawing junctions

Automatic main-beam generation could skip a wall-to-offset-column span because the wall-coverage check treated a diagonal legacy reference as vertical. Reject non-orthogonal coverage candidates. Ordinary regeneration retains deleted-member suppression; explicit Auto MB rebuild restores default spans.

Manual beam snapping resolves actual column centres and the wall face toward the beam before the existing orthogonality, Opening, footprint and overlap checks. The resulting contact is recognized by the existing support check. No gap tolerance or support rule is widened.

Built on official main f9ac54addd0fc8cd89ab919c18f725ecff37a8c4, including axis insertion and wall copying. Loading/RC equations, reinforcement rules, native Excel/VBA, templates and Section A/B report rendering are unchanged. Geometry changes can naturally change subsequent calculated values.

## Validation

- Automated junction and app-snapping tests passed with synthetic fixtures and a local model: centred/left/right walls, both click orders, automatic MB restoration, deletion preservation, physical support agreement and save/reopen persistence.
- Existing beam type, drawing support, beam network, secondary bay following, axis insertion and wall copying regression tests passed.
- Windows build and ZIP integrity verified. All 567 pre-existing files outside the explicitly changed UI/geometry/version/build files match the baseline byte for byte, including Excel and calculation/report assets.

## Live browser verification completed 2026-10-17

- Tested the existing preview using the current locally supplied model, after saving a backup and confirming no pending invalid text inputs.
- Centred wall: manually draw from wall to column, inspect both supports, then delete and restore through Auto MB and Apply Layout. Passed.
- Left-offset wall: manually draw in the reverse direction from column to wall, inspect both supports, then delete and restore through Auto MB. Passed.
- Right-offset wall: manually draw from wall to column, inspect both supports, save and reopen the model, recheck the endpoints/supports, then delete and restore through Auto MB. Passed.
- Actual attempted drawing across an Opening was rejected. Actual attempted drawing overlapping an existing beam was rejected with the overlap message. Neither invalid attempt added a beam.
- Restored the pre-test saved model and exported it again. The entire parsed JSON is exactly equal, preserving geometry, loads, reinforcement, selections and settings.
- The existing right-side preview remains on E2.301 at the original address. Screenshots, model files, coordinates and member details are retained locally and are not uploaded.

No application-code or binary changes were needed for this follow-up. The initial draft's pending live UI verification is now complete. Native Excel/A/B generation was not rerun for this geometry-only change; the byte-preservation check remains valid. Two legacy Playwright runner suites were unavailable; direct browser operation and the named offline regression suites above provide the recorded coverage.
