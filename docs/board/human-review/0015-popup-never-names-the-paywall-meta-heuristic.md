---
not_for_the_loop: main's suite (npm test) is red because of this card's own failing check #4, and the loop parks any card while main is red, so only an attended session can build it
---
# The popup never names the heuristic that fired

## Why
**A page that the paywall heuristic opened in reader mode shows a vague popup.** PRD section 11
criterion 4 says that a non-curated page carrying
`<meta property="article:content_tier" content="locked">` triggers reader mode and that the popup
then reads "Heuristic: paywall meta tag". The overlay does appear. The popup reads "Reader mode is
active on this tab." instead.

**What it costs.** The PRD's mitigation for heuristic false positives is that the user can see why
the extension fired and set the site to Never. A popup that cannot say "the paywall meta tag" leaves
the user guessing, and criterion 4 cannot pass, so v2 cannot ship.

**How it came to be this way.** `src/background.js` stores `decision.reason || 'heuristic'` for a
heuristic injection, and `decideTrigger` returns `reason: 'no-match'` there, so the stored reason
is `no-match`. `src/popup.js` has no label for `no-match`, and none of its labels names a detection
signal. The signal (`paywall:meta:content_tier=locked`) exists only inside the page, in
`window.__ARM_DETECT_RESULT`, and never reaches storage.

## Links

**Relates to**
- `0001` - the acceptance pass whose criterion 4 found this; `tests/acceptance.mjs` is the check.
- `0017` - the same stored reason is also written when the heuristic did NOT fire. Fix both in one
  sitting, because both change what `injectReader` writes to `chrome.storage.session`.

## Not this card
The false "active" reason on pages where nothing fired; that is `0017`. Wording for the ad-density
signals beyond what the popup needs to name them.

## Plan
Stand at the repository root. `npm ci`, then `node tests/acceptance.mjs chromium` prints
`FAIL  #4 [chromium] overlay present, popup reason "Reader mode is active on this tab."` today.
Get the detection signals from the page back to the service worker after `detect.js` runs (for
example, return them from an `executeScript` call), store them with the trigger reason, and give
`src/popup.js` a label per signal, with `meta:content_tier=locked` reading "Heuristic: paywall meta
tag".

## Acceptance
<!-- AC:BEGIN -->
- [ ] #1 WHEN a non-curated page with the `article:content_tier` locked meta tag triggers reader
      mode, THE POPUP SHALL show the reason "Heuristic: paywall meta tag". proves: `#4 [chromium]`
      in `tests/acceptance.mjs`
<!-- AC:END -->

## Tasks
- [ ] Carry the detect.js signals back to the service worker and into `trigger:<tabId>`
- [ ] Label each signal in `src/popup.js`
- [ ] `node tests/acceptance.mjs chromium` prints `PASS  #4`

## Comments

**2026-10-07** Not a decision, so back to todo/. This is a bug with a known fix (see Plan and the manager pass of 2026-10-05: return the detect.js signals from `injectReader`'s `executeScript`, store them in `trigger:<tabId>`, label `paywall:meta:content_tier=locked` "Heuristic: paywall meta tag" in `src/popup.js`, fix 0017 in the same change). It went round the loop twice because `npm test` exits 1 on this very failure, and the loop refuses every card while main is red. `not_for_the_loop:` is set so an attended session builds it; main stays red after this until #7 passes too (card 0016, which carries options and still needs an answer). Loop entries pruned; git keeps them.

**2026-10-07** The loop moved this card from todo/ to human-review/ because main's suite is red and the runner named no failing test, so there is nothing to hand a session and no card that could name what is red. Every other card on this board is stopped until main is green again. Run the suite on main and read what it says; bin/work-card.ps1 asks main again as soon as something outside docs/board/ changes there.

### 2026-10-07 manager (m20261007034139-d88e)

**outcome: rob**

The fix is known and still not built, but only an attended session can build it, because this card's own failing check keeps main red and the loop will not take any card while main is red.

**what the session said**

The bug is still in the code. In `src/background.js`, the `webNavigation` handler still passes `decision.reason || 'heuristic'` to `injectReader`. `injectReader` still does not read the detect.js signals back from the page. In `src/popup.js`, `REASON_LABELS` and `shortReasonForPill` still have no label for any detection signal. So criterion #1 is still open, and nobody has to untick it.

The plan is already known. The 2026-10-05 manager pass and the 2026-10-07 comment both say what to build. The builder does not need new instructions.

`reopen` will not help. The card sends itself back to todo/, then comes back here, every time. The cause is that this card's own check #4 makes main red, and the loop refuses every card while main is red. `not_for_the_loop:` is already set for this reason. Only an attended session can do the work: Rob, or a session he starts, builds 0015 and 0017 together on main.

WHY: The fix is known and still not built, but only an attended session can build it, because this card's own failing check keeps main red and the loop will not take any card while main is red.

OUTCOME: rob

