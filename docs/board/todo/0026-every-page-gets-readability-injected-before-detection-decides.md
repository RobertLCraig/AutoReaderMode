# Every page gets Readability injected before detection decides, into whatever document is there

## Why
**With default settings, the 2,800-line Readability library is injected into every http(s) page the
user opens.** The paywall heuristic ships enabled, so any page not on a list takes the heuristic path,
and `injectReader` in `src/background.js` injects `readability.js`, `detect.js` and `reader.js` in
one call before `detect.js` has said whether the page is a candidate. On most pages it then decides
nothing should happen.

**What it costs.** Parse and memory cost on every page load, for a library used on a small fraction
of them; on a slow device that is felt on every tab. Separately, all three `executeScript` calls
target `{ tabId }` rather than the document that completed loading. On the heuristic path the
decide-and-inject sequence is asynchronous, so if the user navigates in the gap, the stamp, the
scripts and the result read can land on a different document than the one decided about.

**How it came to be this way.** The heuristic path was added by appending `detect.js` to the
existing file list, and the target was never narrowed when `documentId` became available.

## Links

**Relates to**
- `0024` - changes how `reader.js` is invoked, in the same function.

## Not this card
- The detection thresholds themselves (`0037`).

## Acceptance
<!-- AC:BEGIN -->
- [ ] WHEN the heuristic path runs on a page where `detect.js` does not fire, THE APP SHALL not inject `readability.js` or `reader.js`. proves: `inject: no Readability on a page detection rejects`
- [ ] WHEN the tab navigates between decision and injection, THE APP SHALL not inject into the new document. proves: `inject: a navigation during decide is not injected`
<!-- AC:END -->

## Tasks
- [ ] On the heuristic path, inject `detect.js` alone, read `__ARM_DETECT_RESULT`, then inject `readability.js` and `reader.js` only when it fired.
- [ ] Target `documentIds: [details.documentId]` for automatic injections.

## Plan
`C:\Dev\AutoReaderMode\src\background.js`, function `injectReader` and its caller `handleNavigation`.
Whether Readability was injected can be read in a test as `typeof Readability` in the isolated world
via `chrome.scripting.executeScript` from `worker.evaluate`. Add the checks as `record('inject', ...)`
lines in `tests/acceptance.mjs`.

## Comments

**2026-10-20** Raised by the shortcomings sweep. Read off the code; nothing here was run.
