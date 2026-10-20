# Per-site rules cannot be edited on the options page, and Remove means opposite things

## Why
**The options page lists per-site rules but cannot change them.** Each row in the "Your sites" list
in `src/options.js` shows an Always or Never tag and a Remove button. Turning a Never into an Always
means removing it and re-adding it, and a Never rule cannot be created here at all, only from the
popup while on that site.

**What it costs.** The options page is where a user goes to manage the extension in bulk, and it
cannot do the one thing the PRD makes central to false positives. The row's Remove button also does
opposite things with nothing to say so: on an Always row it stops reader mode opening, on a Never
row it lets it open again. Around it:
- The empty-list text says "Add a hostname above to always open it in reader mode", though the list
  also holds Never rules, and nothing tells the user this is where the popup's rules live.
- In the curated-list drawers, "disable" and "remove" have the same effect on triggering
  (`decideTrigger` filters both out); remove only also hides the entry, with no confirmation and no
  undo in the toast.

**How it came to be this way.** The list was built for v1's add-a-site flow and the rules were
rendered into it without their own controls.

## Links

**Relates to**
- `0030` - rule scope; each row should show what the rule covers.
- `0029` - the add box in the same section.
- `0028` - every control here needs its write checked.

## Not this card
- Import or export of the list.

## Acceptance
<!-- AC:BEGIN -->
- [ ] WHEN the user changes a row's rule between Always, Default and Never, THE APP SHALL store the new rule without re-adding the site. proves: `rules: a row's rule can be changed in place`
- [ ] WHEN the user adds a host, THE APP SHALL let them choose Always or Never. proves: `rules: a Never rule can be added from options`
- [ ] WHEN the user removes a curated entry, THE APP SHALL offer an undo in the toast. proves: `rules: curated remove can be undone`
<!-- AC:END -->

## Tasks
- [ ] Give each row the popup's Always / Default / Never segmented control in place of the tag and Remove.
- [ ] Add a rule choice to the add box.
- [ ] Rewrite the section heading and empty-state text to cover both rule types.
- [ ] Merge curated "disable" and "remove" into one control, or label the difference, and add Undo to the toast.

## Plan
`C:\Dev\AutoReaderMode`, files `src/options.html` and `src/options.js`. Reuse the segmented control's
markup and styles from `src/popup.html` rather than inventing a second one. Drive
`chrome-extension://<id>/options.html` in `tests/acceptance.mjs` and add the checks as
`record('rules', ...)` lines.

## Comments

**2026-10-20** Raised by the shortcomings sweep. Read off the code; nothing here was run.
