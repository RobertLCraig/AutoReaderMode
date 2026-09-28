# The PRD's SPA link points at the wrong lines of the handover

## Why
`PRD.md` section 5.5 ends "This addresses the SPA gap called out in
[HANDOVER.md](HANDOVER.md#L62-L66)". Those lines were the SPA-gap paragraph at commit `134be3a`.
After `HANDOVER.md` was rewritten for v2.0 they are the key-files table, so the link lands a reader
on something unrelated.

A line-number link breaks every time the file it points into is edited. The `HANDOVER.md` rewrite on
card `0002` broke this one, and the reviewer of that card found it on 2026-08-29.

## Links

**Relates to**
- `0002` - its rewrite of `HANDOVER.md` is what moved the lines, and its thread records the fault.
- `0009` - the other stale links in `PRD.md`; kept apart because they have a different cause.

## Not this card
Any other link in `PRD.md`.

## Acceptance
<!-- AC:BEGIN -->
- [x] #1 `PRD.md` section 5.5 SHALL NOT link to `HANDOVER.md` by line number. proves: none - no suite
      in this repository reads prose
<!-- AC:END -->

## Tasks
- [x] Point the sentence at what now records the SPA behaviour, by heading, or drop the link if
      nothing does

## Comments

**2026-09-28**
RESULT: done
TESTS: +0 new, no suite - #1 is `proves: none`, and this repository has no `composer.json`, so
`.\vendor\bin\pest.bat` and `.\vendor\bin\pint.bat` do not exist here and were not run
TOUCHED: PRD.md
TOUCHED: docs/board/in-progress/0008-prd-spa-link-points-at-the-wrong-lines.md
OUT-OF-SCOPE: none

`HANDOVER.md` no longer has an SPA-gap paragraph, because v2.0 closed the gap. The only place that
records the fix is the v2.0 changelog bullet about the `MutationObserver`. The sentence now says the
gap was the v1 handover's, and links `HANDOVER.md#changelog` by heading. I linked the `Changelog`
heading rather than the `v2.0` sub-heading, because the sub-heading's anchor carries a date and an
em dash and would break when the next release renames "(current)".

### 2026-09-28 review (v20260928195519-5e3a)

**suite**

No suite this job could find in AutoReaderMode, so none ran. That is not a pass.

**acceptance: sound**

I checked the one criterion against the files. It holds.

**#1 (no line-number link to `HANDOVER.md` in `PRD.md` section 5.5): it holds.**
- Section 5.5 of `PRD.md` has no link with `#L` in it now. I searched `PRD.md` for `L62` and got no match.
- The new link is `HANDOVER.md#changelog`. `HANDOVER.md` has a `## Changelog` heading, so the link goes to a real place.
- Under that heading, the `### v2.0 (current) - 2026-04-30` entry has the bullet about the `MutationObserver` in `reader.js`. That is the SPA fix. The new sentence in the PRD is true.
- The builder did not link the `v2.0` heading. That was a good choice. Its anchor has a date and a dash in it, so it could break at the next release.

This card changes prose only, so there is no function to name. The work is in section 5.5 of `PRD.md`, in the SPA-handling text.

I found no defect.

VERDICT: sound

**scope: sound**

I found no problem with the scope of this change.

**What the build changed:** The build commit is `e758513`. It changed 2 files only:
- `PRD.md`: one sentence in section 5.5.
- The `0008` card: ticked boxes and a new comment.

**Nothing went past the fence:**
- No other link in `PRD.md` changed. The two old links in section 6 are not touched, and they belong to `0009`.
- No code changed. `HANDOVER.md` did not change.
- The `AGENT.md`, `README.md`, `0004`, `0006`, `0007`, `0011` and `0012` changes in the diff come from earlier commits. This build did not make them.

**Nothing is half done:**
- The new link is `HANDOVER.md#changelog`. `HANDOVER.md` has a `## Changelog` heading, so the link opens the right place.
- The sentence no longer uses a line number. That is what #1 asks for.

I did not disprove a criterion.

VERDICT: sound

**breakage: sound**

I tried to break the change and could not.

- **The line-number link is gone.** Section 5.5 of `PRD.md` has no `HANDOVER.md#L...` link now. The only line-number links to `HANDOVER.md` that are left are in board cards, and cards are text that quotes history.
- **The new link works.** `HANDOVER.md` has a `## Changelog` heading. On GitHub, that heading makes the anchor `#changelog`, so the link lands on the right place.
- **The new sentence is true.** Under Changelog, the `### v2.0 (current)` entry has a bullet that adds the `MutationObserver` in `reader.js` for SPA pages (single-page apps). The sentence says "the v2.0 entry records the fix", and that is correct.
- **No other file uses the old sentence.** No caller, other document or comment needed an update.

The diff also holds changes from cards `0004`, `0006` and `0007`. Earlier commits made those changes, and they are not this card's work.

No criterion is disproved.

VERDICT: sound

