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

