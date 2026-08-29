# The handover still describes v1.2 on a v2.0 codebase

## What I need from you

**Two answers.**

1. Untick criterion #1, so this card can go back to `todo/` and be finished? Yes / no.
2. Should the four documentation faults found outside this card get cards of their own? Yes / no.

---

**On 1.** The reviewer checked all four boxes against the real files on 2026-08-29 and disproved
one. `src/icons/` exists, holds three PNGs and is named by `src/manifest.json`, and neither the
architecture tree nor the key-files table in `HANDOVER.md` mentions it. A reviewing agent may not
edit acceptance, so the card came back with all four still ticked, and every session since has
opened it and found nothing to do. Pass is #1 unticked. Fail is leaving the boxes alone, which
sends the card round the same loop again. The fix itself is one line naming `icons/`.

**On 2.** The reviewer named four faults in files this card's acceptance never covered. `AGENT.md`
still tells an agent to bundle Readability and puts `isEdgeBrowser()` in `utils.js`, a file v2.0
deleted. `README.md` carries the same v1 tree. `PRD.md` section 5.5 points at `HANDOVER.md#L62-L66`,
which is now the permissions table. `PRD.md` section 9 calls the vendored Readability MIT when its
own header says Apache-2.0. None is on a card, and `HANDOVER.md` says every outstanding item is one.
Pass is yes or no. Fail is leaving them in a comment, where nobody sweeps them.

**Why it needs you** Unticking a criterion is the one edit no reviewing agent may make, and how many
cards this board carries for stale documentation is a call about where your attention goes.

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

Nobody decided to leave the handover behind. The v2.0 rewrite landed on 2026-04-30 and the document
describing it was never part of that commit.

## Links

**Relates to**
- `0001` - the acceptance pass this card should land behind, so the handover can record its eight
  verdicts instead of being rewritten twice.
- `0005` - where the twelve manual checks went when this card took them out of the handover.

## Not this card
Running the acceptance pass. That is card 0001, and this card should land after it so the handover
can record the verdicts rather than being rewritten twice.

## Acceptance
<!-- AC:BEGIN -->
- [x] #1 THE ARCHITECTURE and key-files sections SHALL describe the files that exist in `src/`,
      including `content/`, `data/`, `lib/` and the options page.
- [x] #2 THE "Known limitations" section SHALL NOT name Readability or the MutationObserver as
      improvement paths, because both shipped.
- [x] #3 THE CHANGELOG SHALL carry a v2.0 entry, and the twelve-item manual testing checklist SHALL
      live on the board rather than in the handover.
- [x] #4 THE HANDOVER SHALL point at `docs/board/` for work and SHALL NOT list any work item in
      prose.
<!-- AC:END -->

## Tasks
- [x] Re-derive the architecture and file map from `src/` as it stands
- [x] Delete the two solved improvement paths
- [x] Write the v2.0 changelog entry from the 2026-04-30 commit
- [x] Move the testing checklist onto card 0001 and point the handover at the board
      (it landed on a new card, `0005`, not on `0001` — see the comment below)

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

**2026-08-29** Closed #3 by recovering the twelve manual checks from `git show e0e107f -- HANDOVER.md`
and giving them a card of their own: `docs/board/todo/0005-the-twelve-manual-checks-nobody-has-run.md`.
Each check is one acceptance criterion carrying `proves: manual`, and the card carries
`not_for_the_loop:` because every check is a person clicking through a browser. It sits in `todo/`
rather than `human-review/`, because the board's own rule is that a card arriving in that lane
without a question is a defect in the card, and this one asks nothing — `0001` already holds the ask
for the same browser sitting.

**Why a new card and not `0001`.** The criterion says the checklist shall live on the board, and it
does not say which card. `0001` is where the earlier session wanted it and where its own item 8
still points, but `0001` sits in `human-review/` and this session is forbidden to edit any card but
its own. The choice was a new card or a third session leaving the same box open with the checklist
still buried in a commit diff. `0005` links back to `0001` under `## Relates to`, and `0001` item 8
still reads "now card 0002's to relocate": **whoever may edit `0001` should point that item at
`0005`.** That is the one loose end this card leaves.

I reworded one of the twelve. v1's "Remove site — toggle reflects new state" names a toggle v2
deleted, so criterion 10 now asks for the Always / Default / Never control returning to Default and
the saved-site count dropping, which is what `src/popup.js` actually does. The reason is recorded on
`0005` itself.

I also repaired the two `PRD.md` links I flagged as stale last session, because this card's own
relocation is what broke them: section 8 and section 11 criterion 8 both pointed at
`HANDOVER.md#L91-L104`, which is now the permissions table, and both now point at `0005`. Two other
stale anchors in `PRD.md` are older than this card and I left them: section 5.5 points at
`HANDOVER.md#L62-L66` for the SPA gap, and section 8 points at `src/utils.js#L10-L20` for
`isEdgeBrowser()`, a file v2.0 deleted. `PRD.md` section 9 also still calls Readability MIT when the
vendored file is Apache-2.0. All three want a card.

Still no test suite in this repository, so `pest.bat` and `pint.bat` could not be run. This session
changed three markdown files and no code.

### 2026-08-29 review (v20260829153634-30f9)

**suite**

No suite this job could find in AutoReaderMode, so none ran. That is not a pass.

**acceptance: defect**

I checked each box against the real files.

**#1 ÔÇö mostly true, one gap.** `HANDOVER.md` "Architecture" and "Key files" match `src/` for `background.js`, `popup`, `options`, `content/` (`readability.js`, `detect.js`, `reader.js`), `data/` (28 + 14 entries, confirmed in `src/data/paywalls.json` and `src/data/ad-heavy.json`) and `lib/` (`matcher.js`, `settings.js`, `triggers.js`, loaded by the `importScripts` call in `src/background.js`). The precedence list matches `decideTrigger` in `src/lib/triggers.js`. But `src/icons/` exists, holds three PNGs, and is used by `src/manifest.json` (`action.default_icon` and `icons`). Neither the tree nor the key-files table names it, so the tree it presents as the whole of `src/` is not the whole of `src/`.

**#2 ÔÇö true.** "Known limitations" names no improvement path. Readability appears only as current behaviour, matching `tryReadability` in `src/content/reader.js`. The MutationObserver is absent there and matches `SPA_MAX_WAIT_MS` in the same file.

**#3 ÔÇö true.** The v2.0 changelog entry is there. The twelve checks are on the board at `docs/board/todo/0005-the-twelve-manual-checks-nobody-has-run.md`.

**#4 ÔÇö true.** "Where the work is" points at the four lanes and lists no work item.

One line to add: `icons/`.

VERDICT: defect

**scope: defect**

**Over the fence.** `PRD.md` is not this card's file. Its section 11, criterion 8 was rewritten, and section 11 *is* the acceptance pass ÔÇö the one thing `## Not this card` fences off. The section 8 Edge-test bullet was edited too. The card's acceptance names `HANDOVER.md` and the board only.

**Half done ÔÇö the relocation.** Item 8 of `docs/board/human-review/0001-v2-acceptance-pass.md` still reads "now card 0002's to relocate". The checks now live on `0005`. So the board holds one stale pointer and two homes for the same twelve checks. AC#3 is ticked over that gap, and the card's own comment admits it.

**Grew ÔÇö the licence.** The key-files row for `src/content/readability.js` in `HANDOVER.md` now says Apache-2.0. That is correct; the file header says Apache-2.0. But the Readability injection bullet in `PRD.md` still says "MIT licensed". No criterion asked for a licence audit, one was started, and it stopped halfway with no card raised.

**Grew ÔÇö a check was rewritten.** Criterion #10 on `0005` is new wording, not the moved "Remove site ÔÇö toggle reflects new state". Defensible, but the task said move.

VERDICT: defect

**breakage: defect**

**Findings (breakage lens)**

1. **`AGENT.md`, "Improving Chrome extraction" and the `isEdgeBrowser()` section.** AC #2 deleted the two solved improvement paths from `HANDOVER.md`, but `AGENT.md` still tells an agent to "Consider bundling Mozilla ReadabilityÔÇª add `readability.js` to `src/`", still says `extractArticleElement()` lives in `reader.js`, and still says `isEdgeBrowser()` is in `utils.js`. `AGENT.md` is the agent-facing rules file, so the exact failure the card exists to stop still happens. `README.md`'s structure and permissions tables carry the same v1 tree. No card covers either.

2. **`PRD.md` section 5.5.** `HANDOVER.md#L62-L66` was the SPA-gap paragraph at commit `134be3a` and is the key-files table now. This rewrite broke it, the same way it broke the two anchors the session repaired. The card comment says it is "older than this card". It is not.

3. **`HANDOVER.md`, "Where the work is".** It asserts every outstanding item is a card. Three the session itself found (two stale anchors, the MIT/Apache-2.0 clash in `PRD.md` section 9) are on no card ÔÇö only in a comment on `0002`.

VERDICT: defect


**2026-08-29** The reviewer returned this card and its finding is the last review entry at the bottom of ## Direction. The loop moved it from todo/ to human-review/ because it has bounced 1 time between todo and ai-review, all 4 criteria ticked. THE BUILDER COULD NOT ACT ON THAT FINDING. A reviewer never unticks a criterion - it is forbidden from editing acceptance at all - so the card came back with 4 of 4 criteria still ticked, every session found nothing open to do, and the loop promoted it again on the boxes. Untick what the reviewer disproved and move it back to todo/, or say here why the finding is wrong.
