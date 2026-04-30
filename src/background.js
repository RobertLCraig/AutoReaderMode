/**
 * background.js - Service worker for Auto Reader Mode v2.
 *
 * Trigger flow:
 *   webNavigation.onCompleted (top-level)
 *     -> triggers.decideTrigger(host)
 *        -> { fire: true, reason }                : auto-trigger immediately
 *        -> { fire: false, allowHeuristic: true } : inject content scripts and let
 *                                                   detect.js + reader.js gate the mount
 *        -> { fire: false, allowHeuristic: false}: do nothing
 *
 * Edge path: redirect tab to read:// Immersive Reader URL (v1.x behaviour).
 *            If Edge actually errors on the read:// URL we fall back to the overlay.
 *            We do NOT use a timeout - read:// staying loaded is the success state.
 *
 * Chrome path: inject readability.js + (optionally) detect.js + reader.js.
 *
 * Per-tab trigger reason is written to chrome.storage.session under the key
 * `trigger:<tabId>` so the popup can show why we fired.
 */

importScripts('lib/matcher.js', 'lib/settings.js', 'lib/triggers.js');

// ── Boot ──────────────────────────────────────────────────────────────────────

(async function boot() {
    await loadSettings();
    bindSettingsListener();
    await Promise.all([getCuratedPaywalls(), getCuratedAdHeavy()]);
    console.log('[ARM] service worker ready');
})();

chrome.runtime.onInstalled.addListener(async () => { await loadSettings(); });
chrome.runtime.onStartup.addListener(async   () => { await loadSettings(); });

// ── Per-tab state ─────────────────────────────────────────────────────────────

// Tabs we have redirected to read:// and are awaiting confirmation on.
// Cleared when read:// onCompleted fires (success) or onErrorOccurred fires (fallback).
const pendingEdgeReader = new Map(); // tabId -> { originalUrl, reason }

// Tabs we just reverted via the fallback path. Suppress one trigger so the
// auto-trigger logic doesn't immediately redirect us back to read:// again.
const skipNextTrigger = new Map(); // tabId -> deadline (ms epoch)
const SKIP_WINDOW_MS = 5000;

// Tabs we redirected to read:// recently. If the user exits Immersive Reader
// (Edge's own exit button), the tab navigates back to the original URL and
// onCompleted fires for it - without this guard we'd immediately bounce them
// back into reader mode. We suppress that one re-trigger.
const recentEdgeRedirectOrigin = new Map(); // tabId -> { url, until }
const ECHO_WINDOW_MS = 60_000;

chrome.tabs.onRemoved.addListener(tabId => {
    chrome.storage.session.remove(`trigger:${tabId}`);
    pendingEdgeReader.delete(tabId);
    skipNextTrigger.delete(tabId);
    recentEdgeRedirectOrigin.delete(tabId);
});

// ── Trigger reason persistence ────────────────────────────────────────────────

function setTriggerReason(tabId, payload) {
    const key = `trigger:${tabId}`;
    chrome.storage.session.set({ [key]: payload }, () => {
        if (chrome.runtime.lastError) {
            console.error('[ARM] failed to persist trigger reason:', chrome.runtime.lastError.message);
        }
    });
}

// ── Injection (Chrome / fallback path) ────────────────────────────────────────

async function injectReader(tabId, url, reason, requireHeuristic) {
    const heuristicConfig = {
        paywall: getSetting('enablePaywallHeuristic'),
        ads: getSetting('enableAdHeuristic'),
    };

    try {
        // Stamp the page (ISOLATED world, same as the content scripts) so
        // detect.js and reader.js can read the trigger context.
        await chrome.scripting.executeScript({
            target: { tabId },
            func: (reason, heuristicConfig, requireHeuristic) => {
                window.__ARM_TRIGGER_REASON = reason;
                window.__ARM_DETECT_CONFIG = heuristicConfig;
                window.__ARM_REQUIRE_HEURISTIC = requireHeuristic;
            },
            args: [reason, heuristicConfig, requireHeuristic],
        });

        const files = ['content/readability.js'];
        if (requireHeuristic) files.push('content/detect.js');
        files.push('content/reader.js');

        await chrome.scripting.executeScript({ target: { tabId }, files });

        setTriggerReason(tabId, {
            url, reason, requireHeuristic, timestamp: Date.now(),
        });
    } catch (err) {
        console.error(`[ARM] script injection failed (${url}):`, err.message);
        chrome.action.setBadgeText({ tabId, text: '!' });
        chrome.action.setBadgeBackgroundColor({ tabId, color: '#dc2626' });
    }
}

// ── Edge: redirect to Immersive Reader, with error-triggered fallback ────────

async function redirectToImmersiveReader(tabId, originalUrl, reason) {
    let urlObject;
    try { urlObject = new URL(originalUrl); } catch (_) { return false; }
    if (originalUrl.startsWith('read://')) return false;

    const readerUrl = `read://https_${urlObject.hostname}/?url=${encodeURIComponent(originalUrl)}`;

    // Record reason now so the popup shows the right thing immediately,
    // regardless of whether onCompleted ever fires for the read:// URL.
    setTriggerReason(tabId, {
        url: originalUrl,
        reason: 'edge:immersive-reader',
        requireHeuristic: false,
        sourceReason: reason,
        timestamp: Date.now(),
    });

    pendingEdgeReader.set(tabId, { originalUrl, reason });
    recentEdgeRedirectOrigin.set(tabId, {
        url: originalUrl,
        until: Date.now() + ECHO_WINDOW_MS,
    });

    try {
        await chrome.tabs.update(tabId, { url: readerUrl });
        return true;
    } catch (err) {
        console.error('[ARM] tab update failed:', err.message);
        pendingEdgeReader.delete(tabId);
        recentEdgeRedirectOrigin.delete(tabId);
        return false;
    }
}

async function revertToOriginal(tabId, originalUrl, reason) {
    skipNextTrigger.set(tabId, Date.now() + SKIP_WINDOW_MS);

    try {
        await chrome.tabs.update(tabId, { url: originalUrl });
    } catch (err) {
        console.error(`[ARM] revert failed for tab ${tabId}:`, err.message);
        skipNextTrigger.delete(tabId);
        return;
    }

    // Wait for the revert to land, then inject the overlay path once.
    function onRevertComplete(details) {
        if (details.tabId !== tabId || details.frameId !== 0) return;
        if (!details.url || !details.url.startsWith('http')) return;
        chrome.webNavigation.onCompleted.removeListener(onRevertComplete);
        injectReader(tabId, details.url, reason || 'edge-fallback', false);
    }
    chrome.webNavigation.onCompleted.addListener(onRevertComplete);
}

chrome.webNavigation.onErrorOccurred.addListener(details => {
    if (details.frameId !== 0) return;
    const pending = pendingEdgeReader.get(details.tabId);
    if (!pending) return;
    if (!details.url || !details.url.startsWith('read://')) return;
    console.warn(`[ARM] Edge read:// error: ${details.error}`);
    pendingEdgeReader.delete(details.tabId);
    revertToOriginal(details.tabId, pending.originalUrl, `edge-fallback:${details.error}`);
});

// ── Navigation handler ────────────────────────────────────────────────────────

async function handleNavigation(details) {
    if (details.frameId !== 0) return;
    if (!details.url) return;

    const tabId = details.tabId;

    // 1. read:// success: our redirect just landed. Clear pending state and stop.
    if (pendingEdgeReader.has(tabId) && details.url.startsWith('read://')) {
        pendingEdgeReader.delete(tabId);
        return;
    }

    // 2. Only act on http(s) from here on.
    if (!details.url.startsWith('http')) return;

    // 3. Suppress one trigger after a fallback revert.
    const skipUntil = skipNextTrigger.get(tabId);
    if (skipUntil && Date.now() < skipUntil) {
        skipNextTrigger.delete(tabId);
        console.log(`[ARM] ${details.url}: skipping (recent fallback revert)`);
        return;
    }
    if (skipUntil) skipNextTrigger.delete(tabId);

    // 4. Suppress one trigger if this is the user exiting Edge's Immersive
    //    Reader and landing back on the original URL we redirected from.
    const echo = recentEdgeRedirectOrigin.get(tabId);
    if (echo) {
        if (Date.now() >= echo.until) {
            recentEdgeRedirectOrigin.delete(tabId);
        } else if (echo.url === details.url) {
            recentEdgeRedirectOrigin.delete(tabId);
            console.log(`[ARM] ${details.url}: detected exit from Immersive Reader, suppressing re-trigger`);
            return;
        }
    }

    let hostname;
    try { hostname = new URL(details.url).hostname; } catch (_) { return; }

    const decision = await decideTrigger(hostname);
    console.log(`[ARM] ${hostname} -> ${decision.fire ? 'fire' : 'skip'} (${decision.reason})`);

    if (!decision.fire && !decision.allowHeuristic) {
        chrome.action.setBadgeText({ tabId, text: '' });
        return;
    }

    if (decision.fire && isEdgeBrowser()) {
        const ok = await redirectToImmersiveReader(tabId, details.url, decision.reason);
        if (ok) return;
        injectReader(tabId, details.url, decision.reason, false);
        return;
    }

    const requireHeuristic = !decision.fire && decision.allowHeuristic;
    injectReader(tabId, details.url, decision.reason || 'heuristic', requireHeuristic);
}

chrome.webNavigation.onCompleted.addListener(handleNavigation);

// ── Browser detection ─────────────────────────────────────────────────────────

function isEdgeBrowser() {
    try {
        const ua = (typeof navigator !== 'undefined' && navigator.userAgent) ||
                   (typeof self !== 'undefined' && self.navigator && self.navigator.userAgent) ||
                   '';
        return /Edg\/\d+/.test(ua);
    } catch (_) {
        return false;
    }
}

// ── Popup messaging ───────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (!msg || typeof msg !== 'object') return;

    if (msg.type === 'manual-toggle') {
        (async () => {
            const tab = msg.tab;
            if (!tab) return sendResponse({ ok: false, error: 'no-tab' });

            try {
                if (isEdgeBrowser()) {
                    if (tab.url.startsWith('read://')) {
                        // Exit Immersive Reader -> back to original URL.
                        const inner = new URL(tab.url).searchParams.get('url');
                        if (!inner) return sendResponse({ ok: false, error: 'no-inner-url' });
                        skipNextTrigger.set(tab.id, Date.now() + SKIP_WINDOW_MS);
                        await chrome.tabs.update(tab.id, { url: decodeURIComponent(inner) });
                        chrome.storage.session.remove(`trigger:${tab.id}`);
                        sendResponse({ ok: true });
                        return;
                    }
                    const ok = await redirectToImmersiveReader(tab.id, tab.url, 'manual');
                    sendResponse({ ok });
                    return;
                }

                // Chrome / Chromium: toggle overlay via reader.js (the script
                // self-toggles when injected on top of an active overlay).
                await injectReader(tab.id, tab.url, 'manual', false);
                sendResponse({ ok: true });
            } catch (err) {
                sendResponse({ ok: false, error: err.message });
            }
        })();
        return true;
    }
});
