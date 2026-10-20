# Leaving Edge Immersive Reader bounces the user straight back in

## Why
**On Edge, a user who reads for more than a minute and then exits Immersive Reader is sent back to
it.** `src/background.js` keeps the per-tab redirect bookkeeping in three in-memory Maps
(`pendingEdgeReader`, `skipNextTrigger`, `recentEdgeRedirectOrigin`). The guard that stops the
original URL re-triggering lasts `ECHO_WINDOW_MS`, 60 seconds, and all three Maps are wiped whenever
the worker sleeps, which it does after about 30 seconds idle, that is, while somebody reads.

**What it costs.** Every Edge user who auto-opens a page and reads it for longer than a minute cannot
leave reader mode with Edge's own exit button; only a Never rule gets them out. Edge is one of the
two browsers the extension supports.

**How it came to be this way.** The state was written for a worker that stays alive, and the timer
was a guess at how long a read takes. The same block has three smaller faults:
- The `webNavigation.onErrorOccurred` handler treats every `read://` error as a failure, including
  `net::ERR_ABORTED`, which is the user pressing Stop or navigating away, so the tab is reverted
  against the user's action.
- `revertToOriginal` adds an `onRevertComplete` listener that is only removed on success. If the
  revert never completes, a later unrelated http load in that tab gets the overlay with an
  edge-fallback reason.
- `redirectToImmersiveReader` always builds `read://https_<hostname>`, dropping the scheme and the
  port, so an http site or a non-default port gets the wrong reader URL. Edge's exact format for
  those cases is unverified.

## Links

**Relates to**
- `0020` - the settings cache has the same worker-sleep problem.
- `0022` - the popup's reading of Edge state, which this card's stored state feeds.

## Not this card
- The missing timeout on a silent `read://` failure, which `HANDOVER.md` already documents.
- The popup's labels.

## Acceptance
<!-- AC:BEGIN -->
- [ ] WHEN a tab exits Immersive Reader after the worker has been restarted, THE APP SHALL not redirect it back to `read://`. proves: `edge: exit after worker restart stays out`
- [ ] WHEN the `read://` navigation errors with `net::ERR_ABORTED`, THE APP SHALL not revert the tab or inject the overlay. proves: `edge: aborted read:// is left alone`
- [ ] WHEN a revert navigation never completes, THE APP SHALL not inject into a later unrelated load in that tab. proves: `edge: stale revert listener does not fire`
<!-- AC:END -->

## Tasks
- [ ] Move the three Maps into `chrome.storage.session`, keyed per tab, and clear them in `tabs.onRemoved`.
- [ ] Replace the 60-second echo window with "the previous top-frame URL in this tab was `read://`".
- [ ] Ignore `net::ERR_ABORTED` in the `onErrorOccurred` handler.
- [ ] Replace the `onRevertComplete` listener with a stored "pending fallback inject" flag that `handleNavigation` consumes.
- [ ] Build the `read://` prefix from the URL's scheme and port, after confirming Edge's format by hand in Edge.

## Plan
`C:\Dev\AutoReaderMode\src\background.js`, the "Per-tab state" and "Edge: redirect" sections.
`tests/acceptance.mjs` already launches Edge stable for criteria 1 and 3; add the checks there as
`record('edge', ...)` lines. The first criterion needs the worker stopped between redirect and exit.

## Comments

**2026-10-20** Raised by the shortcomings sweep. Read off the code; nothing here was run.
