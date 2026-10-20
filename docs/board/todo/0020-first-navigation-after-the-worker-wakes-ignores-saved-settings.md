# The first navigation after the worker wakes ignores the user's saved settings

## Why
**A site the user set to Never can still open in reader mode.** An MV3 service worker is shut down
after about 30 seconds idle and woken by the next event. When `webNavigation.onCompleted` is that
event, `handleNavigation` in `src/background.js` calls `decideTrigger` straight away, while `boot()`
is still waiting on `loadSettings()`. `settingsCache` in `src/lib/settings.js` starts as a copy of
`SETTINGS_DEFAULTS`, so that one decision is made with no `siteOverrides`, an empty `readerSites` and
default toggles.

**What it costs.** It hits the first page load after every idle spell, which for most users is the
start of most browsing sessions. A Never rule on a curated paywall site fails exactly then, a user's
own preset site does not open, and a user who turned the paywall heuristic off gets it anyway.
Nothing tells them the rule was skipped.

**How it came to be this way.** The listeners are correctly registered at top level, but nothing
ties the first decision to settings having loaded. Two related gaps sit in the same code:
`loadSettings` never checks `chrome.runtime.lastError`, so if `sync.get` fails, `data` is undefined,
`key in data` throws inside the callback and the promise never resolves; and `bindSettingsListener`
runs only after that await, so a change written while `sync.get` is in flight is lost until the
next restart.

## Links

**Relates to**
- `0028` - the same `lastError` blind spot on every other sync write.
- `0021` - the other piece of state that does not survive the worker sleeping.

## Not this card
- Edge redirect bookkeeping that is lost when the worker sleeps (`0021`).
- Any change to which source wins in `decideTrigger`.

## Acceptance
<!-- AC:BEGIN -->
- [ ] WHEN the worker is stopped and a navigation to a curated paywall host with a saved Never rule wakes it, THE APP SHALL not open reader mode. proves: `cold-start: Never rule holds on the waking navigation`
- [ ] WHEN `chrome.storage.sync.get` fails during load, THE APP SHALL fall back to defaults, log the error and still finish booting. proves: `cold-start: settings load failure still boots`
<!-- AC:END -->

## Tasks
- [ ] Hold the `loadSettings()` promise at module level and await it at the top of `handleNavigation` and of the `manual-toggle` handler.
- [ ] In `loadSettings`, check `chrome.runtime.lastError`, use defaults on failure and always resolve; check it on the defaults write too.
- [ ] Register the `storage.onChanged` listener synchronously at top level.
- [ ] Add both checks to `tests/acceptance.mjs` as `record('cold-start', ...)` lines.

## Plan
Work in `C:\Dev\AutoReaderMode`, files `src/background.js` and `src/lib/settings.js`. To reach a
cold start in Playwright, seed `chrome.storage.sync` in one context, then stop the worker (for
example from `chrome://serviceworker-internals`) so the navigation is the event that wakes it. Run
`npm test`; the new lines print `PASS  cold-start ...`.

## Comments

**2026-10-20** Raised by the shortcomings sweep. Read off the code and re-read at the cited
functions; not yet observed in a browser.
