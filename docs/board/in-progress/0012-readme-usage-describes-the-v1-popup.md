# README.md "Usage" describes the v1 popup

## Why
The "Usage" section of `README.md` tells a person to "flip the toggle" next to the current site's
domain and to remove a site "by clicking the × button next to it". The v2 popup has neither.
`src/popup.html` has a per-site rule as a segmented Always / Default / Never control, and the bulk
site list moved to the options page (`src/options.html`, `src/options.js`). The "Features" table
above it still lists the v1 feature set too: no curated lists, no heuristics, no per-site rules, no
options page.

A new user who follows the README looks for controls that are gone. The session on `0007` found it on
2026-09-28; that card covered "File Structure", "How It Works" and "Permissions" only.

## Links

**Relates to**
- `0007` - the card whose session found this; it fixed the other v1 sections of `README.md`.

## Not this card
Any other section of `README.md`, any other document, and any change to the code.

## Acceptance
<!-- AC:BEGIN -->
- [ ] #1 THE "Usage" section of `README.md` SHALL describe the controls in `src/popup.html` and
      `src/options.html` and name no control that is not there. proves: none - no suite in this
      repository reads prose
- [ ] #2 THE "Features" table of `README.md` SHALL list the four trigger sources and the per-site
      rule that v2 has. proves: none - as #1
<!-- AC:END -->

## Tasks
- [ ] Read `src/popup.html`, `src/popup.js`, `src/options.html` and `src/options.js` and rewrite both
      sections to match
