importScripts("utils.js");

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Ensure we're only processing fully loaded tabs with valid URLs
    if (changeInfo.status === "complete" && tab.url && typeof tab.url === "string" && tab.url.startsWith("http")) {
        try {
            console.log("Tab fully loaded:", tab.url);

            const url = new URL(tab.url);
            const hostname = url.hostname;

            // Check if the site is in the enabled list
            chrome.storage.sync.get(["readerSites"], function(data) {
                const sites = data.readerSites || [];
                console.log("Checking if site is in enabled list:", hostname, sites);

                if (sites.includes(hostname)) {
                    console.log("Site is in the enabled list, converting to reader mode:", hostname);

                    const readerUrl = convertUrl(tab.url);
                    if (readerUrl) {
                        console.log("Reader URL generated, updating tab:", readerUrl);
                        chrome.tabs.update(tabId, { url: readerUrl }, function() {
                            if (chrome.runtime.lastError) {
                                console.error("Failed to update tab to reader mode:", chrome.runtime.lastError);
                            } else {
                                console.log(`Successfully switched ${hostname} to reader mode.`);
                            }
                        });
                    } else {
                        console.error("Failed to convert URL to reader mode:", tab.url);
                    }
                } else {
                    console.log("Site is not in the enabled list:", hostname);
                }
            });
        } catch (e) {
            console.error("Error processing tab URL:", tab.url, e);
        }
    } else {
        if (!tab.url) {
            console.warn("Tab URL is undefined. This may happen for new tabs, discarded tabs, or internal Chrome pages.");
        } else if (!tab.url.startsWith("http")) {
            console.warn("Tab URL does not start with http/https, ignoring. Tab URL:", tab.url);
        }
    }
});
