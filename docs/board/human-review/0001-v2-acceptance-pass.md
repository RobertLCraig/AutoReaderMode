# Run the v2 acceptance pass

## What I need from you

**Run the eight v2 acceptance criteria in a real browser and record a verdict for each.** Load the
unpacked extension and work through [PRD.md section 11](../../../PRD.md). The ones most likely to
fail, and what a failure means:

1. **Edge, curated paywall host.** Pass: the URL becomes `read://https_<host>/?url=...`. Fail: the
   inline overlay appears instead, which means the Edge branch did not take and every Edge user
   gets the Chrome path.
2. **Chrome, same host.** Pass: the inline Readability overlay renders the article.
3. **A host added by the popup** still auto-triggers on the next visit. Fail here means the v2
   rewrite broke the one feature v1 had.
4. **A non-curated page carrying `<meta property="article:content_tier" content="locked">`.**
   Pass: reader mode fires and the popup reads "Heuristic: paywall meta tag". This is the criterion
   that proves the heuristic and its reason display are wired to each other.
5. **All four detection sources disabled.** Pass: nothing fires on any non-listed host. A trigger
   here is the worst failure on the list, because it is the one that wrecks ordinary browsing.
6. **A JS-rendered news site.** Pass: extracted content, not an empty overlay. This is what the
   MutationObserver exists for.
7. **A `chrome://` page.** Pass: the error banner fires and the popup explains why, rather than
   failing silently.
8. The twelve-item manual checklist that was in the handover, now card 0002's to relocate.

**Pass** is eight verdicts, one per criterion, recorded here under `## Direction`.

**Fail** is a blanket "seems fine". Report the numbers instead, because a named failure says where
to look next and each one earns its own card. Criterion 5 matters most: a trigger on a non-listed
host is the failure that wrecks ordinary browsing, and it is the one you will not notice unless you
go looking for it.

**Why it needs you** All eight need a real browser on real sites, two of them Edge specifically, and
one needs a live paywalled host. Nothing anywhere records that any of this has been run since the
rewrite was committed on 2026-04-30, so the extension has been sitting at version 2.0 unverified for
three and a half months.

## Why
`src/manifest.json` says version 2.0 and the rewrite was committed on 2026-04-30 with Readability
bundled, a MutationObserver in `reader.js` and both curated lists in `src/data/`. Nothing anywhere
records that any of it has been run.

The PRD says the rewrite "ships when all of the following are true". It has not shipped, and the
eight criteria are the only thing standing between the code and calling it done.

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
- [ ] Load unpacked in Edge stable, run criteria 1 and 3
- [ ] Load unpacked in Chrome stable, run criteria 2, 4, 5, 6, 7
- [ ] Record each verdict here under Direction
