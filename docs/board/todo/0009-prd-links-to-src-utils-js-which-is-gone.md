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
- [ ] #1 `PRD.md` SHALL NOT link to `src/utils.js`, and SHALL name where each function lives now.
      proves: none - no suite in this repository reads prose
<!-- AC:END -->

## Tasks
- [ ] Repoint both links at `src/background.js`, by file rather than by line number
