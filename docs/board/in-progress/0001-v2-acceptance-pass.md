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
- [ ] #2 WHERE a criterion fails, A CARD SHALL exist naming that failure, so the verdict is not the
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
