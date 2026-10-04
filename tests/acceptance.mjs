// PRD section 11 acceptance pass. Loads src/ unpacked and prints PASS / FAIL per criterion.
//   node tests/acceptance.mjs          (HEADED=1 to watch the browsers)
// Criteria 1 and 3 run in Edge stable, 2 and 4-7 in Playwright's Chromium. 8 is card 0005.
import { chromium } from 'playwright';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const SRC = resolve(import.meta.dirname, '..', 'src');
const OVERLAY = '#auto-reader-mode-overlay';
const results = [];

const para = n => Array.from({ length: n }, (_, i) =>
    `<p>Paragraph ${i + 1} of the test article. It carries enough ordinary prose for Readability ` +
    `to treat this page as an article rather than a stub, which needs several hundred characters.</p>`).join('');
const article = (title, head = '') =>
    `<!doctype html><html><head><title>${title}</title>${head}</head><body><article><h1>${title}</h1>${para(8)}</article></body></html>`;

function record(n, browser, pass, detail) {
    results.push({ n, browser, pass, detail });
    console.log(`${pass ? 'PASS' : 'FAIL'}  #${n} [${browser}] ${detail}`);
}

async function launch(channel) {
    const dir = mkdtempSync(join(tmpdir(), 'arm-'));
    const context = await chromium.launchPersistentContext(dir, {
        channel,
        headless: !process.env.HEADED,
        args: [`--disable-extensions-except=${SRC}`, `--load-extension=${SRC}`],
    });
    const worker = context.serviceWorkers()[0] || await context.waitForEvent('serviceworker');
    const id = new URL(worker.url()).host;
    // Give boot() time to load settings and the curated lists.
    await worker.evaluate(() => new Promise(r => setTimeout(r, 500)));
    return {
        context, worker, id,
        close: async () => { await context.close(); rmSync(dir, { recursive: true, force: true }); },
    };
}

// Serve every URL from the given html, so no check depends on a live site.
async function serve(context, html) {
    await context.route(/^https?:/, route => route.fulfill({ contentType: 'text/html', body: html(route.request().url()) }));
}

const tabId = (worker, url) =>
    worker.evaluate(async u => (await chrome.tabs.query({})).find(t => t.url === u)?.id, url);
const trigger = (worker, id) =>
    worker.evaluate(async k => (await chrome.storage.session.get(k))[k], `trigger:${id}`);

async function overlayText(page, timeout = 8000) {
    try {
        await page.waitForSelector(`${OVERLAY} #arm-body`, { timeout });
        return (await page.textContent(`${OVERLAY} #arm-body`)) || '';
    } catch { return null; }
}

// The popup reads the active tab, so put the target tab in front, then (re)load the popup.
async function popupFor(b, target) {
    const popup = await b.context.newPage();
    await target.bringToFront();
    await popup.goto(`chrome-extension://${b.id}/popup.html`);
    await popup.waitForTimeout(500);
    return popup;
}

async function waitForUrl(page, prefix, ms) {
    for (let t = 0; t < ms; t += 200) {
        if (page.url().startsWith(prefix)) return true;
        await page.waitForTimeout(200);
    }
    return false;
}

async function edge() {
    const b = await launch('msedge');
    try {
        await serve(b.context, url => article(`Edge ${new URL(url).hostname}`));
        const ua = await b.worker.evaluate(() => navigator.userAgent);
        console.log(`edge UA: ${ua}`);

        // 1: curated paywall host -> read://, and the overlay fallback does not fire.
        let page = await b.context.newPage();
        const url1 = 'https://www.ft.com/content/acceptance';
        await page.goto(url1);
        const id1 = await tabId(b.worker, url1);
        const redirected = await waitForUrl(page, 'read://', 10000);
        await page.waitForTimeout(3000);
        const t1 = id1 && await trigger(b.worker, id1);
        record(1, 'edge', redirected && page.url().startsWith('read://') && t1?.reason === 'edge:immersive-reader',
            `url=${page.url()} reason=${t1?.reason}`);
        await page.close();

        // 3: host written to readerSites auto-triggers on next visit (Edge: read://).
        await b.worker.evaluate(() => chrome.storage.sync.set({ readerSites: ['preset-site.example'] }));
        page = await b.context.newPage();
        await page.goto('https://preset-site.example/story');
        const ok3 = await waitForUrl(page, 'read://', 10000);
        record(3, 'edge', ok3, `url=${page.url()}`);
    } finally { await b.close(); }
}

async function chromiumRun() {
    const b = await launch('chromium'); // not the headless shell, which cannot load extensions
    try {
        const tier = '<meta property="article:content_tier" content="locked">';
        const late = 'LATE-RENDERED-MARKER';
        await serve(b.context, url => {
            const u = new URL(url);
            if (u.hostname === 'spa.example') {
                return `<!doctype html><html><head><title>SPA</title></head><body><div id="app">Loading</div><script>
                    setTimeout(() => { document.getElementById('app').innerHTML =
                        '<article><h1>SPA story</h1><p>${late}</p>${para(8).replace(/'/g, "\\'")}</article>'; }, 1500);
                    </script></body></html>`;
            }
            return article(`Page on ${u.hostname}`, u.hostname.startsWith('locked') ? tier : '');
        });

        // 2: curated paywall host -> overlay carrying article text.
        let page = await b.context.newPage();
        await page.goto('https://www.ft.com/content/acceptance');
        const t2 = await overlayText(page);
        record(2, 'chromium', !!t2 && t2.includes('Paragraph 1'), `overlay text ${t2 === null ? 'absent' : t2.length + ' chars'}`);
        await page.close();

        // 3 is run under Edge per the card; Chromium does not repeat it.

        // 4: non-curated host with the content_tier meta -> overlay, popup names the heuristic.
        page = await b.context.newPage();
        await page.goto('https://locked-news.example/story');
        const t4 = await overlayText(page);
        const popup = await popupFor(b, page);
        const reason = (await popup.textContent('#reason-line'))?.trim();
        record(4, 'chromium', !!t4 && reason === 'Heuristic: paywall meta tag',
            `overlay ${t4 ? 'present' : 'absent'}, popup reason "${reason}"`);
        await popup.close(); await page.close();

        // 6: body filled by script after load -> overlay carries that text.
        await b.worker.evaluate(() => chrome.storage.sync.set({ readerSites: ['spa.example'] }));
        page = await b.context.newPage();
        await page.goto('https://spa.example/');
        const t6 = await overlayText(page, 12000);
        record(6, 'chromium', !!t6 && t6.includes(late), `overlay text ${t6 === null ? 'absent' : (t6.includes(late) ? 'has' : 'lacks') + ' the late text'}`);
        await page.close();

        // 7: chrome:// denies executeScript -> error badge recorded and the popup explains it.
        page = await b.context.newPage();
        await page.goto('chrome://version');
        await page.waitForTimeout(1500);
        const id7 = await tabId(b.worker, 'chrome://version/');
        const badge = id7 && await b.worker.evaluate(t => chrome.action.getBadgeText({ tabId: t }), id7);
        const p7 = await popupFor(b, page);
        const explains = await p7.isVisible('#unavailable');
        record(7, 'chromium', badge === '!' && explains, `badge "${badge}", popup unavailable state ${explains ? 'shown' : 'not shown'}`);
        await p7.close(); await page.close();

        // 5 last, since it switches detection off: all four sources off -> nothing on non-listed hosts.
        // The hosts carry the paywall meta, so a live heuristic would show up here.
        await b.worker.evaluate(() => chrome.storage.sync.set({
            readerSites: [], enablePaywallList: false, enableAdList: false,
            enablePaywallHeuristic: false, enableAdHeuristic: false,
        }));
        const hits = [];
        for (const host of ['locked-a.example', 'locked-b.example', 'www.nytimes.com']) {
            page = await b.context.newPage();
            const url = `https://${host}/story`;
            await page.goto(url);
            const t = await overlayText(page, 3000);
            const tr = await trigger(b.worker, await tabId(b.worker, url));
            if (t !== null || tr) hits.push(host);
            await page.close();
        }
        record(5, 'chromium', hits.length === 0, hits.length ? `injected on ${hits.join(', ')}` : 'nothing injected on 3 hosts');
    } finally { await b.close(); }
}

const only = process.argv[2];
if (!only || only === 'edge') await edge();
if (!only || only === 'chromium') await chromiumRun();
console.log('NOT RUN  #8 is card 0005, which is not_for_the_loop');
process.exitCode = results.every(r => r.pass) ? 0 : 1;
