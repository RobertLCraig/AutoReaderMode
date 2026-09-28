# The PRD calls Readability MIT when it is Apache-2.0

## Why
`PRD.md` says the vendored Readability is "MIT licensed" (line 107, in section 5.4). The file itself,
`src/content/readability.js`, opens with an Apache License 2.0 header. `HANDOVER.md` was corrected
to Apache-2.0 on 2026-08-29, so the two documents now disagree.

A wrong licence in the spec is what somebody reads when deciding what they owe the upstream authors
for shipping it. The PRD copied the claim from the v1 handover. The session on `0002` found it, and
its thread places it in "section 9"; the line is in section 5.4.

## Links

**Relates to**
- `0002` - its thread is where this fault was found, and it corrected `HANDOVER.md` only.

## Not this card
Any other licence question. The project's own licence in `LICENSE` and `README.md` is not in doubt.

## Acceptance
<!-- AC:BEGIN -->
- [x] #1 `PRD.md` SHALL give the vendored Readability's licence as Apache-2.0, matching the header of
      `src/content/readability.js`. proves: none - no suite in this repository reads prose
<!-- AC:END -->

## Tasks
- [x] Correct the one phrase in section 5.4

## Comments

**2026-09-28**
RESULT: done
TESTS: +0 new - the one criterion is proves: none
TOUCHED: PRD.md
TOUCHED: docs/board/in-progress/0010-prd-calls-readability-mit-when-it-is-apache.md
OUT-OF-SCOPE: none

`PRD.md` line 107 now reads "vendored, Apache-2.0 licensed, ~50 KB", matching the Apache License 2.0
header of `src/content/readability.js`. No other `.md` in the repository still calls it MIT; the
remaining MIT line in `README.md` is the project's own licence. The instruction to run
`.\vendor\bin\pest.bat` and `pint.bat` does not fit this repository: it is a browser extension with
no `composer.json` and no `vendor/`, here or in `C:\Dev\AutoReaderMode`, so no suite was run.

### 2026-09-28 review (v20260928201709-988d)

**suite**

No suite this job could find in AutoReaderMode, so none ran. That is not a pass.

**acceptance: sound**

I checked criterion #1, the only criterion on this card, and it passes.

**#1: it holds.**
- `PRD.md` section 5.4, in the Chrome / Chromium path, step 1, now says "vendored, Apache-2.0 licensed, ~50 KB".
- The header of `src/content/readability.js` says "Licensed under the Apache License, Version 2.0". The two match.
- I searched `PRD.md` for "MIT" and found nothing. No old claim is left in the file.

This card changes text only, so no function does the work. The fix is in `PRD.md`, section 5.4.

The diff also holds changes to `AGENT.md`, `README.md` and other cards. Those came from earlier cards (`0006` to `0009`). They are not this build's work, so I did not judge them.

No criterion is disproved.

VERDICT: sound

**scope: sound**

I checked the build commit for card 0010, `a29267a`. It stays inside the card's limits.

**What the build changed:**
- `PRD.md`: one phrase in section 5.4, Chrome path step 1. "MIT licensed" is now "Apache-2.0 licensed". This is the one task on the card.
- Its own card: two ticked boxes and a new comment.

**Nothing went past the "Not this card" limit:**
- No other licence text changed. The MIT line in `README.md`, under its licence heading, is the project's own licence. The card keeps it out of scope, and the build did not touch it.
- `HANDOVER.md` already says Apache-2.0, so the two documents now agree.
- No code in `src/` changed.
- The diff also has changes to `AGENT.md`, `README.md`, other `PRD.md` sections and cards 0004 to 0009 and 0011 to 0014. Earlier commits made those changes for other cards. This build did not make them.

**Nothing is half done:**
- `PRD.md` does not call Readability MIT anywhere now. Outside `docs/board/`, no `.md` file calls it MIT.

This check disproves no criterion.

VERDICT: sound

**breakage: sound**

I tried to break this change, and I could not.

- **The fix is right.** Section 5.4 of `PRD.md`, in the Chrome path, now says Readability is "Apache-2.0 licensed". The header of `src/content/readability.js` says "Apache License, Version 2.0". The two now agree.
- **No other file still calls Readability MIT.** `HANDOVER.md` and the `README.md` file tree both say Apache-2.0. The one MIT line left is in the `README.md` "License" section. That line is about the project's own licence, and the card says to leave it alone.
- **No text was made false.** Card `0002` still says "`PRD.md` still says MIT". That line is an old comment in the card's history (its thread), so it is not a live claim. Card `0004` does the same thing.
- **No code changed**, so nothing that calls the code can break.

No criterion is disproved.

VERDICT: sound

