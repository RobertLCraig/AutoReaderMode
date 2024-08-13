document.addEventListener('DOMContentLoaded', function () {
  const currentSiteInput = document.getElementById('current-site');
  const addSiteButton = document.getElementById('add-site');
  const siteList = document.getElementById('site-list');
  const readerModeButton = document.getElementById('reader-mode-button');

  // Get the current tab URL and adjust button text accordingly
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0];
      const url = new URL(tab.url);
      currentSiteInput.value = url.hostname;

      if (tab.url.startsWith('read://')) {
          readerModeButton.textContent = "Switch to Normal Mode";
      } else {
          readerModeButton.textContent = "Switch to Reader Mode";
      }
  });

  // Function to clear and reload the site list
  function reloadSiteList() {
      siteList.innerHTML = ''; // Clear the current list
      chrome.storage.sync.get(['readerSites'], function (data) {
          const sites = data.readerSites || [];
          console.log("Current stored sites:", sites); // Debugging: log current sites

          // Use a Set to prevent duplicate entries
          const uniqueSites = [...new Set(sites)];
          uniqueSites.forEach(site => addSiteToList(site));
      });
  }

  // Load the list of enabled sites when the popup is opened
  reloadSiteList();

  // Add the current site to the list
  addSiteButton.addEventListener('click', function () {
      const site = currentSiteInput.value;
      chrome.storage.sync.get(['readerSites'], function (data) {
          const sites = data.readerSites || [];

          // Ensure no duplicates are added
          if (!sites.includes(site)) {
              sites.push(site);
              chrome.storage.sync.set({ readerSites: sites }, function () {
                  console.log(`${site} has been added to storage.`); // Debugging: log addition
                  reloadSiteList();  // Reload the list after adding the site
                  alert(`${site} has been added to the list.`);
              });
          } else {
              console.log(`${site} is already in the storage.`); // Debugging: log duplicate prevention
              alert(`${site} is already in the list.`);
          }
      });
  });

  // Function to add a site to the UI list
  function addSiteToList(site) {
      const li = document.createElement('li');
      li.textContent = site;
      const removeButton = document.createElement('button');
      removeButton.textContent = 'Remove';
      removeButton.addEventListener('click', function () {
          removeSite(site);
          li.remove();  // Remove the list item from the UI
          alert(`${site} has been removed from the list.`);
      });
      li.appendChild(removeButton);
      siteList.appendChild(li);
  }

  // Function to remove a site from storage and reload the list
  function removeSite(site) {
      chrome.storage.sync.get(['readerSites'], function (data) {
          const sites = data.readerSites || [];
          const updatedSites = sites.filter(s => s !== site);
          chrome.storage.sync.set({ readerSites: updatedSites }, function () {
              console.log(`${site} has been removed from storage.`); // Debugging: log removal
              reloadSiteList();  // Reload the list after removal
          });
      });
  }

  // Toggle Reader Mode when the button is clicked
  readerModeButton.addEventListener('click', function () {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          const tab = tabs[0];
          if (tab.url.startsWith('read://')) {
              // If already in reader mode, switch back to the normal URL
              const normalUrl = decodeURIComponent(new URL(tab.url).searchParams.get('url'));
              chrome.tabs.update(tab.id, { url: normalUrl });
              readerModeButton.textContent = "Switch to Reader Mode";
          } else {
              // If not in reader mode, switch to reader mode
              const readerUrl = convertUrl(tab.url);
              if (readerUrl) {
                  chrome.tabs.update(tab.id, { url: readerUrl });
                  readerModeButton.textContent = "Switch to Normal Mode";
              } else {
                  alert('Failed to convert URL to reader mode.');
              }
          }
      });
  });
});
