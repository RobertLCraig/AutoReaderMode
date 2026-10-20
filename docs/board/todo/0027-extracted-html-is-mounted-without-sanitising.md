# Extracted article HTML is mounted into the page without sanitising

## Why
**The overlay puts the extracted article into the live page with `innerHTML` and nothing removes
event-handler attributes or active elements.** `mountOverlay` in `src/content/reader.js` carries the
comment "Readability returns sanitized HTML", and PRD section 5 says the same. It is not true: the
vendored Readability strips `script` and `noscript` and rewrites `javascript:` links, and that is
all. `on*` attributes, `iframe`, `object`, `embed`, `form` and `svg` survive. The fallback path is
looser still: `fallbackExtract` appends a clone of a page element or of the whole `<body>`, and
`cleanClone` removes by class name only.

**What it costs.** Markup that was inert where it sat (in a `<template>`, a hidden comment preview,
an element the page never attached handlers to) becomes live once re-parsed into the overlay, and
an `<img onerror>` runs in the page's own world. The content comes from the same page, so this is
not a cross-site hole, but it is markup the user never chose to run, and it is the class of bug
Mozilla's own Readability README warns about. The fallback also keeps every `id`, which collides
with the hidden page's ids.

**How it came to be this way.** The PRD stated that Readability sanitises, the comment repeated it,
and nobody checked the vendored source.

## Links

**Relates to**
- `0035` - duplicate ids and hash links in the overlay, which the same cleaning pass can fix.

## Not this card
- Styling of the mounted content (`0035`).

## Acceptance
<!-- AC:BEGIN -->
- [ ] WHEN the article contains `<img src=x onerror=...>`, THE APP SHALL mount it without the handler running. proves: `sanitise: onerror in the article does not run`
- [ ] WHEN the fallback extraction is used, THE APP SHALL mount no `iframe`, `object`, `embed`, `form` or `on*` attribute. proves: `sanitise: fallback strips active content`
<!-- AC:END -->

## Tasks
- [ ] Pass both the Readability `content` and the fallback clone through one allow-list sanitiser before mounting: vendor DOMPurify into `src/content/` beside `readability.js`, or write a short allow-list walk if a dependency is unwanted.
- [ ] Correct the comment in `mountOverlay` and the sentence in `PRD.md` section 5 that says Readability sanitises.

## Plan
`C:\Dev\AutoReaderMode\src\content\reader.js`, functions `mountOverlay`, `fallbackExtract` and
`cleanClone`. If DOMPurify is vendored, add it to the `files` list in `injectReader` in
`src/background.js` and note its licence in `HANDOVER.md` beside Readability's. A served article with
an `<img onerror="window.__armPwned=1">` checked from the page is the test; add it as
`record('sanitise', ...)` lines in `tests/acceptance.mjs`.

## Comments

**2026-10-20** Raised by the shortcomings sweep. Re-read at `mountOverlay` and against the vendored
`readability.js`; not run.
