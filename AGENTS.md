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

After a completed, verified update, upload the current app and source to the
existing GitHub repository. Replace the tracked latest app files while retaining
Git history and prior local release folders. Provide the new Windows app package.

After every completed update, create or update a pull request in the existing
GitHub repository and describe the changes and validation results. Include the
PR link in the delivery message. Honor any explicit user hold on EXE generation.

## Primary bays and secondary beams

MB, CB and TB are primary beams for bay boundaries. SB is a separate secondary
category. Generate SB spacing independently inside each primary-beam bay; do not
space SBs across intervening MB/CB/TB boundaries. Preserve walls as valid bay
boundaries. CB defaults to support-column width. Existing CBs were explicitly
authorized to migrate to column-dependent width in E2.171; later explicit manual
width overrides must remain intact.
