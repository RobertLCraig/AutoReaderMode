# The popup reports reader mode on pages where it is not open

## Why
**After reader mode closes, or after the user moves on, the popup still says it is active, and its
Exit button opens the reader.** The popup decides what to show from `trigger:<tabId>` in
`chrome.storage.session`. That record outlives the overlay in five ways:
- A navigation that `decideTrigger` skips only clears the badge in `handleNavigation`; the previous
  page's record stays. Read an article that fired, click through to an unrelated page, and the popup
  still says "Auto: preset".
- The overlay's own Exit button, Esc and Alt+R in `src/content/reader.js` remove the overlay and
  never tell the worker.
- The popup's Exit on Chrome calls `injectReader(..., 'manual')`. `reader.js` toggles the overlay
  off, and `injectReader` then stores `reason: 'manual'` anyway.
- `src/popup.js` reads the record once when it opens and has no `storage.session.onChanged`
  listener, so a popup opened while the heuristic path is still running shows "Not triggered" and
  never updates.
- On Edge the button label comes from storage, but the worker decides what the button does from
  whether the URL starts with `read://`. Opened with Edge's own reader button, the popup says "Open
  Reader Mode" and clicking it exits.

**What it costs.** The popup is the user's only view of what the extension did, and PRD goal 5
("Honest UX") rests on it. Each case leaves it saying the opposite of the truth, behind a button that
does the opposite of its label.

**How it came to be this way.** The record is written when the extension acts and removed only when
the tab closes. Nothing removes it when the state it describes ends.

## Links

**Relates to**
- `0017` - the heuristic case of the same stale record. The sweep found `injectReader` now removes the record when `detect.js` did not fire, so check whether `0017` is already settled before building.
- `0015` - also changes what `injectReader` stores, so the two touch the same lines.
- `0023` - the manual toggle's error path, in the same handler.

## Not this card
- New labels for reasons (`0015`, `0033`).
- Error reporting from a failed injection (`0023`).

## Acceptance
<!-- AC:BEGIN -->
- [ ] WHEN a tab navigates to a page where nothing fires, THE APP SHALL show "Not triggered" in the popup. proves: `popup-state: skipped navigation clears the record`
- [ ] WHEN the overlay is closed with Esc, THE APP SHALL show "Not triggered" in the popup. proves: `popup-state: Esc clears the record`
- [ ] WHEN the popup's Exit closes the overlay on Chrome, THE APP SHALL show "Not triggered" the next time the popup opens. proves: `popup-state: manual exit clears the record`
- [ ] WHEN the record changes while the popup is open, THE APP SHALL update the popup. proves: `popup-state: popup follows a late trigger`
<!-- AC:END -->

## Tasks
- [ ] Remove `trigger:<tabId>` at the start of every top-frame navigation in `handleNavigation`, or store the URL and have the popup ignore a record whose URL differs from the tab's.
- [ ] Have `reader.js` report an unmount to the worker (a `runtime.sendMessage` with a new listener) and return whether it mounted, so `injectReader` stores or removes accordingly.
- [ ] Add a `chrome.storage.session.onChanged` listener in `popup.js` for the tab's key.
- [ ] On Edge, derive the button label from the tab URL when it starts with `read://`.

## Plan
`C:\Dev\AutoReaderMode`, files `src/background.js`, `src/content/reader.js` and `src/popup.js`.
`tests/acceptance.mjs` already has `popupFor` and `trigger` helpers that read exactly this state;
add the checks as `record('popup-state', ...)` lines.

## Comments

**2026-10-20** Raised by the shortcomings sweep. Read off the code; nothing here was run.
