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
- [x] #1 THE "Usage" section of `README.md` SHALL describe the controls in `src/popup.html` and
      `src/options.html` and name no control that is not there. proves: none - no suite in this
      repository reads prose
- [x] #2 THE "Features" table of `README.md` SHALL list the four trigger sources and the per-site
      rule that v2 has. proves: none - as #1
<!-- AC:END -->

## Tasks
- [x] Read `src/popup.html`, `src/popup.js`, `src/options.html` and `src/options.js` and rewrite both
      sections to match

## Comments

**2026-09-28**
RESULT: done
TESTS: +0 new - both criteria are proves: none; this repository has no test suite (no composer.json, no vendor/bin/pest.bat, no package.json), so pest and pint were not run
TOUCHED: README.md
TOUCHED: docs/board/in-progress/0012-readme-usage-describes-the-v1-popup.md
OUT-OF-SCOPE: none

"Usage" now walks the popup as `src/popup.html` has it: domain, status and reason, the Open Reader
Mode button, the Always / Default / Never rule, and the Settings cog and footer link. It then lists
what the options page holds: the four detection toggles, the per-list "manage" drawer, and the "Your
sites" add box and × buttons. The × now sits on the options page, where it is. The "Exiting reader
mode" subsection was left as it was: the popup button does switch to "Exit Reader Mode", and
`content/reader.js` handles Esc and Alt+R.

"Features" names the four sources as `HANDOVER.md` does (your list, curated paywall, curated
ad-heavy, heuristics), adds a Per-site rule row and an Options page row, and drops "Site management".

Not checked in a browser. The wording was matched against the markup, not against a running popup.
