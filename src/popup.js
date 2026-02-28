/**
 * popup.js — UI logic for the Auto Reader Mode popup.
 *
 * Browser strategy:
 *   Edge   → reader mode is a read:// URL (native Immersive Reader).
 *   Chrome → reader mode is an injected overlay (reader.js content script).
 */

'use strict';

// ── DOM refs ──────────────────────────────────────────────────────────────────

const domainEl       = document.getElementById('current-domain');
const toggleInput    = document.getElementById('auto-toggle');
const toggleText     = document.getElementById('toggle-text');
const toggleDesc     = document.getElementById('toggle-desc');
const browserBadge   = document.getElementById('browser-badge');
const browserName    = document.getElementById('browser-name');
const readerBtn      = document.getElementById('reader-btn');
const readerBtnText  = document.getElementById('reader-btn-text');
const readerBtnHint  = document.getElementById('reader-btn-hint');
const sitesList      = document.getElementById('sites-list');
const sitesCount     = document.getElementById('sites-count');
const sitesEmpty     = document.getElementById('sites-empty');
const mainContent    = document.getElementById('main-content');
const unavailableEl  = document.getElementById('unavailable-state');
const toastEl        = document.getElementById('toast');

// ── Helpers ───────────────────────────────────────────────────────────────────

const RESTRICTED_PREFIXES = [
    'chrome://', 'edge://', 'about:', 'chrome-extension://',
    'moz-extension://', 'data:', 'javascript:',
];

function isRestrictedUrl(url) {
    if (!url) return true;
    return RESTRICTED_PREFIXES.some(p => url.startsWith(p));
}

function getDomainFromTab(tab) {
    try {
        if (tab.url.startsWith('read://')) {
            // Extract original URL embedded in the read:// query string.
            const inner = new URL(tab.url).searchParams.get('url');
            return inner ? new URL(decodeURIComponent(inner)).hostname : null;
        }
        return new URL(tab.url).hostname;
    } catch (_) {
        return null;
    }
}

// ── Reader mode state detection ───────────────────────────────────────────────

async function isInReaderMode(tab) {
    if (isEdgeBrowser()) {
        return tab.url.startsWith('read://');
    }
    // Chrome: check whether the overlay element is present in the page.
    try {
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => !!document.getElementById('auto-reader-mode-overlay'),
        });
        return results?.[0]?.result === true;
    } catch (_) {
        return false;
    }
}

// ── Reader mode toggle ────────────────────────────────────────────────────────

async function enterReaderMode(tab) {
    if (isEdgeBrowser()) {
        const readerUrl = convertUrl(tab.url);
        if (!readerUrl) throw new Error('Could not build reader URL.');
        await chrome.tabs.update(tab.id, { url: readerUrl });
    } else {
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['reader.js'],
        });
    }
}

async function exitReaderMode(tab) {
    if (isEdgeBrowser()) {
        const inner = new URL(tab.url).searchParams.get('url');
        if (!inner) throw new Error('Could not extract original URL.');
        await chrome.tabs.update(tab.id, { url: decodeURIComponent(inner) });
    } else {
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                document.getElementById('auto-reader-mode-overlay')?.remove();
            },
        });
    }
}

// ── Storage helpers ───────────────────────────────────────────────────────────

function getSites() {
    return new Promise(resolve => {
        chrome.storage.sync.get('readerSites', data => resolve(data.readerSites || []));
    });
}

function setSites(sites) {
    return new Promise(resolve => {
        chrome.storage.sync.set({ readerSites: sites }, resolve);
    });
}

// ── Toast ─────────────────────────────────────────────────────────────────────

let toastTimer = null;

function showToast(message, type = 'default') {
    clearTimeout(toastTimer);
    toastEl.textContent = message;
    toastEl.className = `toast ${type}`;
    toastEl.hidden = false;
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 2500);
}

// ── Sites list rendering ──────────────────────────────────────────────────────

async function renderSitesList(currentDomain) {
    const sites = await getSites();
    sitesList.innerHTML = '';

    sitesCount.textContent = sites.length;
    sitesEmpty.classList.toggle('hidden', sites.length > 0);

    sites.forEach(site => {
        const li  = document.createElement('li');
        li.className = 'site-item' + (site === currentDomain ? ' current-site' : '');

        const nameSpan = document.createElement('span');
        nameSpan.className = 'site-name';
        nameSpan.textContent = site;
        nameSpan.title = site;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'remove-btn';
        btn.setAttribute('aria-label', `Remove ${site}`);
        btn.title = 'Remove';
        btn.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                 xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M1 1L11 11M11 1L1 11"
                      stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>`;

        btn.addEventListener('click', async () => {
            const current = await getSites();
            await setSites(current.filter(s => s !== site));
            if (site === currentDomain) {
                toggleInput.checked = false;
                updateToggleLabel(false);
            }
            await renderSitesList(currentDomain);
            showToast(`Removed ${site}`, 'default');
        });

        li.append(nameSpan, btn);
        sitesList.appendChild(li);
    });
}

// ── Toggle label ──────────────────────────────────────────────────────────────

function updateToggleLabel(enabled) {
    toggleText.textContent = enabled ? 'On' : 'Off';
    toggleText.style.color = enabled ? '#2563eb' : '#9ca3af';
    toggleDesc.textContent = enabled
        ? 'Reader mode will open automatically on this site'
        : 'Automatically open in reader mode every time you visit this site';
}

// ── Reader button state ───────────────────────────────────────────────────────

function updateReaderButton(inReaderMode, available) {
    readerBtn.disabled = !available;
    if (inReaderMode) {
        readerBtn.classList.add('active');
        readerBtnText.textContent = 'Exit Reader Mode';
        readerBtnHint.classList.add('hidden');
    } else {
        readerBtn.classList.remove('active');
        readerBtnText.textContent = 'Open Reader Mode';
        // Hint only shown on Chrome (Edge navigates away, so ESC hint is irrelevant)
        readerBtnHint.classList.toggle('hidden', isEdgeBrowser());
    }
}

// ── Init ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
    // Show which browser / reader mode strategy is active
    const edge = isEdgeBrowser();
    browserName.textContent = edge
        ? 'Edge — using Immersive Reader'
        : 'Chrome — using inline reader view';

    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || isRestrictedUrl(tab.url)) {
        mainContent.hidden = true;
        unavailableEl.hidden = false;
        return;
    }

    const domain       = getDomainFromTab(tab);
    const sites        = await getSites();
    const autoEnabled  = domain ? sites.includes(domain) : false;
    const inReader     = await isInReaderMode(tab);

    // Populate current-site section
    domainEl.textContent = domain || tab.url;
    toggleInput.checked  = autoEnabled;
    toggleInput.disabled = !domain;
    updateToggleLabel(autoEnabled);
    updateReaderButton(inReader, !!domain);

    // Render sites list
    await renderSitesList(domain);

    // ── Event: auto-reader toggle ─────────────────────────────────────────────

    toggleInput.addEventListener('change', async () => {
        const nowEnabled = toggleInput.checked;
        updateToggleLabel(nowEnabled);

        const current = await getSites();
        const updated = nowEnabled
            ? [...new Set([...current, domain])]
            : current.filter(s => s !== domain);

        await setSites(updated);
        await renderSitesList(domain);
        showToast(
            nowEnabled ? `Auto reader enabled for ${domain}` : `Auto reader disabled for ${domain}`,
            nowEnabled ? 'success' : 'default',
        );
    });

    // ── Event: manual reader mode button ─────────────────────────────────────

    readerBtn.addEventListener('click', async () => {
        readerBtn.disabled = true;

        try {
            const [fresh] = await chrome.tabs.query({ active: true, currentWindow: true });
            const currentlyIn = await isInReaderMode(fresh);

            if (currentlyIn) {
                await exitReaderMode(fresh);
                updateReaderButton(false, true);
            } else {
                await enterReaderMode(fresh);
                // On Edge, the tab navigates away so close the popup.
                // On Chrome, the overlay is injected in place — close popup
                // so the user can immediately see it.
                window.close();
            }
        } catch (err) {
            showToast('Could not switch reader mode.', 'error');
            readerBtn.disabled = false;
        }
    });
});
