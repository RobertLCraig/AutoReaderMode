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


**2026-10-05** The loop moved this card from in-progress/ to human-review/ because main's suite is red and the runner named no failing test, so there is nothing to hand a session and no card that could name what is red. Every other card on this board is stopped until main is green again. Run the suite on main and read what it says; bin/work-card.ps1 asks main again as soon as something outside docs/board/ changes there.

### 2026-10-05 manager (m20261005052444-d38e)

**outcome: reopen**

The red suite is this card's own open criterion, so the builder can fix it and nobody needs to look.

**what the session said**

Main's suite is red because of this card. `package.json` defines `npm test` as `node tests/acceptance.mjs`. That script prints `FAIL  #4 [chromium]` and sets `process.exitCode` to 1 when any criterion fails. Criterion 4 is the failure that this card exists to fix. The runner did not name a failing test because the script prints lines in the form `FAIL  #n` and does not use a test-framework format. This is not a separate fault.

The code still has the bug. In `src/background.js`, the `webNavigation` handler stores `decision.reason || 'heuristic'`. `decideTrigger` in `src/lib/triggers.js` returns `'no-match'`, so `'no-match'` is stored. `REASON_LABELS` in `src/popup.js` has no entry for it. The signals stay in `window.__ARM_DETECT_RESULT`, which `src/content/detect.js` sets.

Criterion #1 is open, so I write no UNMET line. The builder must:
1. Return the detect signals from `injectReader`'s `executeScript` call.
2. Store them in `trigger:<tabId>`.
3. Label `paywall:meta:content_tier=locked` "Heuristic: paywall meta tag" in `src/popup.js`.
4. Fix card 0017 in the same change.

When `#4` passes, main goes green again.

WHY: The red suite is this card's own open criterion, so the builder can fix it and nobody needs to look.

OUTCOME: reopen

