# README.md describes the v1 files

## Why
The "File Structure" section of `README.md` lists `src/utils.js` and a top-level `src/reader.js`.
Neither exists. `src/` now holds `content/`, `data/`, `lib/`, `options.html` and `options.js`, and
the README names none of them. Its "How It Works" and "Permissions" sections say `reader.js` is
injected on its own and extracts with CSS selectors, which was v1; v2 injects Readability first.

`README.md` is the first file a person opens, so anyone new is handed a map of a codebase that is
gone. The v2.0 rewrite on 2026-04-30 never touched it, and the reviewer of `0002` found it on
2026-08-29.

## Links

**Relates to**
- `0002` - its thread is where this fault was found; that card fixes `HANDOVER.md` only.

## Not this card
Any other document, and any change to the code.

## Acceptance
<!-- AC:BEGIN -->
- [x] #1 THE "File Structure" tree in `README.md` SHALL name every file and folder in `src/` and no
      file that is not there. proves: none - no suite in this repository reads prose
- [x] #2 THE "How It Works" and "Permissions" sections of `README.md` SHALL describe what
      `src/background.js` injects in v2 and match `src/manifest.json`. proves: none - as #1
<!-- AC:END -->

## Tasks
- [x] Re-derive the tree from `src/`, the injection from `src/background.js` and the permissions from
      `src/manifest.json`

## Comments

**2026-09-28** RESULT: done
TESTS: +0 new, no suite exists
TOUCHED: README.md
TOUCHED: docs/board/in-progress/0007-readme-shows-the-v1-file-tree.md
TOUCHED: docs/board/todo/0012-readme-usage-describes-the-v1-popup.md
OUT-OF-SCOPE: 0012

Both criteria are `proves: none`, so no test. The tree was re-derived from a listing of `src/` (all 17
files and 4 folders now named, `utils.js` and top-level `reader.js` gone). "How It Works" now follows
`background.js`: `decideTrigger` precedence from `lib/triggers.js`, the context-stamp call, then
`content/readability.js`, `content/detect.js` only when heuristics decide, then `content/reader.js`;
the Edge `read://` redirect and its error-only fallback. The Readability-first / 500-character
fallback / 5 s SPA wait is from `content/reader.js`. "Permissions" matches every entry in
`manifest.json`, and adds a row for `web_accessible_resources`, which the old table left out.

`.\vendor\bin\pest.bat` and `pint.bat` could not run: this repository tracks no `composer.json`, so
there is nothing for `vendor/` to hold. It is a plain JS extension with no test suite.

Found in passing: the "Usage" section and "Features" table still describe the v1 popup (toggle, ×
button). Raised as `0012`, not fixed.
