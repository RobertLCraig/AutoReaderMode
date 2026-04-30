/**
 * triggers.js - Decision logic for whether to auto-trigger reader mode.
 *
 * Order of precedence:
 *   1. siteOverrides[host] === 'never'  -> skip (always wins)
 *   2. siteOverrides[host] === 'always' -> fire (reason: 'override')
 *   3. user preset list (readerSites)   -> fire (reason: 'preset')
 *   4. curated paywall list             -> fire (reason: 'curated:paywall')
 *   5. curated ad-heavy list            -> fire (reason: 'curated:ads')
 *   6. heuristic detection              -> deferred to content script (detect.js)
 *
 * Heuristics cannot run from the service worker because they need DOM access.
 * For heuristic-eligible navigations we still inject the content script suite
 * and let detect.js decide whether to mount the overlay.
 */

function filterActive(entries, kind) {
    const disabled = getSetting('curatedDisabled') || {};
    const removed  = getSetting('curatedRemoved')  || {};
    const dSet = new Set(disabled[kind] || []);
    const rSet = new Set(removed[kind]  || []);
    return entries.filter(e => !dSet.has(e.host) && !rSet.has(e.host));
}

async function decideTrigger(hostname) {
    if (!hostname) return { fire: false, reason: 'no-host', allowHeuristic: false };

    const overrides = getSetting('siteOverrides') || {};
    const override = overrides[hostname];

    if (override === 'never') {
        return { fire: false, reason: 'override:never', allowHeuristic: false };
    }
    if (override === 'always') {
        return { fire: true, reason: 'override:always', allowHeuristic: false };
    }

    const userSites = getSetting('readerSites') || [];
    if (matchesUserSite(hostname, userSites)) {
        return { fire: true, reason: 'preset', allowHeuristic: false };
    }

    if (getSetting('enablePaywallList')) {
        const list = filterActive(await getCuratedPaywalls(), 'paywall');
        if (findInList(hostname, list)) {
            return { fire: true, reason: 'curated:paywall', allowHeuristic: false };
        }
    }

    if (getSetting('enableAdList')) {
        const list = filterActive(await getCuratedAdHeavy(), 'ads');
        if (findInList(hostname, list)) {
            return { fire: true, reason: 'curated:ads', allowHeuristic: false };
        }
    }

    const allowHeuristic =
        getSetting('enablePaywallHeuristic') || getSetting('enableAdHeuristic');

    return { fire: false, reason: 'no-match', allowHeuristic };
}
