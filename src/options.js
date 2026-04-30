/**
 * options.js - Settings page for Auto Reader Mode v2.
 *
 * Owns the four detection toggles and the bulk site-management list.
 * The popup defers all bulk management to this page; only the per-site
 * Always/Default/Never segmented control lives in the popup.
 */
'use strict';

const TOGGLE_KEYS = [
    'enablePaywallList',
    'enableAdList',
    'enablePaywallHeuristic',
    'enableAdHeuristic',
];

const els = {
    toggles: Object.fromEntries(TOGGLE_KEYS.map(k => [k, document.getElementById(k)])),
    paywallCount: document.getElementById('paywall-count'),
    adCount:      document.getElementById('ad-count'),
    addInput:     document.getElementById('add-input'),
    addBtn:       document.getElementById('add-btn'),
    sitesList:    document.getElementById('sites-list'),
    emptyRow:     document.getElementById('empty-row'),
    toast:        document.getElementById('toast'),
    manageBtns:   document.querySelectorAll('.manage-btn'),
    drawer:       document.getElementById('drawer'),
    drawerBackdrop: document.getElementById('drawer-backdrop'),
    drawerTitle:  document.getElementById('drawer-title'),
    drawerMeta:   document.getElementById('drawer-meta'),
    drawerClose:  document.getElementById('drawer-close'),
    drawerSearch: document.getElementById('drawer-search'),
    drawerList:   document.getElementById('drawer-list'),
    drawerEmpty:  document.getElementById('drawer-empty'),
    drawerActiveCount: document.getElementById('drawer-active-count'),
    drawerTotalCount:  document.getElementById('drawer-total-count'),
    drawerShowRemoved: document.getElementById('drawer-show-removed'),
    drawerHideRemoved: document.getElementById('drawer-hide-removed'),
};

// Cache of the curated lists (read-only ship data)
const curatedCache = { paywall: [], ads: [] };

// Drawer state
const drawerState = {
    kind: null,           // 'paywall' | 'ads'
    title: '',
    showingRemoved: false,
    filter: '',
};

// ── Storage ───────────────────────────────────────────────────────────────────

function syncGet(keys) {
    return new Promise(r => chrome.storage.sync.get(keys, r));
}
function syncSet(obj) {
    return new Promise(r => chrome.storage.sync.set(obj, r));
}

// ── Toast ─────────────────────────────────────────────────────────────────────

let toastTimer = null;
function toast(msg, kind = 'default') {
    clearTimeout(toastTimer);
    els.toast.textContent = msg;
    els.toast.className = `toast ${kind}`;
    els.toast.hidden = false;
    toastTimer = setTimeout(() => { els.toast.hidden = true; }, 2200);
}

// ── Hostname normalisation ───────────────────────────────────────────────────

function normaliseHost(input) {
    if (!input) return null;
    let v = input.trim().toLowerCase();
    if (!v) return null;

    // Strip scheme and path so users can paste a URL or a bare hostname
    if (v.includes('://')) {
        try { v = new URL(v).hostname; } catch (_) { return null; }
    } else {
        v = v.split('/')[0];
    }

    // Reject obvious non-hosts
    if (!v.includes('.')) return null;
    if (/[^a-z0-9.\-:]/.test(v)) return null;
    if (v.length > 253) return null;

    return v;
}

// ── Curated lists ────────────────────────────────────────────────────────────

async function loadCuratedLists() {
    const tasks = [
        { kind: 'paywall', key: 'paywalls.json', countEl: els.paywallCount },
        { kind: 'ads',     key: 'ad-heavy.json', countEl: els.adCount      },
    ];
    for (const t of tasks) {
        try {
            const url = chrome.runtime.getURL(`data/${t.key}`);
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            const entries = Array.isArray(json.entries) ? json.entries : [];
            curatedCache[t.kind] = entries;
            await refreshCount(t.kind);
        } catch (err) {
            console.error('[ARM] options: failed to load curated list', t.key, err.message);
            t.countEl.textContent = '?';
        }
    }
}

async function refreshCount(kind) {
    const entries = curatedCache[kind];
    const { curatedDisabled = {}, curatedRemoved = {} } = await syncGet(['curatedDisabled', 'curatedRemoved']);
    const disabled = new Set(curatedDisabled[kind] || []);
    const removed  = new Set(curatedRemoved[kind]  || []);
    const active = entries.filter(e => !disabled.has(e.host) && !removed.has(e.host)).length;
    const countEl = kind === 'paywall' ? els.paywallCount : els.adCount;
    countEl.textContent = `${active} / ${entries.length}`;
}

// ── Drawer ───────────────────────────────────────────────────────────────────

const DRAWER_TITLES = {
    paywall: 'Curated paywall list',
    ads:     'Curated ad-heavy list',
};

function openDrawer(kind) {
    drawerState.kind = kind;
    drawerState.title = DRAWER_TITLES[kind] || 'List';
    drawerState.showingRemoved = false;
    drawerState.filter = '';
    els.drawerSearch.value = '';
    els.drawerTitle.textContent = drawerState.title;
    els.drawer.hidden = false;
    els.drawerBackdrop.hidden = false;
    // Force a reflow so the transition runs from the off-screen state
    void els.drawer.offsetWidth;
    els.drawer.classList.add('open');
    els.drawerBackdrop.classList.add('open');
    els.drawer.setAttribute('aria-hidden', 'false');
    document.addEventListener('keydown', onDrawerKey);
    renderDrawer();
    setTimeout(() => els.drawerSearch.focus(), 200);
}

function closeDrawer() {
    els.drawer.classList.remove('open');
    els.drawerBackdrop.classList.remove('open');
    els.drawer.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', onDrawerKey);
    setTimeout(() => {
        els.drawer.hidden = true;
        els.drawerBackdrop.hidden = true;
    }, 220);
    drawerState.kind = null;
}

function onDrawerKey(e) {
    if (e.key === 'Escape') {
        e.preventDefault();
        closeDrawer();
    }
}

async function renderDrawer() {
    if (!drawerState.kind) return;
    const kind = drawerState.kind;
    const entries = curatedCache[kind] || [];
    const { curatedDisabled = {}, curatedRemoved = {} } = await syncGet(['curatedDisabled', 'curatedRemoved']);
    const disabled = new Set(curatedDisabled[kind] || []);
    const removed  = new Set(curatedRemoved[kind]  || []);

    const filterText = drawerState.filter.trim().toLowerCase();
    const sorted = [...entries].sort((a, b) => a.host.localeCompare(b.host));

    const visible = sorted.filter(e => {
        const isRemoved = removed.has(e.host);
        if (drawerState.showingRemoved) {
            if (!isRemoved) return false;
        } else {
            if (isRemoved) return false;
        }
        if (filterText && !e.host.toLowerCase().includes(filterText)) return false;
        return true;
    });

    els.drawerList.innerHTML = '';
    els.drawerEmpty.hidden = visible.length > 0;

    for (const entry of visible) {
        const isRemoved = removed.has(entry.host);
        const isDisabled = disabled.has(entry.host);

        const li = document.createElement('li');
        li.className = 'drawer-entry';
        if (isDisabled && !isRemoved) li.classList.add('disabled');
        if (isRemoved) li.classList.add('removed');

        const host = document.createElement('span');
        host.className = 'drawer-entry-host';
        host.textContent = entry.host;
        host.title = entry.host;
        li.appendChild(host);

        if (!isRemoved) {
            // Active entry: toggle + remove
            const switchLabel = document.createElement('label');
            switchLabel.className = 'switch';
            switchLabel.title = isDisabled ? 'Enable' : 'Disable';
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.checked = !isDisabled;
            cb.addEventListener('change', async () => {
                await setEntryDisabled(kind, entry.host, !cb.checked);
            });
            const slider = document.createElement('span');
            slider.className = 'slider';
            switchLabel.append(cb, slider);
            li.appendChild(switchLabel);

            const remove = document.createElement('button');
            remove.type = 'button';
            remove.className = 'icon-btn';
            remove.title = 'Remove from list';
            remove.setAttribute('aria-label', `Remove ${entry.host}`);
            remove.innerHTML = `
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M1 1L12 12M12 1L1 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                </svg>`;
            remove.addEventListener('click', () => removeEntry(kind, entry.host));
            li.appendChild(remove);
        } else {
            // Removed entry: restore button
            const restore = document.createElement('button');
            restore.type = 'button';
            restore.className = 'icon-btn restore';
            restore.title = 'Restore';
            restore.setAttribute('aria-label', `Restore ${entry.host}`);
            restore.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M3 7a4 4 0 1 1 1.2 2.85" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M3 3v3h3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>`;
            restore.addEventListener('click', () => restoreEntry(kind, entry.host));
            li.appendChild(restore);
        }

        els.drawerList.appendChild(li);
    }

    // Footer counts
    const total = entries.length;
    const active = entries.filter(e => !disabled.has(e.host) && !removed.has(e.host)).length;
    els.drawerActiveCount.textContent = String(active);
    els.drawerTotalCount.textContent = String(total);

    // Show/Hide removed buttons
    const removedCount = removed.size;
    if (drawerState.showingRemoved) {
        els.drawerShowRemoved.hidden = true;
        els.drawerHideRemoved.hidden = false;
        els.drawerHideRemoved.textContent = 'Back to active';
    } else {
        els.drawerHideRemoved.hidden = true;
        els.drawerShowRemoved.hidden = false;
        els.drawerShowRemoved.textContent = removedCount === 0
            ? 'No removed entries'
            : `Show ${removedCount} removed`;
        els.drawerShowRemoved.disabled = removedCount === 0;
    }
}

async function setEntryDisabled(kind, host, disabled) {
    const stored = await syncGet(['curatedDisabled']);
    const map = stored.curatedDisabled || { paywall: [], ads: [] };
    const list = new Set(map[kind] || []);
    if (disabled) list.add(host); else list.delete(host);
    map[kind] = [...list];
    await syncSet({ curatedDisabled: map });
    toast(`${host} ${disabled ? 'disabled' : 'enabled'}`, disabled ? 'default' : 'success');
}

async function removeEntry(kind, host) {
    const stored = await syncGet(['curatedDisabled', 'curatedRemoved']);
    const removed = stored.curatedRemoved || { paywall: [], ads: [] };
    const disabled = stored.curatedDisabled || { paywall: [], ads: [] };

    const rSet = new Set(removed[kind] || []);
    rSet.add(host);
    removed[kind] = [...rSet];

    // Cleanup: an entry can't be both disabled and removed
    const dSet = new Set(disabled[kind] || []);
    dSet.delete(host);
    disabled[kind] = [...dSet];

    await syncSet({ curatedRemoved: removed, curatedDisabled: disabled });
    toast(`Removed ${host}`);
}

async function restoreEntry(kind, host) {
    const stored = await syncGet(['curatedRemoved']);
    const removed = stored.curatedRemoved || { paywall: [], ads: [] };
    const set = new Set(removed[kind] || []);
    set.delete(host);
    removed[kind] = [...set];
    await syncSet({ curatedRemoved: removed });
    toast(`Restored ${host}`, 'success');
}

// ── Toggles ──────────────────────────────────────────────────────────────────

async function initToggles() {
    const stored = await syncGet(TOGGLE_KEYS);
    const defaults = {
        enablePaywallList: true,
        enableAdList: true,
        enablePaywallHeuristic: true,
        enableAdHeuristic: false,
    };
    for (const key of TOGGLE_KEYS) {
        const checked = (key in stored) ? !!stored[key] : defaults[key];
        els.toggles[key].checked = checked;
        els.toggles[key].addEventListener('change', async () => {
            try {
                await syncSet({ [key]: els.toggles[key].checked });
                toast(`${prettyToggleName(key)}: ${els.toggles[key].checked ? 'on' : 'off'}`,
                      els.toggles[key].checked ? 'success' : 'default');
            } catch (err) {
                toast('Failed to save setting.', 'error');
            }
        });
    }
}

function prettyToggleName(key) {
    return ({
        enablePaywallList:      'Curated paywall list',
        enableAdList:           'Curated ad-heavy list',
        enablePaywallHeuristic: 'Paywall heuristic',
        enableAdHeuristic:      'Ad-density heuristic',
    })[key] || key;
}

// ── Sites list ───────────────────────────────────────────────────────────────

async function renderSites() {
    const { readerSites = [], siteOverrides = {} } = await syncGet(['readerSites', 'siteOverrides']);

    // Combine: every host that appears in either readerSites or siteOverrides
    const hosts = new Set([...readerSites]);
    for (const h of Object.keys(siteOverrides)) hosts.add(h);
    const sortedHosts = [...hosts].sort();

    els.sitesList.innerHTML = '';
    els.emptyRow.hidden = sortedHosts.length > 0;

    for (const host of sortedHosts) {
        const li = document.createElement('li');
        li.className = 'site-item';

        const left = document.createElement('div');
        left.style.display = 'flex';
        left.style.alignItems = 'center';
        left.style.gap = '10px';
        left.style.flex = '1';
        left.style.minWidth = '0';

        const name = document.createElement('span');
        name.className = 'site-host';
        name.textContent = host;
        name.title = host;
        left.appendChild(name);

        if (siteOverrides[host] === 'never') {
            const tag = document.createElement('span');
            tag.className = 'site-tag never';
            tag.textContent = 'Never';
            left.appendChild(tag);
        } else if (siteOverrides[host] === 'always' || readerSites.includes(host)) {
            const tag = document.createElement('span');
            tag.className = 'site-tag';
            tag.textContent = 'Always';
            left.appendChild(tag);
        }

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.type = 'button';
        removeBtn.title = 'Remove';
        removeBtn.setAttribute('aria-label', `Remove ${host}`);
        removeBtn.innerHTML = `
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M1 1L12 12M12 1L1 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            </svg>`;
        removeBtn.addEventListener('click', async () => {
            await removeHost(host);
        });

        li.append(left, removeBtn);
        els.sitesList.appendChild(li);
    }
}

async function addHostFromInput() {
    const raw = els.addInput.value;
    const host = normaliseHost(raw);
    if (!host) {
        toast('Enter a hostname like example.com', 'error');
        return;
    }
    const { readerSites = [], siteOverrides = {} } = await syncGet(['readerSites', 'siteOverrides']);
    if (readerSites.includes(host)) {
        toast(`${host} is already on your list`, 'default');
        els.addInput.value = '';
        return;
    }
    const next = [...readerSites, host];
    const overrides = { ...siteOverrides };
    if (overrides[host] === 'never') delete overrides[host]; // adding overrides 'never'
    await syncSet({ readerSites: next, siteOverrides: overrides });
    els.addInput.value = '';
    await renderSites();
    toast(`Added ${host}`, 'success');
}

async function removeHost(host) {
    const { readerSites = [], siteOverrides = {} } = await syncGet(['readerSites', 'siteOverrides']);
    const nextSites = readerSites.filter(s => s !== host);
    const nextOverrides = { ...siteOverrides };
    delete nextOverrides[host];
    await syncSet({ readerSites: nextSites, siteOverrides: nextOverrides });
    await renderSites();
    toast(`Removed ${host}`);
}

// ── React to external storage changes (e.g. popup edits) ─────────────────────

chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;
    if (changes.readerSites || changes.siteOverrides) {
        renderSites();
    }
    for (const key of TOGGLE_KEYS) {
        if (changes[key]) {
            els.toggles[key].checked = !!changes[key].newValue;
        }
    }
    if (changes.curatedDisabled || changes.curatedRemoved) {
        // Refresh the visible counts
        refreshCount('paywall');
        refreshCount('ads');
        // If a drawer is open, re-render it to reflect the change
        if (drawerState.kind) renderDrawer();
    }
});

// ── Init ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
    await Promise.all([loadCuratedLists(), initToggles(), renderSites()]);

    els.addBtn.addEventListener('click', addHostFromInput);
    els.addInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addHostFromInput();
        }
    });

    // Drawer
    els.manageBtns.forEach(btn => {
        btn.addEventListener('click', () => openDrawer(btn.dataset.list));
    });
    els.drawerClose.addEventListener('click', closeDrawer);
    els.drawerBackdrop.addEventListener('click', closeDrawer);
    els.drawerSearch.addEventListener('input', () => {
        drawerState.filter = els.drawerSearch.value;
        renderDrawer();
    });
    els.drawerShowRemoved.addEventListener('click', () => {
        drawerState.showingRemoved = true;
        renderDrawer();
    });
    els.drawerHideRemoved.addEventListener('click', () => {
        drawerState.showingRemoved = false;
        renderDrawer();
    });
});
