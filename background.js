chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url && typeof tab.url === "string" && tab.url.trim() !== "" && tab.url.startsWith("http")) {
      try {
          const url = new URL(tab.url);
          const hostname = url.hostname;

          console.log(`Tab updated: ${tab.url}`);

          chrome.storage.sync.get(["readerSites"], function(data) {
              const sites = data.readerSites || [];
              console.log("Enabled sites:", sites);

              if (sites.includes(hostname)) {
                  console.log(`Converting ${hostname} to reader mode`);

                  const readerUrl = convertUrl(tab.url);

                  if (readerUrl) {
                      chrome.tabs.update(tabId, { url: readerUrl });
                  } else {
                      console.error("Failed to convert URL to reader mode:", tab.url);
                  }
              } else {
                  console.log(`${hostname} is not in the enabled sites list.`);
              }
          });
      } catch (e) {
          console.error("Failed to construct URL:", tab.url, e);
      }
  } else {
      if (!tab.url) {
          console.warn("Tab URL is undefined during onUpdated event. Tab details:", tab);
      } else if (!tab.url.startsWith("http")) {
          console.warn("Tab URL does not start with http/https, ignoring. Tab URL:", tab.url);
      } else {
          console.warn("Unexpected condition during onUpdated event. Tab details:", tab);
      }
  }
});
