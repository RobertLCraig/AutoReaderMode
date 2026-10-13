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
- [x] #1 WHEN the heuristics run on a page and do not fire, THE EXTENSION SHALL NOT record a trigger
      reason for that tab. proves: `heuristic miss records no reason` in `tests/acceptance.mjs`
<!-- AC:END -->

## Tasks
- [x] Record the trigger reason only when an overlay mounted
- [x] Add the `heuristic miss records no reason` check to `tests/acceptance.mjs`

## Comments

**2026-10-13** Built in 5e99479 with 0015. `injectReader` (`src/background.js`) asks the page for `window.__ARM_DETECT_RESULT` after detect.js; when it did not fire it writes no `trigger:<tabId>` and removes any stale one left by an earlier navigation in the same tab. Added `heuristic miss records no reason` to `tests/acceptance.mjs` (plain non-listed page, default settings): FAIL before with `trigger {"reason":"no-match",...}`, `PASS ... overlay absent, trigger undefined` after. (attended agent, after Rob's 2026-10-13 clear-down)

### 2026-10-13 review (v20261013202013-eec7)

**suite**

`npm test` exited 1 after 26s. The tail of it:

```

> autoreadermode@1.0.0 test
> node tests/acceptance.mjs

edge UA: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0
PASS  #1 [edge] url=read://https_www.ft.com/?url=https%3A%2F%2Fwww.ft.com%2Fcontent%2Facceptance reason=edge:immersive-reader
PASS  #3 [edge] url=read://https_preset-site.example/?url=https%3A%2F%2Fpreset-site.example%2Fstory
PASS  #2 [chromium] overlay text 1392 chars
PASS  #4 [chromium] overlay present, popup reason "Heuristic: paywall meta tag"
PASS  heuristic miss records no reason [chromium] overlay absent, trigger undefined
PASS  #6 [chromium] overlay text has the late text
FAIL  #7 [chromium] badge "", popup unavailable state shown
PASS  #5 [chromium] nothing injected on 3 hosts
NOT RUN  #8 is card 0005, which is not_for_the_loop
```

