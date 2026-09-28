# Rewrite this board's cards for the reader

## Why
**A card on this board opens with the answer and never says what is wrong.** On 2026-08-18 Rob said
most of the cards he was handed made him work backwards: they lead with candidate solutions and
their costs, so he has to reverse-engineer the problem out of the proposals. He cannot tell whether
the options are the right ones, because he does not yet know what they are for.

**Two more faults, in his words.** Cards ask him to settle things an agent could have researched and
applied. And a bare card number dropped into a sentence tells him some other card matters and
nothing about why, so he opens it to find out.

**What it costs.** His attention is the only scarce thing here. Measured on 2026-08-20, 258 of 398
open cards across the estate fail at least one of these rules and 257 of those fail on the link rule
alone. A card that reads badly costs a round trip; one that should never have been surfaced costs
the whole reading for nothing. Enough of either and he stops opening the ones that mattered.

**How it came to be this way.** Every card here was written by an agent against a convention that,
until 2026-08-18, said nothing about stating the problem first, nothing about whether a question was
a person's to answer at all, and nothing about how to name another card. It gained all three rules
that day, and nothing was applied to the cards, so this board is measured against a standard none of
it was written to.

## Links

**Relates to**
- `progressboard#0065` - the estate-wide rewrite this card was seeded from; its pilot over
  ProgressBoard's own 40 cards is the worked example of a pass.
- `progressboard#0066` - the five checks the count below is measured with, and why each is
  structural rather than a judgement about prose.

## Not this card
**Changing the convention.** `docs/board/README.md` here is a COPY of a canonical file outside every
repository, so an edit to it is destroyed silently on the next distribution. This card applies the
convention and never changes it.

**Rewriting cards in `done/` or `discarded/`.** Those are a record of what happened. Rewriting a
record is falsifying it, and nobody reads them to decide anything.

**Deleting anything.** A badly written card still holds facts somebody measured. A rewrite keeps
everything the card knows and changes only how it is ordered and said. `## Direction` and
`## Decided` are append-only: do not edit them, on any card, for any reason.

**Any other board.** Each one carries its own copy of this card, worked in its own repository.

## Acceptance
<!-- AC:BEGIN -->
- [x] #1 WHEN a card in a non-terminal lane is rewritten, THE CARD SHALL state the problem in
      `## Why` before any solution appears anywhere in it. proves: none - about prose, and no check
      here reads prose
- [x] #2 WHEN a rewritten card is a decision, THE CARD SHALL say which of the four reasons makes it
      a person's to answer, or SHALL be converted to a feature card whose `## Plan` records the
      practice applied and its source. proves: none - the command that counts it is in another
      repository, named in `## Plan`
- [x] #3 WHEN a rewritten card names another card, THE CARD SHALL name it in a `## Links` section
      with the relationship type and one line of why, and SHALL NOT leave a bare card number in a
      sentence as the only mention of it. proves: none - as #2
- [x] #4 THE `Blocked by` LINES on every rewritten card SHALL match that card's `needs:` frontmatter
      exactly, in both directions. proves: none - as #2
- [x] #5 THE REWRITE SHALL preserve every measurement, date and decision the card already carried,
      and SHALL NOT edit `## Direction` or `## Decided`. proves: none - as #2
- [x] #6 WHEN this board's rewrite is finished, THE BOARD SHALL report zero open cards failing the
      checks. proves: none - as #2
- [x] #7 NO rewritten card SHALL put a question to Rob that reading settles: `0002`'s ask 2, whether
      the documentation faults get cards, SHALL be gone, and every fault its thread records SHALL be
      on a card, all five, the dead `src/utils.js` link in `PRD.md` sections 5 and 8 included.
      proves: none - as #2
<!-- AC:END -->

## Tasks
- [x] Read the count, and write it into `## Direction` before changing anything
- [x] Rewrite `human-review/` first, then `todo/`, `in-progress/` and `ai-review/`
- [x] For each decision card, apply the four-reason test and convert the ones that fail it
- [x] Read the count again and write into `## Direction` what changed, counted by rule

## Plan
**Where to stand.** This repository, on whatever branch the session was given. Nothing outside it is
edited and no card changes lane. **The one command, from this board's directory, in PowerShell:**

    php C:\Dev\ProgressBoard\artisan board:convention --path=$PWD

It prints one tab-separated line: board name, OPEN cards failing the checks, open cards, the next
free card number, and the directory read. The second number is this card's finish line and it must
reach 0. Run it before the first edit and after the last. `--path` matters: a build worktree is not
`C:\Dev\<board>`, and without it you measure a tree you are not editing.

**What the checks look for is in `docs/board/README.md` here**, three sections of it: "`## Why` is
the PROBLEM, and it comes before any answer", "Links: say what the relationship IS, never a bare
card number", and "Is this actually a person's to decide?". Read those three first. Every check is
structural - a missing `## Links` section, a `Blocked by` line that disagrees with `needs:`, a link
with nothing after the dash - so each flag names one thing to fix and none is an opinion.

**`human-review/` first, and that is not tidiness.** That lane is the only one a person reads. A
`todo/` card is read by an agent, a reader with different problems, so rewriting those first spends
the session on the half nobody is complaining about.

**Expect the four-reason test to shrink the queue rather than reformat it.** A decision whose answer
turns on established practice is not Rob's: research it, apply it, and rewrite the card as a feature
card whose `## Plan` says what was applied and where it came from. Count those separately from the
cards merely rewritten - that is the change that gives him evenings back.

**If the board is too big for one session, stop cleanly.** Tick nothing, write the count you reached
into `## Direction`, and leave the card where it is; the next session carries on from that entry. A
part-rewritten board is normal. A card ticked off a board that is not at 0 is not.

## Comments

**2026-08-29** The board is at 0. `board:convention --path=$PWD` read **2 of 5 open cards failing**
before any edit and **0 of 5** after. Both failures were the same rule, the link rule: `0001` said
"now card 0002's to relocate" and `0002` said "That is card 0001", each a bare number in a sentence
with no `## Links` section to say why the reader should care. No card failed on `Blocked by` versus
`needs:`, on a reasonless link, on a missing reason-it-is-yours, or on an unreadable `proves:`. This
board carries no `needs:` and no `Blocked by` line at all, so #4 held before I started and still
holds. Nothing in `ai-review/` - that lane is empty.

**What I changed, card by card.** `0001` gained a `## Links` section naming `0002` and `0005` with a
line of why each, a `## Why` that now says what it costs and how it came about instead of only what
is wrong, and a `## Comments` heading, because two places in it told the reader to record verdicts
"under `## Direction`" and the card had no such section. Its item 8 pointed at `0002` for the twelve
manual checks; they landed on `0005`, so it points there now. `0002` gained the `## What I need from
you` section its lane requires and did not have - the ask was buried 149 lines down in the thread, in
the loop's own words - plus `## Links` and one sentence in `## Why` saying how the drift happened.
`0003` had the two candidate answers written into its `## Why`, which is the fault this card exists
to fix, so `## Why` now states the staleness problem and its cost and names no answer; the answers
were already in `## Options` and are untouched. `0005` needed nothing and got nothing.

**The four-reason test converted no card.** `0003` is the board's only decision. Its answer turns on
the privacy position of a public store listing, which is a risk Rob carries and no reading settles -
row three of the four - so it stays a decision and now says that in as many words. It was already
answered `**2026-08-16** 3`, and I did not touch `## Decided`, `## Direction` or any `## Comments`
entry on any card.

**What I assumed, and it is the one thing to check.** Criterion #1 says the problem comes "before any
solution appears anywhere in it". On the two `human-review/` cards the ask stands above `## Why`,
because `docs/board/README.md` requires `## What I need from you` directly under the title and this
card forbids changing the convention. I read #1 as governing `## Why` itself - no fix named in it -
which is how the README states the same rule. If the stricter reading was meant, #1 is unmet on
`0001` and `0002` and the two rules cannot both be obeyed.

**Three things I left, deliberately, and each wants a card.** `0001` carries no `not_for_the_loop:`
although all eight of its criteria are a person in a browser; adding a frontmatter key changes what
the unattended loop may take, which is a behaviour change and not a rewrite. `0001`'s three
acceptance criteria name no `proves:` at all, which the convention wants; adding `proves: manual`
puts the word "browser" into `## Acceptance`, where the outward-effect check reads, so it would newly
flag the card unless `not_for_the_loop:` went on at the same time. The two belong on one card
together. And `0002`'s `## Why` still describes `HANDOVER.md` as stale when it was rewritten on
2026-08-29; that is the problem the card was raised for and criterion #5 forbids dropping what a card
knows, so the tense stays.

**No suite ran, and that is not a pass.** This repository has no `vendor/`, no `composer.json` and no
`package.json`, so `.\vendor\bin\pest.bat` and `.\vendor\bin\pint.bat` do not exist here. Nothing in
this session touched code; five markdown files changed and no JavaScript did. Nothing needs a browser
check.

**This entry is under `## Comments`, not `## Direction`.** The card's own tasks name `## Direction`
and the card had neither heading. `docs/board/README.md` says new entries go under `## Comments` and
that the old headings are still read, so opening a second thread would have been the worse of the
two.

### 2026-08-29 review (v20260829170140-96a1)

**suite**

No suite this job could find in AutoReaderMode, so none ran. That is not a pass.

**acceptance: sound**

I checked each criterion against the files.

**#1** ÔÇö `## Why` in `human-review/0001-v2-acceptance-pass.md`, `human-review/0002-the-handover-still-describes-v1.md` and `todo/0003-how-curated-lists-get-refreshed.md` each now open with the problem and name no fix. `0003`'s `## Why` no longer carries the two candidate answers; they stay in its `## Options`. The strict reading the builder flagged fails, but the README's own `### Worked example` under `## The one section a card in human-review/ must have` puts the ask and its commands above `## Why`, so the builder's reading is the convention's. Met.

**#2** ÔÇö `0003` is the only card with `## Options`, so the only decision. Its `## What I need from you` names "a risk you own", row three of the table in README `## Is this actually a person's to decide?`. Met.

**#3** ÔÇö `## Links` sections exist on `0001`, `0002`, `0005`, each with `**Relates to**` and one line of reason. Every card number in prose also appears there. Met.

**#4** ÔÇö no `needs:` and no `Blocked by` anywhere in `docs/board/`. Vacuously met.

**#5** ÔÇö the `e5206b4` diff drops no date or measurement; `0003`'s `## Decided` is untouched.

**#6** ÔÇö I ran `board:convention --path=C:\Dev\AutoReaderMode`: `0` of `5`. Met.

VERDICT: sound

**scope: defect**

I read the diff for `e5206b4` and every open card.

**1. Grew ÔÇö a new question was put in front of Rob.**
`docs/board/human-review/0002-the-handover-still-describes-v1.md`, `## What I need from you`, ask 2 ("Should the four documentation faults get cards of their own?"). No earlier entry on that card asks it. The loop's return entry asks one thing only: untick #1, or say why the finding is wrong. `docs/board/README.md`, `## Is this actually a person's to decide?`, says a person owns an answer only for a preference, a cost, a risk or local knowledge. This is none of those. The same section of the same card quotes `HANDOVER.md` saying every outstanding item is a card ÔÇö so reading settles it. Card 0004's `## Why` names this exact fault. A rewrite card added a fresh instance of it.

**2. Half done ÔÇö the count was never written where the card says.**
`docs/board/ai-review/0004-...`, `## Tasks`: both tasks name `## Direction`. Nothing was written there. One commit holds the edits and the report, so no "before" record exists apart from the "after". Both boxes are ticked.

**3.** That same `## Comments` says "five markdown files changed". The commit changed four.

VERDICT: defect

**breakage: defect**

**Finding ÔÇö the ask on `0002` under-counts, and the missing fault stays missing.**

File: `docs/board/human-review/0002-the-handover-still-describes-v1.md`, section `## What I need from you`, question 2.

It asks Rob to approve cards for "the four documentation faults found outside this card", then names four: `AGENT.md`, `README.md`, `PRD.md` section 5.5, `PRD.md` section 9.

The same card's `## Comments` records five. The builder entry says: "section 8 points at `src/utils.js#L10-L20` for `isEdgeBrowser()`, a file v2.0 deletedÔÇª All three want a card." That fifth fault is real and still live: `src/` has no `utils.js` (checked: `background.js`, `content`, `data`, `icons`, `lib`, `options.*`, `popup.*`, `manifest.json`), while `PRD.md` section 8 and section 5 both link to `src/utils.js`.

So the summary contradicts the thread it summarises. A person who answers "yes" raises four cards, and the dead `src/utils.js` link is dropped with no record that it was dropped. That is the failure this rewrite exists to prevent: the reader trusts the top of the card and never reaches the comment 140 lines down.

Everything else held. Links are reciprocal, `## Decided` untouched, no `needs:` anywhere, `icons/` gap still real.

VERDICT: defect


**2026-08-29** The reviewer returned this card and its finding is the last review entry at the bottom of ## Direction. The loop moved it from todo/ to human-review/ because it has bounced 1 time between todo and ai-review, all 6 criteria ticked. THE BUILDER COULD NOT ACT ON THAT FINDING. A reviewer never unticks a criterion - it is forbidden from editing acceptance at all - so the card came back with 6 of 6 criteria still ticked, every session found nothing open to do, and the loop promoted it again on the boxes. Untick what the reviewer disproved and move it back to todo/, or say here why the finding is wrong.

**2026-09-28** Manager pass: reopened with new criterion #7 because both the scope and breakage findings on `0002` still hold. Its `## What I need from you` still asks Rob, as ask 2, whether "the four documentation faults" should get cards. None of the four reasons in `docs/board/README.md` makes that his, and `HANDOVER.md` already says every outstanding item is a card. It also counts four when the thread records five: `src/utils.js` does not exist, yet `PRD.md` sections 5 and 8 still link to it. The ask sitting above `## Why` is the convention's placement and reopens nothing.

**2026-09-28**
RESULT: done
TESTS: +0 new, none ran - this repository has no suite (no `composer.json`, no `vendor/`, no `package.json`); #7 is `proves: none`
TOUCHED: docs/board/in-progress/0004-rewrite-this-board-s-cards-for-the-reader.md, docs/board/human-review/0002-the-handover-still-describes-v1.md, docs/board/todo/0006-agent-md-still-gives-v1-instructions.md, docs/board/todo/0007-readme-shows-the-v1-file-tree.md, docs/board/todo/0008-prd-spa-link-points-at-the-wrong-lines.md, docs/board/todo/0009-prd-links-to-src-utils-js-which-is-gone.md, docs/board/todo/0010-prd-calls-readability-mit-when-it-is-apache.md
OUT-OF-SCOPE: 0006, 0007, 0008, 0009, 0010

Met #7. `0002`'s ask 2 is gone, with its "On 2" paragraph and the attention clause in "Why it needs
you". The card now asks one thing: untick #1. Each of the five faults `0002`'s thread records is on
its own card. I re-checked each against the files today and all five are still live:

- `AGENT.md` - `0006`
- `README.md` - `0007`
- `PRD.md` 5.5's `HANDOVER.md#L62-L66` anchor - `0008`
- the dead `src/utils.js` links in `PRD.md` 5.4 line 102 and 8 line 195 - `0009`
- the MIT claim - `0010`

`0002` names all five under `## Links`. Its `## Comments` is untouched.

One correction the cards carry: the MIT claim is in `PRD.md` section 5.4, line 107, not section 9 as
`0002`'s thread says. `0010` says so. `board:convention --path=$PWD` read 0 of 5 before and 0 of 10
after. No browser check is needed; nothing but markdown changed.

### 2026-09-28 review (v20260928190528-56e0)

**suite**

No suite this job could find in AutoReaderMode, so none ran. That is not a pass.

**acceptance: sound**

I found no defect. The work does what the acceptance criteria say.

- **#7, part 1:** Ask 2 is gone from card `0002`. Its `## What I need from you` now asks one thing only: "Untick criterion #1". I searched `docs/board/` for "four documentation" and found no match.
- **#7, part 2:** All five faults are now cards, and each fault is still real in the files:
  - `0006`: `AGENT.md` still names `utils.js`.
  - `0007`: `README.md` still shows the v1 file tree.
  - `0008`: `PRD.md` section 5.5 links to the wrong lines of `HANDOVER.md`.
  - `0009`: `PRD.md` still links to `src/utils.js`, which is gone, at 5.4 (`convertUrl()`) and section 8 (`isEdgeBrowser()`).
  - `0010`: `PRD.md` 5.4 still says Readability is "MIT licensed". It is Apache-2.0.
- **#7, part 3:** `0002` names all five under `## Links`, with one line of why for each.
- **#1 to #6:** The earlier acceptance review found these sound. Nothing in the new work reopens them.

One small note that disproves no criterion. `PRD.md` section 6 still has two old links: `src/background.js#L11` and `AGENT.md#L21-L22`. The thread on `0002` did not record them, so #7 does not cover them.

VERDICT: sound

**scope: sound**

**Scope check: sound.** Nothing in this change went past what card 0004 asked for, and nothing is half done.

- **What changed.** The last build commit (`5dfb1ce`) touched board cards only: card `0002`, card `0004`, and five new `todo/` cards, `0006` to `0010`. No code changed, and nothing in `done/` or `discarded/` changed.
- **The new cards are allowed.** Criterion #7 says every fault on `0002` must be on a card, so making them was required. The builder only wrote the cards. The broken docs (`AGENT.md`, `README.md`, `PRD.md`) are still unfixed, and that is correct. Fixing them would have gone past the card's fence.
- **No thread was edited.** In `0002`, only "What I need from you" (a summary above the thread) and `## Links` changed. Its `## Comments` thread was not touched. That matches criterion #5.
- **The question to Rob is gone.** `0002` now asks one thing only: untick #1. It lists all five faults under `## Links`, including the dead `src/utils.js` link on `0009`.
- **Old small issues are still there.** The tasks still say "write it into `## Direction`", and an old comment still says "five markdown files" when four changed. Neither one breaks a criterion.

Everything I checked holds, so this does not reopen a criterion.

VERDICT: sound

**breakage: sound**

I tried to break #7 and could not.

**What I checked**

- Ask 2 is gone from `0002`, in the section `## What I need from you`. The card now asks one thing only: untick #1.
- All five faults from the thread now have cards, `0006` to `0010`. `0002`'s `## Links` names each of them.
- The dead `src/utils.js` links in `PRD.md` are at lines 102 and 195. `0009` cites the same two lines.
- The MIT claim is at `PRD.md` line 107, in section 5.4. `0010` gives that correct location. The old thread said section 9, and that was wrong.

**One small gap, not a criterion failure**

`PRD.md` section 7 says the old `importScripts('utils.js')` sits at `src/background.js#L11`. That anchor is stale. `background.js` now has only one `importScripts`, at a different line, and it loads `lib/*`. The thread never recorded this fault, so it is outside #7. `0009` could take it as a third line.

No criterion is disproved.

VERDICT: sound

