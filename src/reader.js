/**
 * reader.js — Injected content script for Chrome/Chromium reader mode.
 * When injected it toggles an inline reader overlay on the current page.
 * Edge uses its native read:// scheme instead; this file is never injected there.
 */
(function () {
    'use strict';

    const OVERLAY_ID = 'auto-reader-mode-overlay';

    // If the overlay is already active, toggle it off and exit.
    const existing = document.getElementById(OVERLAY_ID);
    if (existing) {
        existing.remove();
        return;
    }

    // ── Content extraction ────────────────────────────────────────────────────

    function getTitle() {
        return (
            document.querySelector('h1')?.textContent?.trim() ||
            document.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
            document.querySelector('meta[name="title"]')?.getAttribute('content') ||
            document.title
        );
    }

    function extractArticleElement() {
        const candidates = [
            'article',
            '[role="article"]',
            '[role="main"] article',
            '.post-body',
            '.post-content',
            '.entry-content',
            '.article-body',
            '.article-content',
            '.article-text',
            '.story-body',
            '.story-content',
            '.page-content',
            '.single-content',
            'main article',
            'main',
            '[role="main"]',
            '#content',
            '#main-content',
            '.content',
        ];

        for (const sel of candidates) {
            const el = document.querySelector(sel);
            if (el && el.innerText.trim().length > 400) {
                return el;
            }
        }

        return document.body;
    }

    function buildCleanContent(sourceEl) {
        const clone = sourceEl.cloneNode(true);

        // Remove non-content elements
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
        unwanted.forEach(sel => {
            try {
                clone.querySelectorAll(sel).forEach(el => el.remove());
            } catch (_) { /* ignore invalid selectors */ }
        });

        return clone;
    }

    // ── Build overlay ─────────────────────────────────────────────────────────

    const title = getTitle();
    const sourceEl = extractArticleElement();
    const cleanContent = buildCleanContent(sourceEl);

    const css = `
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
            max-width: 700px;
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
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: #6b7280;
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
            margin: 0 0 28px;
            font-family: Georgia, 'Times New Roman', serif;
        }
        #${OVERLAY_ID} .arm-body {
            font-size: 18px;
            line-height: 1.8;
            color: #1f2937;
        }
        #${OVERLAY_ID} .arm-body p  { margin: 0 0 1.25em; }
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
        #${OVERLAY_ID} .arm-body a  { color: #2563eb; }
        #${OVERLAY_ID} .arm-body img {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
            margin: 16px 0;
            display: block;
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

    const overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;

    const styleEl = document.createElement('style');
    styleEl.textContent = css;

    overlay.innerHTML = `
        <div class="arm-container">
            <div class="arm-toolbar">
                <span class="arm-label">Reader Mode</span>
                <button class="arm-close-btn" id="arm-close-btn" aria-label="Exit reader mode">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                    Exit Reader Mode
                </button>
            </div>
            <h1 class="arm-title" id="arm-title"></h1>
            <div class="arm-body" id="arm-body"></div>
            <p class="arm-hint">Press Esc or Alt+R to exit reader mode</p>
        </div>
    `;

    overlay.prepend(styleEl);
    overlay.querySelector('#arm-title').textContent = title;
    overlay.querySelector('#arm-body').appendChild(cleanContent);

    document.body.appendChild(overlay);
    overlay.scrollTop = 0;

    // ── Controls ──────────────────────────────────────────────────────────────

    overlay.querySelector('#arm-close-btn').addEventListener('click', () => overlay.remove());

    function handleKey(e) {
        if (e.key === 'Escape' || (e.altKey && e.key.toLowerCase() === 'r')) {
            overlay.remove();
            document.removeEventListener('keydown', handleKey);
        }
    }
    document.addEventListener('keydown', handleKey);
})();
