# Framing Studio project instructions

## Preserve Section A and Section B reports

The user explicitly requires all future updates to preserve both report copies
(Section A 抄 and Section B 抄). Do not change their wording, headings, formulas
as presented, table structure, number display formats, diagrams, spacing, row
heights, column widths, print settings, or pagination rules unless the user
explicitly requests that report change.

An authorized change to inputs or calculations can update the resulting values
in the existing report fields. It does not authorize redesigning, rewriting,
adding, or removing report content. Keep interface improvements separate from
report rendering. Preserve unrelated report code and the native Excel/VBA
rendering routines. Verify preservation when modifying shared calculations or
the workbook template; Excel saves can silently normalize row heights.

## Delivery

Use the official GitHub E2.172 software and its corresponding source as the
baseline for the next software change, PR and upload, as requested by the user.
The downloaded release is `output/FramingStudio_E2.172_Windows.zip` from
`huangshengxiang6608/framing-studio`, release `v2.172`. The existing preview
checkout is older; do not use it to overwrite E2.172 changes. Before future work,
check the repository's current main/release and build on that baseline or its
newer successor, preserving intervening updates.

After a completed, verified update, upload the current app and source to the
existing GitHub repository. Replace the tracked latest app files while retaining
Git history and prior local release folders. Provide the new Windows app package.

After every completed update, create or update a pull request in the existing
GitHub repository and describe the changes and validation results. Include the
PR link in the delivery message. Honor any explicit user hold on EXE generation.

## Preview continuity and remote updates

User preference recorded 2026-10-09: after future verified updates, reuse the
existing browser preview at http://127.0.0.1:8783/ instead of opening a new tab
or assigning a new port for each version. Update the content served at that
address so refreshing the existing tab loads the newly verified version.
Preserve historical release folders and the user's project/browser storage;
do not force a reload that could discard pending input. Verify the served
version and avoid stale-cache responses before announcing availability.

Before starting a software change and again before publishing, check official
GitHub main, releases and relevant PR heads against the local baseline and
known local commits. If remote changes are not present locally, tell the user
which PR/commits changed and summarize their scope before integrating them.
Do not overwrite those changes. Git metadata alone may not identify the
physical computer; state uncertainty instead of claiming a machine origin.
This is a check during active work, not a request for a recurring monitor.

## Primary bays and secondary beams

MB, CB and TB are primary beams for bay boundaries. SB is a separate secondary
category. Generate SB spacing independently inside each primary-beam bay; do not
space SBs across intervening MB/CB/TB boundaries. Preserve walls as valid bay
boundaries. CB defaults to support-column width. Existing CBs were explicitly
authorized to migrate to column-dependent width in E2.171; later explicit manual
width overrides must remain intact.

## Column loads use tributary ownership

User clarification on 2026-10-14: column design loads use tributary areas,
independently of slab -> SB -> primary beam reactions. An offset upper column
is assigned 100% to the lower column whose actual tributary area contains its
physical centre. Do not split this column load using TB end-reaction ratios.
For the current model, 4/F C1 contributes 100% to 3/F AC10 and 0% to AC16.
Accumulate upper floors and confirmed area overrides once along this route.
Shared boundaries or missing ownership require an explicit unresolved result,
not an arbitrary fraction or duplicate assignment. Preserve the separate beam
analysis and the original Section A/B report formulas and formatting.

## Section A beam loads share the Check model

User authorization on 2026-10-14 (E2.264): Section A beam loads must match
Summary/Member Check and Section B, including full beam self-weight, slab
reactions, point loads and resulting M/V. Use the fresh matching Check/B row
for MB, SB, TB and CB; recalculate stale or absent Check data. This supersedes
the historical separate Section A beam-load basis. Keep Section A slab and
column schedules, all original A/B formulas, report layout and native rendering
routines unchanged. Do not overwrite formula cells to force agreement.


## Independent Section B member design sheets

E2.265 user request: generated B/combined workbooks retain a read-only calculation
sheet for each selected member, grouped after its original Section B design sheet.
Preserve the original design layout and calculation equations; capture member
inputs privately so later shared-sheet selection cannot overwrite them. Copied
UPDATE/auto-design buttons must not operate the original design. Original A/B
report-copy content and formatting remain unchanged.


## Manual beam horizontal spacing (E2.283)

User clarified 2026-10-15: in the App Member Check, manual beam reinforcement
may exceed floor(beam width in mm / 100), but same-layer horizontal clear spacing
must be at least 40 mm. Show the physical face, layer and calculated gap on failure,
and reject saving invalid spacing. This does not change vertical layer spacing,
effective-depth calculation, or automatic reinforcement candidate/count rules.
The user subsequently explicitly required Excel to retain its existing rule:
do not change the original workbook, VBA, formulas or A/B report format to relax
that restriction. App acceptance does not imply native Excel verification;
retain native mismatch reporting/blocking rather than forcing Excel agreement.
