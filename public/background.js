/* eslint-disable no-undef */
const TIME_WASTING_SITES = ['youtube.com', 'facebook.com', 'reddit.com'];
let activeTabId = null;
let startTime = null;
let intervalId = null;

function updateIcon(isTimeWasting) {
  chrome.action.setIcon({
    path: isTimeWasting
      ? {
          16: 'data:image/png;base64,...', // Placeholder base64 icon for yellow
          48: 'data:image/png;base64,...',
          128: 'data:image/png;base64,...',
        }
      : {
          16: 'data:image/png;base64,...', // Placeholder base64 icon for default
          48: 'data:image/png;base64,...',
          128: 'data:image/png/base64,...',
        },
  });
}

function checkTimeWasting(url) {
  return TIME_WASTING_SITES.some((site) => url.includes(site));
}

function updateTimeWasted() {
  if (startTime && activeTabId !== null) {
    const endTime = Date.now();
    const timeSpent = (endTime - startTime) / 1000; // time in seconds
    chrome.tabs.get(activeTabId, (tab) => {
      const site = TIME_WASTING_SITES.find((site) => tab.url.includes(site));
      if (site) {
        chrome.storage.local.get(['timeWasted'], (result) => {
          const timeWasted = result.timeWasted || {};
          const newTime = (timeWasted[site] || 0) + timeSpent;
          chrome.storage.local.set({ timeWasted: { ...timeWasted, [site]: newTime } }, () => {
            startTime = Date.now(); // Reset the start time after updating storage
          });
        });
      }
    });
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    const isTimeWasting = checkTimeWasting(tab.url);
    updateIcon(isTimeWasting);
    if (isTimeWasting) {
      activeTabId = tabId;
      startTime = Date.now();
      updateTimeWasted(); // Update immediately
      if (!intervalId) {
        intervalId = setInterval(updateTimeWasted, 1000);
      }
    } else {
      updateTimeWasted();
      activeTabId = null;
      clearInterval(intervalId);
      intervalId = null;
    }
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    const isTimeWasting = checkTimeWasting(tab.url);
    updateIcon(isTimeWasting);
    if (isTimeWasting) {
      activeTabId = activeInfo.tabId;
      startTime = Date.now();
      updateTimeWasted(); // Update immediately
      if (!intervalId) {
        intervalId = setInterval(updateTimeWasted, 1000);
      }
    } else {
      updateTimeWasted();
      activeTabId = null;
      clearInterval(intervalId);
      intervalId = null;
    }
  });
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    updateTimeWasted();
    activeTabId = null;
    clearInterval(intervalId);
    intervalId = null;
  }
});
