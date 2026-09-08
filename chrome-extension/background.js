chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'OPEN_MANAGER') return;

  const domain = message.domain || 'amazon.de';
  const url = `https://alexa.${domain}/spa/index.html`;

  chrome.tabs.create({ url: url, active: true }, tab => {
    if (chrome.runtime.lastError || !tab?.id) {
      sendResponse({ ok: false, error: chrome.runtime.lastError?.message || 'Alexa-Tab konnte nicht geoeffnet werden.' });
      return;
    }

    const tabId = tab.id;
    const inject = async (updatedTabId, changeInfo) => {
      if (updatedTabId !== tabId || changeInfo.status !== 'complete') return;
      chrome.tabs.onUpdated.removeListener(inject);
      try {
        await chrome.scripting.insertCSS({ target: { tabId }, files: ['content.css'] });
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
