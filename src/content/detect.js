/**
 * detect.js - In-page paywall and ad-density heuristics.
 *
 * Runs after readability.js has been injected. Receives a config object via
 * window.__ARM_DETECT_CONFIG so the background script can pass which
 * heuristics are enabled. Sets window.__ARM_DETECT_RESULT so reader.js can
 * read it and decide whether to mount.
 */
(function () {
    'use strict';

    const config = window.__ARM_DETECT_CONFIG || {
        paywall: true,
        ads: false,
    };

    function detectPaywall() {
        // 1. Schema.org tier markers
        const tierMeta = document.querySelector(
            'meta[property="article:content_tier"][content="locked"], ' +
            'meta[name="article:content_tier"][content="locked"]'
        );
        if (tierMeta) return { hit: true, signal: 'meta:content_tier=locked' };

        // 2. Schema.org JSON-LD isAccessibleForFree=false
        const ldNodes = document.querySelectorAll('script[type="application/ld+json"]');
        for (const node of ldNodes) {
            try {
                const text = (node.textContent || '').trim();
                if (!text) continue;
                const data = JSON.parse(text);
                const items = Array.isArray(data) ? data : [data];
                for (const item of items) {
                    if (item && item.isAccessibleForFree === false) {
                        return { hit: true, signal: 'jsonld:isAccessibleForFree=false' };
                    }
                }
            } catch (_) { /* malformed JSON-LD, skip */ }
        }

        // 3. Common paywall containers
        const paywallSelectors = [
            '.paywall', '.tp-modal', '.tp-backdrop',
            '.piano-id', '.meter-modal',
            '[data-paywall]', '[data-testid*="paywall" i]',
            '#paywall', '[class*="paywall" i]',
            '.subscribe-wall', '.subscription-wall',
            '#subscribe-overlay', '.metering-modal',
        ];
        for (const sel of paywallSelectors) {
            try {
                const el = document.querySelector(sel);
                if (el && isLikelyVisible(el)) {
                    return { hit: true, signal: `dom:${sel}` };
                }
            } catch (_) { /* invalid selector */ }
        }

        // 4. Copy-text heuristic: a fixed/sticky overlay containing subscribe wording
        const phrases = [
            'subscribe to continue',
            'subscribe to read',
            'create a free account to read',
            'create an account to keep reading',
            'you have read',
            'free articles remaining',
            'this article is for subscribers',
            'sign in to read',
        ];
        const candidates = document.querySelectorAll('div, section, aside, dialog');
        for (const el of candidates) {
            if (!isLikelyOverlay(el)) continue;
            const text = (el.innerText || '').toLowerCase();
            if (text.length > 1500) continue; // probably the article body
            for (const phrase of phrases) {
                if (text.includes(phrase)) {
                    return { hit: true, signal: `copy:${phrase}` };
                }
            }
        }

        return { hit: false };
    }

    function detectAdDensity() {
        const adIframeSelectors = [
            'iframe[src*="doubleclick"]',
            'iframe[src*="googlesyndication"]',
            'iframe[src*="googletagservices"]',
            'iframe[src*="amazon-adsystem"]',
            'iframe[src*="taboola"]',
            'iframe[src*="outbrain"]',
            'iframe[id*="google_ads_"]',
            'iframe[id*="dianomi"]',
            'ins.adsbygoogle',
            '[id^="google_ads_"]',
            '[id^="div-gpt-ad"]',
        ];

        let adCount = 0;
        for (const sel of adIframeSelectors) {
            try {
                adCount += document.querySelectorAll(sel).length;
            } catch (_) { /* invalid selector */ }
        }

        if (adCount >= 4) {
            return { hit: true, signal: `ad-iframes:${adCount}` };
        }

        const paragraphs = document.querySelectorAll('p').length;
        const allIframes = document.querySelectorAll('iframe').length;
        if (paragraphs > 5 && allIframes > 0) {
            const ratio = allIframes / paragraphs;
            if (ratio >= 0.3 && allIframes >= 3) {
                return { hit: true, signal: `iframe-ratio:${ratio.toFixed(2)}` };
            }
        }

        // Sticky / fixed coverage check
        const stickyHeight = computeStickyCoverage();
        const vh = Math.max(window.innerHeight || 0, 1);
        if (stickyHeight / vh >= 0.3) {
            return { hit: true, signal: `sticky-coverage:${(stickyHeight / vh).toFixed(2)}` };
        }

        return { hit: false };
    }

    function isLikelyVisible(el) {
        try {
            const style = getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) < 0.1) {
                return false;
            }
            const rect = el.getBoundingClientRect();
            return rect.width > 50 && rect.height > 50;
        } catch (_) {
            return false;
        }
    }

    function isLikelyOverlay(el) {
        try {
            const style = getComputedStyle(el);
            if (style.position !== 'fixed' && style.position !== 'sticky') return false;
            const z = parseInt(style.zIndex, 10);
            if (isNaN(z) || z < 100) return false;
            const rect = el.getBoundingClientRect();
            return rect.width > 200 && rect.height > 100;
        } catch (_) {
            return false;
        }
    }

    function computeStickyCoverage() {
        let total = 0;
        const els = document.querySelectorAll('body *');
        // Cap traversal to avoid pathological pages
        const limit = Math.min(els.length, 2000);
        for (let i = 0; i < limit; i++) {
            const el = els[i];
            try {
                const style = getComputedStyle(el);
                if (style.position === 'fixed' || style.position === 'sticky') {
                    const rect = el.getBoundingClientRect();
                    if (rect.width > window.innerWidth * 0.5) {
                        total += Math.max(0, rect.height);
                    }
                }
            } catch (_) { /* skip */ }
        }
        return total;
    }

    // ── Run ───────────────────────────────────────────────────────────────────

    const result = { fire: false, signals: [] };

    if (config.paywall) {
        const r = detectPaywall();
        if (r.hit) {
            result.fire = true;
            result.signals.push(`paywall:${r.signal}`);
        }
    }

    if (config.ads) {
        const r = detectAdDensity();
        if (r.hit) {
            result.fire = true;
            result.signals.push(`ads:${r.signal}`);
        }
    }

    window.__ARM_DETECT_RESULT = result;

    if (result.fire) {
        console.log('[ARM] heuristic fired:', result.signals.join(', '));
    } else {
        console.log('[ARM] heuristics: no signals');
    }
})();
