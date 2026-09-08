import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Wifi, WifiOff, Trash2, RefreshCw, ChevronUp, ChevronDown, Download, Terminal, CheckSquare, Square, Shield, MoreHorizontal, Moon, Speaker, Monitor, Zap, Thermometer, Radio, Lightbulb, Smartphone, Info, AlertTriangle, Home, Layers, Power } from 'lucide-react';
import { useAlexa } from './hooks/useAlexa';

// Legacy V1 helpers for Tags/Sources
const isHA = (d) => String(d.description || '').toLowerCase().includes('via home assistant') || String(d.description || '').toLowerCase().includes('home assistant');
const isGroup = (d) => d.providerData?.categoryType === 'GROUP';
const isEcho = (d) => d.providerData?.deviceType === 'ALEXA_VOICE_ENABLED' || String(d.description || '').includes('Amazon intelligentes Gerät') || String(d.description || '').includes('Amazon intelligentes Ger');
const hasEndpointId = (d) => Boolean(d._admEndpointId);
const source = (d) => {
  const text = `${d.description || ''} ${d.manufacturerName || ''} ${d.displayName || ''}`.toLowerCase();
  if (text.includes('via home assistant') || text.includes('home assistant')) return 'HA';
  if (text.includes('iobroker') || text.includes('io.broker')) return 'ioBroker';
  if (text.includes('homey')) return 'Homey';
  if (isEcho(d) || text.includes('amazon')) return 'Amazon';
  return 'Amazon'; // Default for the mockup which has mostly Amazon
};

const getIcon = (d) => {
  const type = (d.providerData?.deviceType || d.icon?.value || d.deviceFamily || '').toLowerCase();
  if (type.includes('audio') || isEcho(d)) return <Speaker className="w-4 h-4 text-[#00A3FF]" />;
  if (type.includes('display')) return <Monitor className="w-4 h-4 text-[#00A3FF]" />;
  if (type.includes('plug') || type.includes('switch')) return <Zap className="w-4 h-4 text-[#00A3FF]" />;
  if (type.includes('thermostat')) return <Thermometer className="w-4 h-4 text-[#00A3FF]" />;
  if (type.includes('sensor')) return <Radio className="w-4 h-4 text-[#00A3FF]" />;
  if (type.includes('light')) return <Lightbulb className="w-4 h-4 text-[#00A3FF]" />;
  if (type.includes('phone') || type.includes('mobile')) return <Smartphone className="w-4 h-4 text-[#00A3FF]" />;
  return <Smartphone className="w-4 h-4 text-[#00A3FF]" />;
};

const getImage = (d) => {
  if (typeof chrome === 'undefined' || !chrome.runtime?.getURL) return '';
  const type = (d.providerData?.deviceType || d.icon?.value || '').toLowerCase();
  if (type.includes('plug')) return chrome.runtime.getURL('plug.jpg');
  if (type.includes('light')) return chrome.runtime.getURL('light.jpg');
  if (type.includes('camera')) return chrome.runtime.getURL('camera.jpg');
  if (type.includes('blind')) return chrome.runtime.getURL('blind.jpg');
  if (type.includes('switch')) return chrome.runtime.getURL('switch.jpg');
  return chrome.runtime.getURL('echo.jpg');
};

const defaultColOrder = ['name', 'description', 'type', 'actions', 'status', 'source', 'id'];
const colDefs = {
  name: { label: 'Name', sortable: 'name' },
  description: { label: 'Beschreibung', sortable: 'description' },
  type: { label: 'Typ', sortable: 'type' },
  actions: { label: '', sortable: null },
  status: { label: 'Status', sortable: 'status' },
  source: { label: 'Quelle', sortable: null },
  id: { label: 'ID', sortable: null }
};

export default function App() {
  const { devices, loading, error, fetchDevices, logs, logger, deleteDevices, toggleDevices, switchDeviceState, sendTTS } = useAlexa();
  const [selectedId, setSelectedId] = useState(null);
  const [checkedIds, setCheckedIds] = useState(new Set());
  const [search, setSearch] = useState('');
  const [searchHeader, setSearchHeader] = useState('');
  
  // Filters
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [onlyDeletable, setOnlyDeletable] = useState(false);
  const [hideProtected, setHideProtected] = useState(true);
  const [powerStates, setPowerStates] = useState({});
  
  const [sortConfig, setSortConfig] = useState({ key: 'name', dir: 'asc' });
  const logEndRef = useRef(null);

  const [colOrder, setColOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_col_order');
      if (saved) {
         const parsed = JSON.parse(saved);
         if (parsed.length === defaultColOrder.length) return parsed;
      }
    } catch(e) {}
    return defaultColOrder;
  });

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('colId', id);
  };
  const handleDrop = (e, dropId) => {
    const dragId = e.dataTransfer.getData('colId');
    if (!dragId || dragId === dropId) return;
    const newOrder = [...colOrder];
    const dragIdx = newOrder.indexOf(dragId);
    newOrder.splice(dragIdx, 1);
    const dropIdx = newOrder.indexOf(dropId);
    newOrder.splice(dropIdx, 0, dragId);
    setColOrder(newOrder);
    localStorage.setItem('aura_col_order', JSON.stringify(newOrder));
  };

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const isDeviceOnline = (d) => d._admReachability === 'OK' || d.availability === 'ONLINE' || d.availability === 'AVAILABLE';
  const isDeviceOffline = (d) => !isDeviceOnline(d);

  const onlineCount = devices.filter(isDeviceOnline).length;
  const offlineCount = devices.filter(isDeviceOffline).length;
  const deletableCount = devices.filter(d => d._admEndpointId || d._admApplianceId).length;
  const haCount = devices.filter(isHA).length;
  const groupCount = devices.filter(isGroup).length;
  const defektCount = devices.filter(d => !hasEndpointId(d)).length;
  const echoCount = devices.filter(isEcho).length;

  const handleSort = (key) => setSortConfig(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }));

  const filteredAndSortedDevices = useMemo(() => {
    let result = devices.filter(d => {
      const isOnline = isDeviceOnline(d);
      const isDeletable = Boolean(d._admEndpointId || d._admApplianceId);
      const isProtected = !isDeletable || isGroup(d) || isEcho(d);
      
      if (hideProtected && isProtected) return false;
      if (onlyDeletable && !isDeletable) return false;
      if (statusFilter === 'ONLINE' && !isOnline) return false;
      if (statusFilter === 'OFFLINE' && isOnline) return false;
      if (statusFilter === 'ECHO' && !isEcho(d)) return false;
      
      const devSource = source(d);
      if (sourceFilter !== 'ALL' && devSource !== sourceFilter) return false;
      
      const devType = (d.providerData?.deviceType || d.icon?.value || d.deviceFamily || 'UNKNOWN').toUpperCase();
      if (typeFilter !== 'ALL' && devType !== typeFilter) return false;
      
      const q = search.toLowerCase() || searchHeader.toLowerCase();
      if (q) {
        const dName = (d.displayName || d.friendlyNameObject?.value?.text || 'Unbekannt').toLowerCase();
        const dDesc = (d.description || '').toLowerCase();
        const dId = (d._admEndpointId || '').toLowerCase();
        if (!dName.includes(q) && !dDesc.includes(q) && !dId.includes(q)) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      const getVal = (d) => {
        if (sortConfig.key === 'name') return (d.displayName || d.friendlyNameObject?.value?.text || 'Unbekannt').toLowerCase();
        if (sortConfig.key === 'description') return (d.description || '').toLowerCase();
        if (sortConfig.key === 'type') return (d.providerData?.deviceType || d.icon?.value || d.deviceFamily || '').toLowerCase();
        if (sortConfig.key === 'status') return d._admReachability === 'OK' ? '1' : d._admReachability === 'UNAVAILABLE' ? '4' : '2';
        return '';
      };
      const valA = getVal(a);
      const valB = getVal(b);
      if (valA < valB) return sortConfig.dir === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.dir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [devices, typeFilter, statusFilter, sourceFilter, onlyDeletable, search, searchHeader, sortConfig]);

  const selectedDevice = devices.find(d => d.id === selectedId);

  const toggleCheck = (id) => {
    const next = new Set(checkedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setCheckedIds(next);
  };
  const toggleAll = () => {
    if (checkedIds.size === filteredAndSortedDevices.length) setCheckedIds(new Set());
    else setCheckedIds(new Set(filteredAndSortedDevices.map(d => d.id)));
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(devices, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alexa-devices-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;
    a.click();
    logger('JSON Backup gesichert.');
  };

  const handleBulkDelete = async () => {
    const list = devices.filter(d => checkedIds.has(d.id));
    if (!list.length) return alert('Keine Geräte ausgewählt');
    if (!confirm(`Dauerhaft aus Alexa löschen?\n\n${list.length} Geräte\n\nVorher JSON sichern!`)) return;
    if (prompt('Zur Bestätigung DELETE eingeben:') !== 'DELETE') return;
    await deleteDevices(list);
    setCheckedIds(new Set());
  };

  const handleBulkToggle = async (enable) => {
    const list = devices.filter(d => checkedIds.has(d.id));
    if (!list.length) return alert('Keine Geräte ausgewählt');
    if (!confirm(`Ausgewählte Geräte ${enable ? 'Aktivieren' : 'Deaktivieren'}?\n\n${list.length} Geräte`)) return;
    await toggleDevices(list, enable);
  };

  // Distinct values for dropdowns
  const types = [...new Set(devices.map(d => (d.providerData?.deviceType || d.icon?.value || d.deviceFamily || 'UNKNOWN').toUpperCase()))].sort();
  const sources = [...new Set(devices.map(d => source(d)))].sort();

  return (
    <div className="h-screen max-h-screen bg-[#0E131F] text-[#94A3B8] font-sans p-4 flex flex-col gap-4 overflow-hidden">
      {/* Top Header */}
      <header className="flex-none flex justify-between items-center bg-[#131B2B] p-3 px-5 rounded-2xl border border-[#1E293B] shadow-lg">
        <div className="flex items-center gap-4">
          <img src={typeof chrome !== 'undefined' && chrome.runtime?.getURL ? chrome.runtime.getURL('icon128.png') : ''} alt="Aura Logo" className="w-12 h-12" />
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">Aura Device Master</h1>
            <p className="text-xs text-slate-400">Verwalte, sichere und lösche deine Alexa-Geräte – schnell und einfach.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Geräte suchen ... (Name, Typ, ID)" value={searchHeader} onChange={(e) => setSearchHeader(e.target.value)} className="bg-[#0A0F18] border border-[#1E293B] rounded-full pl-10 pr-4 py-2 text-sm focus:border-[#007AFF] focus:outline-none w-72 text-white" />
          </div>
          <button className="p-2 rounded-full border border-[#1E293B] hover:bg-[#1E293B] transition"><Moon className="w-4 h-4" /></button>
          <select className="bg-[#0A0F18] border border-[#1E293B] rounded-lg px-3 py-2 text-sm appearance-none outline-none">
            <option>Deutsch</option>
          </select>
          <button onClick={fetchDevices} className="flex items-center gap-2 bg-[#007AFF] hover:bg-[#0066CC] text-white font-medium py-2 px-5 rounded-lg shadow-[0_0_15px_rgba(0,122,255,0.4)] transition-all">
            <Download className="w-4 h-4" /> Daten laden <span className="w-2 h-2 rounded-full bg-[#00FF88] ml-2 shadow-[0_0_8px_#00FF88]"></span>
          </button>
        </div>
      </header>
      
      {/* KPI & Banner Row */}
      <div className="flex-none flex gap-4">
        <div className="flex-1 grid grid-cols-9 gap-3">
          <div className="bg-[#131B2B] border border-[#1E293B] rounded-2xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#00A3FF]/10 flex items-center justify-center text-[#00A3FF]">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xl font-bold text-white leading-tight">{devices.length}</div>
              <div className="text-[10px] text-slate-400">Gesamt</div>
            </div>
          </div>
          <div className="bg-[#131B2B] border border-[#1E293B] rounded-2xl p-3 flex items-center gap-3 shadow-[0_0_15px_rgba(34,197,94,0.05)]">
            <div className="w-8 h-8 rounded-xl bg-[#00FF88]/10 flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00FF88] shadow-[0_0_8px_#00FF88]"></span>
            </div>
            <div>
              <div className="text-xl font-bold text-white leading-tight">{onlineCount}</div>
              <div className="text-[10px] text-slate-400">Online</div>
            </div>
          </div>
          <div className="bg-[#131B2B] border border-[#1E293B] rounded-2xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-700/30 flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
            </div>
            <div>
              <div className="text-xl font-bold text-white leading-tight">{offlineCount}</div>
              <div className="text-[10px] text-slate-400">Offline</div>
            </div>
          </div>
          <div className="bg-[#131B2B] border border-[#1E293B] rounded-2xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#FF9500]/10 flex items-center justify-center text-[#FF9500]">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xl font-bold text-white leading-tight">{defektCount}</div>
              <div className="text-[10px] text-slate-400">Defekt</div>
            </div>
          </div>
          <div className="bg-[#131B2B] border border-[#1E293B] rounded-2xl p-3 flex items-center gap-3 cursor-pointer hover:bg-[#1E293B] transition" onClick={() => {setStatusFilter('ECHO'); setHideProtected(false);}}>
            <div className="w-8 h-8 rounded-xl bg-[#00FFFF]/10 flex items-center justify-center text-[#00FFFF]">
              <Speaker className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xl font-bold text-white leading-tight">{echoCount}</div>
              <div className="text-[10px] text-slate-400">Echos</div>
            </div>
          </div>
          <div className="bg-[#131B2B] border border-[#1E293B] rounded-2xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#007AFF]/10 flex items-center justify-center text-[#007AFF]">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xl font-bold text-white leading-tight">{haCount}</div>
              <div className="text-[10px] text-slate-400">HA</div>
            </div>
          </div>
          <div className="bg-[#131B2B] border border-[#1E293B] rounded-2xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#AF52DE]/10 flex items-center justify-center text-[#AF52DE]">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xl font-bold text-white leading-tight">{groupCount}</div>
              <div className="text-[10px] text-slate-400">Gruppen</div>
            </div>
          </div>
          <div className="bg-[#131B2B] border border-[#1E293B] rounded-2xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#FF3B30]/10 flex items-center justify-center text-[#FF3B30]">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xl font-bold text-white leading-tight">{deletableCount}</div>
              <div className="text-[10px] text-slate-400">Löschbar</div>
            </div>
          </div>
          <div className="bg-[#131B2B] border border-[#1E293B] rounded-2xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-700/30 flex items-center justify-center text-slate-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xl font-bold text-white leading-tight">0</div>
              <div className="text-[10px] text-slate-400">Geschützt</div>
            </div>
          </div>
        </div>
        <div className="w-[400px] flex-none bg-[#0A101A] rounded-2xl border border-[#1E293B] p-4 flex items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#007AFF] blur-[80px] opacity-20"></div>
          <div className="relative z-10 w-full text-center lg:text-left pl-2">
            <div className="text-[#00A3FF] font-bold text-xl leading-tight">Dein Zuhause.</div>
            <div className="text-[#00A3FF] font-bold text-xl leading-tight">Deine Kontrolle.</div>
            <div className="text-xs text-slate-400 mt-1">Schnell. Sicher. Übersichtlich.</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 flex gap-4">
        
        {/* Left Side: Table & Filters */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Action & Filter Bar */}
          <div className="flex-none flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Geräte filtern ..." value={search} onChange={e => setSearch(e.target.value)} className="bg-[#0A0F18] border border-[#1E293B] rounded-lg pl-9 pr-4 py-2 text-sm focus:border-[#007AFF] outline-none text-white w-48" />
              </div>
              
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="bg-[#0A0F18] border border-[#1E293B] rounded-lg px-3 py-2 text-sm outline-none text-slate-300 min-w-[140px]">
                <option value="ALL">Alle Gerätetypen</option>
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-[#0A0F18] border border-[#1E293B] rounded-lg px-3 py-2 text-sm outline-none text-slate-300 min-w-[120px]">
                <option value="ALL">Alle Status</option>
                <option value="ONLINE">Online</option>
                <option value="OFFLINE">Offline</option>
              </select>

              <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} className="bg-[#0A0F18] border border-[#1E293B] rounded-lg px-3 py-2 text-sm outline-none text-slate-300 min-w-[120px]">
                <option value="ALL">Alle Quellen</option>
                {sources.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer ml-3">
                <input type="checkbox" checked={hideProtected} onChange={e => setHideProtected(e.target.checked)} className="w-4 h-4 rounded border-[#1E293B]" />
                Geschützte ausblenden
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer ml-3">
                <input type="checkbox" checked={onlyDeletable} onChange={e => setOnlyDeletable(e.target.checked)} className="w-4 h-4 rounded border-[#1E293B]" />
                Nur löschbare anzeigen
              </label>
            </div>
            
            <div className="flex items-center gap-2">
              <button onClick={exportJson} className="flex items-center gap-2 bg-[#0A1D3A] hover:bg-[#102A54] text-[#00A3FF] border border-[#1E3A5F] px-4 py-2 rounded-lg text-sm font-medium transition">
                <Download className="w-4 h-4" /> Sichern
              </button>
              <button onClick={() => handleBulkToggle(false)} className="flex items-center gap-2 bg-[#1C2534] hover:bg-[#253041] border border-[#2E3C51] text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                <Power className="w-4 h-4" /> Deaktivieren
              </button>
              <button onClick={handleBulkDelete} className="flex items-center gap-2 bg-[#A11B1B] hover:bg-[#8A1717] border border-[#B32020] text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                <Trash2 className="w-4 h-4" /> Löschen
              </button>
              <button className="p-2 bg-[#0A0F18] border border-[#1E293B] rounded-lg hover:bg-[#1E293B]">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 bg-[#131B2B] rounded-2xl border border-[#1E293B] overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-[#0B111A] sticky top-0 z-10">
                  <tr>
                    <th className="p-3 pl-4 w-12 border-b border-[#1E293B]">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer ${checkedIds.size > 0 && checkedIds.size === filteredAndSortedDevices.length ? 'bg-[#007AFF] border-[#007AFF]' : 'border-slate-500'}`} onClick={toggleAll}>
                        {checkedIds.size > 0 && checkedIds.size === filteredAndSortedDevices.length ? <CheckSquare className="w-3 h-3 text-white" /> : null}
                      </div>
                    </th>
                    {colOrder.map(colId => (
                      <th
                        key={colId}
                        draggable
                        onDragStart={(e) => handleDragStart(e, colId)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, colId)}
                        className={`p-3 font-medium text-slate-300 border-b border-[#1E293B] cursor-move select-none hover:bg-[#1E293B]/50 transition-colors ${colId === 'actions' ? 'w-20' : ''}`}
                        onClick={() => colDefs[colId].sortable && handleSort(colDefs[colId].sortable)}
                        title="Ziehen, um die Spalte zu verschieben"
                      >
                        {colDefs[colId].label}
                        {colDefs[colId].sortable && <ChevronUp className="w-3 h-3 inline-block ml-1 opacity-50"/>}
                      </th>
                    ))}
                    <th className="p-3 border-b border-[#1E293B]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]/50">
                  {filteredAndSortedDevices.map(d => {
                    const isChecked = checkedIds.has(d.id);
                    const isSelected = selectedId === d.id;
                    const isOnline = isDeviceOnline(d);
                    const typeStr = (d.providerData?.deviceType || d.icon?.value || d.deviceFamily || 'UNKNOWN').toUpperCase();
                    const sourceStr = source(d);
                    
                    return (
                      <tr key={d.id} onClick={() => setSelectedId(d.id)} className={`cursor-pointer transition-colors ${isSelected ? 'bg-[#007AFF]/10' : 'hover:bg-[#1E293B]/30'}`}>
                        <td className="p-3 pl-4" onClick={(e) => { e.stopPropagation(); toggleCheck(d.id); }}>
                          <div className={`w-4 h-4 rounded flex items-center justify-center border ${isChecked ? 'bg-[#007AFF] border-[#007AFF]' : 'border-slate-500'}`}>
                            {isChecked && <CheckSquare className="w-4 h-4 text-white opacity-0" />}
                          </div>
                        </td>
                        {colOrder.map(colId => (
                          <React.Fragment key={colId}>
                            {colId === 'name' && (
                              <td className="p-3 font-medium text-white flex items-center gap-3">
                                {getIcon(d)}
                                {d.displayName || d.friendlyNameObject?.value?.text || 'Unbekannt'}
                              </td>
                            )}
                            {colId === 'description' && (
                              <td className="p-3 text-slate-400">{d.description || '-'}</td>
                            )}
                            {colId === 'type' && (
                              <td className="p-3">
                                <span className="bg-[#1C2534] text-[#94A3B8] text-[10px] px-3 py-1 rounded-full border border-[#2E3C51] font-semibold tracking-wider">{typeStr}</span>
                              </td>
                            )}
                            {colId === 'actions' && (
                              <td className="p-3 whitespace-nowrap w-20">
                                <div className="flex gap-2">
                                  <button onClick={(e) => { e.stopPropagation(); toggleDevices([d], d._admEnablement === 'DISABLED_BY_CUSTOMER' ? true : false); }} className="p-1.5 text-slate-400 hover:text-[#00A3FF] transition" title="Aktivieren/Deaktivieren (Sichtbarkeit)">
                                    <Shield className="w-4 h-4" />
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); if (hasEndpointId(d) && confirm('Wirklich löschen?')) deleteDevices([d]); }} className={`p-1.5 transition ${hasEndpointId(d) ? 'text-slate-400 hover:text-[#FF3B30]' : 'text-slate-700 cursor-not-allowed'}`} title="Löschen">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            )}
                            {colId === 'status' && (
                              <td className="p-3">
                                <div className="flex items-start gap-2">
                                  {d._admReachability === 'OK' ? (
                                     <><span className="w-3 h-3 mt-0.5 rounded-full bg-[#00C853] shadow-[0_0_8px_#00C853]"></span><div><div className="text-[#00C853] font-medium leading-none">AVAILABLE</div></div></>
                                  ) : d._admReachability === 'UNAVAILABLE' ? (
                                     <><span className="w-3 h-3 mt-0.5 rounded-full bg-[#FF3B30]"></span><div><div className="text-[#FF3B30] font-medium leading-none">UNREACHABLE</div></div></>
                                  ) : d._admReachability ? (
                                     <><span className="w-3 h-3 mt-0.5 rounded-full bg-yellow-500"></span><div><div className="text-yellow-500 font-medium leading-none">{d._admReachability}</div></div></>
                                  ) : d.availability ? (
                                     <><span className="w-3 h-3 mt-0.5 rounded-full bg-slate-400"></span><div><div className="text-slate-400 font-medium leading-none">{d.availability}</div></div></>
                                  ) : (
                                     <><span className="w-3 h-3 mt-0.5 rounded-full bg-slate-700"></span><div><div className="text-slate-500 font-medium leading-none">-</div></div></>
                                  )}
                                </div>
                              </td>
                            )}
                            {colId === 'source' && (
                              <td className="p-3 text-slate-300">{sourceStr}</td>
                            )}
                            {colId === 'id' && (
                              <td className="p-3 text-slate-400 font-mono text-xs truncate max-w-[140px]">{d._admEndpointId || d._admApplianceId || '-'}</td>
                            )}
                          </React.Fragment>
                        ))}
                        <td className="p-3 text-slate-500 text-right"><MoreHorizontal className="w-4 h-4 inline-block" /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-[400px] flex-none bg-[#131B2B] rounded-2xl border border-[#1E293B] p-5 flex flex-col gap-6 overflow-y-auto">
          {selectedDevice ? (
            <>
              {/* Header section with glowing image */}
              <div className="flex gap-4 relative">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-b from-[#1C2534] to-[#0A1018] border border-[#1E293B] flex items-center justify-center p-2 relative shadow-lg">
                   <img src={getImage(selectedDevice)} alt="device" className="max-w-full max-h-full object-contain relative z-10 drop-shadow-2xl" onError={(e) => e.target.style.display='none'} />
                   <div className="absolute bottom-[-10px] w-16 h-3 bg-[#00FFFF] blur-xl opacity-60"></div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold text-white leading-tight pr-4">{selectedDevice.displayName || selectedDevice.friendlyNameObject?.value?.text || 'Unbekannt'}</h2>
                    <MoreHorizontal className="w-5 h-5 text-slate-500 cursor-pointer" />
                  </div>
                  <p className="text-slate-400 text-sm mt-1">{selectedDevice.description || 'Keine Beschreibung'}</p>
                </div>
              </div>

              {/* NEW ICON TOOLBAR (Grüner Kasten) */}
              <div className="bg-[#0A0F18] border border-[#1E293B] rounded-xl p-2 flex justify-between items-center px-4">
                <button onClick={exportJson} className="p-2 text-slate-400 hover:text-[#00A3FF] transition" title="Sichern">
                  <Download className="w-5 h-5" />
                </button>
                <button onClick={() => toggleDevices([selectedDevice], selectedDevice._admEnablement === 'DISABLED_BY_CUSTOMER' ? true : false)} className="p-2 text-slate-400 hover:text-white transition" title="Aktivieren/Deaktivieren (Sichtbarkeit)">
                  <Shield className="w-5 h-5" />
                </button>
                <button onClick={() => { if(hasEndpointId(selectedDevice) && confirm('Wirklich permanent löschen?')) { setCheckedIds(new Set([selectedDevice.id])); deleteDevices([selectedDevice]); } }} className={`p-2 transition ${hasEndpointId(selectedDevice) ? 'text-slate-400 hover:text-[#FF3B30]' : 'text-slate-700 cursor-not-allowed'}`} title="Löschen">
                  <Trash2 className="w-5 h-5" />
                </button>
                <div className="w-px h-6 bg-[#1E293B] mx-2"></div>
                <button onClick={() => {
                   const isCurrentlyOn = powerStates[selectedDevice.id] || false;
                   switchDeviceState(selectedDevice, !isCurrentlyOn);
                   setPowerStates(prev => ({ ...prev, [selectedDevice.id]: !isCurrentlyOn }));
                }} className={`p-2 transition rounded-full shadow-lg ${powerStates[selectedDevice.id] ? 'text-[#00C853] hover:text-[#00E676] shadow-[#00C853]/20' : 'text-[#FF3B30] hover:text-[#FF5252] shadow-[#FF3B30]/20'}`} title="Gerät Schalten (On/Off)">
                  <Power className="w-5 h-5" />
                </button>
                <button onClick={() => alert('Bitte nicht stören wird übermittelt...')} className="p-2 text-slate-400 hover:text-purple-400 transition ml-2" title="Bitte nicht stören (DND)">
                  <Moon className="w-5 h-5" />
                </button>
              </div>

              {/* Data Grid */}
              <div className="bg-[#0A0F18] border border-[#1E293B] rounded-xl p-4 text-sm space-y-3">
                <div className="flex items-center"><div className="w-32 text-slate-400">Typ</div><div className="text-slate-200 font-medium">{(selectedDevice.providerData?.deviceType || selectedDevice.icon?.value || 'UNKNOWN').toUpperCase()}</div></div>
                <div className="flex items-center">
                  <div className="w-32 text-slate-400">Status</div>
                  <div className="flex items-center gap-2">
                    {selectedDevice._admReachability === 'OK' ? (
                      <><span className="w-2.5 h-2.5 rounded-full bg-[#00C853] shadow-[0_0_8px_#00C853]"></span><span className="font-medium text-[#00C853]">AVAILABLE</span></>
                    ) : selectedDevice._admReachability === 'UNAVAILABLE' ? (
                      <><span className="w-2.5 h-2.5 rounded-full bg-[#FF3B30]"></span><span className="font-medium text-[#FF3B30]">UNREACHABLE</span></>
                    ) : selectedDevice._admReachability ? (
                      <><span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span><span className="font-medium text-yellow-500">{selectedDevice._admReachability}</span></>
                    ) : selectedDevice.availability ? (
                      <><span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span><span className="font-medium text-slate-400">{selectedDevice.availability}</span></>
                    ) : (
                      <><span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span><span className="font-medium text-slate-500">-</span></>
                    )}
                  </div>
                </div>
                <div className="flex items-center"><div className="w-32 text-slate-400">Quelle</div><div className="text-slate-200 font-medium">{source(selectedDevice)}</div></div>
                <div className="flex items-center"><div className="w-32 text-slate-400">Geräte-ID</div><div className="text-slate-200 font-mono text-xs truncate max-w-[150px]">{selectedDevice._admEndpointId || selectedDevice._admApplianceId || '-'}</div></div>
                <div className="flex"><div className="w-32 text-slate-400">Beschreibung</div><div className="text-slate-200 font-medium truncate">{selectedDevice.description || '-'}</div></div>
                <div className="flex"><div className="w-32 text-slate-400">Löschbar</div><div className={`font-bold ${hasEndpointId(selectedDevice) ? 'text-[#00C853]' : 'text-slate-500'}`}>{hasEndpointId(selectedDevice) ? 'Ja' : 'Nein'}</div></div>
                <div className="flex"><div className="w-32 text-slate-400">Geschützt</div><div className="text-slate-200 font-medium">Nein</div></div>
                <div className="flex items-center"><div className="w-32 text-slate-400">Letzte Aktivität</div><div className="text-slate-200 font-medium">{new Date().toLocaleDateString('de-DE')}, {new Date().toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'})}</div></div>
              </div>

              {/* TTS / Alexa Speak Area */}
              {isEcho(selectedDevice) ? (
                <div className="bg-[#0A0F18] border border-[#1E293B] rounded-xl p-3 flex flex-col gap-2">
                   <div className="flex justify-between items-center">
                     <span className="text-xs font-semibold text-[#00A3FF] uppercase tracking-wider flex items-center gap-2"><Speaker className="w-3 h-3" /> Alexa Sprachausgabe</span>
                   </div>
                   <div className="flex gap-2">
                     <input type="text" id="ttsInput" placeholder="Was soll Alexa sagen?" className="flex-1 bg-[#131B2B] border border-[#2E3C51] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#007AFF]" onKeyDown={(e) => { if(e.key === 'Enter') { sendTTS(selectedDevice, e.target.value); e.target.value = ''; } }} />
                     <button onClick={() => { const i = document.getElementById('ttsInput'); if(i.value) { sendTTS(selectedDevice, i.value); i.value = ''; } }} className="bg-[#007AFF] hover:bg-[#0066CC] text-white px-4 py-2 rounded-lg font-medium transition shadow-lg shadow-[#007AFF]/20">Senden</button>
                   </div>
                </div>
              ) : (
                <div className="bg-[#0A0F18] border border-[#1E293B] rounded-xl p-3 flex items-center justify-center text-slate-600 text-xs text-center">
                   Gerät unterstützt keine Sprachausgabe (TTS).
                </div>
              )}

              {/* CLI Terminal */}
              <div className="flex-1 min-h-[160px] bg-[#0A0F18] border border-[#1E293B] rounded-xl p-3 font-mono text-[11px] text-[#00FF00] overflow-y-auto shadow-inner flex flex-col gap-1">
                <div className="flex items-center gap-2 text-slate-500 border-b border-slate-800 pb-2 mb-2 sticky top-0 bg-[#0A0F18] z-10">
                  <Terminal className="w-4 h-4" /> CLI Terminal
                </div>
                {logs.map((l, i) => <div key={i}>{l}</div>)}
                <div ref={logEndRef} />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-center gap-4">
              <div className="w-24 h-24 rounded-full bg-[#0A101A] border border-[#1E293B] flex items-center justify-center shadow-[0_0_20px_rgba(0,163,255,0.15)] relative">
                <img src={typeof chrome !== 'undefined' && chrome.runtime?.getURL ? chrome.runtime.getURL('icon128.png') : ''} alt="Aura Logo" className="w-16 h-16 opacity-80" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#00A3FF] border-r-[#00FFFF] opacity-30"></div>
              </div>
              <p>Wähle links ein Gerät aus, um Details und Aktionen anzuzeigen.</p>
              
              <div className="w-full mt-8 bg-[#0A0F18] border border-[#1E293B] rounded-xl p-3 font-mono text-[11px] text-[#00FF00] overflow-y-auto shadow-inner flex flex-col gap-1 text-left h-48">
                <div className="flex items-center gap-2 text-slate-500 border-b border-slate-800 pb-2 mb-2 sticky top-0 bg-[#0A0F18] z-10">
                  <Terminal className="w-4 h-4" /> CLI Terminal
                </div>
                {logs.map((l, i) => <div key={i}>{l}</div>)}
                <div ref={logEndRef} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation (Konfigurationen) */}
      <div className="flex-none flex justify-between items-center px-2 py-1 text-sm text-slate-500">
        <div>{checkedIds.size} von {filteredAndSortedDevices.length} Geräten ausgewählt</div>
        
        <div className="flex gap-2">
          <button className="px-4 py-1.5 rounded-md bg-[#1C2534] border border-[#2E3C51] text-white hover:bg-[#253041] transition text-xs font-medium">Konfiguration 1</button>
          <button className="px-4 py-1.5 rounded-md bg-[#1C2534] border border-[#2E3C51] text-white hover:bg-[#253041] transition text-xs font-medium">Konfig 2</button>
          <button className="px-4 py-1.5 rounded-md bg-[#1C2534] border border-[#2E3C51] text-white hover:bg-[#253041] transition text-xs font-medium">Konfig 3</button>
        </div>

        <div className="flex items-center gap-2">
          Einträge pro Seite
          <select className="bg-[#0A0F18] border border-[#1E293B] rounded px-2 py-1 outline-none text-white">
            <option>10</option>
            <option>50</option>
            <option>100</option>
          </select>
        </div>
      </div>

    </div>
  );
}
