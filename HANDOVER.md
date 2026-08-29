# Handover Notes — Auto Reader Mode

**Category:** tool

## Project summary

A Manifest V3 browser extension. It opens reader mode by itself on pages the user is likely to want it on. Four sources can fire a trigger: the user's own list of hostnames, a bundled list of known paywall sites, a bundled list of ad-heavy sites, and in-page heuristics that look for paywall markers or ad density. Per-site Always / Never overrides beat all four.

- **Edge** — navigates the tab to `read://https_<domain>/?url=<encoded-url>` (Edge Immersive Reader). If that navigation errors, the tab is reverted and the overlay is injected instead.
- **Chrome / Chromium** — injects Mozilla Readability plus the extension's own content scripts, which render a full-screen reading overlay.

---

## Architecture

```
src/
├── manifest.json           MV3 config, permissions, entry points
├── background.js           service worker: navigation listener + trigger router
├── popup.html / popup.js   current-tab popup: status, reason, per-site rule
├── options.html / options.js   detection toggles, bulk site list, curated-list drawers
├── content/
│   ├── readability.js      vendored Mozilla Readability (Apache-2.0)
│   ├── detect.js           in-page paywall + ad-density heuristics
│   └── reader.js           overlay renderer, SPA MutationObserver, v1 selector fallback
├── data/
│   ├── paywalls.json       curated paywall hosts (28 entries, version 1)
│   └── ad-heavy.json       curated ad-heavy hosts (14 entries, version 1)
└── lib/                    loaded into the service worker by importScripts()
    ├── matcher.js          hostname matching: exact or suffix
    ├── settings.js         in-memory settings cache + curated list loader
    └── triggers.js         decides which source, if any, fires
```

The service worker is a thin router. `background.js` calls `importScripts('lib/matcher.js', 'lib/settings.js', 'lib/triggers.js')` and stays non-module.

```
webNavigation.onCompleted (top-level frame, http/https)
  └── triggers.decideTrigger(host)
        ├── { fire: true, reason }                   → trigger now
        │     ├── Edge:   tabs.update → read:// URL, error-only fallback to overlay
        │     └── Chrome: executeScript [readability.js, reader.js]
        ├── { fire: false, allowHeuristic: true }    → executeScript
        │     [readability.js, detect.js, reader.js]; detect.js decides whether
        │     reader.js mounts
        └── { fire: false, allowHeuristic: false }   → nothing
```

Order of precedence in `triggers.js`: `siteOverrides === 'never'`, then `siteOverrides === 'always'`, then the user preset list, then the curated paywall list, then the curated ad-heavy list, then the heuristics.

Before injecting, `background.js` stamps three globals on the page — `__ARM_TRIGGER_REASON`, `__ARM_DETECT_CONFIG` and `__ARM_REQUIRE_HEURISTIC` — which is how the content scripts learn why they were injected. The reason is also written to `chrome.storage.session` under `trigger:<tabId>`, which is where the popup reads it from.

---

## Key files

| File | Purpose |
|---|---|
| `src/manifest.json` | Permissions, entry points, MV3 config |
| `src/background.js` | Service worker: navigation listener, trigger routing, Edge redirect and fallback, injection |
| `src/lib/matcher.js` | Hostname matching against a list entry (`exact` or `suffix`) |
| `src/lib/settings.js` | Settings defaults, in-memory cache, `storage.onChanged` listener, curated list loading |
| `src/lib/triggers.js` | `decideTrigger(host)` — the precedence order above |
| `src/content/readability.js` | Vendored Mozilla Readability, Apache-2.0 (the handover previously called it MIT) |
| `src/content/detect.js` | Paywall and ad-density heuristics; writes `__ARM_DETECT_RESULT` |
| `src/content/reader.js` | Overlay: Readability parse, SPA MutationObserver, selector fallback, Esc / Alt+R exit |
| `src/data/paywalls.json` | Curated paywall hosts |
| `src/data/ad-heavy.json` | Curated ad-heavy hosts |
| `src/popup.html` / `src/popup.js` | Popup for the current tab: status pill, trigger reason, one action, per-site rule |
| `src/options.html` / `src/options.js` | Options page: four detection toggles, bulk site list, per-entry curated-list management |

`src/utils.js` and the old top-level `src/reader.js` were removed in v2.0. `isEdgeBrowser()` now lives in `background.js`, and the `read://` URL is built inline there.

---

## Known limitations

### None of v2 has been run
The rewrite was committed on 2026-04-30 and nothing in this repository records that any of it has been exercised in a browser. Everything below is what the code is designed to do, not what has been observed. The acceptance pass is on the board.

### Content extraction (Chrome)
`reader.js` tries Mozilla Readability first and falls back to the v1 CSS selector heuristic when the parse comes back shorter than 500 characters. Extraction can still be poor on pages behind a login and on highly unconventional structures, because the overlay only ever reads what the page has already rendered.

### Edge Immersive Reader
The `read://` URL scheme is Edge-only and undocumented. It works reliably as of Edge 79+ but could change in a future Edge release. The fallback is error-triggered only: `webNavigation.onErrorOccurred` on the `read://` navigation reverts the tab and injects the overlay. There is no timeout, so an Edge release that silently rendered nothing rather than erroring would not be caught.

### Heuristic false positives
Ad-density heuristics ship disabled and paywall heuristics ship enabled. A heuristic firing on a page the user did not want it on is the failure mode that hurts ordinary browsing, and the mitigation is the reason display plus a one-click Never rule rather than anything preventing it.

### Curated lists are release-bound
`data/paywalls.json` and `data/ad-heavy.json` are bundled and never fetched, so a list goes stale until the next release. Whether they should ever be fetched remotely is an open question on the board.

### Popup closes on the reader action
`window.close()` is called after the overlay is injected so the user sees the result immediately. If injection fails, an error toast is shown instead and the popup stays open.

---

## State management

Everything the user sets lives in `chrome.storage.sync`, so it follows the profile across devices. `lib/settings.js` defines the defaults and holds an in-memory copy, refreshed by a `chrome.storage.onChanged` listener, so no navigation costs a storage read.

| Key | Shape | Holds |
|---|---|---|
| `readerSites` | array of hostnames | the user's own list, matched as suffixes |
| `siteOverrides` | map host → `always` \| `never` | per-site rule, beats every other source |
| `enablePaywallList` | boolean, default on | curated paywall list active |
| `enableAdList` | boolean, default on | curated ad-heavy list active |
| `enablePaywallHeuristic` | boolean, default on | in-page paywall detection active |
| `enableAdHeuristic` | boolean, default **off** | in-page ad-density detection active |
| `curatedDisabled` | `{ paywall: [], ads: [] }` | curated entries switched off but still listed |
| `curatedRemoved` | `{ paywall: [], ads: [] }` | curated entries switched off and hidden |

Both curated override maps are opt-out lists, so an entry shipped in a later release is active by default.

`chrome.storage.session` holds `trigger:<tabId>`, the reason the extension fired on that tab. It is cleared when the tab closes and is never synced.

---

## Permissions justification (for store submission)

| Permission | Justification |
|---|---|
| `storage` | Persist the user's site list, per-site rules and detection settings |
| `tabs` | Query active tab URL; navigate Edge to read:// |
| `scripting` | Inject Readability and the content scripts for the Chrome overlay |
| `webNavigation` | Detect navigation completion for auto-trigger, and navigation errors for the Edge fallback |
| `activeTab` | Popup-triggered injection without broad host access |
| `host_permissions https://*/*`, `http://*/*` | Background service worker requires host access to inject scripts (can't use activeTab from a service worker) |
| `web_accessible_resources` | `data/paywalls.json` and `data/ad-heavy.json` only, so the content scripts can read the curated lists |

No permission was added for v2. The curated lists are bundled, not fetched.

---

## Where the work is

All outstanding work is on the board, one task per file, and the folder a card sits in is its state. Read [docs/board/README.md](docs/board/README.md) for how the lanes work.

- [docs/board/todo/](docs/board/todo/) — ready to pick up
- [docs/board/in-progress/](docs/board/in-progress/) — being built now
- [docs/board/human-review/](docs/board/human-review/) — waiting on a person
- [docs/board/done/](docs/board/done/) — reviewed and accepted

Nothing outstanding is listed in this document. A work item written in prose here would be a second copy of a card, and the copy is the one that goes stale.

[PRD.md](PRD.md) says what v2 is meant to do, and its section 11 holds the eight criteria the release is judged against.

---

## Changelog

### v2.0 (current) — 2026-04-30
- Auto-trigger now fires from four sources: the user preset list, a curated paywall list, a curated ad-heavy list, and in-page heuristics
- Added per-site Always / Default / Never overrides, which take precedence over every source
- Bundled Mozilla Readability as `content/readability.js` and rebuilt the Chrome overlay on it, with the v1 selector heuristic kept as a fallback
- Added a `MutationObserver` in `reader.js` so SPA pages are re-parsed as they settle, capped at 5 s
- Added `content/detect.js`: paywall markers (`article:content_tier`, JSON-LD `isAccessibleForFree`) and ad density
- Added `data/paywalls.json` and `data/ad-heavy.json`, bundled and release-bound
- Split the service worker into `lib/matcher.js`, `lib/settings.js` and `lib/triggers.js`, loaded by `importScripts`
- Edge keeps the `read://` redirect and gains an error-triggered fallback to the overlay
- Redesigned the popup around the current tab: status pill, trigger reason, one primary action, per-site rule
- Added an options page for the four detection toggles, bulk site management, and per-entry curated-list control with restore
- Removed `src/utils.js` and the old top-level `src/reader.js`

**Not yet verified.** See the acceptance pass on the board.

### v1.2
- Added Chrome/Chromium support via `reader.js` inline overlay
- Fixed critical bug: `background.js` was incorrectly loaded in `popup.html`
- Removed `utils.js` from `web_accessible_resources` (unnecessary exposure)
- Added `host_permissions` required for background script injection
- Replaced all `alert()` calls with inline toast notifications
- Rewrote popup UI: toggle switch, browser badge, empty state, accessibility attributes
- Added in-memory site cache in background service worker (avoids storage I/O per navigation)
- Reduced console output to errors only

### v1.1
- Initial webNavigation-based auto-trigger
- Edge Immersive Reader support

### v1.0
- Initial release (Chrome only, tab-based listener)
