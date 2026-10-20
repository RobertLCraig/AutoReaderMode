# An automatic injection can switch reader mode off

## Why
**Pressing Back to an article that was open in reader mode closes it.** `src/content/reader.js`
starts by looking for an existing overlay and removing it if found, so every injection is a toggle.
`webNavigation.onCompleted` fires again when a page is restored from the back/forward cache with the
overlay still mounted, `handleNavigation` injects again, and the overlay is removed.

**What it costs.** Back and forward are the commonest navigation there is, and on any auto-triggered
article they undo the extension's work. The same toggle has two more effects:
- While `reader.js` waits up to 5 s for a single-page app to settle, a second injection finds no
  overlay yet and starts a second MutationObserver and timer instead of cancelling, so a user who
  toggles off during the wait still gets an overlay a few seconds later.
- The `keydown` listener is removed only on the Esc / Alt+R path. Closing by the Exit button, or by
  re-injection, leaves `handleKey` on `document` holding the detached overlay and the whole article
  in memory, one more per open and close.

**How it came to be this way.** The toggle was built for the popup's Open / Exit button, and the
automatic path reuses the same script with no way to say "make sure it is on".

## Links

**Relates to**
- `0022` - the stored record must agree with whether the overlay ended up on or off.
- `0025` - single-page app navigation, the other case where the page changes under a mounted overlay.

## Not this card
- Reacting to single-page app route changes (`0025`).

## Acceptance
<!-- AC:BEGIN -->
- [ ] WHEN a page restored from the back/forward cache already shows the overlay, THE APP SHALL leave it open. proves: `toggle: back keeps the overlay`
- [ ] WHEN the popup's Exit is pressed during the single-page-app wait, THE APP SHALL not mount an overlay afterwards. proves: `toggle: exit during the wait cancels it`
- [ ] WHEN the overlay is closed by any route, THE APP SHALL remove its keydown listener. proves: `toggle: every exit removes the key listener`
<!-- AC:END -->

## Tasks
- [ ] Stamp the wanted action (`on` for automatic, `toggle` for manual) alongside `__ARM_TRIGGER_REASON`, and have `reader.js` do nothing when asked for `on` and an overlay exists.
- [ ] Keep the pending observer and timer on a window property so a later injection can cancel them.
- [ ] Route every exit through one teardown function that removes the overlay and the listener.

## Plan
`C:\Dev\AutoReaderMode`, files `src/background.js` (`injectReader`) and `src/content/reader.js`.
In Playwright, `page.goBack()` / `page.goForward()` between two served pages reaches the cache
restore; listener leaks can be counted by wrapping `document.addEventListener` in an init script.
Add the checks as `record('toggle', ...)` lines in `tests/acceptance.mjs`.

## Comments

**2026-10-20** Raised by the shortcomings sweep. Read off the code; nothing here was run.
