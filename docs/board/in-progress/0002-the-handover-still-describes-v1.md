# The handover still describes v1.2 on a v2.0 codebase

## Why
`HANDOVER.md` documents a three-file architecture (`background.js`, `utils.js`, `reader.js`), lists
its changelog as "v1.2 (current)", and carries a "Known limitations" section whose two improvement
paths are both already built:

- "Bundle Mozilla Readability" is `src/content/readability.js`, shipped.
- "Add a MutationObserver inside `reader.js`" is in `src/content/reader.js`, shipped.

The tree it describes no longer exists either: `src/` now holds `content/`, `data/`, `lib/`,
`options.html` and `options.js`, none of which the handover mentions. `manifest.json` says 2.0.

An agent reading this would set out to build two things that are done, using a file map that is
wrong, and would never find the actual outstanding work, which is that none of v2 has been verified.

## Not this card
Running the acceptance pass. That is card 0001, and this card should land after it so the handover
can record the verdicts rather than being rewritten twice.

## Acceptance
<!-- AC:BEGIN -->
- [x] #1 THE ARCHITECTURE and key-files sections SHALL describe the files that exist in `src/`,
      including `content/`, `data/`, `lib/` and the options page.
- [x] #2 THE "Known limitations" section SHALL NOT name Readability or the MutationObserver as
      improvement paths, because both shipped.
- [ ] #3 THE CHANGELOG SHALL carry a v2.0 entry, and the twelve-item manual testing checklist SHALL
      live on the board rather than in the handover.
- [x] #4 THE HANDOVER SHALL point at `docs/board/` for work and SHALL NOT list any work item in
      prose.
<!-- AC:END -->

## Tasks
- [x] Re-derive the architecture and file map from `src/` as it stands
- [x] Delete the two solved improvement paths
- [x] Write the v2.0 changelog entry from the 2026-04-30 commit
- [ ] Move the testing checklist onto card 0001 and point the handover at the board

## Comments

**2026-08-29** Rewrote `HANDOVER.md` against `src/` as it stands. The architecture section is now the
real tree (`content/`, `data/`, `lib/`, `options.html` / `options.js`) plus the trigger flow read out
of `background.js` and the precedence order read out of `lib/triggers.js`. The key-files table names
every file that exists and records that `src/utils.js` and the old top-level `src/reader.js` were
deleted in v2.0, with `isEdgeBrowser()` now living in `background.js`. "Known limitations" no longer
carries either solved improvement path; what replaced them is the unverified state of v2, the
Readability-then-selector fallback, the error-only Edge fallback with no timeout, heuristic false
positives, and the release-bound curated lists. `## State management` now lists all eight storage
keys with their defaults, and `## Where the work is` replaces the old testing-checklist section with
pointers to the four board lanes and to `docs/board/README.md`. The v2.0 changelog entry is written
from commit `ae486c4` (2026-04-30) and is marked not yet verified.

**#3 is left open, and only half of it is blocked.** The v2.0 changelog entry is written. The twelve
manual checks are not on the board: they were deleted from `HANDOVER.md` in commit `e0e107f` and now
exist only in that commit's diff, and the place they belong is criterion 8 of card 0001, which this
session is forbidden to edit. Recovering them is one command — `git show e0e107f -- HANDOVER.md` —
so whoever may edit 0001 should paste them under its criterion 8 and tick this box.

Two things I could not settle from the repository and did not act on, because they are outside this
card's acceptance. First, `PRD.md` links the checklist twice as `HANDOVER.md#L91-L104`, at section 8
and at acceptance criterion 8; both line anchors are now stale and will stay stale until the
checklist lands on 0001. Second, the vendored `src/content/readability.js` carries an Apache-2.0
header, not the MIT licence the old handover and `PRD.md` section 9 both claim. I corrected the
licence in `HANDOVER.md` and flagged the change in the key-files table; `PRD.md` still says MIT.

No test suite exists in this repository — no `vendor/`, no `composer.json`, no `package.json` — so
`pest.bat` and `pint.bat` could not be run. This card changed one markdown file and no code.
