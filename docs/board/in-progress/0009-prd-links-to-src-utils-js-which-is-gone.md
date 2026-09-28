# The PRD links to src/utils.js, which is gone

## Why
`PRD.md` links to a file v2.0 deleted, twice:

- section 5.4, line 102: `convertUrl()` at `src/utils.js#L26-L38`
- section 8, line 195: `isEdgeBrowser()` at `src/utils.js#L10-L20`

`src/utils.js` does not exist. `HANDOVER.md` records that `isEdgeBrowser()` lives in
`src/background.js` and that the `read://` URL is built inline there. A reader who follows either
link gets a missing file.

The PRD was written against v1.2, and the v2.0 rewrite on 2026-04-30 deleted the file without
updating the links. The session on `0002` recorded it on 2026-08-29.

## Links

**Relates to**
- `0002` - its thread is where this fault was recorded.
- `0008` - the other stale link in `PRD.md`; kept apart because it has a different cause.

## Not this card
Any other link in `PRD.md`, and any change to the code.

## Acceptance
<!-- AC:BEGIN -->
- [x] #1 `PRD.md` SHALL NOT link to `src/utils.js`, and SHALL name where each function lives now.
      proves: none - no suite in this repository reads prose
<!-- AC:END -->

## Tasks
- [x] Repoint both links at `src/background.js`, by file rather than by line number

## Comments

**2026-09-28** RESULT: done
TESTS: +0 new, none - the only criterion is `proves: none`, and this repository has no suite (no `vendor/`, no Pest, no `package.json`), so neither `pest.bat` nor `pint.bat` exists to run.
TOUCHED: PRD.md
TOUCHED: docs/board/in-progress/0009-prd-links-to-src-utils-js-which-is-gone.md
TOUCHED: docs/board/todo/0013-prd-section-6-points-at-the-wrong-background-js-line.md
TOUCHED: docs/board/todo/0014-prd-promises-an-edge-timeout-the-code-does-not-have.md
OUT-OF-SCOPE: 0013, 0014

Both `src/utils.js` links in `PRD.md` now point at `src/background.js` by file. Section 5.4 step 1 and section 8 second bullet also say where each function lives now. `isEdgeBrowser()` is a function in `src/background.js`. `convertUrl()` does not exist in v2.0: the `read://` URL is built inline in `redirectToImmersiveReader()` in the same file. So the text names that function, not a `convertUrl()` that a reader would search for and not find. A search of `PRD.md` for `utils.js` now finds only the section 6 prose about the old `importScripts('utils.js')` setup, which is not a link and is `0013`'s line.

Found and carded, not fixed: section 6 links `src/background.js#L11`, which is now a comment line (`0013`). Sections 5.4 and 8 promise a 1.5 s timeout on the Edge fallback, and the code has none (`0014`).
