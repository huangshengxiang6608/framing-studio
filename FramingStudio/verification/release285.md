# E2.285 — Show local App RC promptly and clarify explicit Excel verification

After an automatic reinforcement save, the previous UI hid the current beam's values until the background whole-building App audit finished. No Excel request was sent by that save. The editor now evaluates the current beam using the unchanged Section B App solver and an independently verified unchanged load basis. RC values remain available while the whole-building audit completes.

The load-basis fingerprint ignores only beam reinforcement and transient selections. Geometry, loads, supports, cover, material settings, slab/column reinforcement and other inputs remain part of the fingerprint. A non-reinforcement edit invalidates this local result. A new reinforcement-only member record is equivalent to an absent record after stripping reinforcement. Automatic saves change only the stored steel fields rather than materializing inherited support settings. Cached local RC never marks the whole-building audit or A/B output fresh. Existing width-advice annotations are retained.

The native button is now **更新至EXCEL並核對**. It uses a fresh App check if available, waits for a running App check or updates it if needed, then explicitly sends the latest selected automatic/manual reinforcement for native verification. The user confirmed the scope remains the union of selected Check/A/B members. Daily reinforcement edits and their background App audit do not send Excel requests. The existing explicit report generation and selected-member Excel commands remain available.

The restore button is now **恢復 App 自動選筋**, including the shared slab/column editor. Its selection rules have not changed.

## Validation

- `local-rebar285.cjs`: MB, SB, TB and CB, each manual and restored automatic; immediate local results exactly match full-audit result objects. Unrelated model changes invalidate the local load basis, and local results cannot satisfy A/B freshness.
- `local-rebar285-ui.cjs`: deliberately pauses the background audit; As/RC values remain visible, no Excel call occurs, and the final result matches. The explicit renamed button receives the latest manually edited count and fresh App output.
- Existing automatic-save DOM/full-browser tests pass, including invalid spacing, Enter/blur, focus, local backup, Undo and Restore Automatic.
- Summary App-only and native Check UI/pipeline tests pass. Native replies in these tests are simulated; no native workbook/PDF regeneration is claimed.
- On the previously saved 2026-10-15 16:12 model snapshot (not a fresh capture of the live browser), changing TB26's first tension layer by one bar gave exact local/full RC parity. Local RC lookup/recalculation took 5.16 ms, model regeneration 639.73 ms, and the background incremental full audit 9,587.24 ms. These are separate Node timings, not an end-to-end browser latency guarantee. Initial full audit was 11,146.40 ms. No Excel process was invoked.
- Desktop build and package preservation/ZIP checks pass. Loading and RC solver files, automatic selection rules, native ExcelBridge/VBA/templates, formulas and A/B rendering/formatting files are byte-identical to E2.284.
