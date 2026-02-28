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
├── background.js     Service worker — listens for navigation and auto-triggers reader mode
├── utils.js          Shared helpers: browser detection, URL conversion
├── reader.js         Content script — creates the inline reading overlay (Chrome)
├── popup.html        Popup UI markup and styles
├── popup.js          Popup logic — site management, manual toggle
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## How It Works

### Edge

When you visit an enabled site, `background.js` intercepts the `webNavigation.onCompleted` event and calls `chrome.tabs.update` to navigate the tab to Edge's native `read://https_<domain>/?url=<encoded-url>` format. Edge's Immersive Reader takes over from there.

### Chrome / Chromium

`background.js` calls `chrome.scripting.executeScript` to inject `reader.js` into the page. The script extracts the main article content using a set of common CSS selectors (`article`, `[role="main"]`, `.post-content`, etc.), cleans out non-content elements (ads, navigation, sidebars), and renders everything in a full-screen styled overlay. Pressing Esc, Alt+R, or clicking "Exit Reader Mode" removes the overlay without navigating away.

---

## Development

1. Edit files in `src/`.
2. Go to `chrome://extensions/` → find **Auto Reader Mode** → click **Reload** (or use the rotate icon).
3. Open the Service Worker DevTools from the extension card to inspect background script logs.

---

## Permissions

| Permission | Why it's needed |
|---|---|
| `storage` | Persist the list of auto-reader sites across sessions |
| `tabs` | Query the active tab URL; navigate Edge tabs to `read://` |
| `scripting` | Inject `reader.js` into pages (Chrome) |
| `webNavigation` | Detect when a page finishes loading to auto-trigger |
| `activeTab` | Allow popup-triggered script injection without broad host access for popup actions |
| `host_permissions: https://*/*, http://*/*` | Required so the background service worker can inject scripts on any HTTP/HTTPS page |

---

## License

MIT © 2024 RobertLCraig — see [LICENSE](LICENSE).
