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

### 2026-09-28 review (v20260928203639-779c)

**suite**

No suite this job could find in AutoReaderMode, so none ran. That is not a pass.

**acceptance: sound**

I checked both acceptance criteria against the code. Both of them hold.

**#1 (Usage) holds.** Each control that the README names is in the code:
- **Popup** (`src/popup.html`):
  - The domain line (`hero-domain`) and the status and reason lines (`status-pill`, `reason-line`).
  - The `reader-btn` button, which says "Open Reader Mode".
  - The "Rule for this site" control, with the three buttons Always, Default and Never.
  - The Settings cog (`open-options`) and the footer link "Settings →" (`footer-options`).
  - The "unavailable" message, which matches the README line about browser pages, extension pages and local files.
- **Options page** (`src/options.html`, `src/options.js`):
  - Four switches: `enablePaywallList`, `enableAdList`, `enablePaywallHeuristic` and `enableAdHeuristic`.
  - A "manage" button for each curated list. It opens a drawer with a filter box, a switch for each entry, and a restore button for removed entries.
  - "Your sites", with `add-input` and the Add button. `renderSites()` gives each site an X-shaped remove button that calls `removeHost()`.
- **The rule text is true.** `setRule()` in `src/popup.js` adds the site to `readerSites` for Always and saves an override for Never. That matches the README.
- **No v1 toggle is named.**

**#2 (Features) holds.** The Auto-trigger row names all four sources. The "Per-site rule" row names Always, Default and Never.

I found no defect.

VERDICT: sound

**scope: sound**

The scope check found no defect. The build stayed inside the card.

**What the build did.** The build is commit `1307a6f`. It changed two files:
- `README.md`: the "Features" table and the "Usage" section only. The card names both.
- Its own card, `0012`.

**Nothing is over the fence.**
- No other section of `README.md` changed. "Exiting reader mode" was not changed.
- No other document changed. No code in `src/` changed.
- The `AGENT.md`, `PRD.md` and "How It Works" changes in the diff are from earlier commits for cards `0007` to `0011`. This build did not make them.

**Nothing is half done.**
- The v1 "flip the toggle" step is gone.
- The × button now sits under the options page, which is where it is.
- Each control that "Usage" names is in the markup:
  - `src/popup.html` has "Rule for this site", the Settings cog and "Settings →".
  - `src/options.html` has the "manage" buttons, "Your sites" and "Add".
- "Site management" is gone from the table. The "Per-site rule" and "Options page" rows replace it.

This check disproves no criterion.

VERDICT: sound

**breakage: sound**

I tried to break the "Usage" section and the "Features" table. I could not.

- **Popup controls match `src/popup.html`.** The popup has the domain, the status pill with its reason line, the **Open Reader Mode** button, the **Always / Default / Never** buttons, the cog (`open-options`) and the **Settings →** footer link (`footer-options`). The README names all of them. It names no v1 toggle.
- **The rule text is true.** `setRule()` in `src/popup.js` adds the host to `readerSites` on Always. On Never it removes the host and sets an override. On Default it removes both. The README says the same.
- **Options page controls match `src/options.html`.** It has four checkboxes, a **manage** button for each curated list, a drawer with a filter and removed-entry buttons, and the **Your sites** box with **Add**. The README names each of them.
- **"Does not run on browser pages, extension pages or local files" is true.** `isRestrictedUrl()` blocks `chrome://`, `edge://` and extension URLs. A `file:` URL has no host, so the init code in `src/popup.js` shows the `unavailable` panel.
- **Features:** the table names all four sources and the per-site rule.

No criterion is disproved.

VERDICT: sound

