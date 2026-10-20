# A poor or failed extraction is shown with no notice, after a needless wait

## Why
**When reader mode cannot find the article, it mounts whatever it has and says nothing.** In
`src/content/reader.js`, if Readability's result is shorter than 500 characters the code discards it
and waits up to 5 seconds for the page to change. After the wait, `fallbackExtract` takes the first
CSS candidate with 400 characters of text, and if there is none it clones the whole `<body>`
regardless of how little text it holds. The overlay shows that with no hint; only a `console.warn`
records it.

**What it costs.** The user cannot tell a good extraction from a junk one, and on app-like pages gets
an empty or cluttered overlay to close. Around it:
- A genuinely short article that Readability parsed well is thrown away, so the user waits 5 seconds
  and then gets the cruder fallback.
- The 400 ms debounce restarts on every DOM change, so on a page that mutates constantly (tickers,
  rotating ads, carousels) no early retry runs and every such page waits the full 5 seconds.
- `cleanClone`'s removal list does not include paywall containers, so on a paywall page, the main
  reason the overlay opens, the fallback can show the subscribe prompt itself. `detect.js` already
  has those selectors.
- The overlay's label shows raw signal strings, for example `AUTO: PAYWALL:DOM:[CLASS*="PAYWALL" I]`,
  uppercased and cut off with no tooltip.

**How it came to be this way.** The fallback path was carried over from v1 as a safety net and given
no voice of its own.

## Links

**Relates to**
- `0015` - the popup's naming of the same heuristic signals; one plain-words mapping should serve both.
- `0033` - the overlay label for an Edge fallback, in the same `reasonLabel` function.

## Not this card
- Detection thresholds (`0037`).

## Acceptance
<!-- AC:BEGIN -->
- [ ] WHEN the fallback extraction is used, THE APP SHALL show a visible "basic extraction" notice in the overlay. proves: `extract: fallback is announced`
- [ ] WHEN no candidate holds enough text, THE APP SHALL show "Could not extract an article" with an exit instead of the whole page. proves: `extract: nothing found says so`
- [ ] WHEN Readability returns a short article on a static page, THE APP SHALL show it without the 5-second wait. proves: `extract: a short article is kept`
- [ ] WHEN a heuristic signal fired, THE APP SHALL label it in plain words with the raw detail in a tooltip. proves: `extract: signal label is plain words`
<!-- AC:END -->

## Tasks
- [ ] Keep the short Readability result and prefer it over `fallbackExtract` when the wait ends with nothing better.
- [ ] Retry on a fixed interval during the wait, not only after a quiet gap.
- [ ] Add a text threshold below which the overlay shows a "could not extract" message.
- [ ] Add the paywall selectors from `detect.js` to `cleanClone`.
- [ ] Map signal ids to plain words in `reasonLabel` and put the raw id in a `title`.

## Plan
`C:\Dev\AutoReaderMode\src\content\reader.js`, functions `tryReadability`, `fallbackExtract`,
`cleanClone`, `reasonLabel` and the entry block at the end. Add the checks as `record('extract', ...)`
lines in `tests/acceptance.mjs`, serving a short article, an empty app shell and a paywall page.

## Comments

**2026-10-20** Raised by the shortcomings sweep. Read off the code; nothing here was run.
