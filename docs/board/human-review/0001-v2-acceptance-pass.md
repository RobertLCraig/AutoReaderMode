# Run the v2 acceptance pass

## Why
**Nobody has ever seen v2 work.** `src/manifest.json` says version 2.0 and the rewrite was committed
on 2026-04-30 with Readability bundled, a MutationObserver in `reader.js` and both curated lists in
`src/data/`. Nothing anywhere in this repository records that any of it has been run in a browser.

**What it costs.** The PRD says the rewrite "ships when all of the following are true", so the
extension cannot be released to anybody while its eight criteria are unrecorded. Nothing else on
this board can be trusted either: every later card reasons about behaviour that has only ever been
read off the source.

**How it came to be this way.** The rewrite was committed and the verification was never scheduled.
Nobody decided to skip it.

## Plan
Nothing here needs a person. All eight criteria are a browser on a page, and Playwright drives both
browsers this machine has: Edge stable is at
`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe` (`channel: 'msedge'`), Chromium comes
with Playwright. Node 26 is installed; Playwright is not, and the repository has no `package.json`.

1. At the repo root: `npm init -y`, `npm i -D playwright`, `npx playwright install chromium`. Track
   `package.json`, `package-lock.json` and `tests/`; gitignore `node_modules/`.
2. `tests/acceptance.mjs`. An MV3 extension loads only in a persistent context:
   `chromium.launchPersistentContext(tmpDir, { headless: false, args:
   ['--disable-extensions-except=<abs src>', '--load-extension=<abs src>'] })`, plus
   `channel: 'msedge'` for the Edge runs. Reach the service worker with
   `context.waitForEvent('serviceworker')` and its storage through
   `worker.evaluate(() => chrome.storage.sync.get())`; the extension id is the worker URL's host,
   and the popup opens as `chrome-extension://<id>/popup.html`.
3. One check per criterion in [PRD.md section 11](../../../PRD.md), each printing PASS or FAIL:
   - 1, Edge: navigate to a host from `src/data/paywalls.json`; pass when `page.url()` starts with
     `read://`.
   - 2, Chromium: same host; pass when the overlay element `reader.js` injects is present and
     carries article text.
   - 3: write a host to `readerSites` in storage via the worker, visit it, pass when the overlay
     appears.
   - 4: serve a local page carrying `<meta property="article:content_tier" content="locked">`
     (`page.route` or Node's `http.createServer` inside the test); pass when the overlay appears
     and the popup shows "Heuristic: paywall meta tag".
   - 5: set all four detection flags off in storage; visit three non-listed hosts; pass when
     nothing is injected on any of them.
   - 6: a local page whose body is filled by script after load; pass when the overlay carries that
     text.
   - 7: navigate to `chrome://version`; pass when the error state is recorded and the popup
     explains it.
   - 8 is card `0005`; run it from there in the same sitting.
4. Record one dated line per criterion under `## Comments`, pass or fail, and raise one card per
   failure (criterion #2 of this card).

## Links

**Relates to**
- `0002` - it rewrote `HANDOVER.md` against the v2 source, so the file describing the code you are
  about to exercise is current, and its own reviewer says one gap is left in it.
- `0005` - the twelve hand-run checks that are criterion 8 of this card. They need the same two
  browsers loaded, so run both cards in one sitting.

## Not this card
Fixing whatever fails. Each failure earns its own card, because a single card called "fix v2" is
one nobody can finish.

## Acceptance
<!-- AC:BEGIN -->
- [ ] #1 EACH of the eight criteria in PRD section 11 SHALL have a recorded pass or fail.
- [x] #2 WHERE a criterion fails, A CARD SHALL exist naming that failure, so the verdict is not the
      end of the record.
- [ ] #3 WHEN all eight pass, THE PRD SHALL be marked as met and the version SHALL be releasable.
<!-- AC:END -->

## Tasks
- [ ] Add Playwright and `tests/acceptance.mjs` per the Plan
- [ ] Run criteria 1 and 3 under `channel: 'msedge'`, and 2, 4, 5, 6, 7 under Chromium
- [ ] Record each verdict here under `## Comments`, one dated line per criterion

## Comments

**2026-09-30** Moved out of human-review: this card asked a person to load two browsers and look,
and that is a look at built work, not a decision. Every criterion is reachable by Playwright with
the extension loaded in a persistent context, and this machine has Node 26 and Edge stable. The
Plan above is the harness; the builder writes it and records the verdicts.

**2026-10-04** RESULT: partial
TESTS: +7 new acceptance checks in tests/acceptance.mjs; 5 PASS, red: #4 [chromium], #7 [chromium] (real failures, carded); #8 not run
TOUCHED: .gitignore
package.json
package-lock.json
tests/acceptance.mjs
docs/board/todo/0015-popup-never-names-the-paywall-meta-heuristic.md
docs/board/todo/0016-no-error-badge-on-chrome-pages.md
docs/board/todo/0017-popup-says-active-when-the-heuristic-did-not-fire.md
docs/board/todo/0018-handover-still-says-none-of-v2-has-been-run.md
OUT-OF-SCOPE: 0017, 0018

Verdicts, 2026-10-04, `npm test` (node tests/acceptance.mjs), headless, Edge 154 stable and Playwright Chromium:
- #1 PASS [edge] ft.com went to read://https_www.ft.com/?url=..., still there 3 s later, stored reason edge:immersive-reader (no fallback).
- #2 PASS [chromium] ft.com: overlay mounted with the article text (1392 chars).
- #3 PASS [edge] host written to readerSites via the worker: next visit went to read://.
- #4 FAIL [chromium] overlay mounts, but the popup reads "Reader mode is active on this tab.", not "Heuristic: paywall meta tag". Stored reason is 'no-match'. Card 0015.
- #5 PASS [chromium] all four flags off: no overlay and no trigger reason on 3 non-listed hosts, all carrying the locked meta tag.
- #6 PASS [chromium] body filled by script 1.5 s after load: overlay carries the late text.
- #7 FAIL [chromium] chrome://version: badge empty; popup half passes (unavailable state). background.js never injects on non-http pages, so the PRD example cannot fire. Card 0016, written as a decision (Options + Recommendation) and placed in todo/ because that is the only lane I may write to; it may belong in human-review.
- #8 NOT RUN: it is card 0005, which carries not_for_the_loop.

Why criteria are not met: #1 needs all eight recorded and #8 is not; #3 needs all eight to pass.

Test-first note: the code under test already existed, so each check was first run against it. Two first reds were harness faults and are fixed: the headless shell cannot load extensions (now channel 'chromium'), and routing '**/*' served HTML for the popup's own scripts (now http(s) only). Red-capability of #5: with default flags the same locked-meta page DID mount the overlay, so #5 can see an injection. Found in passing: 0017, a trigger reason is stored even when the heuristic gate stops reader.js, so the popup claims reader mode on plain pages.

Assumptions and gaps: pages are served by context.route, not live sites; #1 checks the read:// URL and the absence of the fallback, not that Immersive Reader rendered text (headless). The popup is opened as a tab with the target tab brought to front, not from the toolbar. #3 writes readerSites through the worker as the card's Plan says, not by clicking the popup. The pest/pint steps do not apply: this repository has no PHP, vendor or composer.json. No browser check was done on Rob's own profile.

**2026-10-04** RESULT: partial
TESTS: +0 new; re-ran npm test: 5 PASS, red: #4 [chromium], #7 [chromium] (real failures, carded 0015 and 0016); #8 not run
TOUCHED: none
OUT-OF-SCOPE: none

Re-run of the pass on 2026-10-04 against an unchanged tree. Nothing moved since the previous take: 0015 and 0016 are still in todo/, and 0005 still carries not_for_the_loop. The verdicts are the same as the entry above: #1 PASS [edge] read://https_www.ft.com/..., #2 PASS [chromium] overlay 1392 chars, #3 PASS [edge], #4 FAIL popup reads "Reader mode is active on this tab." (0015), #5 PASS, #6 PASS, #7 FAIL empty badge on chrome://version (0016), #8 NOT RUN (card 0005, a person's job).

Why #1 and #3 stay unmet: #1 needs all eight recorded and #8 can only be recorded by a person running 0005. #3 needs all eight to pass, so it waits on 0015, 0016 and 0005. Another unattended run of this card cannot change that; it should wait until those three cards are done.

No code was written and nothing was committed. pest/pint do not apply: this repository has no PHP. No check was done in Rob's own browser profile.

**2026-10-04** RESULT: blocked
TESTS: +0 new; re-ran npm test: 5 PASS, red: #4 [chromium], #7 [chromium] (real failures, carded 0015 and 0016); #8 not run
TOUCHED: none
OUT-OF-SCOPE: none

Third run of this card against the same tree: src/, tests/ and package.json have not changed since 7c32636. Verdicts are identical: #1 PASS [edge] read://https_www.ft.com/..., #2 PASS [chromium] overlay 1392 chars, #3 PASS [edge], #4 FAIL popup reads "Reader mode is active on this tab." (0015), #5 PASS, #6 PASS, #7 FAIL empty badge on chrome://version (0016), #8 NOT RUN (card 0005, not_for_the_loop).

Marked blocked, not partial: card #1 needs criterion 8 recorded, and only a person running 0005 can do that; card #3 also needs 0015 and 0016 fixed (0016 is a decision for Rob). Please stop scheduling this card unattended until those three are done; another run will print the same lines. #2 is met (both failures have cards).

No code written, nothing committed. pest/pint do not apply: no PHP in this repository. No check was done in Rob's own browser profile.

**2026-10-04** The loop moved this card from in-progress/ to human-review/. 2 takes in a row ended with it still in in-progress/, and the last one said: `made no progress: 2 of 3 still open, exactly as this take found it`. What this card is waiting for is not another session. bin/work-card.ps1 counts those takes out of storage/logs/work-card.log, and will start it again as soon as a person has moved it back to todo/.

### 2026-10-05 manager (m20261005010742-cad6)

**outcome: rob**

Only you can finish this card: run the 0005 checks by hand in both browsers, and make the 0016 decision. After that, move 0001 back to `todo/`.

**what the session said**

The builder has nothing left to do on this card. I did not change any files.

- **#2 is ticked, and that is correct.** Both test failures have their own cards: #4 has card 0015, and #7 has card 0016.
- **#1 is open.** It needs PRD criterion 8. Criterion 8 is card 0005, and 0005 has the `not_for_the_loop` flag. Its twelve checks say "proves: manual", so the loop must not run them.
- **#3 is open.** It needs all eight criteria to pass. That needs three things first:
  - a fix for 0015 (the popup does not show "Heuristic: paywall meta tag")
  - your answer on 0016 (`background.js` never injects on `chrome://` pages)
  - a pass on 0005

  This card says fixes are not its job ("Not this card").

Three runs of the same tree gave the same verdicts. If you reopen the card now, it comes straight back.

Optional: most of the 0005 checks look possible in Playwright. One example is the popup showing the domain. If you remove the `not_for_the_loop` flag, the loop can run them.

WHY: Only you can finish this card: run the 0005 checks by hand in both browsers, and make the 0016 decision. After that, move 0001 back to `todo/`.

OUTCOME: rob

