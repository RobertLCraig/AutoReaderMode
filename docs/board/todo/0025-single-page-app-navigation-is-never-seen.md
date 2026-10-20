# Moving between articles inside a single-page app is never seen

## Why
**On a news site built as a single-page app, clicking from one article to the next leaves the old
article in the overlay, or never opens reader mode on the new one.** `src/background.js` listens
only to `webNavigation.onCompleted`. A route change done with `history.pushState` fires
`onHistoryStateUpdated` instead, which nothing listens to, and `src/content/reader.js` does not
watch for URL changes either.

**What it costs.** Many large news and blog sites route this way, and the curated paywall list
includes several of them. On those sites the extension works on the first page of a visit and then
either stops working or shows the wrong text over the new page, which is worse than doing nothing.

**How it came to be this way.** v2 added a MutationObserver for pages that render late, which covers
the first load of a single-page app; later route changes were not considered.

## Links

**Relates to**
- `0024` - the overlay must not be toggled off by a re-injection, which this card will trigger.

## Not this card
- Prerendered pages. The sweep could not confirm from the docs whether a prerendered page that is
  later activated gets an `onCompleted` with `frameId` 0; that is unverified and not part of this card.

## Acceptance
<!-- AC:BEGIN -->
- [ ] WHEN a top-frame `pushState` changes the URL to another host-matching article, THE APP SHALL re-extract and show the new article. proves: `spa: pushState shows the new article`
- [ ] WHEN a `pushState` moves to a page where nothing fires, THE APP SHALL close the overlay. proves: `spa: pushState to a non-article closes the overlay`
<!-- AC:END -->

## Tasks
- [ ] Add a `webNavigation.onHistoryStateUpdated` listener that passes top-frame events through `handleNavigation`, deduplicated by URL.
- [ ] Make the injected `reader.js` re-extract into an existing overlay, or close it, rather than toggling.

## Plan
`C:\Dev\AutoReaderMode\src\background.js`, the navigation handler section, and
`src/content/reader.js`. Build after `0024`'s "make sure it is on" mode exists or include it. A served
page that calls `history.pushState` and swaps its `<article>` from a button is enough to test this in
`tests/acceptance.mjs`; add the checks as `record('spa', ...)` lines.

## Comments

**2026-10-20** Raised by the shortcomings sweep. Read off the code; nothing here was run.
