# A settings write that fails is shown as saved, and two quick writes lose one

## Why
**The popup and the options page can say "Saved" for a rule or a site that was never stored.** Both
`src/popup.js` and `src/options.js` wrap `chrome.storage.sync.set` in a `syncSet` helper that
resolves from the callback without looking at `chrome.runtime.lastError`. So a write refused by
sync storage (8 KB per item, which `readerSites` reaches at roughly 400 hostnames; 120 writes a
minute) counts as success, the success toast shows, and every `catch` in the callers is dead code.
The toggle's "Failed to save setting." in options can never appear, and a drawer switch or a toggle
can show a state storage does not hold.

**What it costs.** A user's rules silently stop saving once the list is large, and nothing tells
them. Separately, every write reads a whole map or array, edits it, and writes the whole thing back,
with nothing serialising the writes. Two quick drawer switches, two quick clicks on the popup's rule
control, or the popup and the options page open together, and the later write wipes out the earlier
one.

**How it came to be this way.** The callback form of the storage API was used and its error channel
was never wired up; the read-modify-write pattern was copied between the two pages.

## Links

**Relates to**
- `0020` - the worker's own `loadSettings` has the same unchecked `lastError`.
- `0032` - the options page's display faults, which a reverted control will rely on.

## Not this card
- Import, export or quota display for the site list.

## Acceptance
<!-- AC:BEGIN -->
- [ ] WHEN a sync write is refused, THE APP SHALL show an error toast and put the control back to its stored state, in both the popup and the options page. proves: `storage: refused write is reported`
- [ ] WHEN two drawer switches are flipped within the same tick, THE APP SHALL store both changes. proves: `storage: rapid writes keep both`
<!-- AC:END -->

## Tasks
- [ ] Use the promise form of `chrome.storage.sync.set` (or reject on `lastError`) in both `syncSet` helpers, and handle the rejection in every caller, including the drawer switch, remove and restore handlers in `options.js`.
- [ ] Serialise writes through one promise queue per page, re-reading the stored value inside the queue before editing it.
- [ ] Disable the popup's rule control while its write is running.

## Plan
`C:\Dev\AutoReaderMode`, files `src/popup.js` and `src/options.js`. A refused write can be forced in
a test by replacing `chrome.storage.sync.set` in the page with a stub that sets `lastError`, through
`page.evaluate` on the extension page. Add the checks as `record('storage', ...)` lines in
`tests/acceptance.mjs`.

## Comments

**2026-10-20** Raised by the shortcomings sweep. Read off the code; nothing here was run.
