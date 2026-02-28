/**
 * utils.js — Shared utilities for Auto Reader Mode.
 * Loaded via importScripts() in background.js and via <script> in popup.html.
 */

/**
 * Returns true when running inside Microsoft Edge (Chromium-based).
 * Edge's user-agent contains "Edg/<version>"; Chrome does not.
 */
function isEdgeBrowser() {
    try {
        // navigator is available in both popup pages and service workers.
        const ua = (typeof navigator !== 'undefined' && navigator.userAgent) ||
                   (typeof self !== 'undefined' && self.navigator && self.navigator.userAgent) ||
                   '';
        return /Edg\/\d+/.test(ua);
    } catch (_) {
        return false;
    }
}

/**
 * Converts a normal HTTP/HTTPS URL to Edge's read:// Immersive Reader format.
 * Returns null when the URL is already a read:// URL or is invalid.
 */
function convertUrl(originalUrl) {
    try {
        if (originalUrl.startsWith('read://')) {
            return null; // Already in reader mode
        }
        const urlObject = new URL(originalUrl);
        const domain = urlObject.hostname;
        const baseUrl = `read://https_${domain}/?url=`;
        return baseUrl + encodeURIComponent(originalUrl);
    } catch (_) {
        return null;
    }
}
