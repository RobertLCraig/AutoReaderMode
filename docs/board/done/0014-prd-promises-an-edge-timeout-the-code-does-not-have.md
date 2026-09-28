# The PRD promises an Edge timeout the code does not have

## Why
`PRD.md` says the Edge fallback to the overlay fires if the `read://` navigation errors **or** if
`onCompleted` does not fire within 1.5 s. It says this twice: section 5.4, Edge path step 3, and
section 8, third bullet.

The code has no timeout. The header comment in `src/background.js` says "We do NOT use a timeout -
read:// staying loaded is the success state". `HANDOVER.md`, "Edge Immersive Reader", agrees. So a
reader of the spec expects a safety net that is not there: an Edge release that shows a blank page
without an error would not be caught.

The PRD was written before the build, and the build chose error-only. Nobody updated the spec.

## Links

**Relates to**
- `0009` - the session on it found this while editing the same two sections.

## Not this card
Adding a timeout to the code. Whether one is wanted is a separate question; this card only makes the
spec say what was built.

## Acceptance
<!-- AC:BEGIN -->
- [x] #1 `PRD.md` sections 5.4 and 8 SHALL describe the Edge fallback as error-triggered only, with no
      timeout, matching `src/background.js`. proves: none - no suite in this repository reads prose
<!-- AC:END -->

## Tasks
- [x] Correct section 5.4, Edge path step 3
- [x] Correct section 8, third bullet

## Comments

**2026-09-28** RESULT: done
TESTS: +0 new (criterion is proves: none); no suite exists to run
TOUCHED: PRD.md
TOUCHED: docs/board/in-progress/0014-prd-promises-an-edge-timeout-the-code-does-not-have.md
OUT-OF-SCOPE: none

Section 5.4 step 3 and section 8 bullet 3 now say the fallback fires only on
`webNavigation.onErrorOccurred` for the `read://` navigation, with no timeout, and that a blank
`read://` page without an error is not caught. Wording follows the `src/background.js` header and
HANDOVER.md "Edge Immersive Reader". Step 3 also dropped "one-shot listener for that tab": the code
uses one global listener keyed by the `pendingEdgeReader` map, so the old phrase was also untrue.
No code changed. The repository has no `composer.json`, `vendor/` or tests, so `pest.bat` and
`pint.bat` cannot run here; that is the repository, not this worktree.

### 2026-09-28 review (v20260928205906-c985)

**suite**

No suite this job could find in AutoReaderMode, so none ran. That is not a pass.

**acceptance: sound**

I checked the one criterion against the code. It is met.

**#1 is met.**
- **Section 5.4, step 3** in `PRD.md` now says the fallback fires only when `webNavigation.onErrorOccurred` reports an error on the `read://` load. It also says there is no timeout.
- **Section 8, bullet 3** says the same thing. It also says that a blank page with no error is not caught.
- **The code agrees.** In `src/background.js`, the `chrome.webNavigation.onErrorOccurred` listener reads the `pendingEdgeReader` map, then reverts the tab and shows the overlay. The `handleNavigation` path deletes the map entry when the `read://` page finishes loading, which is the success case. The file has no `setTimeout` for this fallback. The header comment says: "We do NOT use a timeout".
- **No old claim is left.** A search of `PRD.md` finds no "1.5". The "timeout" lines that remain are about the Chrome MutationObserver in sections 5.5 and 9, not about Edge.
- **The dropped "one-shot listener" phrase is right to go.** The code uses one listener for all tabs, not one per tab.

No criterion is disproved.

VERDICT: sound

**scope: sound**

The work stayed inside the card. I found no fault.

**What the change did**
- The change is in commit `61c1537`, and it touched two files only.
- In `PRD.md`, it changed section 5.4 (Edge path, step 3) and section 8 (third bullet). The card names both.
- The other file is the card for `0014`.
- The diff also shows changes to `AGENT.md`, `README.md`, the section 6 link and the other cards. Earlier commits made those, for cards `0009` to `0013`. This build did not make them.

**The fence ("Not this card")**
- The card says not to add a timeout to the code. No code in `src/` changed.

**Extra text**
- Step 3 dropped the words "one-shot listener for that tab". The builder recorded this in the card comment.
- Those words were in the step 3 sentence that the card asked to fix. So this is part of the fix, not extra work.

**Is anything half done?**
- A search of the `.md` files found no more "1.5 s" or "times out" claims about Edge.
- The two other timeouts in `PRD.md` are different ones: the SPA parse timeout and the 5 s MutationObserver timeout (a watcher for page changes). Neither is about Edge.
- `HANDOVER.md`, "Edge Immersive Reader", says the same thing as the new text.

This check disproves no criterion.

VERDICT: sound

**breakage: sound**

I tried to break this change. I could not.

- **Section 5.4, step 3 is true.** In `src/background.js`, the `chrome.webNavigation.onErrorOccurred` listener finds the tab in `pendingEdgeReader`. It logs a `console.warn`, removes the entry, reverts the tab, and injects the overlay. Nothing sets a timer. The header comment says "We do NOT use a timeout".
- **Section 8, third bullet is true.** No `setTimeout` touches the Edge path. When `onCompleted` fires for `read://`, `handleNavigation` removes the entry. That is the success path, as the new text says.
- **No 1.5 s promise is left.** I searched every file outside `docs/board/` for "1.5 s" and "timeout". The PRD still says "timeout" in two places: section 5.5 step 3 and the section 9 risk table. Both are about the SPA MutationObserver cap (`SPA_MAX_WAIT_MS` in `content/reader.js`), not the Edge path.
- **The other docs agree.** `HANDOVER.md`, "Edge Immersive Reader", says the same thing in almost the same words.
- **Section 1 still holds.** It says the overlay is a per-tab fallback "when Immersive Reader fails to load". That is loose, but it does not promise a timeout.
- **No code changed.**

No criterion is disproved.

VERDICT: sound

