# AGENT.md names popup helpers that are gone

## Why
`AGENT.md` line 41, under "To add a new site-management feature", tells an agent to edit `popup.js`
and says its `getSites()` / `setSites()` helpers abstract `chrome.storage.sync`. Neither function
exists anywhere in `src/`. `popup.js` has `syncGet()` / `syncSet()`, and the bulk site list moved to
`options.js` in v2.0, which has its own `syncGet()` / `syncSet()`, `renderSites()`,
`addHostFromInput()` and `removeHost()`.

An agent that trusts the passage looks for helpers that are gone, in the file that no longer holds
the site list. The session on `0006` found it on 2026-09-28; that card covered three other passages
only.

## Links

**Relates to**
- `0006` - the card whose session found this; it fixed the other v1 passages in `AGENT.md`.

## Not this card
Any other passage in `AGENT.md`, any other document, and any change to the code.

## Acceptance
<!-- AC:BEGIN -->
- [x] #1 `AGENT.md` SHALL NOT name `getSites()` or `setSites()`, and SHALL point a site-management
      change at the file that holds the site list now. proves: none - no suite in this repository
      reads prose
<!-- AC:END -->

## Tasks
- [x] Read `src/popup.js` and `src/options.js` and rewrite the passage to match

## Comments

**2026-09-28** RESULT: done
TESTS: +0 new, none runnable (criterion is proves: none)
TOUCHED: AGENT.md
TOUCHED: docs/board/in-progress/0011-agent-md-names-popup-helpers-that-are-gone.md
OUT-OF-SCOPE: none

Rewrote `AGENT.md` line 41 only. It now sends a site-list change to `options.js` and names
`renderSites()`, `addHostFromInput()`, `removeHost()` and its `syncGet()` / `syncSet()`, all checked
against `src/options.js`. It says `popup.js` only sets the current site's rule through `setRule()`
(checked at `src/popup.js:148`). `getSites` / `setSites` no longer appear outside the board.

The session prompt asks for `.\vendor\bin\pest.bat` and `pint.bat`. This repository has no
`composer.json`, no `vendor/` and no PHP; it is a browser extension with no automated suite, so
neither was run. Nothing here needs a browser check: the change is prose only.
