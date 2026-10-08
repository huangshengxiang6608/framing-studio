# E2.173 — support coordinates and derived cantilevers

Baseline: GitHub main `d06f8147862101bd43b1ea9ad96df4c1c40ac1cb` (E2.172).

The rendered centreline of a resized/moved main beam could differ from its saved
reference line. Newly spaced SBs reached the rendered line, but Loading accepted
only the old line. Contact now accepts either centreline and maps physical
stations back to the existing reference span. It does not accept arbitrary
nearby points or extend support beyond a member end. Saved input keys remain
stable.

Previously, three singly rooted automatic MBs meeting at a deleted column could
all acquire CB display names without changing their kinds. Candidates are now
resolved in increasing span order: a rooted short CB is established first, then
the complete support graph is evaluated again before another conversion. Actual
kind, edit controls, drawing labels and loading classification agree. Automatic
CBs retain their source identity so old inputs remain available and restoring a
column can restore the MB. Explicit manual MB types are not silently converted.

New automatic CBs and explicit conversions extend the free end to the continuous
building exterior. The full beam footprint must remain outside Openings and
must not overlap another beam. A blocked extension retains the member and gives
a model issue. Geometric classification does not certify fixed-end stiffness or
member capacity; existing design checks and fixed-end confirmation remain.

Validation:

- `source/tests/support-cantilever173.cjs`: both orientations and endpoint orders;
  short CB / two MB reaction transfer; edge reach; shared floors; retained member
  inputs; stable freeze/reload; edit/delete; restoring the column; explicit manual
  conversion; Opening rejection; moved-contact reference stations and gap guards.
- `column-split170.cjs`, `bays171.cjs`, `beam-network165.cjs`: passed.
- `integration143.cjs`: 55 existing loading assertions and 12 truss groups passed.
- `downstream143.cjs`: 11 downstream load-transfer groups passed.
- Private saved-project copy: removing F03 C1 gives CB-02 (source MB5) from X=0
  to X=8 at Y=25, 8.00 m, fixed at W2. MB4 and MB6 remain MB and are connected.
  The actual member editor dropdown shows CB. Private fixture/screenshot excluded.
- F04: SB8 identifies MB2 / MB9; all 28 previously unverified SBs are connected,
  with all 80 beams retained.
- Source/bundle synchronization and inline script parsing checked. Report
  renderers, Excel templates, VBA and native binaries are unchanged from E2.172.

Delivery updates the offline web app and source. Per the existing instruction
not to recompile EXE, the package retains the E2.172 desktop executable; its
embedded web app is E2.173. Native source version fields are ready for a future
authorized build. Full-building Check remains user-triggered.
