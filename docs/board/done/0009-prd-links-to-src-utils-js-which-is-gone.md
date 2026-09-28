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

### 2026-09-28 review (v20260928200654-3ec3)

**suite**

No suite this job could find in AutoReaderMode, so none ran. That is not a pass.

**acceptance: sound**

I checked the one acceptance criterion (#1) against the code. It is met.

**#1 is met.**
- `PRD.md` has no link to `src/utils.js` now. `utils.js` shows up in one place only: the section 6 text about the old `importScripts('utils.js')` setup. That text is not a link to `utils.js`. It links to `src/background.js`, and card `0013` covers it.
- Section 8 says `isEdgeBrowser()` is in `src/background.js`. That is true: `function isEdgeBrowser()` is in that file.
- Section 5.4 says there is no `convertUrl()` in v2.0, and that the `read://` URL is built inside `redirectToImmersiveReader()` in `src/background.js`. That is true: the function makes the `readerUrl` as a template string.
- Both new links go to the file, not to a line number. This matches the card's task.

**One small note. It does not break #1.** Section 8 still says `convertUrl()` is "kept as-is". The next sentence says it became inline code. So that bullet argues with itself a little. The criterion asks for no `utils.js` link and for each function's home to be named. Both of those hold.

VERDICT: sound

**scope: sound**

**Scope check: sound.**

**What the build did:** The build commit is `0678a31`. It changed four files:
- `PRD.md`: two lines only. One is in section 5.4, Edge path step 1. The other is in section 8, second bullet. The card named both.
- Its own card, `0009`.
- Two new `todo/` cards, `0013` and `0014`.

**Nothing went over the fence:**
- No other link in `PRD.md` changed. The section 6 link `src/background.js#L11` is still there. The builder carded it as `0013` and did not fix it. That is correct.
- The 1.5 s timeout text is still in the PRD. The builder carded it as `0014` and did not fix it. That is also correct.
- No code in `src/` changed.
- Earlier commits made the `AGENT.md`, `README.md` and 5.5 changes in the diff, for `0006`, `0007` and `0008`. This build did not make them.

**Nothing is half done:**
- A search of `PRD.md` finds `utils.js` in section 6 prose only. That text is not a link, and it belongs to `0013`.
- Both new texts say where things are now. `isEdgeBrowser()` is in `src/background.js`. The URL is built inline in `redirectToImmersiveReader()` in the same file.

**One small note that disproves no criterion:** Both edited lines still say `convertUrl()` exists, and then say it does not. Step 1 opens with "`convertUrl(originalUrl)` builds...". Section 8 opens with "...are kept as-is". This is awkward to read, but it is not a scope fault.

VERDICT: sound

**breakage: sound**

I tried to break this change and could not.

- **Both old links are gone.** `PRD.md` has no link to `src/utils.js` now. The word `utils.js` shows up only once more, in the section 6 prose. That prose is not a link, and card `0013` covers it.
- **`isEdgeBrowser()` is in the right place.** `PRD.md` section 8 says it lives in `src/background.js`. The code agrees: `src/background.js` defines `function isEdgeBrowser()`.
- **The `read://` URL claim is true.** `PRD.md` says the URL is built inline in `redirectToImmersiveReader()` in `src/background.js`. That function builds `read://https_${hostname}/?url=...` itself, as the text says.
- **No `convertUrl()` exists anywhere in `src/`.** So the PRD is right to say it became inline code.
- **Other docs agree with the PRD.** `HANDOVER.md` gives the same facts, and `AGENT.md` does too.

One small point does not break the criterion. Section 5.4 step 1 still opens with "`convertUrl(originalUrl)` builds...". Section 8 still says `convertUrl()` is "kept as-is". Both sentences correct themselves in the next clause, so no false fact is left.

No criterion is disproved.

VERDICT: sound

