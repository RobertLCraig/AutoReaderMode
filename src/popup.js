/**
 * popup.js - Current-page focused popup for Auto Reader Mode v2.
 *
 * Reads:
 *   - active tab + its hostname
 *   - chrome.storage.session['trigger:<tabId>']  trigger reason set by background.js
 *   - chrome.storage.sync['readerSites']         user preset list (count only)
 *   - chrome.storage.sync['siteOverrides']       per-site Always/Never rules
 *
 * Sends:
 *   - chrome.runtime.sendMessage({ type:'manual-toggle', tab })  for the reader button
 *   - chrome.storage.sync.set on rule changes (segmented control)
 */
'use strict';

const RESTRICTED_PREFIXES = [
    'chrome://', 'edge://', 'about:', 'chrome-extension://',
    'moz-extension://', 'data:', 'javascript:', 'view-source:',
];

const els = {
    main:         document.getElementById('main-content'),
    unavailable:  document.getElementById('unavailable'),
    domain:       document.getElementById('hero-domain'),
    pill:         document.getElementById('status-pill'),
    pillText:     document.getElementById('status-text'),
    reasonLine:   document.getElementById('reason-line'),
    readerBtn:    document.getElementById('reader-btn'),
    readerBtnTxt: document.getElementById('reader-btn-text'),
    ruleSection:  document.getElementById('rule-section'),
    ruleHelp:     document.getElementById('rule-help'),
    segBtns:      document.querySelectorAll('.seg-btn'),
    sitesCount:   document.getElementById('user-sites-count'),
    sitesWord:    document.getElementById('sites-word'),
    openOptions:  document.getElementById('open-options'),
    footerOpts:   document.getElementById('footer-options'),
    toast:        document.getElementById('toast'),
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function isRestrictedUrl(url) {
    if (!url) return true;
    return RESTRICTED_PREFIXES.some(p => url.startsWith(p));
}

function getDomainFromTab(tab) {
    try {
        if (tab.url.startsWith('read://')) {
            const inner = new URL(tab.url).searchParams.get('url');
            return inner ? new URL(decodeURIComponent(inner)).hostname : null;
        }
        return new URL(tab.url).hostname;
    } catch (_) {
        return null;
    }
}

function syncGet(keys) {
    return new Promise(r => chrome.storage.sync.get(keys, r));
}
function syncSet(obj) {
    return new Promise(r => chrome.storage.sync.set(obj, r));
}
function sessionGet(keys) {
    return new Promise(r => chrome.storage.session.get(keys, r));
}

let toastTimer = null;
function toast(msg, kind = 'default') {
    clearTimeout(toastTimer);
    els.toast.textContent = msg;
    els.toast.className = `toast ${kind}`;
    els.toast.hidden = false;
    toastTimer = setTimeout(() => { els.toast.hidden = true; }, 2200);
}

// ── Status rendering ──────────────────────────────────────────────────────────

const REASON_LABELS = {
    'preset':              'Triggered automatically (your sites list)',
    'override:always':     'Triggered automatically (always-on rule for this site)',
    'curated:paywall':     'Triggered automatically (known paywall site)',
    'curated:ads':         'Triggered automatically (known ad-heavy site)',
    'heuristic':           'Triggered by paywall / ad heuristic',
    'edge:immersive-reader': 'Edge Immersive Reader is active on this tab',
    'manual':              'You opened reader mode here manually',
};

function shortReasonForPill(reason) {
    if (!reason) return 'Not triggered';
    if (reason === 'manual') return 'Manual';
    if (reason === 'edge:immersive-reader') return 'Immersive Reader';
    if (reason === 'preset') return 'Auto: preset';
    if (reason === 'override:always') return 'Auto: always';
    if (reason === 'curated:paywall') return 'Auto: paywall';
    if (reason === 'curated:ads') return 'Auto: ad-heavy';
    if (reason === 'heuristic') return 'Auto: heuristic';
    return 'Triggered';
}

function renderStatus(triggerData, tab) {
    const isReader = !!triggerData;
    const reason = triggerData?.reason;

    if (!isReader) {
        els.pill.className = 'status-pill idle';
        els.pillText.textContent = 'Not triggered';
        els.reasonLine.className = 'reason-line empty';
        els.reasonLine.textContent = 'No reader-mode rule applies on this page.';
        els.readerBtnTxt.textContent = 'Open Reader Mode';
        els.readerBtn.classList.remove('exit');
        return;
    }

    const isManual = reason === 'manual';
    els.pill.className = `status-pill ${isManual ? 'manual' : 'fired'}`;
    els.pillText.textContent = shortReasonForPill(reason);

    els.reasonLine.className = 'reason-line';
    els.reasonLine.textContent = REASON_LABELS[reason] || 'Reader mode is active on this tab.';

    els.readerBtnTxt.textContent = 'Exit Reader Mode';
    els.readerBtn.classList.add('exit');
}

// ── Per-site rule (segmented) ────────────────────────────────────────────────

function setActiveSegment(rule) {
    els.segBtns.forEach(btn => {
        const active = btn.dataset.rule === rule;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-checked', active ? 'true' : 'false');
    });
    els.ruleHelp.textContent =
        rule === 'always' ? 'Always open this site in reader mode.' :
        rule === 'never'  ? 'Never auto-trigger reader mode on this site.' :
                            'Use the global detection rules.';
}

function deriveCurrentRule(host, readerSites, overrides) {
    if (overrides[host] === 'never')  return 'never';
    if (overrides[host] === 'always') return 'always';
    if ((readerSites || []).some(s => s === host || host.endsWith('.' + s))) return 'always';
    return 'default';
}

async function setRule(host, rule, currentReaderSites, currentOverrides) {
    const overrides = { ...(currentOverrides || {}) };
    let readerSites = [...(currentReaderSites || [])];

    if (rule === 'never') {
        overrides[host] = 'never';
        readerSites = readerSites.filter(s => s !== host);
    } else if (rule === 'always') {
        overrides[host] = 'always';
        if (!readerSites.includes(host)) readerSites.push(host);
    } else {
        delete overrides[host];
        readerSites = readerSites.filter(s => s !== host);
    }

    await syncSet({ siteOverrides: overrides, readerSites });
    return { readerSites, overrides };
}

// ── Init ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || isRestrictedUrl(tab.url)) {
        els.main.hidden = true;
        els.unavailable.hidden = false;
        return;
    }

    const host = getDomainFromTab(tab);
    if (!host) {
        els.main.hidden = true;
        els.unavailable.hidden = false;
        return;
    }

    els.domain.textContent = host;

    // Pull stored state in parallel
    const [storage, sessionData] = await Promise.all([
        syncGet(['readerSites', 'siteOverrides']),
        sessionGet(`trigger:${tab.id}`),
    ]);

    let readerSites = storage.readerSites || [];
    let overrides   = storage.siteOverrides || {};
    const triggerData = sessionData[`trigger:${tab.id}`];

    // Status pill + reason
    renderStatus(triggerData, tab);

    // Sites count for footer
    els.sitesCount.textContent = readerSites.length;
    els.sitesWord.textContent = readerSites.length === 1 ? 'site' : 'sites';

    // Per-site rule
    let currentRule = deriveCurrentRule(host, readerSites, overrides);
    setActiveSegment(currentRule);

    els.segBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const newRule = btn.dataset.rule;
            if (newRule === currentRule) return;
            try {
                const updated = await setRule(host, newRule, readerSites, overrides);
                readerSites = updated.readerSites;
                overrides   = updated.overrides;
                currentRule = newRule;
                setActiveSegment(newRule);
                els.sitesCount.textContent = readerSites.length;
                els.sitesWord.textContent = readerSites.length === 1 ? 'site' : 'sites';
                toast(
                    newRule === 'always' ? `Always reader on ${host}` :
                    newRule === 'never'  ? `Never reader on ${host}` :
                                           `Reset ${host} to default`,
                    newRule === 'never' ? 'default' : (newRule === 'always' ? 'success' : 'default'),
                );
            } catch (err) {
                toast('Failed to save rule.', 'error');
            }
        });
    });

    // Reader button
    els.readerBtn.addEventListener('click', async () => {
        els.readerBtn.disabled = true;
        try {
            const [fresh] = await chrome.tabs.query({ active: true, currentWindow: true });
            const reply = await chrome.runtime.sendMessage({ type: 'manual-toggle', tab: fresh });
            if (!reply || !reply.ok) {
                toast(reply?.error ? `Failed: ${reply.error}` : 'Could not switch reader mode.', 'error');
                els.readerBtn.disabled = false;
                return;
            }
            // Both Edge (tab navigates) and Chrome (overlay injected) benefit from
            // closing the popup so the user sees the result immediately.
            window.close();
        } catch (err) {
            toast('Could not switch reader mode.', 'error');
            els.readerBtn.disabled = false;
        }
    });

    // Settings cog -> options page
    function openOptions(e) {
        e?.preventDefault?.();
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
        } else {
            chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
        }
        window.close();
    }
    els.openOptions.addEventListener('click', openOptions);
    els.footerOpts.addEventListener('click', openOptions);
});
