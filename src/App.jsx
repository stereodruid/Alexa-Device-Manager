import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Wifi, WifiOff, Trash2, RefreshCw, ChevronUp, ChevronDown, Download, Terminal, CheckSquare, Square, AlertTriangle } from 'lucide-react';
import { useAlexa } from './hooks/useAlexa';

// Legacy V1 helpers for Pills/Tags
const isHA = (d) => String(d.description || '').toLowerCase().includes('via home assistant') || String(d.description || '').toLowerCase().includes('home assistant');
const isGroup = (d) => d.providerData?.categoryType === 'GROUP';
const isEcho = (d) => d.providerData?.deviceType === 'ALEXA_VOICE_ENABLED' || String(d.description || '').includes('Amazon intelligentes Gerät') || String(d.description || '').includes('Amazon intelligentes Ger');
const hasEndpointId = (d) => Boolean(d._admEndpointId);
const source = (d) => {
  const text = `${d.description || ''} ${d.manufacturerName || ''} ${d.displayName || ''}`.toLowerCase();
  if (text.includes('via home assistant') || text.includes('home assistant')) return 'HA';
  if (text.includes('iobroker') || text.includes('io.broker')) return 'ioBroker';
  if (text.includes('homey')) return 'Homey';
  if (isEcho(d) || text.includes('amazon')) return 'Alexa';
  return 'Andere';
};

export default function App() {
  const { devices, loading, error, fetchDevices, logs, logger, deleteDevices, toggleDevices } = useAlexa();
  const [selectedId, setSelectedId] = useState(null);
  const [checkedIds, setCheckedIds] = useState(new Set());
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL'); 
  const [sortConfig, setSortConfig] = useState({ key: 'name', dir: 'asc' });
  const logEndRef = useRef(null);

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
  const haCount = devices.filter(isHA).length;
  const groupCount = devices.filter(isGroup).length;
  const deletableCount = devices.filter(d => d._admEndpointId || d._admApplianceId).length;

  const handleSort = (key) => setSortConfig(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }));

  const filteredAndSortedDevices = useMemo(() => {
    let result = devices.filter(d => {
      const isOnline = isDeviceOnline(d);
      const isDeletable = Boolean(d._admEndpointId || d._admApplianceId);
      
      if (filterType === 'ONLINE' && !isOnline) return false;
      if (filterType === 'OFFLINE' && isOnline) return false;
      if (filterType === 'HA' && !isHA(d)) return false;
      if (filterType === 'GROUP' && !isGroup(d)) return false;
      if (filterType === 'DELETABLE' && !isDeletable) return false;
      if (filterType === 'DEFEKT' && !hasEndpointId(d)) return false; // Basic definition of defect
      
      const q = search.toLowerCase();
      if (q) {
        const dName = (d.displayName || d.friendlyNameObject?.value?.text || 'Unbekannt').toLowerCase();
        const dDesc = (d.description || '').toLowerCase();
        if (!dName.includes(q) && !dDesc.includes(q)) return false;
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
  }, [devices, filterType, search, sortConfig]);

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

  const exportCsv = () => {
    const csvEscape = v => '"' + String(v || '').replace(/"/g, '""') + '"';
    const header = ['id','endpointId','displayName','description','source','categoryType','deviceType','availability','reachability','enablement'];
    const lines = [header.join(',')].concat(devices.map(d => [d.id, d._admEndpointId, d.displayName, d.description, source(d), d.providerData?.categoryType, d.providerData?.deviceType, d.availability, d._admReachability, d._admEnablement].map(csvEscape).join(',')));
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alexa-devices-${new Date().toISOString().replace(/[:.]/g,'-')}.csv`;
    a.click();
    logger('CSV Export gesichert.');
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

  return (
    <div className="h-screen max-h-screen bg-bgDark text-slate-300 font-sans p-6 flex flex-col gap-4 overflow-hidden">
      {/* Header */}
      <header className="flex-none flex justify-between items-center bg-panel p-4 rounded-2xl shadow-lg border border-slate-700">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-aura flex items-center justify-center text-aura font-bold text-xl shadow-[0_0_15px_rgba(0,210,255,0.4)]">A</div>
          <div>
            <h1 className="text-xl font-bold text-white">Aura Device Master</h1>
            <p className="text-sm text-slate-400">Verwalte, sichere und lösche deine Alexa-Geräte - schnell und einfach.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={exportJson} className="flex items-center gap-2 hover:text-white px-4 py-2 bg-slate-800 rounded-lg border border-slate-600 transition">
            <Download className="w-4 h-4" /> JSON
          </button>
          <button onClick={exportCsv} className="flex items-center gap-2 hover:text-white px-4 py-2 bg-slate-800 rounded-lg border border-slate-600 transition">
            <Download className="w-4 h-4" /> CSV
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Geräte suchen..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-bgDark border border-slate-600 rounded-lg pl-10 pr-4 py-2 focus:border-aura focus:outline-none" />
          </div>
          <button onClick={fetchDevices} className="flex items-center gap-2 bg-aura hover:bg-cyan-400 text-bgDark font-bold py-2 px-6 rounded-lg shadow-[0_0_15px_rgba(0,210,255,0.4)] transition-all">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Neu laden
          </button>
        </div>
      </header>
      
      {/* KPI Cards */}
      <div className="flex-none grid grid-cols-7 gap-4 cursor-pointer select-none">
        <div onClick={() => setFilterType('ALL')} className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${filterType === 'ALL' ? 'bg-aura/10 border-aura shadow-[0_0_15px_rgba(0,210,255,0.2)]' : 'bg-panel border-slate-700 hover:border-slate-500'}`}>
          <div className="text-2xl font-bold text-white">{devices.length}</div>
          <div className="text-sm text-slate-400">Gesamt</div>
        </div>
        <div onClick={() => setFilterType('ONLINE')} className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${filterType === 'ONLINE' ? 'bg-green-500/10 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'bg-panel border-slate-700 hover:border-slate-500'}`}>
          <Wifi className="w-6 h-6 text-green-500" />
          <div><div className="text-xl font-bold text-green-500">{onlineCount}</div><div className="text-xs text-slate-400">Online</div></div>
        </div>
        <div onClick={() => setFilterType('OFFLINE')} className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${filterType === 'OFFLINE' ? 'bg-red-500/10 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-panel border-slate-700 hover:border-slate-500'}`}>
          <WifiOff className="w-6 h-6 text-red-500" />
          <div><div className="text-xl font-bold text-red-500">{offlineCount}</div><div className="text-xs text-slate-400">Offline</div></div>
        </div>
        <div onClick={() => setFilterType('DEFEKT')} className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${filterType === 'DEFEKT' ? 'bg-orange-500/10 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.2)]' : 'bg-panel border-slate-700 hover:border-slate-500'}`}>
          <AlertTriangle className="w-6 h-6 text-orange-500" />
          <div><div className="text-xl font-bold text-orange-500">{devices.filter(d => !hasEndpointId(d)).length}</div><div className="text-xs text-slate-400">Defekt</div></div>
        </div>
        <div onClick={() => setFilterType('HA')} className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${filterType === 'HA' ? 'bg-blue-500/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-panel border-slate-700 hover:border-slate-500'}`}>
          <div className="text-blue-500 font-bold">HA</div>
          <div><div className="text-xl font-bold text-blue-400">{haCount}</div><div className="text-xs text-slate-400">Home Assistant</div></div>
        </div>
        <div onClick={() => setFilterType('GROUP')} className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${filterType === 'GROUP' ? 'bg-purple-500/10 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-panel border-slate-700 hover:border-slate-500'}`}>
          <div className="text-purple-500 font-bold">G</div>
          <div><div className="text-xl font-bold text-purple-400">{groupCount}</div><div className="text-xs text-slate-400">Gruppen</div></div>
        </div>
        <div onClick={() => setFilterType('DELETABLE')} className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${filterType === 'DELETABLE' ? 'bg-red-500/10 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-panel border-slate-700 hover:border-slate-500'}`}>
          <Trash2 className="w-6 h-6 text-red-500" />
          <div><div className="text-xl font-bold text-red-500">{deletableCount}</div><div className="text-xs text-slate-400">Löschbar</div></div>
        </div>
      </div>

      {/* Main Grid: Table (75%) + Sidebar (25%) */}
      <div className="flex-1 min-h-0 grid grid-cols-4 gap-4">
        
        {/* Table Container with Log Panel */}
        <div className="col-span-3 flex flex-col gap-4 overflow-hidden">
          <div className="flex-1 bg-panel rounded-2xl border border-slate-700 flex flex-col overflow-hidden">
            <div className="flex-none p-3 border-b border-slate-700 flex justify-between items-center bg-bgDark/30">
              <h2 className="font-bold text-white flex items-center gap-2">
                Gefundene Geräte: {filteredAndSortedDevices.length} 
                <span className="text-xs font-normal text-slate-500">({checkedIds.size} ausgewählt)</span>
              </h2>
              <div className="flex gap-2">
                <button onClick={() => handleBulkToggle(true)} disabled={!checkedIds.size} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50">Aktivieren</button>
                <button onClick={() => handleBulkToggle(false)} disabled={!checkedIds.size} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50">Deaktivieren</button>
                <button onClick={handleBulkDelete} disabled={!checkedIds.size} className="bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/50 px-3 py-1 rounded text-sm disabled:opacity-50 transition-colors">Löschen</button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="h-full flex items-center justify-center"><RefreshCw className="w-8 h-8 text-aura animate-spin" /></div>
              ) : (
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-[#1e293b] sticky top-0 z-10 shadow-md">
                    <tr>
                      <th className="p-3 w-12 cursor-pointer" onClick={toggleAll}>
                        {checkedIds.size > 0 && checkedIds.size === filteredAndSortedDevices.length ? <CheckSquare className="w-4 h-4 text-aura" /> : <Square className="w-4 h-4 text-slate-500" />}
                      </th>
                      <th className="p-3 text-slate-400 font-semibold cursor-pointer select-none group" onClick={() => handleSort('name')}>Name <ChevronUp className="w-3 h-3 inline-block ml-1 opacity-50"/></th>
                      <th className="p-3 text-slate-400 font-semibold cursor-pointer select-none group" onClick={() => handleSort('description')}>Beschreibung</th>
                      <th className="p-3 text-slate-400 font-semibold cursor-pointer select-none group" onClick={() => handleSort('type')}>Typ</th>
                      <th className="p-3 text-slate-400 font-semibold cursor-pointer select-none group" onClick={() => handleSort('status')}>Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {filteredAndSortedDevices.map(d => {
                      const isChecked = checkedIds.has(d.id);
                      return (
                        <tr key={d.id} onClick={() => setSelectedId(d.id)} className={`hover:bg-slate-700/30 cursor-pointer transition-colors ${selectedId === d.id ? 'bg-aura/10' : ''}`}>
                          <td className="p-3" onClick={(e) => { e.stopPropagation(); toggleCheck(d.id); }}>
                            {isChecked ? <CheckSquare className="w-4 h-4 text-aura" /> : <Square className="w-4 h-4 text-slate-500" />}
                          </td>
                          <td className="p-3 font-medium text-white flex flex-col gap-1 items-start">
                            {d.displayName || d.friendlyNameObject?.value?.text || 'Unbekannt'}
                            <div className="flex gap-1">
                              {isHA(d) && <span className="bg-blue-900/50 text-blue-400 text-[10px] px-1.5 py-0.5 rounded border border-blue-500/30">HA</span>}
                              {isGroup(d) && <span className="bg-purple-900/50 text-purple-400 text-[10px] px-1.5 py-0.5 rounded border border-purple-500/30">GRUPPE</span>}
                              {isEcho(d) && <span className="bg-orange-900/50 text-orange-400 text-[10px] px-1.5 py-0.5 rounded border border-orange-500/30">ECHO</span>}
                              {!hasEndpointId(d) && <span className="bg-red-900/50 text-red-400 text-[10px] px-1.5 py-0.5 rounded border border-red-500/30">ID FEHLT</span>}
                              <span className="bg-slate-700/50 text-slate-300 text-[10px] px-1.5 py-0.5 rounded border border-slate-600/30">{source(d)}</span>
                            </div>
                          </td>
                          <td className="p-3 text-slate-400">{d.description || '-'}</td>
                          <td className="p-3"><span className="bg-slate-800 text-[11px] px-2 py-1 rounded-md border border-slate-600">{d.providerData?.deviceType || d.icon?.value || d.deviceFamily || 'UNKNOWN'}</span></td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {d._admReachability === 'OK' ? (
                                 <><span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></span><span className="text-green-500 font-medium">Online</span></>
                              ) : d._admReachability === 'UNAVAILABLE' ? (
                                 <><span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"></span><span className="text-red-500 font-medium">Offline</span></>
                              ) : d._admReachability ? (
                                 <><span className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_#eab308]"></span><span className="text-yellow-500 font-medium">{d._admReachability}</span></>
                              ) : d.availability ? (
                                 <><span className="w-2 h-2 rounded-full bg-slate-400 shadow-[0_0_8px_#9ca3af]"></span><span className="text-slate-400 font-medium">{d.availability}</span></>
                              ) : <span className="text-slate-600">-</span>}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          
          {/* CLI Terminal */}
          <div className="h-40 flex-none bg-[#0a0f18] rounded-xl border border-slate-700 p-3 font-mono text-[11px] text-green-400 overflow-y-auto shadow-inner flex flex-col gap-1">
            <div className="flex items-center gap-2 text-slate-500 border-b border-slate-800 pb-2 mb-1 sticky top-0 bg-[#0a0f18]">
              <Terminal className="w-4 h-4" /> CLI Terminal Output
            </div>
            {logs.map((l, i) => <div key={i}>{l}</div>)}
            <div ref={logEndRef} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-1 bg-panel rounded-2xl border border-slate-700 p-6 flex flex-col gap-6 overflow-y-auto">
          {selectedDevice ? (
            <>
               <div className="flex justify-center bg-bgDark rounded-xl p-4 border border-slate-700 shadow-inner">
                 <img src={typeof chrome !== 'undefined' && chrome.runtime?.getURL ? chrome.runtime.getURL(`${(selectedDevice.providerData?.deviceType || selectedDevice.icon?.value || '').toLowerCase()}.jpg`) : ''} alt={selectedDevice.providerData?.deviceType || 'device'} className="h-32 object-contain" onError={(e) => { e.target.style.display='none' }} />
               </div>
               <div>
                 <h2 className="text-2xl font-bold text-white mb-1 leading-tight">{selectedDevice.displayName || selectedDevice.friendlyNameObject?.value?.text || 'Unbekannt'}</h2>
                 <p className="text-slate-400 text-sm">{selectedDevice.description || 'Keine Beschreibung'}</p>
                 <div className="flex items-center gap-2 mt-2">
                    {selectedDevice._admReachability === 'OK' ? (
                       <><span className="w-2 h-2 rounded-full bg-green-500"></span><span className="text-sm font-bold text-green-500">Online</span></>
                    ) : selectedDevice._admReachability === 'UNAVAILABLE' ? (
                       <><span className="w-2 h-2 rounded-full bg-red-500"></span><span className="text-sm font-bold text-red-500">Offline</span></>
                    ) : selectedDevice._admReachability ? (
                       <><span className="w-2 h-2 rounded-full bg-yellow-500"></span><span className="text-sm font-bold text-yellow-500">{selectedDevice._admReachability}</span></>
                    ) : selectedDevice.availability ? (
                       <><span className="w-2 h-2 rounded-full bg-slate-400"></span><span className="text-sm font-bold text-slate-400">{selectedDevice.availability}</span></>
                    ) : <span className="text-sm font-bold text-slate-600">-</span>}
                 </div>
               </div>
               
               <div className="space-y-4 pt-4 border-t border-slate-700 text-sm">
                 <div><div className="text-slate-500 mb-1">Typ</div><div className="font-mono text-aura bg-bgDark px-2 py-1 rounded inline-block">{selectedDevice.providerData?.deviceType || selectedDevice.icon?.value || 'UNKNOWN'}</div></div>
                 <div><div className="text-slate-500 mb-1">Netzwerk-ID</div><div className="font-mono text-slate-300 text-[10px] break-all bg-bgDark p-2 rounded">{selectedDevice._admEndpointId || 'Keine Endpoint-ID'}</div></div>
                 <div className="pt-2">
                   <button onClick={() => { setCheckedIds(new Set([selectedDevice.id])); handleBulkDelete(); }} className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 py-2 rounded-lg font-semibold transition-colors flex justify-center items-center gap-2">
                     <Trash2 className="w-4 h-4" /> Löschen
                   </button>
                 </div>
               </div>
            </>
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center gap-4">
               <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-700">
                 <span className="text-2xl">👆</span>
               </div>
               <p className="px-4">Wähle links ein Gerät aus, um Details und Aktionen anzuzeigen.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
