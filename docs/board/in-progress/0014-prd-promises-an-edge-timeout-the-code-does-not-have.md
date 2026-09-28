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
- [ ] #1 `PRD.md` sections 5.4 and 8 SHALL describe the Edge fallback as error-triggered only, with no
      timeout, matching `src/background.js`. proves: none - no suite in this repository reads prose
<!-- AC:END -->

## Tasks
- [ ] Correct section 5.4, Edge path step 3
- [ ] Correct section 8, third bullet
