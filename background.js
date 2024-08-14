importScripts("utils.js");

function initializeReaderSites() {
    return new Promise((resolve) => {
        chrome.storage.sync.get("readerSites", (data) => {
            if (!data.readerSites) {
                chrome.storage.sync.set({ readerSites: [] }, () => {
                    console.log("Initialized readerSites in storage.");
                    resolve([]);
                });
            } else {
                console.log("readerSites already initialized:", data.readerSites);
                resolve(data.readerSites);
            }
        });
    });
}

async function handleWebNavigation(details) {
    if (details.frameId === 0 && details.url && details.url.startsWith("http")) {
        try {
            console.log("WebNavigation completed for URL:", details.url);

            const url = new URL(details.url);
            const hostname = url.hostname;

            const sites = await initializeReaderSites();

            console.log("Checking if site is in enabled list:", hostname, sites);

            if (sites.includes(hostname)) {
                console.log("Site is in the enabled list, converting to reader mode:", hostname);

                const readerUrl = convertUrl(details.url);
                if (readerUrl) {
                    console.log("Reader URL generated, updating tab:", readerUrl);
                    chrome.tabs.update(details.tabId, { url: readerUrl }, function () {
                        if (chrome.runtime.lastError) {
                            console.error("Failed to update tab to reader mode:", chrome.runtime.lastError);
                        } else {
                            console.log(`Successfully switched ${hostname} to reader mode.`);
                        }
                    });
                } else {
                    console.error("Failed to convert URL to reader mode:", details.url);
                }
            } else {
                console.log("Site is not in the enabled list:", hostname);
            }
        } catch (e) {
            console.error("Error processing tab URL:", details.url, e);
        }
    } else {
        if (!details.url) {
            console.warn("WebNavigation URL is undefined or empty. This may happen for new tabs, discarded tabs, or internal Chrome pages.");
        } else if (!details.url.startsWith("http")) {
            console.warn("WebNavigation URL does not start with http/https, ignoring. URL:", details.url);
        }
    }
}

chrome.runtime.onInstalled.addListener(() => {
    initializeReaderSites();
});

chrome.runtime.onStartup.addListener(() => {
    initializeReaderSites();
});

chrome.webNavigation.onCompleted.addListener(handleWebNavigation);
