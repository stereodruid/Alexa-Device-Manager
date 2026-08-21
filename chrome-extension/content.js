(() => {
  'use strict';

  const APP_ID = 'codex-alexa-device-manager';
  const API_LIST = '/api/behaviors/entities?skillId=amzn1.ask.1p.smarthome';
  const API_ENDPOINTS = '/nexus/v1/graphql';
  const API_DELETE_LEGACY = id => `/api/phoenix/appliance/${encodeURIComponent(id)}`;

  const existing = document.getElementById(APP_ID);
  if (existing) existing.remove();

  const state = {
    devices: [],
    filtered: [],
    selected: new Set(),
    groups: [],
    lastDeleted: [],
    lastEnablement: [],
    running: false,
    sortCol: 'name',
    sortDir: 1,
    columns: ['checkbox', 'name', 'description', 'type', 'status', 'id']
  };

  // Translation is deliberately separate from the Alexa API logic.
  const translations = {
    de: {
      subtitle: 'Laeuft lokal in deiner eingeloggten Amazon-Session. Kein Upload, keine externen Dienste.',
      load: 'Geraete laden', exportJson: 'JSON sichern', exportCsv: 'CSV sichern',
      search: 'Suchen: Name, Beschreibung, Typ...', chooseGroup: 'Gruppe waehlen',
      allTypes: 'Alle Typen', allSources: 'Alle Quellen', onlyHA: 'nur Home Assistant',
      hideProtected: 'geschuetzte ausblenden', selectVisible: 'Sichtbare auswaehlen',
      selectGroup: 'Gruppenmitglieder auswaehlen', selectHA: 'HA-Geraete auswaehlen',
      clearSelection: 'Auswahl leeren', allowGroups: 'Gruppen loeschbar machen',
      allowEchoes: 'Echo/Amazon-Geraete loeschbar machen', pause: 'Pause ms',
      name: 'Name', description: 'Beschreibung', type: 'Typ', status: 'Status', id: 'ID',
      noDevices: 'Noch keine Geraete geladen.', noMatches: 'Keine passenden Geraete.',
      ready: 'Bereit. Erst Geraete laden, dann filtern/auswaehlen. Loeschen ist dauerhaft.',
      dryRun: 'Trockenlauf', disable: 'Auswahl deaktivieren', enable: 'Auswahl aktivieren', delete: 'Auswahl loeschen',
      total: 'Gesamt', homeAssistant: 'Home Assistant', groups: 'Gruppen', echoAmazon: 'Echo/Amazon',
      deletable: 'Loeschbar', selected: 'Ausgewaehlt', visible: 'Sichtbar',
      sourceHA: 'Home Assistant', sourceIoBroker: 'ioBroker', sourceHomey: 'Homey', sourceAlexa: 'Alexa/Amazon', sourceOther: 'Andere',
      group: 'GRUPPE', echo: 'ECHO', endpointMissing: 'ENDPUNKT-ID FEHLT', protected: 'GESCHUETZT',
      alexa: 'Alexa', unknown: 'unbekannt', loading: 'Lade Geraete von Alexa...',
      loaded: '{total} Geraete geladen, {ha} davon Home Assistant, {deletable} mit Loesch-ID.',
      listFailed: 'Liste fehlgeschlagen: {status} {statusText} {body}', notJson: 'Antwort ist kein JSON: {body}',
      invalidList: 'Alexa-Antwort ist kein Array. Endpoint/Region pruefen.', idsFailed: 'Alexa-Loesch-IDs konnten nicht geladen werden ({status}). Loeschung ist absichtlich gesperrt.',
      dryRunLog: 'Trockenlauf: {count} Geraete ausgewaehlt. Tabelle steht in der Browser-Konsole.',
      noneDeletable: 'Keine loeschbaren Geraete ausgewaehlt.', deleteQuestion: 'Dauerhaft aus Alexa loeschen?\n\n{count} Geraete\n{names}\n\nVorher JSON sichern, falls noch nicht geschehen.',
      typeDelete: 'Zur Bestaetigung DELETE eingeben:', confirmationMissing: 'Abgebrochen: Bestaetigung fehlt.',
      deleteStart: 'Starte Loeschung von {count} Geraeten mit {delay} ms Pause...', deleteDone: 'Loeschlauf fertig. Lade Geraete neu zur Kontrolle...',
      verificationPartial: 'Kontrolle: {remaining} von {total} Geraeten sind noch vorhanden; {failed} Loeschaufrufe wurden abgelehnt.',
      verificationDeleted: 'Kontrolle: Alle {total} ausgewaehlten Geraete wurden entfernt.', reloadError: 'Neuladefehler: {error}',
      noneForAction: 'Keine Geraete zum {action} ausgewaehlt.', activate: 'aktivieren', deactivate: 'deaktivieren',
      enableQuestion: '{count} Geraete in Alexa {action}?\n\n{names}\n\nDie Aenderung ist ueber die Gegenaktion rueckgaengig zu machen.',
      typeEnable: 'Zur Bestaetigung AKTIVIEREN eingeben:', typeDisable: 'Zur Bestaetigung DEAKTIVIEREN eingeben:',
      actionStart: 'Starte {action} von {count} Geraeten...', actionDone: '{action} fertig. Lade Geraete neu zur Kontrolle...',
      verificationActionPartial: 'Kontrolle: {failed} von {total} Aenderungen wurden nicht bestaetigt.',
      verificationActionDone: 'Kontrolle: Alle {total} Aenderungen bestaetigt.', noStatus: 'keinen Status', error: 'FEHLER', language: 'Sprache', german: 'Deutsch', english: 'English'
    },
    en: {
      subtitle: 'Runs locally in your signed-in Amazon session. No uploads, no external services.',
      load: 'Load devices', exportJson: 'Save JSON', exportCsv: 'Save CSV',
      search: 'Search: name, description, type...', chooseGroup: 'Choose group',
      allTypes: 'All types', allSources: 'All sources', onlyHA: 'Home Assistant only',
      hideProtected: 'hide protected', selectVisible: 'Select visible',
      selectGroup: 'Select group members', selectHA: 'Select HA devices',
      clearSelection: 'Clear selection', allowGroups: 'allow deleting groups',
      allowEchoes: 'allow deleting Echo/Amazon devices', pause: 'Pause ms',
      name: 'Name', description: 'Description', type: 'Type', status: 'Status', id: 'ID',
      noDevices: 'No devices loaded yet.', noMatches: 'No matching devices.',
      ready: 'Ready. Load devices first, then filter/select. Deletion is permanent.',
      dryRun: 'Dry run', disable: 'Disable selection', enable: 'Enable selection', delete: 'Delete selection',
      total: 'Total', homeAssistant: 'Home Assistant', groups: 'Groups', echoAmazon: 'Echo/Amazon',
      deletable: 'Deletable', selected: 'Selected', visible: 'Visible',
      sourceHA: 'Home Assistant', sourceIoBroker: 'ioBroker', sourceHomey: 'Homey', sourceAlexa: 'Alexa/Amazon', sourceOther: 'Other',
      group: 'GROUP', echo: 'ECHO', endpointMissing: 'ENDPOINT ID MISSING', protected: 'PROTECTED',
      alexa: 'Alexa', unknown: 'unknown', loading: 'Loading Alexa devices...',
      loaded: 'Loaded: {total} devices, {ha} from Home Assistant, {deletable} with a deletion ID.',
      listFailed: 'List failed: {status} {statusText} {body}', notJson: 'Response is not JSON: {body}',
      invalidList: 'Alexa response is not an array. Check endpoint/region.', idsFailed: 'Alexa deletion IDs could not be loaded ({status}). Deletion is intentionally blocked.',
      dryRunLog: 'Dry run: {count} devices selected. The table is in the browser console.',
      noneDeletable: 'No deletable devices selected.', deleteQuestion: 'Permanently delete from Alexa?\n\n{count} devices\n{names}\n\nSave JSON first if you have not done so.',
      typeDelete: 'Type DELETE to confirm:', confirmationMissing: 'Cancelled: confirmation missing.',
      deleteStart: 'Starting deletion of {count} devices with a {delay} ms pause...', deleteDone: 'Deletion finished. Reloading devices for verification...',
      verificationPartial: 'Verification: {remaining} of {total} devices are still present; {failed} deletion requests were rejected.',
      verificationDeleted: 'Verification: all {total} selected devices were removed.', reloadError: 'Reload error: {error}',
      noneForAction: 'No devices selected to {action}.', activate: 'enable', deactivate: 'disable',
      enableQuestion: '{count} devices in Alexa {action}?\n\n{names}\n\nThe change can be reversed using the opposite action.',
      typeEnable: 'Type ENABLE to confirm:', typeDisable: 'Type DISABLE to confirm:',
      actionStart: 'Starting to {action} {count} devices...', actionDone: '{action} finished. Reloading devices for verification...',
      verificationActionPartial: 'Verification: {failed} of {total} changes were not confirmed.',
      verificationActionDone: 'Verification: all {total} changes confirmed.', noStatus: 'no status', error: 'ERROR', language: 'Language', german: 'Deutsch', english: 'English'
    }
  };
  let language = localStorage.getItem('admLanguage') === 'en' ? 'en' : 'de';
  function t(key, values = {}) {
    return String(translations[language][key] ?? key).replace(/\{(\w+)\}/g, (_, name) => values[name] ?? `{${name}}`);
  }

  const css = `
    #${APP_ID} { position: fixed; inset: 20px; z-index: 2147483647; background: #101418; color: #f4f7fb; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif; border: 1px solid #39424e; box-shadow: 0 18px 80px rgba(0,0,0,.55); border-radius: 18px; overflow: hidden; display: grid; grid-template-rows: auto auto 1fr auto; }
    #${APP_ID} * { box-sizing: border-box; color: inherit; }
    #${APP_ID} .adm-header { display:flex; align-items:center; justify-content:space-between; gap: 16px; padding: 14px 18px; background: linear-gradient(135deg, #18202a, #101418); border-bottom: 1px solid #303946; }
    #${APP_ID} .adm-title { font-size: 18px; font-weight: 750; letter-spacing: .2px; }
    #${APP_ID} .adm-sub { color:#9fb0c2; font-size: 12px; margin-top: 2px; }
    #${APP_ID} .adm-actions, #${APP_ID} .adm-controls { display:flex; gap: 8px; flex-wrap: wrap; align-items:center; }
    #${APP_ID} button { background:#253142; color:#f4f7fb; border:1px solid #42506a; border-radius: 10px; padding: 8px 10px; cursor:pointer; font-weight: 650; }
    #${APP_ID} button:hover { background:#314057; }
    #${APP_ID} button.adm-primary { background:#0b76d1; border-color:#2793ef; }
    #${APP_ID} button.adm-danger { background:#85222a; border-color:#c23a45; }
    #${APP_ID} button.adm-warning { background:#765319; border-color:#bd8a2e; }
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
    #${APP_ID} th { position:sticky; top:0; background:#18202a; z-index:1; text-align:left; color:#b8c7d8; border-bottom:1px solid #334052; padding:9px 8px; transition: background 0.2s; }
    #${APP_ID} th.adm-sortable { cursor: pointer; user-select: none; }
    #${APP_ID} th.adm-sortable:hover { background: #222d3b; }
    #${APP_ID} th.adm-dragover { background: #2d3b4d !important; border-left: 2px solid #38bdf8; }
    #${APP_ID} th.adm-dragging { opacity: 0.4; }
    #${APP_ID} td { padding:8px; border-bottom:1px solid #222b37; vertical-align:top; color:#e8f0f8 !important; background:#101820; }
    #${APP_ID} tr:hover td { background:#172233 !important; color:#ffffff !important; }
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
        <div class="adm-sub" data-i18n="subtitle">Laeuft lokal in deiner eingeloggten Amazon-Session. Kein Upload, keine externen Dienste.</div>
      </div>
      <div class="adm-actions">
        <a href="https://www.buymeacoffee.com/stereodruid" target="_blank" style="text-decoration:none; background:#FFDD00; color:#000000; border-radius:10px; padding:8px 10px; font-weight:650; font-size:13px; margin-right:8px;">☕ Donate</a>
        <select id="admLanguage" aria-label="Sprache / Language"><option value="de">Deutsch</option><option value="en">English</option></select>
        <button id="admReload" class="adm-primary" data-i18n="load">Geraete laden</button>
        <button id="admExportJson" data-i18n="exportJson">JSON sichern</button>
        <button id="admExportCsv" data-i18n="exportCsv">CSV sichern</button>
        <button id="admClose" class="adm-close" aria-label="Close">×</button>
      </div>
    </div>
    <div class="adm-panel">
      <div class="adm-stats" id="admStats"></div>
      <div class="adm-controls">
        <input id="admSearch" data-i18n-placeholder="search" placeholder="Suchen: Name, Beschreibung, Typ..." style="min-width:320px; flex:1" />
        <select id="admGroup"><option value="">Gruppe waehlen</option></select>
        <select id="admType"><option value="">Alle Typen</option></select>
        <select id="admSource"><option value="">Alle Quellen</option></select>
        <label><input id="admOnlyHA" type="checkbox"> <span data-i18n="onlyHA">nur Home Assistant</span></label>
        <label><input id="admHideProtected" type="checkbox" checked> <span data-i18n="hideProtected">geschuetzte ausblenden</span></label>
      </div>
      <div class="adm-controls">
        <button id="admSelectVisible" data-i18n="selectVisible">Sichtbare auswaehlen</button>
        <button id="admSelectGroup" data-i18n="selectGroup">Gruppenmitglieder auswaehlen</button>
        <button id="admSelectHA" data-i18n="selectHA">HA-Geraete auswaehlen</button>
        <button id="admClear" data-i18n="clearSelection">Auswahl leeren</button>
        <label><input id="admIncludeGroups" type="checkbox"> <span data-i18n="allowGroups">Gruppen loeschbar machen</span></label>
        <label><input id="admIncludeEcho" type="checkbox"> <span data-i18n="allowEchoes">Echo/Amazon-Geraete loeschbar machen</span></label>
        <label><span data-i18n="pause">Pause ms</span> <input id="admDelay" class="adm-small" type="number" min="100" step="50" value="300"></label>
      </div>
    </div>
    <div class="adm-body">
      <table>
        <thead id="admHead"></thead>
        <tbody id="admRows"><tr><td colspan="6" class="adm-muted" data-i18n="noDevices">Noch keine Geraete geladen.</td></tr></tbody>
      </table>
    </div>
    <div class="adm-footer">
      <div class="adm-log" id="admLog">Bereit. Erst Geraete laden, dann filtern/auswaehlen. Loeschen ist dauerhaft.</div>
      <div class="adm-actions">
        <button id="admDryRun" data-i18n="dryRun">Trockenlauf</button>
        <button id="admDisable" class="adm-warning" data-i18n="disable">Auswahl deaktivieren</button>
        <button id="admEnable" class="adm-primary" data-i18n="enable">Auswahl aktivieren</button>
        <button id="admDelete" class="adm-danger" data-i18n="delete">Auswahl loeschen</button>
      </div>
    </div>
  `;
  document.body.appendChild(root);

  const $ = id => root.querySelector(`#${id}`);
  const rows = $('admRows');
  const logBox = $('admLog');

  function applyLanguage() {
    root.querySelectorAll('[data-i18n]').forEach(element => { element.textContent = t(element.dataset.i18n); });
    root.querySelectorAll('[data-i18n-placeholder]').forEach(element => { element.placeholder = t(element.dataset.i18nPlaceholder); });
    $('admLanguage').value = language;
    $('admClose').setAttribute('aria-label', language === 'de' ? 'Schliessen' : 'Close');
    fillFilters();
    renderHeaders();
    applyFilter();
  }

  function renderHeaders() {
    const thead = $('admHead');
    if (!thead) return;
    const colDefs = {
      checkbox: { label: '', width: '38px', sortable: false },
      name: { label: t('name'), sortable: true },
      description: { label: t('description'), sortable: true },
      type: { label: t('type'), sortable: true },
      status: { label: t('status'), sortable: true },
      id: { label: t('id'), sortable: true }
    };
    const tr = document.createElement('tr');
    state.columns.forEach((colId, index) => {
      const def = colDefs[colId];
      const th = document.createElement('th');
      if (def.width) th.style.width = def.width;
      
      th.draggable = true;
      th.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', index); th.classList.add('adm-dragging'); });
      th.addEventListener('dragend', () => th.classList.remove('adm-dragging'));
      th.addEventListener('dragover', e => { e.preventDefault(); th.classList.add('adm-dragover'); });
      th.addEventListener('dragleave', () => th.classList.remove('adm-dragover'));
      th.addEventListener('drop', e => {
        e.preventDefault();
        th.classList.remove('adm-dragover');
        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
        if (!isNaN(fromIndex) && fromIndex !== index) {
          const moved = state.columns.splice(fromIndex, 1)[0];
          state.columns.splice(index, 0, moved);
          renderHeaders();
          renderTable();
        }
      });
      
      let content = escapeHtml(def.label);
      if (def.sortable) {
        th.classList.add('adm-sortable');
        if (state.sortCol === colId) content += state.sortDir === 1 ? ' &#9650;' : ' &#9660;';
        th.addEventListener('click', () => {
          if (state.sortCol === colId) state.sortDir *= -1;
          else { state.sortCol = colId; state.sortDir = 1; }
          renderHeaders();
          applyFilter();
        });
      }
      th.innerHTML = content;
      tr.appendChild(th);
    });
    thead.innerHTML = '';
    thead.appendChild(tr);
  }

  function log(msg) {
    const stamp = new Date().toLocaleTimeString();
    logBox.textContent += `\n[${stamp}] ${msg}`;
    logBox.scrollTop = logBox.scrollHeight;
  }

  function isHA(d) { return String(d.description || '').includes('via Home Assistant'); }
  function isGroup(d) { return d.providerData?.categoryType === 'GROUP'; }
  function isEcho(d) { return d.providerData?.deviceType === 'ALEXA_VOICE_ENABLED' || String(d.description || '').includes('Amazon intelligentes Gerät') || String(d.description || '').includes('Amazon intelligentes Ger'); }
  function hasDeleteId(d) { return Boolean(d._admEndpointId || d._admApplianceId); }
  function hasEndpointId(d) { return Boolean(d._admEndpointId); }
  function isSpecialProtected(d) { return (isGroup(d) && !$('admIncludeGroups').checked) || (isEcho(d) && !$('admIncludeEcho').checked); }
  function isProtected(d) { return !hasDeleteId(d) || isSpecialProtected(d); }
  function isEnablementProtected(d) { return !hasEndpointId(d) || isSpecialProtected(d); }
  function deviceType(d) { return d.providerData?.deviceType || d.icon?.value || ''; }
  function category(d) { return d.providerData?.categoryType || ''; }
  function sourceKey(d) {
    const text = `${d.description || ''} ${d.manufacturerName || ''} ${d.displayName || ''}`.toLowerCase();
    if (text.includes('via home assistant') || text.includes('home assistant')) return 'ha';
    if (text.includes('iobroker') || text.includes('io.broker')) return 'iobroker';
    if (text.includes('homey')) return 'homey';
    if (isEcho(d) || text.includes('amazon')) return 'alexa';
    return 'other';
  }
  function sourceLabel(key) { return t({ ha: 'sourceHA', iobroker: 'sourceIoBroker', homey: 'sourceHomey', alexa: 'sourceAlexa', other: 'sourceOther' }[key]); }
  function source(d) { return sourceLabel(sourceKey(d)); }
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
    const deletable = state.devices.filter(hasDeleteId).length;
    $('admStats').innerHTML = [
      [t('total'), total], [t('homeAssistant'), ha], [t('groups'), groupCount], [t('echoAmazon'), echo], [t('deletable'), deletable], [t('selected'), selected], [t('visible'), state.filtered.length]
    ].map(([label, value]) => `<div class="adm-stat"><b>${value}</b><span>${label}</span></div>`).join('');
  }

  function fillFilters() {
    const groupSelect = $('admGroup');
    const prevGroup = groupSelect.value;
    groupSelect.innerHTML = `<option value="">${escapeHtml(t('chooseGroup'))}</option>` + groups().map(g => `<option value="${g.id}">${escapeHtml(g.displayName)} (${g.providerData?.groupMembers?.length || 0})</option>`).join('');
    if ([...groupSelect.options].some(o => o.value === prevGroup)) groupSelect.value = prevGroup;

    const types = [...new Set(state.devices.map(deviceType).filter(Boolean))].sort();
    const typeSelect = $('admType');
    const prevType = typeSelect.value;
    typeSelect.innerHTML = `<option value="">${escapeHtml(t('allTypes'))}</option>` + types.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('');
    if (types.includes(prevType)) typeSelect.value = prevType;

    const sources = [...new Set(state.devices.map(sourceKey))].sort((a, b) => sourceLabel(a).localeCompare(sourceLabel(b), language));
    const sourceSelect = $('admSource');
    const prevSource = sourceSelect.value;
    sourceSelect.innerHTML = `<option value="">${escapeHtml(t('allSources'))}</option>` + sources.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(sourceLabel(s))}</option>`).join('');
    if (sources.includes(prevSource)) sourceSelect.value = prevSource;
  }

  function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  }

  function applyFilter() {
    const q = $('admSearch').value.trim().toLowerCase();
    const type = $('admType').value;
    const selectedSource = $('admSource').value;
    const members = activeGroupMembers();
    const groupMode = $('admGroup').value;
    state.filtered = state.devices.filter(d => {
      if ($('admOnlyHA').checked && !isHA(d)) return false;
      if ($('admHideProtected').checked && isProtected(d)) return false;
      if (type && deviceType(d) !== type) return false;
      if (selectedSource && sourceKey(d) !== selectedSource) return false;
      if (groupMode && !members.has(d.id) && d.id !== groupMode) return false;
      if (q) {
        const hay = `${d.displayName || ''} ${d.description || ''} ${source(d)} ${deviceType(d)} ${category(d)} ${d.id || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    state.filtered.sort((a, b) => {
      let valA = "", valB = "";
      if (state.sortCol === "name") { valA = (a.displayName || "").toLowerCase(); valB = (b.displayName || "").toLowerCase(); }
      else if (state.sortCol === "description") { valA = (a.description || "").toLowerCase(); valB = (b.description || "").toLowerCase(); }
      else if (state.sortCol === "type") { valA = deviceType(a).toLowerCase(); valB = deviceType(b).toLowerCase(); }
      else if (state.sortCol === "status") { valA = (a._admReachability || a.availability || "").toLowerCase(); valB = (b._admReachability || b.availability || "").toLowerCase(); }
      else if (state.sortCol === "id") { valA = (a.id || "").toLowerCase(); valB = (b.id || "").toLowerCase(); }
      if (valA < valB) return -1 * state.sortDir;
      if (valA > valB) return 1 * state.sortDir;
      return 0;
    });

    renderTable();
    renderStats();
  }

  function renderTable() {
    if (!state.filtered.length) {
      rows.innerHTML = `<tr><td colspan="${state.columns.length}" class="adm-muted">${escapeHtml(t('noMatches'))}</td></tr>`;
      return;
    }
    rows.innerHTML = state.filtered.map(d => {
      const deleteProtected = isProtected(d);
      const enablementProtected = isEnablementProtected(d);
      const protectedNow = deleteProtected && enablementProtected;
      const checked = state.selected.has(d.id) ? 'checked' : '';
      const disabled = protectedNow ? 'disabled' : '';
      const pills = [category(d), deviceType(d)].filter(Boolean).map(x => `<span class="adm-pill">${escapeHtml(x)}</span>`).join('');
      const flags = [isHA(d) ? '<span class="adm-pill">HA</span>' : '', `<span class="adm-pill">${escapeHtml(source(d))}</span>`, isGroup(d) ? `<span class="adm-pill warn">${t('group')}</span>` : '', isEcho(d) ? `<span class="adm-pill warn">${t('echo')}</span>` : '', !hasEndpointId(d) ? `<span class="adm-pill bad">${t('endpointMissing')}</span>` : '', isSpecialProtected(d) ? `<span class="adm-pill bad">${t('protected')}</span>` : ''].join('');
      
      let reachHtml = '';
      if (d._admReachability === 'OK') reachHtml = '<span style="color: #4ade80">🟢 Online</span>';
      else if (d._admReachability === 'UNAVAILABLE') reachHtml = '<span style="color: #f87171">🔴 Offline</span>';
      else if (d._admReachability) reachHtml = `<span style="color: #fbbf24">🟠 ${escapeHtml(d._admReachability)}</span>`;
      else if (d.availability) reachHtml = `<span style="color: #9ca3af">⚪ ${escapeHtml(d.availability)}</span>`;

      const statusCell = `${reachHtml}<br><span class="adm-muted">${t('alexa')}: ${escapeHtml(d._admEnablement || t('unknown'))}</span>`;
      
      const cellContents = {
        checkbox: `<td><input class="adm-rowcheck" data-id="${d.id}" type="checkbox" ${checked} ${disabled}></td>`,
        name: `<td><b>${escapeHtml(d.displayName)}</b><div>${flags}</div></td>`,
        description: `<td>${escapeHtml(d.description)}</td>`,
        type: `<td>${pills}</td>`,
        status: `<td>${statusCell}</td>`,
        id: `<td class="adm-muted">${escapeHtml(d.id)}</td>`
      };

      const trHtml = state.columns.map(col => cellContents[col]).join('');
      return `<tr>${trHtml}</tr>`;
    }).join('');
    rows.querySelectorAll('.adm-rowcheck').forEach(cb => cb.addEventListener('change', e => {
      const id = e.target.dataset.id;
      if (e.target.checked) state.selected.add(id); else state.selected.delete(id);
      renderStats();
    }));
  }

  async function loadDevices() {
    state.selected.clear();
    log(t('loading'));
    const res = await fetch(API_LIST, { headers: { Accept: 'application/json' }});
    const text = await res.text();
    if (!res.ok) throw new Error(t('listFailed', { status: res.status, statusText: res.statusText, body: text.slice(0, 300) }));
    let data;
    try { data = JSON.parse(text); } catch (e) { throw new Error(t('notJson', { body: text.slice(0, 300) })); }
    if (!Array.isArray(data)) throw new Error(t('invalidList'));
    state.devices = data;
    await attachDeleteIds();
    fillFilters();
    applyFilter();
    log(t('loaded', { total: data.length, ha: data.filter(isHA).length, deletable: data.filter(hasDeleteId).length }));
  }

  async function attachDeleteIds() {
    const query = `query getDevicesBaseData {
      allDevices: listEndpoints(listEndpointsInput: { includeHouseholdDevices: true }) {
        endpoints {
          endpointId: id
          enablement
          legacyAppliance { applianceId }
          legacyIdentifiers { chrsIdentifier { entityId } }
          features {
            name
            properties {
              name
              ... on Reachability { reachabilityStatusValue }
            }
          }
        }
      }
    }`;
    const res = await fetch(API_ENDPOINTS, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    const body = await res.json().catch(() => null);
    const endpoints = body?.data?.allDevices?.endpoints;
    if (!res.ok || !Array.isArray(endpoints)) {
      throw new Error(t('idsFailed', { status: res.status }));
    }

    const endpointByEntityId = new Map();
    for (const endpoint of endpoints) {
      const endpointId = endpoint?.endpointId;
      const applianceId = endpoint?.legacyAppliance?.applianceId;
      const entityId = endpoint?.legacyIdentifiers?.chrsIdentifier?.entityId;
      let reachability = null;
      if (Array.isArray(endpoint?.features)) {
        const conn = endpoint.features.find(f => f.name === 'connectivity');
        if (conn && Array.isArray(conn.properties)) {
          const prop = conn.properties.find(p => p.reachabilityStatusValue || p.name === 'reachability');
          if (prop) reachability = prop.reachabilityStatusValue;
        }
      }
      for (const key of [endpointId, entityId, String(endpointId || '').replace(/^amzn1\.alexa\.endpoint\./, '')]) {
        if (key) endpointByEntityId.set(key, { endpointId, applianceId, enablement: endpoint?.enablement, reachability });
      }
    }

    for (const device of state.devices) {
      const endpoint = endpointByEntityId.get(device.id);
      device._admApplianceId = endpoint?.applianceId || null;
      device._admEndpointId = endpoint?.endpointId || null;
      device._admEnablement = endpoint?.enablement || null;
      device._admReachability = endpoint?.reachability || null;
    }
  }

  function selectedDevices() {
    return state.devices.filter(d => state.selected.has(d.id));
  }

  function selectWhere(fn) {
    for (const d of state.devices) {
      if (fn(d) && !isEnablementProtected(d)) state.selected.add(d.id);
    }
    applyFilter();
  }

  function dryRun() {
    const list = selectedDevices();
    console.table(list.map(d => ({ name: d.displayName, description: d.description, type: deviceType(d), id: d.id })));
    log(t('dryRunLog', { count: list.length }));
  }

  async function deleteSelected() {
    if (state.running) return;
    const list = selectedDevices().filter(d => !isProtected(d));
    if (!list.length) { log(t('noneDeletable')); return; }
    const names = list.slice(0, 8).map(d => d.displayName).join(', ') + (list.length > 8 ? ` ... +${list.length - 8}` : '');
    const ok = confirm(t('deleteQuestion', { count: list.length, names }));
    if (!ok) return;
    const typed = prompt(t('typeDelete'));
    if (typed !== 'DELETE') { log(t('confirmationMissing')); return; }

    state.running = true;
    $('admDelete').disabled = true;
    state.lastDeleted = [];
    const delay = Math.max(100, Number($('admDelay').value || 300));
    log(t('deleteStart', { count: list.length, delay }));
    for (const d of list) {
      try {
        let status;
        let statusText;
        let body;
        if (d._admEndpointId) {
          const query = 'mutation forgetEndpoint($input: ForgetEndpointInput!) { forgetEndpoint(forgetEndpointInput: $input) { endpointId } }';
          const res = await fetch(API_ENDPOINTS, {
            method: 'POST',
            headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({ operationName: 'forgetEndpoint', query, variables: { input: { endpointId: d._admEndpointId } } }),
          });
          body = await res.json().catch(() => null);
          const forgottenId = body?.data?.forgetEndpoint?.endpointId;
          const error = body?.errors?.[0]?.message;
          if (!res.ok || error || forgottenId !== d._admEndpointId) throw new Error(error || (language === 'de' ? 'Alexa hat die Loeschung nicht bestaetigt.' : 'Alexa did not confirm the deletion.'));
          status = res.status;
          statusText = 'vergessen';
        } else {
          const res = await fetch(API_DELETE_LEGACY(d._admApplianceId), { method: 'DELETE', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }});
          body = await res.text().catch(() => '');
          status = res.status;
          statusText = res.statusText;
        }
        log(`${status} ${statusText} - ${d.displayName}`);
        state.lastDeleted.push({ id: d.id, endpointId: d._admEndpointId, applianceId: d._admApplianceId, name: d.displayName, status, statusText, body: typeof body === 'string' ? body.slice(0, 500) : body });
      } catch (e) {
        log(`${t('error')} - ${d.displayName}: ${e.message}`);
        state.lastDeleted.push({ id: d.id, endpointId: d._admEndpointId, applianceId: d._admApplianceId, name: d.displayName, error: e.message });
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    state.running = false;
    $('admDelete').disabled = false;
    log(t('deleteDone'));
    await loadDevices().then(() => {
      const remaining = state.lastDeleted.filter(entry => state.devices.some(d => (entry.endpointId && d._admEndpointId === entry.endpointId) || (!entry.endpointId && d._admApplianceId === entry.applianceId)));
      const failed = state.lastDeleted.filter(entry => entry.error);
      if (remaining.length || failed.length) {
        log(t('verificationPartial', { remaining: remaining.length, total: state.lastDeleted.length, failed: failed.length }));
      } else {
        log(t('verificationDeleted', { total: state.lastDeleted.length }));
      }
    }).catch(e => log(t('reloadError', { error: e.message })));
  }

  async function setEnablement(enabled) {
    if (state.running) return;
    const target = enabled ? 'ENABLED' : 'DISABLED_BY_CUSTOMER';
    const list = selectedDevices().filter(d => !isEnablementProtected(d) && d._admEnablement !== target);
    const action = enabled ? t('activate') : t('deactivate');
    if (!list.length) { log(t('noneForAction', { action })); return; }

    const names = list.slice(0, 8).map(d => d.displayName).join(', ') + (list.length > 8 ? ` ... +${list.length - 8}` : '');
    const ok = confirm(t('enableQuestion', { count: list.length, action, names }));
    if (!ok) return;
    const confirmation = enabled ? (language === 'de' ? 'AKTIVIEREN' : 'ENABLE') : (language === 'de' ? 'DEAKTIVIEREN' : 'DISABLE');
    const typed = prompt(enabled ? t('typeEnable') : t('typeDisable'));
    if (typed !== confirmation) { log(t('confirmationMissing')); return; }

    const query = `mutation setEndpointEnablement($input: SetEndpointEnablementInput!) {
      setEndpointEnablement(input: $input) {
        endpoint { endpointId: id enablement }
        error { __typename }
      }
    }`;
    state.running = true;
    $('admDisable').disabled = true;
    $('admEnable').disabled = true;
    state.lastEnablement = [];
    const delay = Math.max(100, Number($('admDelay').value || 300));
    log(t('actionStart', { action, count: list.length }));

    for (const d of list) {
      try {
        const res = await fetch(API_ENDPOINTS, {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName: 'setEndpointEnablement', query, variables: { input: { endpointId: d._admEndpointId, enablement: target } } }),
        });
        const body = await res.json().catch(() => null);
        const result = body?.data?.setEndpointEnablement;
        const error = body?.errors?.[0]?.message || result?.error?.__typename;
        const actual = result?.endpoint?.enablement;
        if (!res.ok || error || actual !== target) throw new Error(error || `${t('alexa')} ${actual || t('noStatus')}`);
        log(`${res.status} - ${d.displayName}: ${actual}`);
        state.lastEnablement.push({ id: d.id, endpointId: d._admEndpointId, name: d.displayName, target, success: true });
      } catch (e) {
        log(`${t('error')} - ${d.displayName}: ${e.message}`);
        state.lastEnablement.push({ id: d.id, endpointId: d._admEndpointId, name: d.displayName, target, success: false, error: e.message });
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    state.running = false;
    $('admDisable').disabled = false;
    $('admEnable').disabled = false;
    log(t('actionDone', { action: action[0].toUpperCase() + action.slice(1) }));
    await loadDevices().then(() => {
      const failed = state.lastEnablement.filter(entry => {
        const device = state.devices.find(d => d._admEndpointId === entry.endpointId);
        return !entry.success || device?._admEnablement !== entry.target;
      });
      log(failed.length ? t('verificationActionPartial', { failed: failed.length, total: state.lastEnablement.length }) : t('verificationActionDone', { total: state.lastEnablement.length }));
    }).catch(e => log(t('reloadError', { error: e.message })));
  }

  $('admLanguage').addEventListener('change', event => {
    language = event.target.value === 'en' ? 'en' : 'de';
    localStorage.setItem('admLanguage', language);
    applyLanguage();
    log(t('ready'));
  });
  $('admReload').addEventListener('click', () => loadDevices().catch(e => log(`${t('error')}: ${e.message}`)));
  $('admClose').addEventListener('click', () => root.remove());
  ['admSearch','admGroup','admType','admSource','admOnlyHA','admHideProtected','admIncludeGroups','admIncludeEcho'].forEach(id => $(id).addEventListener('input', applyFilter));
  $('admSelectVisible').addEventListener('click', () => selectWhere(d => state.filtered.includes(d)));
  $('admSelectGroup').addEventListener('click', () => { const m = activeGroupMembers(); selectWhere(d => m.has(d.id)); });
  $('admSelectHA').addEventListener('click', () => selectWhere(isHA));
  $('admClear').addEventListener('click', () => { state.selected.clear(); applyFilter(); });
  $('admDryRun').addEventListener('click', dryRun);
  $('admDisable').addEventListener('click', () => setEnablement(false).catch(e => log(`${t('error')}: ${e.message}`)));
  $('admEnable').addEventListener('click', () => setEnablement(true).catch(e => log(`${t('error')}: ${e.message}`)));
  $('admDelete').addEventListener('click', () => deleteSelected().catch(e => log(`${t('error')}: ${e.message}`)));
  $('admExportJson').addEventListener('click', () => download(`alexa-devices-${new Date().toISOString().replace(/[:.]/g,'-')}.json`, JSON.stringify(state.devices, null, 2), 'application/json'));
  $('admExportCsv').addEventListener('click', () => {
    const header = ['id','endpointId','displayName','description','source','categoryType','deviceType','availability','reachability','enablement'];
    const lines = [header.join(',')].concat(state.devices.map(d => [d.id,d._admEndpointId,d.displayName,d.description,source(d),category(d),deviceType(d),d.availability,d._admReachability,d._admEnablement].map(csvEscape).join(',')));
    download(`alexa-devices-${new Date().toISOString().replace(/[:.]/g,'-')}.csv`, lines.join('\n'), 'text/csv');
  });

  applyLanguage();
  logBox.textContent = t('ready');
  loadDevices().catch(e => log(`${t('error')}: ${e.message}`));
})();
