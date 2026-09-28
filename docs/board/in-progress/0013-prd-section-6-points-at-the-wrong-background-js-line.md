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
- [ ] #1 `PRD.md` section 6 SHALL NOT link to a line number in `src/background.js`, and SHALL name
      the file that holds the `importScripts` call. proves: none - no suite in this repository reads prose
<!-- AC:END -->

## Tasks
- [ ] Repoint the link at `src/background.js` by file rather than by line number
