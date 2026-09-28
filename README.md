# Auto Reader Mode

A Manifest V3 browser extension that **automatically activates reader mode** on websites you choose.

- **Microsoft Edge** — uses Edge's built-in Immersive Reader (`read://` URL scheme).
- **Chrome / Chromium** — injects a clean inline reading overlay directly into the page.

---

## Features

| Feature | Description |
|---|---|
| Auto-trigger | Automatically opens reader mode whenever you navigate to a site you've enabled |
| Manual toggle | One-click button in the popup to enter or exit reader mode on any page |
| Site management | Add or remove sites from the auto-reader list at any time |
| Dark mode | Reader overlay respects your OS dark-mode preference (Chrome) |
| Keyboard shortcut | Press **Esc** or **Alt+R** to exit the reader overlay (Chrome) |
| Cross-browser | Works in Edge (Immersive Reader) and Chrome/Chromium (inline overlay) |

---

## Browser Compatibility

| Browser | Reader mode method | Min version |
|---|---|---|
| Microsoft Edge | Native `read://` Immersive Reader | Edge 79+ |
| Google Chrome | Injected inline overlay | Chrome 88+ |
| Brave, Opera, Arc, etc. | Injected inline overlay | Any MV3-capable build |

---

## Installation

See [INSTALL.md](INSTALL.md) for full step-by-step instructions.

**Quick start (unpacked):**

1. Clone or download this repository.
2. Open `chrome://extensions/` (or `edge://extensions/`).
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the `src/` folder.

---

## Usage

1. **Navigate** to any web page you want to read.
2. **Click the extension icon** in your browser toolbar to open the popup.
3. **Flip the toggle** next to the current site's domain to enable auto reader mode for that site.
   - Every future visit will open in reader mode automatically.
4. Use the **Open Reader Mode** button to immediately view the current page in reader mode without adding the site to the auto list.
5. **Remove** any site from the list by clicking the × button next to it.

### Exiting reader mode (Chrome)

- Click **Exit Reader Mode** in the popup, or
- Press **Esc** or **Alt+R** while the overlay is visible.

---

## File Structure

```
src/
├── manifest.json     Extension metadata, permissions, and entry points
├── background.js     Service worker — listens for navigation, decides whether to trigger, injects or redirects
├── popup.html        Popup UI markup and styles
├── popup.js          Popup logic — current-tab status, trigger reason, manual toggle, per-site rule
├── options.html      Options page markup
├── options.js        Options logic — detection toggles, site list, curated-list management
├── content/          Injected into the page (Chrome, and the Edge fallback)
│   ├── readability.js    Vendored Mozilla Readability (Apache-2.0)
│   ├── detect.js         Paywall and ad-density heuristics
│   └── reader.js         Renders the inline reading overlay
├── data/
│   ├── paywalls.json     Curated list of paywall sites
│   └── ad-heavy.json     Curated list of ad-heavy sites
├── lib/              Loaded into the service worker with importScripts()
│   ├── matcher.js        Hostname matching (exact or suffix)
│   ├── settings.js       Settings defaults, cache, and curated-list loading
│   └── triggers.js       decideTrigger(host) — which source, if any, fires
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## How It Works

### Edge

On every top-level `webNavigation.onCompleted` event, `background.js` asks `lib/triggers.js` whether to fire. A per-site Always / Never rule wins; then your own site list, the curated paywall list, and the curated ad-heavy list. If none of them fire and a heuristic is enabled, the page is handed to the in-page heuristics instead.

### Edge

When a trigger fires, `background.js` calls `chrome.tabs.update` to navigate the tab to Edge's native `read://https_<domain>/?url=<encoded-url>` format, and Edge's Immersive Reader takes over. If that navigation errors (`webNavigation.onErrorOccurred`), the tab is reverted to the original URL and the Chrome overlay is injected instead.

### Chrome / Chromium

`background.js` first runs a small `chrome.scripting.executeScript` function that sets the trigger context on the page (`__ARM_TRIGGER_REASON`, `__ARM_DETECT_CONFIG`, `__ARM_REQUIRE_HEURISTIC`). It then injects `content/readability.js`, then `content/detect.js` (only when the heuristics must decide), then `content/reader.js`. When the heuristics decide, `reader.js` mounts only if `detect.js` says so. `reader.js` parses the page with Mozilla Readability, falls back to the v1 CSS selector heuristic when the result is shorter than 500 characters, and re-parses for up to 5 s while a single-page app settles. It renders the result in a full-screen overlay. Pressing Esc, Alt+R, or clicking "Exit Reader Mode" removes the overlay without navigating away.

---

## Development

1. Edit files in `src/`.
2. Go to `chrome://extensions/` → find **Auto Reader Mode** → click **Reload** (or use the rotate icon).
3. Open the Service Worker DevTools from the extension card to inspect background script logs.

---

## Permissions

| Permission | Why it's needed |
|---|---|
| `storage` | Persist your site list, per-site rules and detection settings (`sync`); hold the per-tab trigger reason (`session`) |
| `tabs` | Query the active tab URL; navigate Edge tabs to `read://` and back |
| `scripting` | Inject the trigger context, `content/readability.js`, `content/detect.js` and `content/reader.js` into pages |
| `webNavigation` | Detect when a page finishes loading to auto-trigger, and when a `read://` navigation errors for the Edge fallback |
| `activeTab` | Allow popup-triggered script injection without broad host access for popup actions |
| `host_permissions: https://*/*, http://*/*` | Required so the background service worker can inject scripts on any HTTP/HTTPS page |
| `web_accessible_resources: data/paywalls.json, data/ad-heavy.json` | Exposes the two curated lists to pages; nothing else in the extension is exposed |

---

## License

MIT © 2024 RobertLCraig — see [LICENSE](LICENSE).
