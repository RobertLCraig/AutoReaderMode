# The PRD promises an Edge timeout the code does not have

## Why
`PRD.md` says the Edge fallback to the overlay fires if the `read://` navigation errors **or** if
`onCompleted` does not fire within 1.5 s. It says this twice: section 5.4, Edge path step 3, and
section 8, third bullet.

The code has no timeout. The header comment in `src/background.js` says "We do NOT use a timeout -
read:// staying loaded is the success state". `HANDOVER.md`, "Edge Immersive Reader", agrees. So a
reader of the spec expects a safety net that is not there: an Edge release that shows a blank page
without an error would not be caught.

The PRD was written before the build, and the build chose error-only. Nobody updated the spec.

## Links

**Relates to**
- `0009` - the session on it found this while editing the same two sections.

## Not this card
Adding a timeout to the code. Whether one is wanted is a separate question; this card only makes the
spec say what was built.

## Acceptance
<!-- AC:BEGIN -->
- [x] #1 `PRD.md` sections 5.4 and 8 SHALL describe the Edge fallback as error-triggered only, with no
      timeout, matching `src/background.js`. proves: none - no suite in this repository reads prose
<!-- AC:END -->

## Tasks
- [x] Correct section 5.4, Edge path step 3
- [x] Correct section 8, third bullet

## Comments

**2026-09-28** RESULT: done
TESTS: +0 new (criterion is proves: none); no suite exists to run
TOUCHED: PRD.md
TOUCHED: docs/board/in-progress/0014-prd-promises-an-edge-timeout-the-code-does-not-have.md
OUT-OF-SCOPE: none

Section 5.4 step 3 and section 8 bullet 3 now say the fallback fires only on
`webNavigation.onErrorOccurred` for the `read://` navigation, with no timeout, and that a blank
`read://` page without an error is not caught. Wording follows the `src/background.js` header and
HANDOVER.md "Edge Immersive Reader". Step 3 also dropped "one-shot listener for that tab": the code
uses one global listener keyed by the `pendingEdgeReader` map, so the old phrase was also untrue.
No code changed. The repository has no `composer.json`, `vendor/` or tests, so `pest.bat` and
`pint.bat` cannot run here; that is the repository, not this worktree.
