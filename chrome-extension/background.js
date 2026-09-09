const domains = new Set([
  "amazon.de",
  "amazon.com",
  "amazon.co.uk",
  "amazon.fr",
  "amazon.it",
  "amazon.es",
  "amazon.ca",
  "amazon.com.au",
  "amazon.co.jp",
  "amazon.in",
  "amazon.com.br",
  "amazon.com.mx",
]);
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "OPEN_MANAGER") return;
  const domain = message.domain || "amazon.de";
  if (sender.id !== chrome.runtime.id || !domains.has(domain)) {
    sendResponse({ ok: false, error: "Ungültige Region oder Absender." });
    return;
  }
  chrome.tabs.create(
    { url: `https://alexa.${domain}/spa/index.html`, active: true },
    (tab) => {
      if (chrome.runtime.lastError || !tab?.id) {
        sendResponse({
          ok: false,
          error:
            chrome.runtime.lastError?.message ||
            "Alexa-Tab konnte nicht geöffnet werden.",
        });
        return;
      }
      let finished = false;
      const cleanup = () => {
        clearTimeout(timer);
        chrome.tabs.onUpdated.removeListener(updated);
        chrome.tabs.onRemoved.removeListener(removed);
      };
      const finish = (result) => {
        if (finished) return;
        finished = true;
        cleanup();
        sendResponse(result);
      };
      const inject = async () => {
        if (finished) return;
        // Claim this completion before asynchronous injection to avoid duplicate roots.
        finished = true;
        cleanup();
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"],
          });
          sendResponse({ ok: true });
        } catch {
          sendResponse({
            ok: false,
            error:
              "Manager konnte nicht geladen werden. Amazon-Anmeldung und Region prüfen, danach erneut öffnen.",
          });
        }
      };
      const updated = (id, info) => {
        if (id === tab.id && info.status === "complete") inject();
      };
      const removed = (id) => {
        if (id === tab.id)
          finish({ ok: false, error: "Alexa-Tab wurde geschlossen." });
      };
      const timer = setTimeout(
        () =>
          finish({
            ok: false,
            error: "Alexa-Seite lädt zu lange. Bitte erneut versuchen.",
          }),
        25000,
      );
      chrome.tabs.onUpdated.addListener(updated);
      chrome.tabs.onRemoved.addListener(removed);
      chrome.tabs.get(tab.id, (current) => {
        if (chrome.runtime.lastError)
          finish({ ok: false, error: "Alexa-Tab nicht erreichbar." });
        else if (current?.status === "complete") inject();
      });
    },
  );
  return true;
});
