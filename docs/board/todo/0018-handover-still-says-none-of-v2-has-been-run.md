# The handover still says none of v2 has been run

## Why
**`HANDOVER.md` says nothing in v2 has been exercised in a browser.** Its "Known limitations"
section opens with "None of v2 has been run", and the v2.0 changelog entry ends "Not yet verified".
Since card `0001`, `tests/acceptance.mjs` runs PRD section 11 criteria 1 to 7 in Edge and Chromium,
and on 2026-10-04 five passed and two failed.

**What it costs.** The next session reads the handover first and will believe every behaviour is
unobserved, and it will not learn that `npm ci` then `npm test` runs the pass.

**How it came to be this way.** Card `0001` built the harness and its scope did not include the
handover.

## Links

**Relates to**
- `0001` - built `tests/acceptance.mjs` and recorded the verdicts this card writes down.

## Not this card
Changing any verdict, or the PRD.

## Plan
Edit `HANDOVER.md` at the repository root. Replace the "None of v2 has been run" paragraph with what
was run, where the verdicts are (card `0001`'s comments), and how to rerun them: `npm ci`,
`npx playwright install chromium`, `npm test`. Edge stable must be installed for criteria 1 and 3.
Change "Not yet verified" in the changelog to match.

## Acceptance
<!-- AC:BEGIN -->
- [ ] #1 WHEN a reader opens `HANDOVER.md`, IT SHALL say which PRD criteria have been run, where the
      verdicts are, and the commands that rerun them. proves: none - no suite in this repository reads prose
<!-- AC:END -->

## Tasks
- [ ] Rewrite the "None of v2 has been run" paragraph and the changelog line

## Comments
