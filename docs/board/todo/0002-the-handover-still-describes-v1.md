# The handover still describes v1.2 on a v2.0 codebase

## Why
`HANDOVER.md` documents a three-file architecture (`background.js`, `utils.js`, `reader.js`), lists
its changelog as "v1.2 (current)", and carries a "Known limitations" section whose two improvement
paths are both already built:

- "Bundle Mozilla Readability" is `src/content/readability.js`, shipped.
- "Add a MutationObserver inside `reader.js`" is in `src/content/reader.js`, shipped.

The tree it describes no longer exists either: `src/` now holds `content/`, `data/`, `lib/`,
`options.html` and `options.js`, none of which the handover mentions. `manifest.json` says 2.0.

An agent reading this would set out to build two things that are done, using a file map that is
wrong, and would never find the actual outstanding work, which is that none of v2 has been verified.

## Not this card
Running the acceptance pass. That is card 0001, and this card should land after it so the handover
can record the verdicts rather than being rewritten twice.

## Acceptance
<!-- AC:BEGIN -->
- [ ] #1 THE ARCHITECTURE and key-files sections SHALL describe the files that exist in `src/`,
      including `content/`, `data/`, `lib/` and the options page.
- [ ] #2 THE "Known limitations" section SHALL NOT name Readability or the MutationObserver as
      improvement paths, because both shipped.
- [ ] #3 THE CHANGELOG SHALL carry a v2.0 entry, and the twelve-item manual testing checklist SHALL
      live on the board rather than in the handover.
- [ ] #4 THE HANDOVER SHALL point at `docs/board/` for work and SHALL NOT list any work item in
      prose.
<!-- AC:END -->

## Tasks
- [ ] Re-derive the architecture and file map from `src/` as it stands
- [ ] Delete the two solved improvement paths
- [ ] Write the v2.0 changelog entry from the 2026-04-30 commit
- [ ] Move the testing checklist onto card 0001 and point the handover at the board
