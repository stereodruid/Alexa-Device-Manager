const statusEl = document.getElementById('status');
const regionEl = document.getElementById('region');
function status(msg) { statusEl.textContent = msg; }

// Automatische Vorauswahl basierend auf der Browsersprache
const lang = chrome.i18n.getUILanguage() || navigator.language || 'en-US';
const regionCode = lang.split('-')[1]?.toUpperCase() || lang.toUpperCase();
const domainMap = {
  'US': 'amazon.com', 'GB': 'amazon.co.uk', 'UK': 'amazon.co.uk',
  'DE': 'amazon.de', 'FR': 'amazon.fr', 'IT': 'amazon.it',
  'ES': 'amazon.es', 'JP': 'amazon.co.jp', 'CA': 'amazon.ca',
  'AU': 'amazon.com.au', 'IN': 'amazon.in', 'BR': 'amazon.com.br',
  'MX': 'amazon.com.mx'
};
const defaultDomain = domainMap[regionCode] || 'amazon.com';
if (Array.from(regionEl.options).some(o => o.value === defaultDomain)) {
  regionEl.value = defaultDomain;
}

async function openManager() {
  status('Öffne Manager...');
  await chrome.runtime.sendMessage({ type: 'OPEN_MANAGER', domain: regionEl.value });
  window.close();
}

document.getElementById('open').addEventListener('click', openManager);
