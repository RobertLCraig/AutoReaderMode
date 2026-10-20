# The site list accepts entries that can never match

## Why
**A hostname typed or pasted into the options page can be saved and then never fire.** The input
normaliser in `src/options.js` (the function that turns typed text into a hostname before
`readerSites` is written) lets through:
- a port, because `:` is in the allowed characters, so `example.com:8080` is saved and can never
  equal a `URL.hostname`;
- a trailing or leading dot, double dots and labels starting with a hyphen;
- a bare public suffix such as `co.uk`, which then suffix-matches every `.co.uk` site;
- `www.`, which is kept, so pasting `https://www.example.com/...` saves `www.example.com` and does
  not cover `example.com` itself or `m.example.com`.

The input is a single-line `<input>`, so pasting several hostnames on separate lines has the browser
strip the line breaks and join them: `a.com` and `b.com` become `a.comb.com`, which passes validation.
The duplicate check looks only for the exact string, so adding `news.forbes.com` when `forbes.com`
is listed, or a host an enabled curated list already covers, says nothing. On the matching side,
`matchesUserSite` in `src/lib/matcher.js` does not strip a trailing dot from the page's hostname, so
`www.ft.com.` matches nothing.

**What it costs.** The user believes a site is set up, it never opens in reader mode, and the
options page gives no hint why. The bulk paste the options page is described as offering silently
produces junk.

**How it came to be this way.** The normaliser was written as a character filter rather than a
parse, and the input was never widened from the v1 single-site field.

## Links

**Relates to**
- `0030` - the scope rules for per-site rules, which decide what a stored entry covers.
- `0031` - the same options-page section, its rule rows.

## Not this card
- How per-site Always / Never rules match subdomains (`0030`).

## Acceptance
<!-- AC:BEGIN -->
- [ ] WHEN the user enters `https://www.Example.com:8080/a`, THE APP SHALL store `example.com`. proves: `hosts: a pasted URL is normalised`
- [ ] WHEN the user pastes three hostnames on separate lines, THE APP SHALL store three entries and report how many were added and rejected. proves: `hosts: multi-line paste adds each line`
- [ ] WHEN the user enters a bare public suffix or a malformed host, THE APP SHALL reject it with a reason. proves: `hosts: malformed and suffix-only input is rejected`
- [ ] WHEN the user adds a host an existing entry or an enabled curated list already covers, THE APP SHALL say which one covers it. proves: `hosts: covered host is reported`
<!-- AC:END -->

## Tasks
- [ ] Parse each entry with `new URL('http://' + value)`, take `hostname`, strip a trailing dot and a leading `www.`, and reject empty labels.
- [ ] Reject a small built-in list of common public suffixes (`co.uk`, `com.au` and the like); a full public-suffix list is not wanted.
- [ ] Replace the input with a `<textarea>` and split on line breaks, commas and spaces.
- [ ] Strip a trailing dot from the page hostname in `matcher.js`.

## Plan
`C:\Dev\AutoReaderMode`, files `src/options.html`, `src/options.js` and `src/lib/matcher.js`. Drive
the options page directly in `tests/acceptance.mjs` at `chrome-extension://<id>/options.html` and
read `readerSites` back from the worker. Add the checks as `record('hosts', ...)` lines.

## Comments

**2026-10-20** Raised by the shortcomings sweep. Read off the code; nothing here was run.
