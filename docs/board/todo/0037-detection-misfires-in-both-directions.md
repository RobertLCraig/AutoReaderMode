# Paywall and ad detection misfire in both directions

## Why
**The in-page heuristics in `src/content/detect.js` fire on ordinary pages and miss real paywalls.**
Read off the code:

False positives:
- One Google ad slot is counted about three times: the `div-gpt-ad*` container, and its
  `google_ads_iframe_*` frame matching both `iframe[id*="google_ads_"]` and `[id^="google_ads_"]`.
  Two ordinary ad slots reach the threshold of 4.
- The phrase "you have read" matches cookie and consent banners ("...you have read our privacy
  policy"), which are fixed, high in z-index and short, so they fire the paywall signal.
- `[class*="paywall" i]` matches `no-paywall` and `paywall-free`, and metered wrappers that are fully
  readable; any visible box over 50 by 50 pixels fires.
- The iframe ratio counts every iframe, so articles with YouTube or social embeds read as ad-heavy.
- Sticky coverage adds up nested fixed elements and counts sticky site headers and cookie bars.

False negatives:
- The JSON-LD check looks only at top-level objects and arrays, so it misses `@graph` wrappers (the
  Yoast default) and `hasPart`, and it requires the boolean `false`, missing the string `"False"`
  used in Google's own paywall markup examples.
- Detection runs once, on navigation complete. Paywall overlays that load seconds later, as Piano's
  do, are missed, and nothing re-checks.
- Sticky coverage scans only the first 2,000 elements.

**What it costs.** The paywall heuristic ships enabled, so its false positives open reader mode on
pages the user did not want it on, which HANDOVER calls "the failure mode that hurts ordinary
browsing". Its misses leave the paywall sites it exists for untouched.

**How it came to be this way.** The heuristics were written from a list of markers and never run
against real pages; the acceptance pass uses one synthetic page per signal.

## Links

**Relates to**
- `0026` - when detection runs relative to injection.
- `0001` - the acceptance pass, whose criterion 4 covers only the meta-tag signal.

## Not this card
- Whether `content_tier=metered` should fire. That is a product call; leave the current behaviour and
  note it in `PRD.md` section 9 as an open question.

## Acceptance
<!-- AC:BEGIN -->
- [ ] WHEN a page carries two standard GPT ad slots, THE APP SHALL not fire the ad-density signal. proves: `detect: two GPT slots do not fire`
- [ ] WHEN a page shows a cookie banner containing "you have read our privacy policy", THE APP SHALL not fire the paywall signal. proves: `detect: consent banner does not fire`
- [ ] WHEN JSON-LD under `@graph` carries `isAccessibleForFree: "False"`, THE APP SHALL fire the paywall signal. proves: `detect: @graph and string False fire`
- [ ] WHEN a paywall overlay appears 2 seconds after load, THE APP SHALL fire. proves: `detect: late paywall overlay fires`
<!-- AC:END -->

## Tasks
- [ ] Count unique ad slots, deduplicated by nearest slot container.
- [ ] Drop "you have read" or make it specific ("you have read N free articles").
- [ ] Exclude negated paywall class names and require overlay-like positioning.
- [ ] Count only iframes from ad domains; count only the outermost fixed or sticky element and skip `header` and `nav`.
- [ ] Walk `@graph` and `hasPart`, and accept the boolean and the string form.
- [ ] Re-run detection once after a short delay, or on a mutation, before deciding not to mount.

## Plan
`C:\Dev\AutoReaderMode\src\content\detect.js`. Each criterion is a small served page in
`tests/acceptance.mjs`; add them as `record('detect', ...)` lines. The late-overlay case needs
`0026`'s detect-first injection or a re-check inside `detect.js` itself.

## Comments

**2026-10-20** Raised by the shortcomings sweep. Read off the code; nothing here was run.
