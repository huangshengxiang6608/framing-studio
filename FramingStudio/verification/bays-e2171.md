# E2.171 verification

CB widths were saved as manual values. Existing CB records now migrate once to
column-dependent widths, as explicitly requested. Later numeric manual overrides
remain effective; blank width restores column sizing.

The affected CB root ended inside the receiving main-beam section but 250 mm
short of its centreline. Exact raw-line bay detection therefore missed that
boundary and restored SB spacing across all three bays. Bay detection now joins
physically connected primary sections to their receiving centrelines. This is a
topology projection; it does not move physical beam endpoints or bridge open gaps.
MB, CB and TB define primary bays; SB does not. Walls remain valid boundaries.

Automated validation passed in the preview and integrated PR builds:

- `bays171.cjs`: legacy and tagged snapshots, CB migration, independent bay spacing,
  MB/TB/CB versus SB classification, unique IDs, connected supports, shared floors,
  column resizing, subsequent explicit manual width, reset to column width,
  freeze/reload stability, preserving automatic CB during SB rebuild, and retaining
  original SBs where existing member inputs require review.
- `column-split170.cjs`, `beam-network165.cjs`, and `shorter-main-beams.cjs`:
  intermediate column splitting, primary/secondary connections and load actions.
- `loading115.cjs`: 55 existing loading assertions. Explicit manual-CB fixtures
  opt into the migrated project schema so their specified dimensions stay fixed.
- Integrated PR `integration143.cjs`: 55 existing loading assertions and 12 truss
  integration groups; `downstream143.cjs`: 11 load-transfer groups.
- 31 preview and 38 integrated inline classic scripts parse successfully.
- Changed source modules exactly match their embedded app copies. All unrelated
  embedded content is byte-identical to E2.170, apart from the version label.

A private project copy was replayed and visually inspected without changing the
user's open project. F02 CB_1 and CB_2 are both 1500 mm wide. The right strip has
three bays with 4, 7 and 4 SBs at 2.45, 3.00 and 2.45 m spacing respectively.
All spacing is uniform within each bay and no model issues are produced there.
The private project and screenshot are excluded from Git and the package.

Section A/B renderers, report formulas, workbook templates, VBA and native EXE
files are unchanged by E2.171. Windows delivery retains the existing executable
and updates the offline app assets and source. Full-building Check remains a
manual action; these geometry tests do not assert engineering approval.
