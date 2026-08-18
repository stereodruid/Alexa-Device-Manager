(() => {
  'use strict';

  const APP_ID = 'codex-alexa-device-manager';
  const API_LIST = '/api/behaviors/entities?skillId=amzn1.ask.1p.smarthome';
  const API_DELETE = id => `/api/phoenix/appliance/${encodeURIComponent(id)}`;

  const existing = document.getElementById(APP_ID);
  if (existing) existing.remove();

  const state = {
    devices: [],
    filtered: [],
    selected: new Set(),
    groups: [],
    lastDeleted: [],
    running: false,
  };

  const css = `
    #${APP_ID} { position: fixed; inset: 20px; z-index: 2147483647; background: #101418; color: #f4f7fb; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif; border: 1px solid #39424e; box-shadow: 0 18px 80px rgba(0,0,0,.55); border-radius: 18px; overflow: hidden; display: grid; grid-template-rows: auto auto 1fr auto; }
    #${APP_ID} * { box-sizing: border-box; }
    #${APP_ID} .adm-header { display:flex; align-items:center; justify-content:space-between; gap: 16px; padding: 14px 18px; background: linear-gradient(135deg, #18202a, #101418); border-bottom: 1px solid #303946; }
    #${APP_ID} .adm-title { font-size: 18px; font-weight: 750; letter-spacing: .2px; }
    #${APP_ID} .adm-sub { color:#9fb0c2; font-size: 12px; margin-top: 2px; }
    #${APP_ID} .adm-actions, #${APP_ID} .adm-controls { display:flex; gap: 8px; flex-wrap: wrap; align-items:center; }
    #${APP_ID} button { background:#253142; color:#f4f7fb; border:1px solid #42506a; border-radius: 10px; padding: 8px 10px; cursor:pointer; font-weight: 650; }
    #${APP_ID} button:hover { background:#314057; }
    #${APP_ID} button.adm-primary { background:#0b76d1; border-color:#2793ef; }
    #${APP_ID} button.adm-danger { background:#85222a; border-color:#c23a45; }
    #${APP_ID} button:disabled { opacity:.45; cursor:not-allowed; }
    #${APP_ID} input, #${APP_ID} select { background:#0b0f14; color:#f4f7fb; border:1px solid #3a4656; border-radius: 10px; padding: 8px 10px; }
    #${APP_ID} label { display:flex; gap: 7px; align-items:center; color:#c6d2de; font-size: 13px; }
    #${APP_ID} input[type=checkbox] { width: 16px; height: 16px; }
    #${APP_ID} .adm-panel { padding: 12px 18px; border-bottom:1px solid #303946; background:#141a21; display:grid; gap:10px; }
    #${APP_ID} .adm-stats { display:flex; gap: 10px; flex-wrap:wrap; }
    #${APP_ID} .adm-stat { background:#0c1117; border:1px solid #2f3947; padding:8px 10px; border-radius:12px; min-width:110px; }
    #${APP_ID} .adm-stat b { display:block; font-size:17px; }
    #${APP_ID} .adm-stat span { color:#99a8b8; font-size:12px; }
    #${APP_ID} .adm-body { overflow:auto; }
    #${APP_ID} table { width:100%; border-collapse: collapse; font-size: 13px; }
    #${APP_ID} th { position:sticky; top:0; background:#18202a; z-index:1; text-align:left; color:#b8c7d8; border-bottom:1px solid #334052; padding:9px 8px; }
    #${APP_ID} td { padding:8px; border-bottom:1px solid #222b37; vertical-align:top; }
    #${APP_ID} tr:hover td { background:#151d27; }
    #${APP_ID} .adm-muted { color:#8fa0b2; }
    #${APP_ID} .adm-pill { display:inline-block; padding:2px 7px; border-radius:999px; background:#263244; color:#c7d6e8; font-size:11px; margin:1px 4px 1px 0; }
    #${APP_ID} .adm-pill.warn { background:#48351a; color:#ffd48c; }
    #${APP_ID} .adm-pill.bad { background:#4a1e27; color:#ff9da9; }
    #${APP_ID} .adm-footer { display:grid; grid-template-columns: 1fr auto; gap:12px; padding:12px 18px; border-top:1px solid #303946; background:#111820; align-items:center; }
    #${APP_ID} .adm-log { white-space:pre-wrap; max-height:110px; overflow:auto; color:#b7c5d6; font-family: ui-monospace, Consolas, monospace; font-size:12px; background:#090d12; border:1px solid #263141; border-radius:10px; padding:8px; }
    #${APP_ID} .adm-close { font-size:18px; padding:5px 10px; }
    #${APP_ID} .adm-small { width: 92px; }
  `;

  const root = document.createElement('div');
  root.id = APP_ID;
  root.innerHTML = `
    <style>${css}</style>
    <div class="adm-header">
      <div>
        <div class="adm-title">Alexa Device Manager</div>
        <div class="adm-sub">Läuft lokal in deiner eingeloggten Amazon-Session. Kein Upload, keine externen Dienste.</div>
      </div>
      <div class="adm-actions">
        <button id="admReload" class="adm-primary">Geräte laden</button>
        <button id="admExportJson">JSON sichern</button>
        <button id="admExportCsv">CSV sichern</button>
        <button id="admClose" class="adm-close">×</button>
      </div>
    </div>
    <div class="adm-panel">
      <div class="adm-stats" id="admStats"></div>
      <div class="adm-controls">
        <input id="admSearch" placeholder="Suchen: Name, Beschreibung, Typ..." style="min-width:320px; flex:1" />
        <select id="admGroup"><option value="">Gruppe wählen</option></select>
        <select id="admType"><option value="">Alle Typen</option></select>
        <label><input id="admOnlyHA" type="checkbox"> nur Home Assistant</label>
        <label><input id="admHideProtected" type="checkbox" checked> geschützte ausblenden</label>
      </div>
      <div class="adm-controls">
        <button id="admSelectVisible">Sichtbare auswählen</button>
        <button id="admSelectGroup">Gruppenmitglieder auswählen</button>
        <button id="admSelectHA">HA-Geräte auswählen</button>
        <button id="admClear">Auswahl leeren</button>
        <label><input id="admIncludeGroups" type="checkbox"> Gruppen löschbar machen</label>
        <label><input id="admIncludeEcho" type="checkbox"> Echo/Amazon-Geräte löschbar machen</label>
        <label>Pause ms <input id="admDelay" class="adm-small" type="number" min="100" step="50" value="300"></label>
      </div>
    </div>
    <div class="adm-body">
      <table>
        <thead><tr><th style="width:38px"></th><th>Name</th><th>Beschreibung</th><th>Typ</th><th>Status</th><th>ID</th></tr></thead>
        <tbody id="admRows"><tr><td colspan="6" class="adm-muted">Noch keine Geräte geladen.</td></tr></tbody>
      </table>
    </div>
    <div class="adm-footer">
      <div class="adm-log" id="admLog">Bereit. Erst Geräte laden, dann filtern/auswählen. Löschen ist dauerhaft.</div>
      <div class="adm-actions">
        <button id="admDryRun">Trockenlauf</button>
        <button id="admDelete" class="adm-danger">Auswahl löschen</button>
      </div>
    </div>
  `;
  document.body.appendChild(root);

  const $ = id => root.querySelector(`#${id}`);
  const rows = $('admRows');
  const logBox = $('admLog');

  function log(msg) {
    const stamp = new Date().toLocaleTimeString();
    logBox.textContent += `\n[${stamp}] ${msg}`;
    logBox.scrollTop = logBox.scrollHeight;
  }

  function isHA(d) { return String(d.description || '').includes('via Home Assistant'); }
  function isGroup(d) { return d.providerData?.categoryType === 'GROUP'; }
  function isEcho(d) { return d.providerData?.deviceType === 'ALEXA_VOICE_ENABLED' || String(d.description || '').includes('Amazon intelligentes Gerät') || String(d.description || '').includes('Amazon intelligentes Ger'); }
  function isProtected(d) { return (isGroup(d) && !$('admIncludeGroups').checked) || (isEcho(d) && !$('admIncludeEcho').checked); }
  function deviceType(d) { return d.providerData?.deviceType || d.icon?.value || ''; }
  function category(d) { return d.providerData?.categoryType || ''; }
  function groups() { return state.devices.filter(isGroup); }
  function activeGroupMembers() {
    const groupId = $('admGroup').value;
    const group = state.devices.find(d => d.id === groupId);
    return new Set(group?.providerData?.groupMembers || []);
  }

  function download(name, content, type) {
    const blob = new Blob([content], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }

  function csvEscape(v) {
    return `"${String(v ?? '').replaceAll('"', '""')}"`;
  }

  function renderStats() {
    const total = state.devices.length;
    const ha = state.devices.filter(isHA).length;
    const groupCount = state.devices.filter(isGroup).length;
    const echo = state.devices.filter(isEcho).length;
    const selected = state.selected.size;
    $('admStats').innerHTML = [
      ['Gesamt', total], ['Home Assistant', ha], ['Gruppen', groupCount], ['Echo/Amazon', echo], ['Ausgewählt', selected], ['Sichtbar', state.filtered.length]
    ].map(([label, value]) => `<div class="adm-stat"><b>${value}</b><span>${label}</span></div>`).join('');
  }

  function fillFilters() {
    const groupSelect = $('admGroup');
    const prevGroup = groupSelect.value;
    groupSelect.innerHTML = '<option value="">Gruppe wählen</option>' + groups().map(g => `<option value="${g.id}">${escapeHtml(g.displayName)} (${g.providerData?.groupMembers?.length || 0})</option>`).join('');
    if ([...groupSelect.options].some(o => o.value === prevGroup)) groupSelect.value = prevGroup;

    const types = [...new Set(state.devices.map(deviceType).filter(Boolean))].sort();
    const typeSelect = $('admType');
    const prevType = typeSelect.value;
    typeSelect.innerHTML = '<option value="">Alle Typen</option>' + types.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('');
    if (types.includes(prevType)) typeSelect.value = prevType;
  }

  function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  }

  function applyFilter() {
    const q = $('admSearch').value.trim().toLowerCase();
    const type = $('admType').value;
    const members = activeGroupMembers();
    const groupMode = $('admGroup').value;
    state.filtered = state.devices.filter(d => {
      if ($('admOnlyHA').checked && !isHA(d)) return false;
      if ($('admHideProtected').checked && isProtected(d)) return false;
      if (type && deviceType(d) !== type) return false;
      if (groupMode && !members.has(d.id) && d.id !== groupMode) return false;
      if (q) {
        const hay = `${d.displayName || ''} ${d.description || ''} ${deviceType(d)} ${category(d)} ${d.id || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    renderTable();
    renderStats();
  }

  function renderTable() {
    if (!state.filtered.length) {
      rows.innerHTML = '<tr><td colspan="6" class="adm-muted">Keine passenden Geräte.</td></tr>';
      return;
    }
    rows.innerHTML = state.filtered.map(d => {
      const protectedNow = isProtected(d);
      const checked = state.selected.has(d.id) ? 'checked' : '';
      const disabled = protectedNow ? 'disabled' : '';
      const pills = [category(d), deviceType(d)].filter(Boolean).map(x => `<span class="adm-pill">${escapeHtml(x)}</span>`).join('');
      const flags = [isHA(d) ? '<span class="adm-pill">HA</span>' : '', isGroup(d) ? '<span class="adm-pill warn">GRUPPE</span>' : '', isEcho(d) ? '<span class="adm-pill warn">ECHO</span>' : '', protectedNow ? '<span class="adm-pill bad">GESCHÜTZT</span>' : ''].join('');
      return `<tr>
        <td><input class="adm-rowcheck" data-id="${d.id}" type="checkbox" ${checked} ${disabled}></td>
        <td><b>${escapeHtml(d.displayName)}</b><div>${flags}</div></td>
        <td>${escapeHtml(d.description)}</td>
        <td>${pills}</td>
        <td>${escapeHtml(d.availability || '')}<br><span class="adm-muted">enabled: ${escapeHtml(d.providerData?.enabled)}</span></td>
        <td class="adm-muted">${escapeHtml(d.id)}</td>
      </tr>`;
    }).join('');
    rows.querySelectorAll('.adm-rowcheck').forEach(cb => cb.addEventListener('change', e => {
      const id = e.target.dataset.id;
      if (e.target.checked) state.selected.add(id); else state.selected.delete(id);
      renderStats();
    }));
  }

  async function loadDevices() {
    state.selected.clear();
    log('Lade Geräte von Alexa...');
    const res = await fetch(API_LIST, { headers: { Accept: 'application/json' }});
    const text = await res.text();
    if (!res.ok) throw new Error(`Liste fehlgeschlagen: ${res.status} ${res.statusText} ${text.slice(0, 300)}`);
    let data;
    try { data = JSON.parse(text); } catch (e) { throw new Error(`Antwort ist kein JSON: ${text.slice(0, 300)}`); }
    if (!Array.isArray(data)) throw new Error('Alexa-Antwort ist kein Array. Endpoint/Region prüfen.');
    state.devices = data;
    fillFilters();
    applyFilter();
    log(`Geladen: ${data.length} Geräte, ${data.filter(isHA).length} davon Home Assistant.`);
  }

  function selectedDevices() {
    return state.devices.filter(d => state.selected.has(d.id));
  }

  function selectWhere(fn) {
    for (const d of state.devices) {
      if (fn(d) && !isProtected(d)) state.selected.add(d.id);
    }
    applyFilter();
  }

  function dryRun() {
    const list = selectedDevices();
    console.table(list.map(d => ({ name: d.displayName, description: d.description, type: deviceType(d), id: d.id })));
    log(`Trockenlauf: ${list.length} Geräte ausgewählt. Tabelle steht in der Browser-Konsole.`);
  }

  async function deleteSelected() {
    if (state.running) return;
    const list = selectedDevices().filter(d => !isProtected(d));
    if (!list.length) { log('Keine löschbaren Geräte ausgewählt.'); return; }
    const names = list.slice(0, 8).map(d => d.displayName).join(', ') + (list.length > 8 ? ` ... +${list.length - 8}` : '');
    const ok = confirm(`Dauerhaft aus Alexa löschen?\n\n${list.length} Geräte\n${names}\n\nVorher JSON sichern, falls noch nicht geschehen.`);
    if (!ok) return;
    const typed = prompt('Zur Bestätigung DELETE eingeben:');
    if (typed !== 'DELETE') { log('Abgebrochen: Bestätigung fehlt.'); return; }

    state.running = true;
    $('admDelete').disabled = true;
    state.lastDeleted = [];
    const delay = Math.max(100, Number($('admDelay').value || 300));
    log(`Starte Löschung von ${list.length} Geräten mit ${delay} ms Pause...`);
    for (const d of list) {
      try {
        const res = await fetch(API_DELETE(d.id), { method: 'DELETE', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }});
        const body = await res.text().catch(() => '');
        log(`${res.status} ${res.statusText} - ${d.displayName}`);
        state.lastDeleted.push({ id: d.id, name: d.displayName, status: res.status, statusText: res.statusText, body: body.slice(0, 500) });
      } catch (e) {
        log(`FEHLER - ${d.displayName}: ${e.message}`);
        state.lastDeleted.push({ id: d.id, name: d.displayName, error: e.message });
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    state.running = false;
    $('admDelete').disabled = false;
    log('Löschlauf fertig. Lade Geräte neu zur Kontrolle...');
    await loadDevices().catch(e => log(`Reload-Fehler: ${e.message}`));
  }

  $('admReload').addEventListener('click', () => loadDevices().catch(e => log(`FEHLER: ${e.message}`)));
  $('admClose').addEventListener('click', () => root.remove());
  ['admSearch','admGroup','admType','admOnlyHA','admHideProtected','admIncludeGroups','admIncludeEcho'].forEach(id => $(id).addEventListener('input', applyFilter));
  $('admSelectVisible').addEventListener('click', () => selectWhere(d => state.filtered.includes(d)));
  $('admSelectGroup').addEventListener('click', () => { const m = activeGroupMembers(); selectWhere(d => m.has(d.id)); });
  $('admSelectHA').addEventListener('click', () => selectWhere(isHA));
  $('admClear').addEventListener('click', () => { state.selected.clear(); applyFilter(); });
  $('admDryRun').addEventListener('click', dryRun);
  $('admDelete').addEventListener('click', () => deleteSelected().catch(e => log(`FEHLER: ${e.message}`)));
  $('admExportJson').addEventListener('click', () => download(`alexa-devices-${new Date().toISOString().replace(/[:.]/g,'-')}.json`, JSON.stringify(state.devices, null, 2), 'application/json'));
  $('admExportCsv').addEventListener('click', () => {
    const header = ['id','displayName','description','categoryType','deviceType','availability','enabled'];
    const lines = [header.join(',')].concat(state.devices.map(d => [d.id,d.displayName,d.description,category(d),deviceType(d),d.availability,d.providerData?.enabled].map(csvEscape).join(',')));
    download(`alexa-devices-${new Date().toISOString().replace(/[:.]/g,'-')}.csv`, lines.join('\n'), 'text/csv');
  });

  loadDevices().catch(e => log(`FEHLER: ${e.message}`));
})();
