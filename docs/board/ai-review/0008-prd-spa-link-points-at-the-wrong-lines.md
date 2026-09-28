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
