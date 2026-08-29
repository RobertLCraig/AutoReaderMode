# PRD: Auto Reader Mode v2

**Status:** Draft
**Author:** Robert Craig
**Date:** 2026-04-30
**Supersedes:** v1.2 (current code in `src/`)

---

## 1. Background

The current extension (v1.2) auto-triggers reader mode on a user-curated list of hostnames. It uses two strategies:

1. On Edge it navigates to `read://https_<host>/?url=<encoded>` and lets Edge Immersive Reader take over.
2. On Chrome / Chromium it injects [src/reader.js](src/reader.js#L1-L60), which extracts the article via CSS selector heuristics and renders an inline overlay.

It works, but has two significant gaps:

- **No automatic detection.** v1.2 only fires on hostnames the user already added by hand. The product goal is for the extension to also auto-trigger on sites that exhibit paywall or excessive-ad signals, even without the user pre-listing them.
- **Extraction is brittle on Chrome.** The selector heuristic in [src/reader.js](src/reader.js#L29-L60) misses SPAs (content rendered after `webNavigation.onCompleted`) and many real-world layouts. Edge sidesteps this entirely because Immersive Reader does its own extraction.

The `read://` redirect on Edge stays. It is one line of code, ships zero of our extraction logic, and uses Microsoft's own reader UI (which most users already know). The only risk is if Microsoft removes the scheme in a future Edge release; we mitigate that by adding the overlay as a fallback path, not by replacing `read://` outright.

## 2. Goals

1. **Keep the Edge `read://` redirect as the primary Edge path.** Add the overlay as a per-tab fallback only when Immersive Reader fails to load.
2. **Three trigger sources** for auto reader mode:
   - User-preset hostnames (existing behaviour).
   - Curated lists shipped with the extension (known paywall sites, known ad-heavy sites). User can disable each list.
   - In-page heuristic detection (paywall markers, ad density) that the user can opt into per site or globally.
3. **Reliable extraction** using Mozilla Readability rather than the bespoke selector loop.
4. **SPA support** so the trigger does not fire too early on JS-rendered articles.
5. **Honest UX.** Every trigger event surfaces in the popup with a reason (preset / curated / heuristic) and the user can override or undo it.

## 3. Non-goals

- **Paywall bypass.** The extension only re-renders article-shaped content that the page itself has already delivered to the DOM. It does not request hidden content, spoof referrers, strip cookies, or use Google-cache style tricks. If a publisher genuinely withholds the body, the overlay will be empty and the user will see the original page.
- **Login-walled content** (Substack private posts, members-only forums, etc).
- **Custom themes / typography UI.** v2 keeps the single light + dark stylesheet.
- **Mobile browsers, Firefox, Safari.** Chromium MV3 only.
- **Cloud sync of detection rules.** Storage stays in `chrome.storage.sync` for the user's own list; curated lists ship with the extension and update on release.

## 4. Users and primary use cases

The user (technical, runs Edge as a daily driver, also tests in Chrome) wants:

1. Visit a known paywall domain (e.g. ft.com, nytimes.com): article opens in reader view automatically without them having to add the domain first.
2. Visit a regional news site they have not heard of, but it is plastered in ads: the extension notices, pops the overlay, and offers a one-click "always do this here" affordance.
3. Visit a site they explicitly added: behaves exactly as today.
4. Visit a normal page (their own blog, a docs site): nothing happens.
5. Toggle automatic detection off entirely if they find it intrusive.

## 5. Functional requirements

### 5.1 Triggering

A navigation triggers reader mode if any of the following are true and the user has not opted out for that hostname:

| Source | Storage key | Default |
|---|---|---|
| User preset list | `readerSites` (sync) | `[]` |
| Curated paywall list | shipped JSON, gated by `enablePaywallList` | enabled |
| Curated ad-heavy list | shipped JSON, gated by `enableAdList` | enabled |
| Heuristic paywall detection | gated by `enablePaywallHeuristic` | enabled |
| Heuristic ad-density detection | gated by `enableAdHeuristic` | disabled (opt-in, can be noisy) |

Per-host overrides live in `siteOverrides: { [hostname]: 'always' \| 'never' }`. `'never'` beats every other source. `'always'` is equivalent to membership in `readerSites`.

### 5.2 Curated lists

Two JSON files shipped in `src/data/`:

- `src/data/paywalls.json` - hostnames where major newspapers and magazines paywall by default. Seed list: ft.com, nytimes.com, wsj.com, economist.com, telegraph.co.uk, thetimes.co.uk, washingtonpost.com, bloomberg.com, newyorker.com, theatlantic.com, wired.com, hbr.org. Update via release.
- `src/data/ad-heavy.json` - sites that load excessive ad networks. Smaller seed list, kept conservative to avoid false positives.

Each entry: `{ "host": "ft.com", "match": "suffix" }` so `news.ft.com` matches via `suffix`, while `match: "exact"` only fires on the literal hostname.

### 5.3 Heuristic detection

Runs inside the content script (`detect.js`) after Readability has parsed the page. Cheap, runs once, results cached on `chrome.storage.session` keyed by hostname for the browser session.

**Paywall signals (any one fires the trigger, if enabled):**

- `<meta property="article:content_tier" content="locked">` or similar tier markers
- Schema.org `JsonLd { "isAccessibleForFree": false }` on the main article node
- Presence of one of: `.paywall`, `.tp-modal`, `.tp-backdrop`, `.piano-id`, `.meter-modal`, `[data-paywall]`, `[data-testid*="paywall"]`
- Body contains common paywall copy patterns: "subscribe to continue", "create a free account to read", "you have read X of Y free articles" (case-insensitive, anchored to a fixed-position overlay)

**Excessive-ad signals:**

- Count of `iframe[src*="doubleclick"]`, `iframe[src*="googlesyndication"]`, `ins.adsbygoogle`, `[id^="google_ads_"]` exceeds 4
- Or: ratio of `<iframe>` nodes that match an ad-network host to total content paragraphs exceeds 0.3
- Or: total height of fixed/sticky elements exceeds 30% of viewport

Each signal records its name on the trigger event so the popup can show "Triggered by: paywall meta tag" or "Triggered by: 7 ad iframes detected".

### 5.4 Rendering

Two paths, branched on `isEdgeBrowser()` exactly as v1.2 does:

**Edge path (primary):**
1. `convertUrl(originalUrl)` builds `read://https_<host>/?url=<encoded>` ([src/utils.js:26-38](src/utils.js#L26-L38)).
2. `chrome.tabs.update(tabId, { url: readerUrl })` redirects the tab. Immersive Reader takes over.
3. **Fallback:** register a one-shot `webNavigation.onErrorOccurred` listener for that tab. If the `read://` navigation errors or times out (1.5 s without `onCompleted`), revert to the original URL and inject the overlay path instead. Log the fallback so the user sees why.

**Chrome / Chromium path:**
1. Inject `readability.js` (vendored, MIT licensed, ~50 KB) before `reader.js`.
2. `new Readability(document.cloneNode(true)).parse()` returns `{ title, byline, content, textContent, length, excerpt, siteName }`.
3. Render `content` (already sanitised by Readability) inside the overlay body.
4. Fall back to the v1 selector heuristic if Readability returns `null` (very short pages, non-articles).

The Mozilla Readability upgrade only affects the Chrome / overlay path. Edge keeps using whatever Microsoft ships in Immersive Reader.

### 5.5 SPA handling

When the auto-trigger fires on `webNavigation.onCompleted`, `reader.js` does:

1. Run Readability immediately.
2. If `length < 500` characters, register a `MutationObserver` on `document.body` and re-run Readability when the subtree settles (debounced 400 ms, max wait 5 s).
3. Only mount the overlay once a parse with `length >= 500` succeeds, or after the timeout. On timeout with no parse, surface a toast (existing toast mechanism in popup.js) explaining nothing was extracted.

This addresses the SPA gap called out in [HANDOVER.md](HANDOVER.md#L62-L66).

### 5.6 Popup changes

The popup keeps its current structure but adds:

- **Detection panel** under the existing toggle: four checkboxes for the four detection sources (curated paywall, curated ads, heuristic paywall, heuristic ads). Persists to `chrome.storage.sync`.
- **Trigger reason** badge on the current site: "Auto-triggered by: paywall list" or "Manually enabled" or "Not auto-triggered". Read from a per-tab `chrome.storage.session` key written by the background script.
- **Override row** when the current host was auto-triggered by a curated or heuristic source: "Always reader mode here" / "Never reader mode here" buttons that write to `siteOverrides`.

### 5.7 Telemetry and feedback (per `nothing fails silently` rule)

- Service worker logs every trigger decision: `[ARM] auto-trigger ft.com via curated:paywall` or `[ARM] skipped example.com - no signals`.
- Readability failures log `[ARM] Readability returned null on <host>` with the page length and node count.
- Heuristic detection logs the matched signal name on hit, and a one-line summary on miss when a curated or preset source fired (so the user can see why heuristics did not also fire).
- Popup displays a status row even when nothing happened, so the user is never left guessing.
- Errors from `chrome.scripting.executeScript` are surfaced via `chrome.action.setBadgeText('!')` and a popup toast explaining what failed.

## 6. Architecture

```
src/
├── manifest.json
├── background.js          service worker, navigation handler, trigger router
├── popup.html / popup.js  unchanged structure, new detection panel + reason badge
├── content/
│   ├── readability.js     vendored Mozilla Readability
│   ├── detect.js          paywall + ad-density heuristics
│   └── reader.js          overlay renderer (uses Readability output)
├── data/
│   ├── paywalls.json
│   └── ad-heavy.json
└── lib/
    ├── matcher.js         host matching (suffix / exact / regex)
    ├── settings.js        cached settings + onChanged listener
    └── triggers.js        decision logic: which source, if any, fires
```

`background.js` becomes a thin router:

```
onCompleted (top-level, http/https)
  -> triggers.decide(host)         // returns { fire: bool, reason: string }
  -> if fire: scripting.executeScript [readability.js, detect.js, reader.js]
  -> reader.js: parse, observe-if-SPA, mount overlay
  -> detect.js: report signals back via chrome.runtime.sendMessage for the popup
```

The classic `importScripts('utils.js')` setup in [src/background.js](src/background.js#L11) is replaced by a small `lib/` modular layout. Service worker stays non-module to avoid the cascade described in [AGENT.md](AGENT.md#L21-L22); we simply `importScripts('lib/matcher.js', 'lib/settings.js', 'lib/triggers.js')`.

## 7. Manifest changes

```json
{
  "manifest_version": 3,
  "name": "Auto Reader Mode",
  "version": "2.0",
  "permissions": ["storage", "tabs", "scripting", "webNavigation", "activeTab"],
  "host_permissions": ["https://*/*", "http://*/*"],
  "background": { "service_worker": "background.js" },
  "action": { "default_popup": "popup.html", "default_icon": { ... } },
  "web_accessible_resources": [{
    "resources": ["data/paywalls.json", "data/ad-heavy.json"],
    "matches": ["<all_urls>"]
  }]
}
```

No new permissions. Curated lists are bundled, not fetched.

## 8. Edge-specific notes

- `read://https_<host>/?url=<encoded>` remains the default behaviour. This is what v1.2 does today and the user has confirmed it still works in their Edge install.
- `isEdgeBrowser()` in [src/utils.js](src/utils.js#L10-L20) and `convertUrl()` are kept as-is.
- The fallback (revert tab and inject overlay) only fires if `webNavigation.onErrorOccurred` reports a failure on the `read://` navigation, or if `onCompleted` does not fire within 1.5 s. This is defensive insurance against Microsoft changing the scheme later, not a current need.
- Add an Edge-specific manual test pass to the testing checklist, now [card 0005](docs/board/todo/0005-the-twelve-manual-checks-nobody-has-run.md): load unpacked in Edge, hit a curated paywall site, confirm Immersive Reader opens (URL bar shows `read://`), and confirm the overlay fallback does *not* fire.

## 9. Risks and open questions

| Risk | Mitigation |
|---|---|
| Heuristic false positives wreck the user's normal browsing | Heuristic ad detection ships disabled. Heuristic paywall is on but easy to disable. Always show "Triggered by: ..." reason so the user can blacklist a host in one click. |
| Curated lists go stale | Lists are small JSON files, refreshed on each release. Open question: do we ever fetch them remotely (would need a new permission and a privacy notice), or stick to release-bound updates? Recommend release-bound for v2. |
| Readability bundle size (~50 KB) bloats the extension | Acceptable. The CRX in [bin/](bin/) is already 4.5 MB due to icons. The benefit (correct extraction on far more sites) far outweighs the cost. |
| Paywall scrapers attract publisher complaints / store removal | Position the extension as "improved reading view", not "paywall bypass". Document the non-bypass stance in README and store listing. The overlay reads only what the page has already rendered. |
| MutationObserver on SPAs holds the worker / leaks | Hard 5 s timeout, single observer instance, disconnect after first successful parse. |

## 10. Migration

v2 is a clean break in code, but storage keys are mostly preserved:

- `readerSites` (existing) - kept, same shape.
- `enablePaywallList`, `enableAdList`, `enablePaywallHeuristic`, `enableAdHeuristic` - new booleans, defaults set in `chrome.runtime.onInstalled`.
- `siteOverrides` - new map.

On first run after upgrade, show a one-time popup notice: "Auto Reader Mode now detects paywalls and ad-heavy pages automatically. You can disable this in the popup." No data migration needed.

## 11. Acceptance criteria

The rewrite ships when all of the following are true:

1. Loading unpacked in Edge stable, navigating to a curated paywall host, and getting Edge Immersive Reader (URL becomes `read://https_<host>/?url=...`). The overlay fallback does not fire.
2. Same trigger flow in Chrome stable, but rendered as the inline Readability-powered overlay.
3. Adding a host to `readerSites` via the popup still auto-triggers on next visit.
4. Visiting a non-curated site with a `<meta property="article:content_tier" content="locked">` triggers reader mode and the popup shows reason "Heuristic: paywall meta tag".
5. Disabling all four detection sources in the popup leaves only the user preset list active. Visiting any non-listed host does nothing.
6. Visiting a JS-rendered article (e.g. a Vue / React news site) results in extracted content, not an empty overlay.
7. The unhandled-error banner / badge fires when `executeScript` is denied (e.g. on `chrome://`), and the popup explains why.
8. The twelve-item manual testing checklist passes, plus the new Edge-specific cases. The checklist is [card 0005](docs/board/todo/0005-the-twelve-manual-checks-nobody-has-run.md).

## 12. Out-of-scope follow-ups

Track for v2.1+:

- Optional per-site typography overrides (font, size, line height).
- Saving extracted articles offline.
- Keyboard shortcut to re-extract after dismissing.
- Telemetry opt-in (anonymous: which curated entries fire, which heuristics fire) to refine the curated lists. Would require explicit consent UI.
