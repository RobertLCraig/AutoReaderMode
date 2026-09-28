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
- [ ] #1 `PRD.md` SHALL give the vendored Readability's licence as Apache-2.0, matching the header of
      `src/content/readability.js`. proves: none - no suite in this repository reads prose
<!-- AC:END -->

## Tasks
- [ ] Correct the one phrase in section 5.4
