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
- [ ] #1 THE "File Structure" tree in `README.md` SHALL name every file and folder in `src/` and no
      file that is not there. proves: none - no suite in this repository reads prose
- [ ] #2 THE "How It Works" and "Permissions" sections of `README.md` SHALL describe what
      `src/background.js` injects in v2 and match `src/manifest.json`. proves: none - as #1
<!-- AC:END -->

## Tasks
- [ ] Re-derive the tree from `src/`, the injection from `src/background.js` and the permissions from
      `src/manifest.json`
