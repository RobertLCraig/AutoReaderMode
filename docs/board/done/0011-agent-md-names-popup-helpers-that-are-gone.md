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

### 2026-09-28 review (v20260928202658-512f)

**suite**

No suite this job could find in AutoReaderMode, so none ran. That is not a pass.

**acceptance: sound**

I checked criterion #1 against the code. It passes.

**#1 holds.**
- `AGENT.md` does not name `getSites()` or `setSites()` anymore. My search found them nowhere in `src/` and nowhere in `AGENT.md`.
- `AGENT.md` now sends a site-list change to `options.js`. That is the right file. It holds the site list.
- Each function that `AGENT.md` names in `src/options.js` is real: `renderSites()`, `addHostFromInput()`, `removeHost()`, `syncGet()` and `syncSet()`. The first three read and write `readerSites` through `syncGet()` / `syncSet()`, as the text says.
- `src/popup.js` does have `setRule()`, `syncGet()` and `syncSet()`.

**One small point. It does not fail #1.** The text says `popup.js` "only sets the rule for the current site". But `setRule()` in `src/popup.js` also adds the current host to `readerSites`, or removes it. So the popup can change the site list, but only for the host that is open now. The criterion asks for the text to point at the file that holds the site list, and it does.

VERDICT: sound

**scope: sound**

I checked the build commit `85f119b` for card 0011. It changed two files only:

- `AGENT.md`: one line, the "To add a new site-management feature" passage.
- The card for 0011: ticked boxes and a new comment.

**Nothing went over the fence:**
- No other passage in `AGENT.md` changed. The stale "`css` template literal" note in the styling passage is still there, untouched.
- No code in `src/` changed.
- The changes to `PRD.md` and `README.md`, and the moves of cards 0006 to 0010, came from earlier commits for other cards. This build did not make them.

**Nothing is half done:**
- `AGENT.md` does not name `getSites()` or `setSites()` now.
- The passage points a site-list change at `options.js`.
- Each function it names is in the file it names:
  - `renderSites()`, `addHostFromInput()`, `removeHost()`, `syncGet()` and `syncSet()` are in `src/options.js`.
  - `setRule()`, `syncGet()` and `syncSet()` are in `src/popup.js`.

No criterion is disproved.

VERDICT: sound

**breakage: sound**

I tried to break the new `AGENT.md` passage. I could not.

- **No old names.** `getSites` and `setSites` appear nowhere outside `docs/board/`.
- **It points at the right file.** `src/options.js` holds the site list. It defines `renderSites()`, `addHostFromInput()` and `removeHost()`. All three read and write `readerSites` through the `syncGet()` / `syncSet()` in that file, and those wrap `chrome.storage.sync`.
- **The `popup.js` claim is true.** `src/popup.js` has its own `syncGet()` / `syncSet()`. The only change it makes to storage is in `setRule()`, for the current host. It also reads the site count to show it, but it changes nothing else.
- **Nothing else needed an update.** No other document named the two old helpers.

The criterion holds. Nothing is broken.

VERDICT: sound

