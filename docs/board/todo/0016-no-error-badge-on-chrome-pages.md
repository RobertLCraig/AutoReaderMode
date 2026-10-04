# No error badge on chrome:// pages, as PRD criterion 7 asks

## Why
**PRD section 11 criterion 7 fails as written.** It says the error badge fires when `executeScript`
is denied, "e.g. on `chrome://`", and that the popup explains why. On `chrome://version` in
Chromium on 2026-10-04 the badge text was empty. The popup half passes: it shows "Reader mode
unavailable here".

**What it costs.** Criterion 7 cannot pass, so v2 cannot ship. More importantly, the red `!` badge
path in `injectReader` has never been seen to fire at all, so nobody knows whether a user ever gets
told that an injection failed.

**How it came to be this way.** `handleNavigation` in `src/background.js` returns before any
injection when the URL is not http(s). On `chrome://` the extension never calls `executeScript`, so
nothing is denied and nothing sets the badge. The PRD's example names a page the code deliberately
skips. The badge can only fire on an http(s) page where scripting is refused, such as the Chrome Web
Store, and that was not reachable from the test harness: routing `chromewebstore.google.com`
closed the browser context.

## Links

**Relates to**
- `0001` - the acceptance pass whose criterion 7 found this; `tests/acceptance.mjs` is the check.

## Options
1. **Correct the PRD.** Change criterion 7's example to an http(s) page that refuses scripting, and
   leave `chrome://` to the popup's unavailable state, which already works. Cost: a PRD edit and a
   new way for `tests/acceptance.mjs` to reach a denied http(s) page, which is not yet known to
   exist.
2. **Make the code match the PRD.** Set the badge on `chrome://` and other restricted pages too.
   Cost: a badge on every browser page the user opens, for something the extension never tried to
   do, which is noise.

## Recommendation
Option 1. Skipping browser pages is the right behaviour, and the badge exists to report a failed
attempt, not a page that was never attempted. The open part is how to exercise a denied http(s)
page in a test.

## Comments
