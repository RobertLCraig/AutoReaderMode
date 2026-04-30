/**
 * settings.js - In-memory cache of user settings + curated lists.
 *
 * Loaded once at service worker startup. chrome.storage.onChanged listener
 * keeps the cache fresh without per-navigation storage round-trips.
 *
 * Curated lists are bundled JSON, fetched via chrome.runtime.getURL on first
 * use and cached for the worker's lifetime. They never change at runtime.
 */

const SETTINGS_DEFAULTS = {
    readerSites: [],
    siteOverrides: {},
    enablePaywallList: true,
    enableAdList: true,
    enablePaywallHeuristic: true,
    enableAdHeuristic: false,
    // Per-entry overrides on the curated lists. Anything in `disabled` is
    // ignored by the trigger router; anything in `removed` is also hidden
    // from the user in the options page. Both are opt-out lists, so new
    // entries shipped in a future release default to active.
    curatedDisabled: { paywall: [], ads: [] },
    curatedRemoved:  { paywall: [], ads: [] },
};

const SETTINGS_KEYS = Object.keys(SETTINGS_DEFAULTS);

const settingsCache = { ...SETTINGS_DEFAULTS };
let curatedPaywalls = null;
let curatedAdHeavy = null;

function loadSettings() {
    return new Promise(resolve => {
        chrome.storage.sync.get(SETTINGS_KEYS, data => {
            for (const key of SETTINGS_KEYS) {
                settingsCache[key] = (key in data) ? data[key] : SETTINGS_DEFAULTS[key];
            }
            // Persist defaults for any keys that were missing so the popup UI
            // reflects the actual stored state on first run.
            const missing = {};
            for (const key of SETTINGS_KEYS) {
                if (!(key in data)) missing[key] = SETTINGS_DEFAULTS[key];
            }
            if (Object.keys(missing).length > 0) {
                chrome.storage.sync.set(missing);
            }
            console.log('[ARM] settings loaded:', settingsCache);
            resolve(settingsCache);
        });
    });
}

function getSetting(key) {
    return settingsCache[key];
}

function bindSettingsListener() {
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== 'sync') return;
        for (const key of SETTINGS_KEYS) {
            if (changes[key]) {
                settingsCache[key] = changes[key].newValue ?? SETTINGS_DEFAULTS[key];
                console.log(`[ARM] setting changed: ${key}`);
            }
        }
    });
}

async function loadCuratedList(filename) {
    const url = chrome.runtime.getURL(`data/${filename}`);
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        return Array.isArray(json.entries) ? json.entries : [];
    } catch (err) {
        console.error(`[ARM] failed to load curated list ${filename}:`, err.message);
        return [];
    }
}

async function getCuratedPaywalls() {
    if (curatedPaywalls === null) {
        curatedPaywalls = await loadCuratedList('paywalls.json');
        console.log(`[ARM] loaded ${curatedPaywalls.length} paywall entries`);
    }
    return curatedPaywalls;
}

async function getCuratedAdHeavy() {
    if (curatedAdHeavy === null) {
        curatedAdHeavy = await loadCuratedList('ad-heavy.json');
        console.log(`[ARM] loaded ${curatedAdHeavy.length} ad-heavy entries`);
    }
    return curatedAdHeavy;
}
