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

### 2026-09-28 review (v20260928204701-dc42)

**suite**

No suite this job could find in AutoReaderMode, so none ran. That is not a pass.

**acceptance: sound**

I checked the one rule on this card, #1. It passes.

**#1 passes.**
- `PRD.md` section 6 now links to `[src/background.js](src/background.js)`. The link has no line number (no `#L...`).
- `PRD.md` has no other `background.js#` link.
- `src/background.js` is the file that holds the `importScripts` call. It is the only one: `importScripts('lib/matcher.js', 'lib/settings.js', 'lib/triggers.js')`. The call is at the top level of the file, not inside a function. So the file is the right thing to name.

This card changes only text, so no function does the work. The fix is the section 6 paragraph in `PRD.md`.

The diff also changes `AGENT.md` and `README.md` and moves other cards. Earlier cards (`0009` to `0012`) made those changes. I did not judge them.

I could not break this criterion.

VERDICT: sound

**scope: sound**

I checked the build commit for card `0013`. It is `c995b4f`.

**It changed two files only:**
- `PRD.md`: one line in section 6. The `#L11` anchor is gone. The link is now `[src/background.js](src/background.js)`.
- The card `0013` itself.

**Nothing went over the fence:**
- No other link in `PRD.md` changed. The `AGENT.md#L21-L22` link on the same line is still there. The card fences it out, so that is right.
- No code in `src/` changed.
- The `AGENT.md`, `README.md` and 5.4 licence changes in the diff are from earlier commits. They are for cards `0009` to `0012`, not this build.

**Nothing is half done:**
- `PRD.md` has no other `background.js#` anchor.
- The file it links, `src/background.js`, holds the only `importScripts` call. That call loads `lib/matcher.js`, `lib/settings.js` and `lib/triggers.js`, as the PRD text says.

This check disproves no criterion.

VERDICT: sound

**breakage: sound**

I tried to break this change. I could not.

- **The line-number link is gone.** Section 6 of `PRD.md` now links `[src/background.js](src/background.js)` with no `#L11`. A search of `PRD.md` finds no other `background.js#` link.
- **It names the right file.** `src/background.js` holds the only `importScripts(...)` call. It loads `lib/matcher.js`, `lib/settings.js` and `lib/triggers.js`, which is what the section 6 sentence says.
- **No other document is now wrong.** `HANDOVER.md` and `AGENT.md` both say `background.js` calls `importScripts` for the three `lib/` files. The PRD agrees with them.
- **The other section 6 link was left alone,** as the card asks. That is `AGENT.md#L21-L22`. It still points at the non-module warning, which is on line 22 of `AGENT.md`.
- **No code changed.** The `AGENT.md`, `README.md` and other card files in the diff came from cards `0009` to `0012`. This card did not change them.

My check disproves no criterion.

VERDICT: sound

