# AGENT.md — Auto Reader Mode

Guidelines for AI agents working on this codebase.

---

## Project type

Manifest V3 browser extension (Chrome + Edge). No build step, no npm, no bundler — all files are plain JS/HTML/CSS loaded directly by the browser.

---

## Working directory

All extension source lives in `src/`. The browser loads `src/` as the unpacked extension root. Do **not** modify files outside `src/` except documentation (`README.md`, `INSTALL.md`, `HANDOVER.md`, `AGENT.md`) and `.gitignore`.

---

## Key constraints

### No build step
There is no Webpack, Vite, Rollup, or transpiler. Do not introduce `import`/`export` ES module syntax unless you also switch `background.js` to `"type": "module"` in `manifest.json` **and** update all consumers. Currently `utils.js` is loaded with `importScripts()` (background) and a `<script>` tag (popup) — both require classic (non-module) syntax.

### Manifest V3 rules
- No `eval()`, no `new Function()`, no remote code loading.
- Background code runs as a service worker (`background.js`) — no DOM access.
- Content scripts (`reader.js`) run in the page context, isolated from extension context.
- `chrome.scripting.executeScript` requires either `activeTab` (popup-triggered) or matching `host_permissions` (background-triggered).

### No inline scripts in extension pages
MV3 CSP blocks inline `<script>` in HTML. All JS must be in separate `.js` files loaded via `<script src="...">`.

### Browser detection
`isEdgeBrowser()` in `utils.js` uses the UA string (`/Edg\/\d+/`). Edge includes `Edg/<version>`; Chrome does not. This is the correct detection; do not use feature detection or the `browser` API object.

---

## Adding features

### To add a new site-management feature
Edit `popup.js`. The `getSites()` / `setSites()` helpers abstract `chrome.storage.sync`. Use `await` throughout — no callback-style code.

### To improve content extraction (Chrome)
Edit `reader.js`. The `extractArticleElement()` and `buildCleanContent()` functions contain the heuristics. Consider bundling [Mozilla Readability](https://github.com/mozilla/readability) for better extraction — add `readability.js` to `src/`, list it before `reader.js` in any scripting call, and call `new Readability(document.cloneNode(true)).parse()`.

### To change the reader overlay styling
Edit the `css` template literal inside `reader.js`. Styles are injected into the page inside the overlay element (self-contained, cleaned up when overlay is removed). Dark mode is handled via `@media (prefers-color-scheme: dark)`.

### To add a keyboard shortcut via manifest
Add a `commands` block in `manifest.json` and listen for `chrome.commands.onCommand` in `background.js`.

---

## Testing

There is no automated test suite. Manual testing procedure:

1. Open `chrome://extensions/` (or `edge://extensions/`).
2. Click **Load unpacked** → select the `src/` folder.
3. Navigate to an HTTP/HTTPS page.
4. Click the extension icon to open the popup.
5. Test the toggle, manual button, and remove functionality.
6. Check the Service Worker console via DevTools for errors.

When changing `background.js` or `manifest.json`, always click **Reload** on the extension card after saving.

---

## Files NOT to touch

| File / folder | Reason |
|---|---|
| `key/` | Private key for extension signing — gitignored, do not commit |
| `bin/AutoReaderMode.crx` | Pre-built package — regenerate with Chrome's "Pack extension" if needed |
| `LICENSE` | Legal file — do not modify |

---

## Commit style

Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`. Keep messages short and imperative. Example: `fix: remove background.js from popup script tags`.
