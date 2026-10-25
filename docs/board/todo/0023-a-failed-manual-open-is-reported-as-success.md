# A failed manual open is reported as success and the popup just closes

## What I need from you

The loop moved this card from todo/ to human-review/ WITHOUT trying it. All 4 of its open acceptance criteria say proves: manual, so there is nothing left an unattended session could close and starting one would change nothing. Each open criterion names what to look at and what a pass is: tick what passes and move the card on, or say what failed and move it back to todo/.

## Why
**On a page where the extension cannot run, clicking "Open Reader Mode" closes the popup and nothing
happens.** `injectReader` in `src/background.js` catches every injection error itself, sets a red
`!` badge and returns nothing. The `manual-toggle` handler therefore always replies `{ ok: true }`,
`src/popup.js` closes the popup, and the error toast it has for a failed reply can never fire on
Chrome.

**What it costs.** The user is told nothing on exactly the pages where they need telling: the
Chrome Web Store, the built-in PDF viewer, `file://` pages, `devtools://`, and pages whose policy
blocks scripting. The `RESTRICTED_PREFIXES` list in `popup.js` covers none of those (its own
"unavailable" text says local files are not supported, but `file://` is not on the list), so they
get the full UI and a button that silently fails. When a red badge does appear, nothing clears it
after a later success and no error text is stored anywhere the popup could show it.

**How it came to be this way.** `injectReader` was written for the automatic path, where nobody is
waiting for an answer, and the manual path reused it. A smaller fault rides along: both
`popup.js` and the worker's Edge exit call `decodeURIComponent` on a value `searchParams.get` has
already decoded, which throws on a `%` in the inner URL (the popup then shows "unavailable") or
sends the exit to the wrong URL.

## Links

**Relates to**
- `0016` - the error badge on `chrome://`, the decision about where the badge belongs; this card is the failed-attempt path that decision keeps.
- `0022` - the same `manual-toggle` handler and the same stored record.

## Not this card
- Setting a badge on pages the extension never tried to run on (`0016`).

## Acceptance
<!-- AC:BEGIN -->
- [ ] WHEN the popup's Open fails because injection is refused, THE APP SHALL keep the popup open and show the reason. proves: `manual: refused injection is shown in the popup`
- [ ] WHEN a later injection on the same tab succeeds, THE APP SHALL clear the red badge. proves: `manual: success clears the error badge`
- [ ] WHEN the popup opens on a `file://` page, THE APP SHALL show the unavailable state. proves: `manual: file pages show unavailable`
- [ ] WHEN the Edge reader URL's inner URL contains `%25`, THE APP SHALL exit to that exact URL. proves: `manual: exit keeps an encoded percent`
<!-- AC:END -->

## Tasks
- [ ] Make `injectReader` return `{ ok, error }` (or rethrow on the manual path) and pass the error back through the `manual-toggle` reply.
- [ ] Store the last error under the tab's record, show it in the popup, and clear the badge on success.
- [ ] Add `file://`, `devtools://`, `view-source:` and the Web Store hosts to the popup's restricted list.
- [ ] Drop the second `decodeURIComponent` in `popup.js` and in the worker's Edge exit branch.

## Plan
`C:\Dev\AutoReaderMode`, files `src/background.js` and `src/popup.js`. A refused injection can be
reached in `tests/acceptance.mjs` by pointing the popup at a `file://` page or by stubbing
`chrome.scripting.executeScript` to reject from `worker.evaluate`. Add the checks as
`record('manual', ...)` lines.

## Comments

**2026-10-20** Raised by the shortcomings sweep. Read off the code; nothing here was run.

**2026-10-25** The loop moved this card from todo/ to human-review/ WITHOUT trying it. All 4 of its open acceptance criteria say proves: manual, so there is nothing left an unattended session could close and starting one would change nothing. Each open criterion names what to look at and what a pass is: tick what passes and move the card on, or say what failed and move it back to todo/.

### 2026-10-25 manager (m20261025151013-d54e)

**outcome: reopen**

No code has been written for this card yet, and the card's Plan already says how to test every item without a person.

**what the session said**

The four fixes the card asks for are not in the code yet. Nothing on this card has been built.

- In `src/background.js`, `injectReader` still catches every error and returns nothing. So the `manual-toggle` handler still replies `{ ok: true }`.
- No code clears the red `!` badge after a later success. The only badge clear is in `handleNavigation`, and it runs only when the extension does not fire.
- `src/popup.js` `RESTRICTED_PREFIXES` still does not include `file://`.
- Both places still call `decodeURIComponent` a second time: the hostname read near the top of `src/popup.js`, and the Edge `read://` exit in the `manual-toggle` handler.

All four criteria are open, and the builder can close them. The card's own Plan says how to test each one in `tests/acceptance.mjs`: stub `chrome.scripting.executeScript` to reject, or point the popup at a `file://` page. So the "proves: manual" tags do not stop an unattended session. The builder must build all four Tasks and add `record('manual', ...)` checks.

WHY: No code has been written for this card yet, and the card's Plan already says how to test every item without a person.

OUTCOME: reopen

