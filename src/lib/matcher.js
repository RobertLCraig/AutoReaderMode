/**
 * matcher.js - Hostname matching for curated lists and the user-preset list.
 *
 * Match modes:
 *   exact   - hostname must equal entry.host
 *   suffix  - hostname must equal entry.host or end with '.' + entry.host
 *
 * The user-preset list (readerSites in storage) is treated as suffix matches
 * to mirror v1.x behaviour where adding 'forbes.com' also covered 'www.forbes.com'.
 */

function matchesEntry(hostname, entry) {
    if (!hostname || !entry || !entry.host) return false;
    const host = entry.host.toLowerCase();
    const target = hostname.toLowerCase();

    if (entry.match === 'exact') {
        return target === host;
    }
    return target === host || target.endsWith('.' + host);
}

function findInList(hostname, list) {
    if (!Array.isArray(list)) return null;
    for (const entry of list) {
        if (matchesEntry(hostname, entry)) return entry;
    }
    return null;
}

function matchesUserSite(hostname, userSites) {
    if (!Array.isArray(userSites) || !hostname) return false;
    const target = hostname.toLowerCase();
    return userSites.some(s => {
        const host = (s || '').toLowerCase();
        if (!host) return false;
        return target === host || target.endsWith('.' + host);
    });
}
