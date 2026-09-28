# PRD section 6 points at the wrong line of background.js

## Why
`PRD.md` section 6 says the old `importScripts('utils.js')` setup is at
`src/background.js#L11`. Line 11 of `src/background.js` is now a comment. The only
`importScripts` call is at line 22, and it loads `lib/*`, not `utils.js`. A reader who follows the
link lands on the wrong line.

The v2.0 rewrite on 2026-04-30 moved the call and nobody updated the anchor. The review on `0004`
noted it on its thread, and no card carried it.

## Links

**Relates to**
- `0009` - fixed the dead `src/utils.js` links in `PRD.md`; this link was outside its scope.

## Not this card
Any other link in `PRD.md`, and any change to the code.

## Acceptance
<!-- AC:BEGIN -->
- [x] #1 `PRD.md` section 6 SHALL NOT link to a line number in `src/background.js`, and SHALL name
      the file that holds the `importScripts` call. proves: none - no suite in this repository reads prose
<!-- AC:END -->

## Tasks
- [x] Repoint the link at `src/background.js` by file rather than by line number

## Comments

**2026-09-28** RESULT: done
TESTS: +0 new, no suite exists
TOUCHED: PRD.md
TOUCHED: docs/board/in-progress/0013-prd-section-6-points-at-the-wrong-background-js-line.md
OUT-OF-SCOPE: none

The one criterion is `proves: none`, so no test. `PRD.md` section 6 now links
`[src/background.js](src/background.js)` with no `#L11` anchor. The link still names the file that
holds the only `importScripts` call. No other `background.js#` anchor is left in `PRD.md`.

`.\vendor\bin\pest.bat` and `pint.bat` could not run: this repository has no `composer.json`, so no
`vendor/`. It is a plain JS extension with no test suite.
