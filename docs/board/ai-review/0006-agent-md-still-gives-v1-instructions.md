# AGENT.md still gives an agent v1 instructions

## Why
`AGENT.md` is the rules file an agent reads before touching this code, and three of its instructions
describe files v2.0 deleted or changed:

- line 22 says `utils.js` is loaded with `importScripts()` and a `<script>` tag. `src/utils.js` does
  not exist; `src/background.js` loads `lib/matcher.js`, `lib/settings.js` and `lib/triggers.js`.
- line 34 puts `isEdgeBrowser()` in `utils.js`. It lives in `src/background.js` now.
- line 44 tells an agent to "consider bundling Mozilla Readability" and to edit
  `extractArticleElement()` in `reader.js`. Readability is already vendored at
  `src/content/readability.js`, and the renderer is `src/content/reader.js`.

An agent that trusts the file goes looking for a file that is gone, or sets out to build a thing
that shipped. The v2.0 rewrite on 2026-04-30 never touched `AGENT.md`, and the reviewer of `0002`
found it on 2026-08-29.

## Links

**Relates to**
- `0002` - its thread is where this fault was found; that card fixes `HANDOVER.md` only.

## Not this card
Any other document, and any change to the code. `AGENT.md` is made to describe `src/` as it stands.

## Acceptance
<!-- AC:BEGIN -->
- [x] #1 `AGENT.md` SHALL NOT name `utils.js`, and SHALL name the file each moved function lives in
      now. proves: none - no suite in this repository reads prose
- [x] #2 `AGENT.md` SHALL NOT tell an agent to bundle Readability, because it is bundled. proves:
      none - as #1
<!-- AC:END -->

## Tasks
- [x] Read `src/background.js`, `src/lib/` and `src/content/` and rewrite the three passages to match

## Comments

**2026-09-28** RESULT: done
TESTS: +0 new, both criteria are proves: none; no suite exists to run
TOUCHED: AGENT.md, docs/board/in-progress/0006-agent-md-still-gives-v1-instructions.md, docs/board/todo/0011-agent-md-names-popup-helpers-that-are-gone.md
OUT-OF-SCOPE: 0011
Rewrote the three passages against `src/` as it stands. The "No build step" passage now says
`background.js` loads the three `lib/` files with `importScripts()` and injects the three `content/`
files with `executeScript`. The popup loads only `popup.js`, so the old `<script>` tag claim was
dropped, not moved. `isEdgeBrowser()` is now placed in `background.js`. The extraction passage now
says Readability is vendored at `content/readability.js`, and names `tryReadability()`,
`fallbackExtract()` and `cleanClone()` in place of the two v1 functions. A grep of `AGENT.md` for
`utils.js`, `extractArticleElement` and "bundling" finds nothing.
The session prompt asks for `pest.bat` and `pint.bat`. This repository has no `composer.json` and no
`vendor/`; it is a plain MV3 extension, and `AGENT.md` says there is no automated suite. Neither
command exists to run, and none was run.
Line 41 names `getSites()` / `setSites()`, which v2.0 removed. That is outside this card's three
passages, so it is raised as `0011`.
