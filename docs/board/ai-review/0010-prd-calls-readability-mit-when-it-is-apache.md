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
