const ALEXA_MANAGER_URL = 'https://alexa.amazon.de/spa/index.html';

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'OPEN_MANAGER') return;

  chrome.tabs.create({ url: ALEXA_MANAGER_URL, active: true }, tab => {
    if (chrome.runtime.lastError || !tab?.id) {
      sendResponse({ ok: false, error: chrome.runtime.lastError?.message || 'Alexa-Tab konnte nicht geoeffnet werden.' });
      return;
    }

    const tabId = tab.id;
    const inject = async (updatedTabId, changeInfo) => {
      if (updatedTabId !== tabId || changeInfo.status !== 'complete') return;
      chrome.tabs.onUpdated.removeListener(inject);
      try {
        await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
        sendResponse({ ok: true });
      } catch (error) {
        sendResponse({ ok: false, error: error.message });
      }
    };
    chrome.tabs.onUpdated.addListener(inject);
  });
  return true;
});
