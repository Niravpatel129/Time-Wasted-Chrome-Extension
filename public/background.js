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
    chrome.storage.local.get(['timeWasted'], (result) => {
      const newTime = (result.timeWasted || 0) + timeSpent;
      chrome.storage.local.set({ timeWasted: newTime });
    });
    startTime = Date.now(); // Reset the start time
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    const isTimeWasting = checkTimeWasting(tab.url);
    updateIcon(isTimeWasting);
    updateTimeWasted();
    if (isTimeWasting) {
      activeTabId = tabId;
      startTime = Date.now();
      if (!intervalId) {
        intervalId = setInterval(updateTimeWasted, 1000);
      }
    } else {
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
    updateTimeWasted();
    if (isTimeWasting) {
      activeTabId = activeInfo.tabId;
      startTime = Date.now();
      if (!intervalId) {
        intervalId = setInterval(updateTimeWasted, 1000);
      }
    } else {
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
