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
        console.log("AURA MANAGER: Injecting into tab", tabId);
        await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
        console.log("AURA MANAGER: Successfully injected content.js");
        sendResponse({ ok: true });
      } catch (error) {
        console.error("AURA MANAGER: Injection failed:", error);
        sendResponse({ ok: false, error: error.message });
      }
    };
    chrome.tabs.onUpdated.addListener(inject);
  });
  return true;
});
