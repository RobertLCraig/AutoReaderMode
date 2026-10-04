# The popup says reader mode is active on pages where nothing fired

## Why
**On an ordinary page, the popup claims reader mode is on.** With the default settings, every
http(s) page that is not on a list gets the heuristic scripts injected. When `detect.js` finds
nothing, no overlay appears, which is right. But the popup on that page shows the "fired" pill,
"Reader mode is active on this tab." and an "Exit Reader Mode" button.

Seen in Chromium on 2026-10-04: a plain article page with no paywall marker, no overlay, and
`chrome.storage.session` holding `trigger:<tabId> = { reason: 'no-match', requireHeuristic: true }`.

**What it costs.** This is the default path, so it is most pages a user visits. The popup is the
user's only way to see why the extension acted, and on these pages it says the opposite of the
truth. Read off the code, not observed: clicking "Exit Reader Mode" there would OPEN the overlay,
because `reader.js` toggles.

**How it came to be this way.** `injectReader` in `src/background.js` calls `setTriggerReason` as
soon as `executeScript` returns, whether or not `reader.js` passed its heuristic gate. The gate is
inside the page, and its answer never comes back to the service worker.

## Links

**Relates to**
- `0001` - the acceptance pass that found this while checking criterion 4.
- `0015` - the missing heuristic label; both change what `injectReader` stores, so fix them together.

## Not this card
The heuristic label wording; that is `0015`.

## Plan
Stand at the repository root and run `npm ci`. Make `injectReader` write `trigger:<tabId>` only when
an overlay was actually mounted, for example by having the injection return whether `reader.js`
mounted, or by checking `window.__ARM_DETECT_RESULT.fire` in an `executeScript` call after
`detect.js`. Add a check to `tests/acceptance.mjs` that visits a non-listed page without paywall
markers under default settings and fails when `trigger:<tabId>` is set.

## Acceptance
<!-- AC:BEGIN -->
- [ ] #1 WHEN the heuristics run on a page and do not fire, THE EXTENSION SHALL NOT record a trigger
      reason for that tab. proves: `heuristic miss records no reason` in `tests/acceptance.mjs`
<!-- AC:END -->

## Tasks
- [ ] Record the trigger reason only when an overlay mounted
- [ ] Add the `heuristic miss records no reason` check to `tests/acceptance.mjs`

## Comments
