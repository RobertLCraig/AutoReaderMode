# The popup does not say what will happen on this site, or why Edge fired

## Why
**With the rule on Default, the popup cannot tell the user whether this site will open in reader
mode.** Its help text is "Use the global detection rules". A site on the curated paywall list, which
opens automatically, looks the same as one that never will, and the popup does not show when the
heuristics are off. `decideTrigger` in `src/lib/triggers.js` already works the answer out, but
`src/popup.js` has no message to ask the worker for it.

**What it costs.** PRD goal 5 says every trigger surfaces with a reason and the user can override
it. The user can only choose a rule well if they know what Default will do. The same gap shows in
three more places:
- On Edge the stored record carries `sourceReason`, the rule that caused the redirect (preset,
  curated, always, manual). The popup ignores it and says only "Edge Immersive Reader is active on
  this tab".
- When Immersive Reader fails and the overlay is used instead, the stored reason is
  `edge-fallback` or `edge-fallback:<error>`. Neither the popup's labels nor `reasonLabel` in
  `src/content/reader.js` cover it, so the popup shows a bare "Triggered" and the overlay shows
  "Reader Mode", hiding that the preferred reader failed.
- Changing the rule has no effect on the open page and the popup does not say it applies from the
  next load. Setting Never leaves the overlay open; setting Always does not open it.

**How it came to be this way.** The popup was designed around what already happened on the tab, and
the reasons added for Edge were never given labels.

## Links

**Relates to**
- `0015` - the missing label for the heuristic signal, in the same label tables.
- `0022` - the stored record these labels read.

## Not this card
- The heuristic signal label (`0015`).
- The raw signal strings in the overlay's own label (`0036`).

## Acceptance
<!-- AC:BEGIN -->
- [ ] WHEN the popup opens with the rule on Default on a curated paywall host, THE APP SHALL say the site opens automatically because it is a known paywall site. proves: `explain: Default previews the decision`
- [ ] WHEN Edge redirected because of a preset, THE APP SHALL name the preset as the reason. proves: `explain: Edge shows its source reason`
- [ ] WHEN the overlay was used because Immersive Reader failed, THE APP SHALL say so in the popup and in the overlay label. proves: `explain: Edge fallback is labelled`
- [ ] WHEN the user changes the rule, THE APP SHALL apply it to the open tab or say it applies on the next load. proves: `explain: rule change says when it applies`
<!-- AC:END -->

## Tasks
- [ ] Add a `decide` message to the worker that returns `decideTrigger(host)`, and show the result under the rule control.
- [ ] Add labels for `sourceReason` and for `edge-fallback` / `edge-fallback:<error>` in `popup.js` and in `reasonLabel` in `reader.js`.
- [ ] After a rule change, either re-run the decision on the tab or show "applies from next load" with a reload button.

## Plan
`C:\Dev\AutoReaderMode`, files `src/background.js` (new message case in the `onMessage` listener),
`src/popup.js` and `src/content/reader.js`. Build after `0015` lands if it is in progress, since both
edit the same label tables. Add the checks as `record('explain', ...)` lines in
`tests/acceptance.mjs`; the Edge ones run in the Edge context it already launches.

## Comments

**2026-10-20** Raised by the shortcomings sweep. Read off the code; nothing here was run.
