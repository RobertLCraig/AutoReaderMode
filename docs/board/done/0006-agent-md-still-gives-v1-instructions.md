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

### 2026-09-28 review (v20260928191803-038f)

**suite**

No suite this job could find in AutoReaderMode, so none ran. That is not a pass.

**acceptance: sound**

I checked both criteria against the code. Both hold.

**#1 (no `utils.js`, and each function's new file is named):** `AGENT.md` does not name `utils.js` now. It says `isEdgeBrowser()` is in `background.js`, and that is correct: the function is in `src/background.js`. Its note on loading is also correct:
- The top level of `src/background.js` calls `importScripts('lib/matcher.js', 'lib/settings.js', 'lib/triggers.js')`.
- The injection code in `src/background.js` puts `content/readability.js`, then `content/detect.js` (only when it is needed), then `content/reader.js` in the `executeScript` file list.

**#2 (no instruction to bundle Readability):** The old "consider bundling" text is gone. The new text says Readability is vendored (already copied into the project), and it is. It also names `tryReadability()`, `fallbackExtract()` and `cleanClone()`, and all three are in `src/content/reader.js`.

One small point breaks neither criterion. The text says `detect.js` is always injected, but the code injects it only when a heuristic check is needed.

VERDICT: sound

**scope: sound**

The builder stayed inside the fence. I tried to find extra work and found none.

**What changed in `AGENT.md`:** Only the three passages the card names changed.
- "No build step" now names `background.js` and `lib/*`. I found the `importScripts()` call for `lib/*` in `src/background.js`.
- "Browser detection" now places `isEdgeBrowser()` in `background.js`. That function is in `src/background.js`.
- "To improve content extraction" now names `tryReadability()`, `fallbackExtract()` and `cleanClone()`. All three are in `src/content/reader.js`.

**Nothing went over the fence:**
- No code changed.
- No other document changed.
- The stale `getSites()` / `setSites()` passage is outside this card. The builder did not fix it. It raised it as card `0011` in `todo/`, which is correct.

**Other files in the diff:**
- The `0004` move to `done/` came from earlier board commits in the same range. This build did not make that change.
- The move of `0006` from `todo/` to `ai-review/` is normal board movement.

**Nothing is half done:** Both criteria hold. `AGENT.md` does not name `utils.js`, and it does not tell an agent to bundle Readability.

No criterion is disproved.

VERDICT: sound

**breakage: sound**

I tried to break this change and could not. All three rewritten passages match the code in `src/`.

- **Loading passage:** `src/background.js` loads `lib/matcher.js`, `lib/settings.js` and `lib/triggers.js` with one `importScripts()` call at the top of the file. Its reader-injection code sends `content/readability.js`, then `content/detect.js`, then `content/reader.js` to `executeScript`. `detect.js` is sent only when a heuristic check is needed. The new text is correct.
- **Dropped `<script>` claim:** `popup.html` loads only `popup.js`, and `options.html` loads only `options.js`. Dropping the claim was correct. The rule on inline scripts is still true.
- **`isEdgeBrowser()`:** This function is defined in `src/background.js`. That is what the new text says.
- **Readability passage:** `tryReadability()`, `fallbackExtract()` and `cleanClone()` all exist in `src/content/reader.js`. No line in `AGENT.md` still names `utils.js` or tells an agent to bundle Readability.

Two small notes. Neither one disproves a criterion, because both are outside the three passages this card covered:

- `AGENT.md` still names `getSites()` / `setSites()`. That is already on card `0011`.
- The styling passage says to edit a "`css` template literal" in `reader.js`. `src/content/reader.js` has no variable named `css`. The dark-mode `@media` rule exists, but the name is stale. Nothing tracks this yet, so it could go on a new card.

VERDICT: sound

