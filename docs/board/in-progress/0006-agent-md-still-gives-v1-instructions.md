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
- [ ] #1 `AGENT.md` SHALL NOT name `utils.js`, and SHALL name the file each moved function lives in
      now. proves: none - no suite in this repository reads prose
- [ ] #2 `AGENT.md` SHALL NOT tell an agent to bundle Readability, because it is bundled. proves:
      none - as #1
<!-- AC:END -->

## Tasks
- [ ] Read `src/background.js`, `src/lib/` and `src/content/` and rewrite the three passages to match
