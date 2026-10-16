# E2.298 - Keep cantilever roots connected after column resizing

Resizing an aligned column could move the adjacent column-to-wall beam to the new column centre while leaving a one-column CB at its old root. The overlap filter then excluded the CB. Resolve the CB root before collision testing, preserve its free-end station and logical input references, and determine automatic CB width from its followed endpoints. Fixed positions and manual widths remain explicit. Actual overlap, reversed spans and boundary checks remain in force.

Built on official E2.297 main f3fa1956683a88b1556866d025eeaf42d7fbab72. That release arrived during validation and was merged before delivery; its beam type/support editing and report scrolling changes, together with PR #16, are retained. PR #14 remains separate.

Validation:

- `cb-column-follow298.cjs`: 16 combinations of horizontal/vertical, either root end, manual/automatic width and manual/snapshot records; fixed-position counterparts, stable logical load references and actual overlap rejection.
- Current saved model F02 / 2F C2: 1000 -> 750 -> 500 -> 1500 -> 2000 -> 1000 mm through the existing resize API. CB_3 and EDIT_1 meet at the physical column centre at every step, CB width follows the column, and save/reload retains the result.
- Final E2.298 browser test: 500 x 500 mm and 2000 x 2000 mm; 83 beams retained, CB_3 present. Downloaded UI models independently checked against the source engine. Original 1000 x 1000 model restored; complete saved JSON matches the pre-test model.
- `beam-type294.cjs`, `column-anchors174.cjs`, `representative-restore295.cjs`, `support-cantilever173.cjs` and `unified-members175.cjs` passed after integrating official E2.297.
- Windows desktop compiled; bundled engine matches source. Port 8783 serves the exact E2.298 bundle with no-store caching.
- 545 other pre-existing application files are byte-identical to official E2.297, including RC/selection modules, loading calculations, ExcelBridge, workbook/VBA templates and all A/B report/rendering sources. Only the two geometry changes, bundle, version metadata and rebuilt desktop host differ, plus this regression and verification note.

Limits: this change repairs member geometry and does not certify structural adequacy. Geometry-dependent values can change when a previously excluded CB is restored. Existing secondary-bay and unidentified slab-region warnings remain for review. Native Excel/PDF generation was not rerun because neither templates nor report code changed. Private project files and screenshots are excluded from the repository and release package.
