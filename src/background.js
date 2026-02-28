/**
 * background.js — Service worker for Auto Reader Mode.
 *
 * Strategy:
 *   - Edge   → navigate the tab to the native read:// Immersive Reader URL.
 *   - Chrome → inject reader.js as a content script to show an inline overlay.
 *
 * The enabled-sites list is kept in a local cache and synced with
 * chrome.storage.sync so we avoid a storage round-trip on every navigation.
 */
importScripts('utils.js');

// ── Site list cache ───────────────────────────────────────────────────────────

let cachedSites = [];

function loadSites() {
    return new Promise(resolve => {
        chrome.storage.sync.get('readerSites', data => {
            cachedSites = data.readerSites || [];
            if (!data.readerSites) {
                chrome.storage.sync.set({ readerSites: [] });
            }
            resolve(cachedSites);
        });
    });
}

// Keep the in-memory cache in sync whenever storage changes
// (e.g. the user adds/removes a site in the popup).
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.readerSites) {
        cachedSites = changes.readerSites.newValue || [];
    }
});

// ── Navigation handler ────────────────────────────────────────────────────────

async function handleNavigation(details) {
    // Only act on top-level HTTP/HTTPS navigation.
    if (details.frameId !== 0) return;
    if (!details.url || !details.url.startsWith('http')) return;

    let hostname;
    try {
        hostname = new URL(details.url).hostname;
    } catch (_) {
        return;
    }

    if (!cachedSites.includes(hostname)) return;

    if (isEdgeBrowser()) {
        // Edge: navigate to the native Immersive Reader URL.
        const readerUrl = convertUrl(details.url);
        if (!readerUrl) return;
        chrome.tabs.update(details.tabId, { url: readerUrl }, () => {
            if (chrome.runtime.lastError) {
                console.error('[AutoReaderMode] tab update failed:', chrome.runtime.lastError.message);
            }
        });
    } else {
        // Chrome / other Chromium: inject the inline reader overlay.
        try {
            await chrome.scripting.executeScript({
                target: { tabId: details.tabId },
                files: ['reader.js'],
            });
        } catch (err) {
            console.error('[AutoReaderMode] script injection failed:', err.message);
        }
    }
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(() => loadSites());
chrome.runtime.onStartup.addListener(() => loadSites());

chrome.webNavigation.onCompleted.addListener(handleNavigation);
