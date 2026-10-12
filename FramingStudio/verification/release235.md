# E2.235 verification

Baseline: E2.234, cab3646f5a66f4e277bec6d30358c7b055eebb4a. Official main/release and PR #8 checked before editing and before publishing; main remains 5d18359d7110709b14fcecf431e23b88509791f6, official release v2.203.

Beam Member Check interface only:
- Original Excel overall status, failure reasons, actions, source and cell results are contained in one initially collapsed detailed-calculation section. A note distinguishes the original Excel L/d-inclusive result from the diagram's independent RC result.
- Remove the repeated legacy reinforcement description from the beam result block. Existing column/slab output remains unchanged.
- Replace the visible beam AUTO/MANUAL selector with an accessible live status. A hidden mode field maintains the original save/restore path. Inline editing shows manual/unsaved; saving shows manual; restoring automatic reinforcement retains the existing button and computation.

Validation:
- Expanded offline Member Check DOM suite passes: collapsed detail contains raw heading/cell table, no duplicate reinforcement notice, no visible mode selector, automatic/manual/unsaved status transitions, restore button and existing save path.
- Existing diagram editing, caret, validation, CB area mapping, freshness and selection tests continue to pass.
- Windows desktop compilation succeeds. Package verification compares embedded modules, ZIP contents and protected application files against baseline, including unchanged calculations, Section A/B report renderers, report exports, Excel workbooks and native VBA routines.
- No live browser automation used. Delivery verifies served preview bytes/no-store headers and uploaded package digest without forcing reload or changing storage.
