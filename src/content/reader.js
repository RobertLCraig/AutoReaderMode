/**
 * reader.js - Inline reader overlay for Chrome / Chromium and the Edge fallback path.
 *
 * Sequence when injected:
 *   1. If overlay already mounted, remove it (toggle off) and exit.
 *   2. If window.__ARM_REQUIRE_HEURISTIC is true, only mount when
 *      window.__ARM_DETECT_RESULT.fire is true. detect.js sets this.
 *   3. Try Mozilla Readability. If parse() returns a usable article, render it.
 *   4. If the page looks SPA-y (parse too short), watch the DOM with a
 *      MutationObserver for up to 5s and re-parse on settle.
 *   5. As a last resort, fall back to the v1 selector heuristic.
 *
 * The trigger reason (preset / curated / heuristic) is set by background.js as
 * window.__ARM_TRIGGER_REASON before injection so the overlay toolbar can
 * surface it.
 */
(function () {
    'use strict';

    const OVERLAY_ID = 'auto-reader-mode-overlay';
    const MIN_LENGTH = 500;
    const SPA_MAX_WAIT_MS = 5000;
    const SPA_DEBOUNCE_MS = 400;

    // Toggle off if already mounted
    const existing = document.getElementById(OVERLAY_ID);
    if (existing) {
        existing.remove();
        return;
    }

    const requireHeuristic = window.__ARM_REQUIRE_HEURISTIC === true;
    if (requireHeuristic) {
        const detect = window.__ARM_DETECT_RESULT;
        if (!detect || !detect.fire) {
            console.log('[ARM] reader.js: heuristic gate not satisfied, skipping');
            return;
        }
    }

    const triggerReason = window.__ARM_TRIGGER_REASON || 'manual';
    const triggerSignals = (window.__ARM_DETECT_RESULT && window.__ARM_DETECT_RESULT.signals) || [];

    // ── Extraction ────────────────────────────────────────────────────────────

    function tryReadability() {
        if (typeof Readability !== 'function') return null;
        try {
            const docClone = document.cloneNode(true);
            const article = new Readability(docClone).parse();
            if (!article) return null;
            if ((article.length || (article.textContent || '').length) < MIN_LENGTH) return null;
            return article;
        } catch (err) {
            console.warn('[ARM] Readability threw:', err.message);
            return null;
        }
    }

    function getFallbackTitle() {
        return (
            document.querySelector('h1')?.textContent?.trim() ||
            document.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
            document.querySelector('meta[name="title"]')?.getAttribute('content') ||
            document.title
        );
    }

    function fallbackExtract() {
        const candidates = [
            'article', '[role="article"]', '[role="main"] article',
            '.post-body', '.post-content', '.entry-content',
            '.article-body', '.article-content', '.article-text',
            '.story-body', '.story-content', '.page-content',
            '.single-content', 'main article', 'main',
            '[role="main"]', '#content', '#main-content', '.content',
        ];

        for (const sel of candidates) {
            const el = document.querySelector(sel);
            if (el && el.innerText.trim().length > 400) {
                const clone = el.cloneNode(true);
                cleanClone(clone);
                return {
                    title: getFallbackTitle(),
                    contentNode: clone,
                    byline: null,
                    siteName: null,
                };
            }
        }
        const body = document.body.cloneNode(true);
        cleanClone(body);
        return {
            title: getFallbackTitle(),
            contentNode: body,
            byline: null,
            siteName: null,
        };
    }

    function cleanClone(root) {
        const unwanted = [
            'script', 'style', 'noscript',
            'nav', 'header', 'footer', 'aside',
            '[class*="advertisement"]', '[class*=" ad "]', '[id*="ad-"]',
            '[class*="sidebar"]', '[class*="social"]', '[class*="share"]',
            '[class*="newsletter"]', '[class*="subscribe"]',
            '[class*="related"]', '[class*="recommend"]',
            '[class*="comment"]', '[id*="comment"]',
            '[class*="cookie"]', '[class*="popup"]',
            '[class*="banner"]', '[class*="promo"]',
        ];
        for (const sel of unwanted) {
            try {
                root.querySelectorAll(sel).forEach(el => el.remove());
            } catch (_) { /* invalid selector */ }
        }
    }

    // ── Style (defined before mount so TDZ doesn't bite the synchronous path) ─

    const STYLE = `
        #${OVERLAY_ID} {
            position: fixed;
            inset: 0;
            z-index: 2147483647;
            background: #fafaf9;
            overflow-y: auto;
            font-family: Georgia, 'Times New Roman', serif;
        }
        #${OVERLAY_ID} * { box-sizing: border-box; }
        #${OVERLAY_ID} .arm-container {
            max-width: 720px;
            margin: 0 auto;
            padding: 40px 24px 80px;
        }
        #${OVERLAY_ID} .arm-toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 28px;
            padding-bottom: 16px;
            border-bottom: 1px solid #e5e7eb;
            font-family: system-ui, -apple-system, sans-serif;
        }
        #${OVERLAY_ID} .arm-label {
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #6b7280;
            max-width: 60%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        #${OVERLAY_ID} .arm-close-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: none;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            padding: 6px 12px;
            font-size: 13px;
            font-family: system-ui, -apple-system, sans-serif;
            color: #374151;
            cursor: pointer;
            transition: background 0.15s, border-color 0.15s;
        }
        #${OVERLAY_ID} .arm-close-btn:hover {
            background: #f3f4f6;
            border-color: #9ca3af;
        }
        #${OVERLAY_ID} .arm-title {
            font-size: 28px;
            font-weight: 700;
            line-height: 1.3;
            color: #111827;
            margin: 0 0 8px;
            font-family: Georgia, 'Times New Roman', serif;
        }
        #${OVERLAY_ID} .arm-byline {
            font-size: 14px;
            color: #6b7280;
            margin: 0 0 28px;
            font-family: system-ui, -apple-system, sans-serif;
        }
        #${OVERLAY_ID} .arm-body {
            font-size: 18px;
            line-height: 1.8;
            color: #1f2937;
        }
        #${OVERLAY_ID} .arm-body p { margin: 0 0 1.25em; }
        #${OVERLAY_ID} .arm-body h1,
        #${OVERLAY_ID} .arm-body h2,
        #${OVERLAY_ID} .arm-body h3,
        #${OVERLAY_ID} .arm-body h4 {
            color: #111827;
            font-family: Georgia, 'Times New Roman', serif;
            line-height: 1.3;
            margin: 1.5em 0 0.5em;
        }
        #${OVERLAY_ID} .arm-body h2 { font-size: 22px; }
        #${OVERLAY_ID} .arm-body h3 { font-size: 19px; }
        #${OVERLAY_ID} .arm-body a { color: #2563eb; }
        #${OVERLAY_ID} .arm-body img {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
            margin: 16px 0;
            display: block;
        }
        #${OVERLAY_ID} .arm-body figure { margin: 16px 0; }
        #${OVERLAY_ID} .arm-body figcaption {
            font-size: 14px;
            color: #6b7280;
            text-align: center;
            margin-top: 8px;
        }
        #${OVERLAY_ID} .arm-body blockquote {
            border-left: 3px solid #d1d5db;
            margin: 1em 0;
            padding: 4px 0 4px 20px;
            color: #4b5563;
            font-style: italic;
        }
        #${OVERLAY_ID} .arm-body pre {
            background: #f3f4f6;
            border-radius: 6px;
            padding: 16px;
            overflow-x: auto;
            font-size: 14px;
        }
        #${OVERLAY_ID} .arm-body code {
            font-family: 'SFMono-Regular', 'Consolas', monospace;
            background: #f3f4f6;
            border-radius: 4px;
            padding: 2px 6px;
            font-size: 0.88em;
        }
        #${OVERLAY_ID} .arm-body pre code {
            background: none;
            padding: 0;
        }
        #${OVERLAY_ID} .arm-hint {
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 12px;
            color: #9ca3af;
            text-align: center;
            margin-top: 32px;
            padding-top: 16px;
            border-top: 1px solid #f0f0f0;
        }
        @media (prefers-color-scheme: dark) {
            #${OVERLAY_ID} { background: #18181b; }
            #${OVERLAY_ID} .arm-toolbar { border-color: #3f3f46; }
            #${OVERLAY_ID} .arm-close-btn { color: #d4d4d8; border-color: #52525b; }
            #${OVERLAY_ID} .arm-close-btn:hover { background: #27272a; border-color: #71717a; }
            #${OVERLAY_ID} .arm-title { color: #f4f4f5; }
            #${OVERLAY_ID} .arm-byline { color: #a1a1aa; }
            #${OVERLAY_ID} .arm-body  { color: #d4d4d8; }
            #${OVERLAY_ID} .arm-body h1,
            #${OVERLAY_ID} .arm-body h2,
            #${OVERLAY_ID} .arm-body h3,
            #${OVERLAY_ID} .arm-body h4 { color: #f4f4f5; }
            #${OVERLAY_ID} .arm-body blockquote { color: #a1a1aa; border-color: #52525b; }
            #${OVERLAY_ID} .arm-body pre,
            #${OVERLAY_ID} .arm-body code { background: #27272a; }
            #${OVERLAY_ID} .arm-hint { color: #52525b; border-color: #27272a; }
        }
    `;

    // ── Mount ─────────────────────────────────────────────────────────────────

    function reasonLabel() {
        switch (triggerReason) {
            case 'preset':           return 'Auto: site preset';
            case 'curated:paywall':  return 'Auto: known paywall';
            case 'curated:ads':      return 'Auto: ad-heavy site';
            case 'heuristic':        return `Auto: ${triggerSignals.join(', ') || 'detected'}`;
            case 'override:always':  return 'Auto: always-on for this site';
            case 'manual':           return 'Reader Mode';
            default:                 return 'Reader Mode';
        }
    }

    function mountOverlay(article) {
        // Guard against double-mount in case observer fires after first parse
        if (document.getElementById(OVERLAY_ID)) return;

        const overlay = document.createElement('div');
        overlay.id = OVERLAY_ID;

        const styleEl = document.createElement('style');
        styleEl.textContent = STYLE;

        overlay.innerHTML = `
            <div class="arm-container">
                <div class="arm-toolbar">
                    <span class="arm-label" id="arm-label"></span>
                    <button class="arm-close-btn" id="arm-close-btn" aria-label="Exit reader mode">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                        </svg>
                        Exit Reader Mode
                    </button>
                </div>
                <h1 class="arm-title" id="arm-title"></h1>
                <p class="arm-byline" id="arm-byline" hidden></p>
                <div class="arm-body" id="arm-body"></div>
                <p class="arm-hint">Press Esc or Alt+R to exit reader mode</p>
            </div>
        `;
        overlay.prepend(styleEl);

        overlay.querySelector('#arm-label').textContent = reasonLabel();
        overlay.querySelector('#arm-title').textContent = article.title || document.title;

        if (article.byline) {
            const bl = overlay.querySelector('#arm-byline');
            bl.textContent = article.byline;
            bl.hidden = false;
        }

        const body = overlay.querySelector('#arm-body');
        if (article.content) {
            // Readability returns sanitized HTML
            body.innerHTML = article.content;
        } else if (article.contentNode) {
            body.appendChild(article.contentNode);
        }

        document.body.appendChild(overlay);
        overlay.scrollTop = 0;

        overlay.querySelector('#arm-close-btn').addEventListener('click', () => overlay.remove());

        function handleKey(e) {
            if (e.key === 'Escape' || (e.altKey && e.key.toLowerCase() === 'r')) {
                overlay.remove();
                document.removeEventListener('keydown', handleKey);
            }
        }
        document.addEventListener('keydown', handleKey);
    }

    // ── Entry ─────────────────────────────────────────────────────────────────

    let article = tryReadability();
    if (article) {
        mountOverlay(article);
        return;
    }

    // SPA path: watch for content to settle, then re-parse
    console.log('[ARM] reader.js: initial parse below threshold, watching DOM');
    let timer = null;
    let mounted = false;
    const start = Date.now();

    const observer = new MutationObserver(() => {
        if (mounted) return;
        clearTimeout(timer);
        timer = setTimeout(attempt, SPA_DEBOUNCE_MS);
    });

    function attempt() {
        if (mounted) return;
        const a = tryReadability();
        if (a) {
            mounted = true;
            observer.disconnect();
            mountOverlay(a);
            return;
        }
        if (Date.now() - start >= SPA_MAX_WAIT_MS) {
            mounted = true;
            observer.disconnect();
            console.warn('[ARM] reader.js: timed out, using fallback extraction');
            mountOverlay(fallbackExtract());
        }
    }

    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(attempt, SPA_MAX_WAIT_MS); // hard cap
})();
