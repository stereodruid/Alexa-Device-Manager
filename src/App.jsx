import React, { useState, useEffect, useMemo } from 'react';
import { Search, Wifi, WifiOff, Trash2, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';
import { useAlexa } from './hooks/useAlexa';

export default function App() {
  const { devices, loading, error, fetchDevices } = useAlexa();
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, ONLINE, OFFLINE, DELETABLE
  const [sortConfig, setSortConfig] = useState({ key: 'name', dir: 'asc' });

  // Fetch devices on mount
  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const isDeviceOnline = (d) => {
    return d._admReachability === 'OK' || 
           d.availability === 'ONLINE' || 
           d.availability === 'AVAILABLE';
  };

  const onlineCount = devices.filter(isDeviceOnline).length;
  const deletableCount = devices.filter(d => d._admEndpointId || d._admApplianceId).length;
  const offlineCount = devices.length - onlineCount;

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredAndSortedDevices = useMemo(() => {
    let result = devices.filter(d => {
      const isOnline = isDeviceOnline(d);
      const isDeletable = Boolean(d._admEndpointId || d._admApplianceId);
      
      if (filterType === 'ONLINE' && !isOnline) return false;
      if (filterType === 'OFFLINE' && isOnline) return false;
      if (filterType === 'DELETABLE' && !isDeletable) return false;
      
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
        if (sortConfig.key === 'status') return isDeviceOnline(d) ? '1' : '0';
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

  const SortIcon = ({ colKey }) => {
    if (sortConfig.key !== colKey) return <ChevronUp className="w-4 h-4 opacity-0 group-hover:opacity-30 inline-block ml-1" />;
    return sortConfig.dir === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-aura inline-block ml-1" />
      : <ChevronDown className="w-4 h-4 text-aura inline-block ml-1" />;
  };

  return (
    <div className="h-screen max-h-screen bg-bgDark text-slate-300 font-sans p-6 flex flex-col gap-6 overflow-hidden">
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
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Geräte suchen..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-bgDark border border-slate-600 rounded-lg pl-10 pr-4 py-2 focus:border-aura focus:outline-none" 
            />
          </div>
          <button 
            onClick={fetchDevices} 
            className="flex items-center gap-2 bg-aura hover:bg-cyan-400 text-bgDark font-bold py-2 px-6 rounded-lg shadow-[0_0_15px_rgba(0,210,255,0.4)] transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Daten laden
          </button>
        </div>
      </header>
      
      {/* KPI Cards */}
      <div className="flex-none grid grid-cols-5 gap-4 cursor-pointer select-none">
        <div onClick={() => setFilterType('ALL')} className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${filterType === 'ALL' ? 'bg-aura/10 border-aura shadow-[0_0_15px_rgba(0,210,255,0.2)]' : 'bg-panel border-slate-700 hover:border-slate-500'}`}>
          <div className="text-3xl font-bold text-white">{devices.length}</div>
          <div className="text-sm text-slate-400">Geräte gesamt</div>
        </div>
        
        <div onClick={() => setFilterType('ONLINE')} className={`p-4 rounded-xl border flex items-center gap-4 transition-all col-span-2 ${filterType === 'ONLINE' ? 'bg-green-500/10 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'bg-panel border-slate-700 hover:border-slate-500'}`}>
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
            <Wifi className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-green-500">{onlineCount}</div>
            <div className="text-sm text-slate-400">Online</div>
          </div>
        </div>

        <div onClick={() => setFilterType('OFFLINE')} className={`p-4 rounded-xl border flex items-center gap-4 transition-all col-span-1 ${filterType === 'OFFLINE' ? 'bg-slate-700/50 border-slate-400' : 'bg-panel border-slate-700 hover:border-slate-500'}`}>
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-400">
            <WifiOff className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-300">{offlineCount}</div>
            <div className="text-sm text-slate-400">Offline/Unbekannt</div>
          </div>
        </div>

        <div onClick={() => setFilterType('DELETABLE')} className={`p-4 rounded-xl border flex items-center gap-4 transition-all col-span-1 ${filterType === 'DELETABLE' ? 'bg-red-500/10 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-panel border-slate-700 hover:border-slate-500'}`}>
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-red-500">{deletableCount}</div>
            <div className="text-sm text-slate-400">Löschbar</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Table (75%) + Sidebar (25%) */}
      <div className="flex-1 min-h-0 grid grid-cols-4 gap-6">
        
        {/* Table Container */}
        <div className="col-span-3 bg-panel rounded-2xl border border-slate-700 flex flex-col overflow-hidden">
          <div className="flex-none p-4 border-b border-slate-700 flex justify-between items-center bg-bgDark/30">
            <h2 className="font-bold text-white">Gefundene Geräte: {filteredAndSortedDevices.length}</h2>
            <div className="flex gap-2">
              <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-1.5 rounded-lg text-sm transition-colors">Deaktivieren</button>
              <button className="bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/50 px-4 py-1.5 rounded-lg text-sm transition-colors">Löschen</button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-aura animate-spin" />
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-400">Fehler: {error}</div>
            ) : (
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-[#1e293b] sticky top-0 z-10 shadow-md">
                  <tr>
                    <th className="p-4 w-12"><input type="checkbox" className="accent-aura w-4 h-4" /></th>
                    <th className="p-4 text-slate-400 font-semibold cursor-pointer select-none group" onClick={() => handleSort('name')}>
                      Name <SortIcon colKey="name" />
                    </th>
                    <th className="p-4 text-slate-400 font-semibold cursor-pointer select-none group" onClick={() => handleSort('description')}>
                      Beschreibung <SortIcon colKey="description" />
                    </th>
                    <th className="p-4 text-slate-400 font-semibold cursor-pointer select-none group" onClick={() => handleSort('type')}>
                      Typ <SortIcon colKey="type" />
                    </th>
                    <th className="p-4 text-slate-400 font-semibold cursor-pointer select-none group" onClick={() => handleSort('status')}>
                      Status <SortIcon colKey="status" />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {filteredAndSortedDevices.map(d => {
                    const isOnline = isDeviceOnline(d);
                    const devName = d.displayName || d.friendlyNameObject?.value?.text || 'Unbekannt';
                    const devType = d.providerData?.deviceType || d.icon?.value || d.deviceFamily || 'UNKNOWN';
                    return (
                      <tr 
                        key={d.id} 
                        onClick={() => setSelectedId(d.id)}
                        className={`hover:bg-slate-700/30 cursor-pointer transition-colors ${selectedId === d.id ? 'bg-aura/10' : ''}`}
                      >
                        <td className="p-4"><input type="checkbox" className="accent-aura w-4 h-4" onClick={(e) => e.stopPropagation()}/></td>
                        <td className="p-4 font-medium text-white">{devName}</td>
                        <td className="p-4 text-slate-400">{d.description || '-'}</td>
                        <td className="p-4">
                          <span className="bg-slate-800 text-xs px-2 py-1 rounded-md border border-slate-600">{devType}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`}></span>
                            <span className={isOnline ? 'text-green-500' : 'text-red-500'}>{isOnline ? 'Online' : 'Offline'}</span>
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

        {/* Right Sidebar */}
        <div className="col-span-1 bg-panel rounded-2xl border border-slate-700 p-6 flex flex-col gap-6 overflow-y-auto">
           {selectedDevice ? (
             <>
               <div className="bg-bgDark rounded-xl p-6 flex items-center justify-center border border-slate-700/50 relative overflow-hidden min-h-[160px]">
                 <div className="absolute inset-0 bg-aura/5"></div>
                 {(() => {
                   let imgName = 'switch';
                   const type = (selectedDevice.providerData?.deviceType || selectedDevice.icon?.value || selectedDevice.deviceFamily || '').toUpperCase();
                   if (type === 'ECHO' || type === 'KNIGHT' || type === 'AUDIO') imgName = 'echo';
                   else if (type === 'SMARTPLUG' || type === 'PLUG') imgName = 'plug';
                   else if (type === 'LIGHT' || type === 'SMARTLIGHT') imgName = 'light';
                   else if (type === 'CAMERA' || type === 'WEBCAM') imgName = 'camera';
                   else if (type.includes('BLIND') || type.includes('CURTAIN')) imgName = 'blind';
                   
                   const imgUrl = typeof chrome !== 'undefined' && chrome.runtime?.getURL 
                     ? chrome.runtime.getURL(`${imgName}.jpg`) 
                     : '';
                     
                   return <img src={imgUrl} alt={imgName} className="h-32 object-contain relative z-10 drop-shadow-xl rounded-xl mix-blend-screen" />;
                 })()}
               </div>
               <div>
                 <h2 className="text-2xl font-bold text-white mb-1 leading-tight">{selectedDevice.displayName || selectedDevice.friendlyNameObject?.value?.text || 'Unbekannt'}</h2>
                 <p className="text-slate-400 text-sm">{selectedDevice.description || 'Keine Beschreibung'}</p>
                 <div className="flex items-center gap-2 mt-2">
                   <span className={`w-2 h-2 rounded-full ${isDeviceOnline(selectedDevice) ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`}></span>
                   <span className={`text-sm font-bold ${isDeviceOnline(selectedDevice) ? 'text-green-500' : 'text-red-500'}`}>
                     {isDeviceOnline(selectedDevice) ? 'Online' : 'Offline'}
                   </span>
                 </div>
               </div>
               
               <div className="flex flex-col gap-3 text-sm mt-4 border-t border-slate-700 pt-6">
                 <div className="flex justify-between"><span className="text-slate-500">Typ</span><span className="text-white font-medium text-right">{selectedDevice.providerData?.deviceType || selectedDevice.icon?.value || selectedDevice.deviceFamily || '-'}</span></div>
                 <div className="flex justify-between"><span className="text-slate-500">Netzwerk</span><span className="text-white font-medium text-right">{selectedDevice.deviceOwnerCustomerId ? 'Lokal/Cloud' : '-'}</span></div>
                 <div className="flex justify-between"><span className="text-slate-500">Löschbar</span><span className={selectedDevice._admApplianceId ? "text-red-400 font-medium" : "text-slate-500 font-medium"}>{selectedDevice._admApplianceId ? 'Ja' : 'Nein'}</span></div>
                 <div className="flex justify-between"><span className="text-slate-500">ID</span><span className="text-slate-400 text-xs truncate max-w-[120px]" title={selectedDevice.id}>{selectedDevice.id}</span></div>
               </div>

               <div className="mt-auto flex flex-col gap-3 pt-6 border-t border-slate-700">
                 <button className="bg-aura hover:bg-cyan-400 text-bgDark font-bold py-3 rounded-xl shadow-[0_0_15px_rgba(0,210,255,0.4)] transition-all">Sichern</button>
                 <div className="flex gap-3">
                   <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-all">Pause</button>
                   <button disabled={!selectedDevice._admApplianceId} className="flex-1 disabled:opacity-30 disabled:cursor-not-allowed bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 font-bold py-3 rounded-xl transition-all">Löschen</button>
                 </div>
               </div>
             </>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 gap-4">
                <div className="text-4xl opacity-50">👆</div>
                <p>Wähle links ein Gerät aus, um Details und Aktionen anzuzeigen.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
