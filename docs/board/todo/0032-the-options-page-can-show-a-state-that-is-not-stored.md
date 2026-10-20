# The options page can show a toggle state that is not the one in force

## Why
**A detection toggle can show off while the setting is on.** When a toggle key is deleted from sync
storage, the `storage.onChanged` handler in `src/options.js` sets the checkbox from `!!newValue`,
which is false, while `src/lib/settings.js` falls back to the default, which is true for three of the
four toggles. The defaults are also copied by hand into `options.js` from `SETTINGS_DEFAULTS`, so the
two lists will drift.

**What it costs.** The user reads off a setting that is not the one the worker obeys. Three smaller
display faults sit in the same code:
- When storage changes, the open curated-list drawer is cleared and rebuilt. After each switch
  flip, keyboard focus is lost and the list jumps to the top, and because `renderDrawer` is async
  with no ordering guard, typing in the filter while writes land can leave an older list showing.
- If a curated list fails to load, its count shows "?" and the drawer says "No matches", never that
  the list failed.
- Nothing shows how close `readerSites` is to sync storage's 8 KB per-item limit, past which writes
  fail.

**How it came to be this way.** The options page keeps its own copy of the defaults and re-renders
wholesale on every change, which was simplest when it was written.

## Links

**Relates to**
- `0028` - a refused write must also put the control back; this card's re-render is what does it.
- `0031` - the same page.

## Not this card
- Error handling of writes (`0028`).

## Acceptance
<!-- AC:BEGIN -->
- [ ] WHEN a toggle's key is removed from sync storage, THE APP SHALL show that toggle at its default. proves: `options: deleted toggle shows its default`
- [ ] WHEN a drawer switch is flipped, THE APP SHALL keep keyboard focus on that switch. proves: `options: drawer keeps focus after a flip`
- [ ] WHEN a curated list fails to load, THE APP SHALL say so in its drawer. proves: `options: failed list load is shown`
- [ ] WHEN `readerSites` passes 80 percent of the per-item limit, THE APP SHALL show a warning with the usage. proves: `options: near-quota warning`
<!-- AC:END -->

## Tasks
- [ ] Load `lib/settings.js` in `options.html` and use its `SETTINGS_DEFAULTS` everywhere the page needs a default.
- [ ] Update the changed drawer row in place, or restore focus after a re-render, and drop results from an older render.
- [ ] Show the load error in the drawer.
- [ ] Read `chrome.storage.sync.getBytesInUse('readerSites')` and warn near the limit.

## Plan
`C:\Dev\AutoReaderMode`, files `src/options.html`, `src/options.js`, and `src/lib/settings.js` (read
only, unless it needs to export its defaults differently). Check `settings.js` has no service-worker
only calls at top level before loading it into a page. Add the checks as `record('options', ...)`
lines in `tests/acceptance.mjs`.

## Comments

**2026-10-20** Raised by the shortcomings sweep. Read off the code; nothing here was run.
