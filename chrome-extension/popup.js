const statusEl = document.getElementById('status');
function status(msg) { statusEl.textContent = msg; }

async function openManager() {
  status('Öffne Manager...');
  await chrome.runtime.sendMessage({ type: 'OPEN_MANAGER' });
  window.close();
}

document.getElementById('open').addEventListener('click', openManager);
