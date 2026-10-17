# E2.309 — Direct-entry height fields

Hide the browser's number-input increment/decrement arrows for floor height, clear height and E&M height in the Floors page, including local-height entries. Retain numeric inputs, direct typing, existing validation, auto-apply and undo. Other numeric fields retain their controls.

This is a screen-only CSS change scoped to the Floors sidebar. Browser inspection confirmed the affected fields use text-field appearance, the total-floor control remains unchanged, and the focused height input has no spinner arrows. All JavaScript, calculation/selection modules, Excel/VBA and Section A/B report rendering are byte-for-byte unchanged from E2.308. The Windows launcher was rebuilt with the new version. The original user's tab and unsaved inputs were not reloaded or replaced.
