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

### 2026-09-28 review (v20260928193025-a6a1)

**suite**

No suite this job could find in AutoReaderMode, so none ran. That is not a pass.

**acceptance: defect**

The file tree is correct, but I found one defect in "How It Works".

**#1 (file tree): it holds.** I listed every file and folder in `src/`: 17 files and 4 folders. `README.md` names each of them, with all three icons. It no longer names `utils.js` or a top-level `reader.js`.

**#2 (How It Works and Permissions): it fails.**
- **Permissions is correct.** Each row matches `src/manifest.json`: the permissions, `host_permissions` and `web_accessible_resources`. The `session` storage claim is also true: `background.js` writes the trigger reason to `chrome.storage.session`.
- **The Chrome injection text is correct.** The injection code in `src/background.js` stamps the trigger context first. Then it injects `content/readability.js`, then `content/detect.js` only when `requireHeuristic` is set, then `content/reader.js`. The README says the same.
- **The defect: "How It Works" now has two `### Edge` headings.** The builder added the new heading but did not rename the old one. So the trigger paragraph sits under an `### Edge` heading. That paragraph describes how `background.js` asks `decideTrigger` in `lib/triggers.js` whether to fire. The `webNavigation.onCompleted` listener in `src/background.js` runs this for both browsers. A reader will think the trigger step is Edge-only, and that Chrome skips it.

UNMET: #2 the trigger-decision step, which runs for both browsers in the onCompleted listener in src/background.js, sits under a duplicate "### Edge" heading, so "How It Works" tells a reader it applies to Edge only.

VERDICT: defect

**scope: defect**

I checked what the change did beyond the card, and what it left unfinished.

**Over the fence: nothing.**
- The `AGENT.md` change and the move of `0004` and `0006` come from earlier commits in the same range. They are not this build's work.
- This build changed only `README.md`, its own card, and the new card `0012`.
- The v1 "Usage" and "Features" text was not fixed. It was raised as `0012`. That is correct.

**Half done: one fault.**
- In `README.md`, the "How It Works" section now has two `### Edge` headings, one after the other.
- The first `### Edge` holds the new text on how a trigger is chosen, from `decideTrigger` in `src/lib/triggers.js`. That logic runs in Chrome and in Edge.
- The builder added a new `### Edge` for the Edge redirect. But the old `### Edge` heading was not renamed.
- So a Chrome user reads that the trigger rules are for Edge only. That is wrong. The section does not correctly describe what `src/background.js` does.

UNMET: #2 "How It Works" puts the trigger logic that both browsers share under a leftover `### Edge` heading, which is repeated, so the section says the trigger logic is for Edge only.

VERDICT: defect

**breakage: defect**

I tried to break the README change. Two parts of "How It Works" are wrong about what `src/background.js` does.

**1. The shared trigger text sits under an "Edge" heading.** The change adds a second `### Edge` heading. The paragraph under the first one is about `decideTrigger` in `lib/triggers.js`, which applies to both browsers. A Chrome reader who jumps to "Chrome / Chromium" misses that paragraph. A reader who does see it is told it is Edge only.

**2. Edge also gets the overlay when the heuristics decide.** In `src/background.js`, the `onCompleted` handler goes to `read://` only when `decision.fire && isEdgeBrowser()`. When only a heuristic is on (`!decision.fire && decision.allowHeuristic`), it calls `injectReader` on Edge as well. So Edge gets `content/detect.js` and the in-page overlay. The README says the Edge overlay is used only when `read://` fails. The `content/` line in the file tree says the same ("Chrome, and the Edge fallback"). Both are wrong.

The file tree matches the 17 files in `src/`. The Permissions table matches `src/manifest.json`.

UNMET: #2 "How It Works" says Edge gets the injected scripts only when `read://` fails, but `background.js` also injects `detect.js` and the overlay on Edge when the heuristics decide, and it puts the trigger rules that apply to both browsers under an Edge-only heading.

VERDICT: defect

**acceptance**

- **#2 reopened**, by the acceptance lens: the trigger-decision step, which runs for both browsers in the onCompleted listener in src/background.js, sits under a duplicate "### Edge" heading, so "How It Works" tells a reader it applies to Edge only.
- **#2 was named by the scope lens and is not a ticked criterion here**, so nothing was changed: "How It Works" puts the trigger logic that both browsers share under a leftover `### Edge` heading, which is repeated, so the section says the trigger logic is for Edge only.
- **#2 was named by the breakage lens and is not a ticked criterion here**, so nothing was changed: "How It Works" says Edge gets the injected scripts only when `read://` fails, but `background.js` also injects `detect.js` and the overlay on Edge when the heuristics decide, and it puts the trigger rules that apply to both browsers under an Edge-only heading.

**2026-09-28** RESULT: done
TESTS: +0 new, no suite exists
TOUCHED: README.md
TOUCHED: docs/board/in-progress/0007-readme-shows-the-v1-file-tree.md
OUT-OF-SCOPE: none

Answers the review. Both criteria are `proves: none`, so no test. In "How It Works" the first,
duplicate `### Edge` heading is now "Deciding whether to fire (both browsers)", because the
`decideTrigger` step in `handleNavigation` runs for every browser. The Edge section now says
`read://` is used only when a source fires, and that when only the heuristics decide, Edge takes the
in-page overlay path too (`background.js` redirects only on `decision.fire && isEdgeBrowser()`).
The old "Chrome / Chromium" heading is now "In-page overlay (Chrome / Chromium; Edge when the
heuristics decide or `read://` fails)". The `content/` line in the file tree says the same.
Permissions is unchanged; the review found it correct.

`pest.bat` and `pint.bat` still cannot run: this repository has no `composer.json` and no `vendor/`.

### 2026-09-28 review (v20260928194222-c1b3)

**suite**

No suite this job could find in AutoReaderMode, so none ran. That is not a pass.

**acceptance: sound**

I checked both criteria against the code. I could not break either one.

**#1 (file tree): it holds.** `src/` has 17 files in 4 folders. The tree in `README.md` names every one of them, including the three icons. It does not name `utils.js` or a top-level `reader.js`.

**#2 (How It Works and Permissions): it holds.**
- **Trigger order:** `decideTrigger` in `src/lib/triggers.js` checks the Never / Always rule, then your site list, then the paywall list, then the ad-heavy list. After that it can hand the page to the heuristics. The new "both browsers" section says the same.
- **Edge path:** `handleNavigation` in `src/background.js` goes to `read://` only when `decision.fire && isEdgeBrowser()`. When only the heuristics decide, Edge gets `injectReader`. The README now says both things.
- **Edge fallback:** the `onErrorOccurred` listener calls `revertToOriginal`, and that injects the overlay. The README says this too.
- **Injection order:** `injectReader` sets the three `__ARM_*` values first. Then it injects `readability.js`, then `detect.js` (only when needed), then `reader.js`. This matches.
- **Permissions:** every row matches `src/manifest.json`.

The earlier defects are fixed. The duplicate `### Edge` heading is gone, and the text now says Edge uses the overlay when the heuristics decide.

One small gap does not fail a criterion. `handleNavigation` also falls back to the overlay at once when `redirectToImmersiveReader` returns false. The README describes only the `onErrorOccurred` fallback. The heading still says "`read://` fails", so this is an omission and not a false claim.

VERDICT: sound

**scope: sound**

**Scope check: sound.**

**Nothing went over the fence:**
- In `README.md`, only three sections changed: "File Structure", "How It Works" and "Permissions". The card names all three.
- "Usage" and "Features" did not change. They still show the v1 popup. The builder put that work on card `0012` and did not fix it. That is correct.
- No code in `src/` changed.
- The `AGENT.md` edit and the moves of `0004` and `0006` came from earlier commits in the same range. They are not this build's work.

**Nothing is half done:**
- The review before this one found two faults: a second `### Edge` heading, and a claim that Edge used the overlay only when `read://` failed. Both are fixed now.
- "How It Works" now has three different headings: "Deciding whether to fire (both browsers)", "Edge", and "In-page overlay (Chrome / Chromium; Edge when the heuristics decide or `read://` fails)".
- The `content/` line in the file tree now says the same thing as the overlay heading.
- A search of `README.md` finds no `utils.js` and no v1 text that says extraction uses only CSS selectors.

This check disproves no criterion.

VERDICT: sound

**breakage: sound**

I found no defect. The fix answers both points from the last review.

- **The duplicate `### Edge` heading is gone.** The first heading is now "Deciding whether to fire (both browsers)". This matches `handleNavigation` in `src/background.js`, which calls `decideTrigger` for every browser.
- **Edge now goes to `read://` only when a source fires.** In `handleNavigation`, the redirect runs only on `decision.fire && isEdgeBrowser()`. When only the heuristics decide, the code reaches `injectReader` with `requireHeuristic` set, on Edge too. The README "Edge" paragraph, the overlay heading and the `content/` line in the file tree now all say this.
- **The trigger order is correct.** `decideTrigger` in `src/lib/triggers.js` checks the per-site rule, then your site list (`preset`), then the paywall list, then the ad-heavy list. The README gives the same order.
- **The fallback is correct.** The `onErrorOccurred` listener calls `revertToOriginal`, which injects the overlay after the revert loads. The README says this.

One small gap does not break a criterion. `handleNavigation` also injects the overlay at once when `redirectToImmersiveReader` returns false, with no navigation error. The overlay heading says "`read://` fails", and that covers this case. No text in the README is now false.

VERDICT: sound

