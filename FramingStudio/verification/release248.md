# E2.248 — Member Check navigation and torsion options

Baseline: E2.247, f2d42e1650c87eb417dc7bff04acc4a79a8028af. Official main,
release and PR #8 checked before changes; no intervening changes found.

- Torsion link diameter dropdown adds T20 and T25. Existing manual RC evaluation
  and serialization consume the selected diameter; automatic selection rules
  and RC formula code are unchanged.
- Member Check lists selected/currently focused members first, expanded by
  default, with a bounded scrollable table. New focus alone does not change any
  Check or report selection. The table supplies the Check/A/B controls previously
  duplicated below it. Choosing another member resets the side-panel scroll.
- The redundant current-selection card and ordinary per-floor failure details
  are omitted on Member Check. Per-member results remain; stale selection repair
  remains available. Other pages keep the existing floor-strip behavior.
- The browser has no WebView2-to-Excel bridge, so report generation was disabled.
  Browser report pages now show an actionable Windows/Excel handoff and use the
  existing validated project-save button. Native Windows A/B/AB generation and
  busy guards are unchanged. Browser-native Excel generation is not added.

Validation:
- Updated `rebar227.cjs` DOM regression passes, including T20/T25 live inputs,
  T25 save/reload, independent diameters, RC previews, selection/undo, spacing
  guards, AUTO restoration and duplicate-free controls.
- `member-navigation248.cjs` verifies list ordering, cross-floor navigation,
  scroll reset, separate Check/A/B choices, removal and collapse retention.
- `report-handoff248.cjs` verifies browser instructions/save and native A/B/AB
  dispatch plus busy-state controls. Tests are offline DOM tests using linkedom.
- JavaScript syntax and desktop compilation pass. Packaged HTML is checked
  against the baseline plus only the intended module/version substitutions.
- Existing report content/renderers, PDF preview, native report generation
  handlers, Excel/VBA and templates are preserved byte-for-byte. No report
  wording, layout, number formatting, diagrams, printing or pagination changes.

Deployment keeps the existing 8783 address, project storage and pending page
inputs; no browser reload is forced.
