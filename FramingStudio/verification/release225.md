# E2.225 verification — 2026-10-11

Baseline E2.224 e56d54ac284c315e1d41adcfbb3d178193460264; official main 5d18359d7110709b14fcecf431e23b88509791f6, release v2.203 and PR #8 checked before editing with no remote-only changes.

E2.225 removes the redundant Summary Check status selector and its predicate. Floor and member type scope the result set; the existing combination table alone selects result states. Combination counts no longer change because of a second, less detailed status filter. Presets and pending/non-beam categories remain available.

Validation: rendered-summary checks confirm two selectors, all eight beam combinations, correct floor/type counts, and no hidden restriction even with a legacy status value. Existing beam-filters214 regressions pass, including dependent A/B checks, deflection, transfer, pending states and default selections. Exact bundle and protected-file comparison preserve all calculation/report/Excel/VBA modules and the Member Check calculate/update handlers. Windows application and source are packaged together. Live browser inspection is unavailable due URL policy; no browser workaround or forced reload is used. Native Excel recalculation was not required for this filtering-only update.

The Member Check calculate/update button is deliberately unchanged: its existing flow can first widen selected MB/SB members under the prior sizing rules, then recalculate checks. This release only changes Summary filtering.
