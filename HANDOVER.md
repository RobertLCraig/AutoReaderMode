# Handover Notes — Auto Reader Mode

## Project summary

A Manifest V3 browser extension. When the user navigates to a site they have enabled, the extension triggers reader mode automatically:
- **Edge** — navigates the tab to `read://https_<domain>/?url=<encoded-url>` (Edge Immersive Reader).
- **Chrome / Chromium** — injects `reader.js` as a content script, which creates a full-screen reading overlay.

---

## Architecture

```
background.js (service worker)
  ├── Listens: webNavigation.onCompleted
  ├── Checks: cachedSites (in-memory) includes tab hostname
  ├── Edge path:   chrome.tabs.update → read:// URL
  └── Chrome path: chrome.scripting.executeScript → reader.js

popup.js (extension popup)
  ├── Reads active tab URL
  ├── Detects reader mode status (read:// prefix on Edge; DOM query on Chrome)
  ├── Toggle: add/remove hostname from chrome.storage.sync['readerSites']
  └── Button: calls enterReaderMode() / exitReaderMode()

utils.js (shared, loaded in both contexts)
  ├── isEdgeBrowser() — UA string check for "Edg/<version>"
  └── convertUrl()    — build Edge read:// URL from normal HTTP URL

reader.js (content script, Chrome only)
  └── IIFE — toggle overlay on page; extracts article content with CSS selector heuristics
```

---

## Key files

| File | Purpose |
|---|---|
| `src/manifest.json` | Permissions, entry points, MV3 config |
| `src/background.js` | Service worker, navigation listener, auto-trigger logic |
| `src/utils.js` | Shared browser detection and URL helpers |
| `src/reader.js` | Chrome content script — inline reading overlay |
| `src/popup.html` | Popup UI (self-contained HTML + CSS) |
| `src/popup.js` | Popup event handlers and state management |

---

## Known limitations

### Content extraction (Chrome)
`reader.js` uses a CSS selector heuristic to locate article content. It works well on standard article/blog layouts but may produce poor results on:
- SPAs that render content after `DOMContentLoaded`
- Paywalled or behind-login content
- Highly unconventional page structures

**Improvement path:** Bundle [Mozilla Readability](https://github.com/mozilla/readability) (MIT licence) as an additional content script. This is the same engine Firefox's built-in reader mode uses.

### Edge Immersive Reader
The `read://` URL scheme is Edge-only and undocumented. It works reliably as of Edge 79+ but could theoretically change in a future Edge release.

### Auto-trigger on SPAs
`webNavigation.onCompleted` fires once on initial page load. SPA sites that load content via AJAX after the event will be injected too early, before the main content is rendered.

**Improvement path:** Add a `MutationObserver` inside `reader.js` to wait for a content element to appear, with a timeout.

### Popup closes on "Open Reader Mode" (Chrome)
`window.close()` is called after injecting the overlay so the user can immediately see the result. If injection fails, an error toast is shown instead.

---

## State management

The `readerSites` array is stored in `chrome.storage.sync`, meaning it syncs across devices for the same Chrome/Edge profile. The background service worker also holds an in-memory cache (`cachedSites`) that is updated via `chrome.storage.onChanged` to avoid storage reads on every navigation.

---

## Permissions justification (for store submission)

| Permission | Justification |
|---|---|
| `storage` | Persist user's site list |
| `tabs` | Query active tab URL; navigate Edge to read:// |
| `scripting` | Inject reader.js for Chrome overlay |
| `webNavigation` | Detect navigation completion for auto-trigger |
| `activeTab` | Popup-triggered injection without broad host access |
| `host_permissions https://*/*` | Background service worker requires host access to inject scripts (can't use activeTab from a service worker) |

---

## Testing checklist

- [ ] Load unpacked in Chrome — popup opens, shows correct domain
- [ ] Load unpacked in Edge — popup opens, shows correct domain
- [ ] Add a site in Chrome — overlay appears on next visit
- [ ] Add a site in Edge — navigates to read:// on next visit
- [ ] Manual "Open Reader Mode" button works in Chrome
- [ ] Manual "Open Reader Mode" button works in Edge
- [ ] Exit via Esc key (Chrome overlay)
- [ ] Exit via Alt+R (Chrome overlay)
- [ ] Exit via "Exit Reader Mode" button in popup
- [ ] Remove site — site removed from list, toggle reflects new state
- [ ] Open popup on `chrome://newtab` — unavailable state shown
- [ ] Dark mode OS preference — Chrome overlay uses dark colours

---

## Changelog

### v1.2 (current)
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
