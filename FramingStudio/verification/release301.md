# E2.301 — Wall/beam drawing junctions

Automatic main-beam generation could skip a wall-to-offset-column span because the wall-coverage check treated a diagonal legacy reference as vertical. Reject non-orthogonal coverage candidates. Existing deleted-member suppression remains effective during ordinary regeneration; explicit Auto MB rebuild restores the default span.

Manual beam snapping now resolves actual column centres and the wall face toward the beam before the existing orthogonality, Opening, footprint and overlap checks run. The same physical wall contact is recognized by the existing Loading support check; no gap tolerance or support rule is widened. Both click directions work for centred and offset walls.

Built on official main f9ac54addd0fc8cd89ab919c18f725ecff37a8c4, including the merged axis-insertion and wall-copy changes. No loading/RC equations, reinforcement rules, native Excel/VBA, templates, or Section A/B report rendering were edited. Geometry changes can naturally change subsequent calculated values.

Validation:
- `wall-beam-junction301.cjs`: synthetic and current private 2019 model, wall centre/left/right, six junction targets per position, automatic missing MB restored, ordinary update respects deletion, physical wall support agrees.
- `wall-beam-snap301.cjs`: executes the actual app snapping functions in Node VM, both click directions for all three positions; generated manual beam remains connected after JSON save/reopen. Passed with synthetic and current private model.
- True OP crossings, genuine beam overlaps, wall gaps, out-of-length and ambiguous wall contacts remain guarded; transposed horizontal-wall cases passed.
- Existing `beam-type294`, `drawing-support197`, `beam-network165`, `secondary-bay-follow300`, `axis-insert291`, and `wall-copy292` regression tests passed.
- Windows desktop build and ZIP integrity/contents checked. All pre-existing files outside the explicitly changed UI/geometry/version/build files are byte-identical to the baseline, including all Excel assets and calculation/report modules.

Limitations: browser automation timed out after refreshing the preview, so interactive pointer/screenshot verification was not completed. Two legacy browser suites (`beam-footprint`, `main-beam-centres`) also could not start because their Playwright dependency is unavailable. The tests above exercise the actual snapping and generation code offline; they are not claimed as live UI tests. Native Excel/A/B generation was not rerun for this geometry-only change. The private model is not included in the repository or release.
