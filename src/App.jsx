import React, { useState, useEffect } from 'react';
import { Search, Wifi, WifiOff, Trash2, RefreshCw } from 'lucide-react';
import { useAlexa } from './hooks/useAlexa';

export default function App() {
  const { devices, loading, error, fetchDevices } = useAlexa();
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');

  // Fetch devices on mount
  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const filteredDevices = devices.filter(d => 
    d.name?.toLowerCase().includes(search.toLowerCase()) || 
    d.description?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedDevice = devices.find(d => d.id === selectedId);
  const onlineCount = devices.filter(d => d._admReachability === 'OK' || d.availability === 'ONLINE').length;
  const deletableCount = devices.filter(d => d._admApplianceId).length;

  return (
    <div className="min-h-screen bg-bgDark text-slate-300 font-sans p-6 flex flex-col gap-6">
      {/* Header */}
      <header className="flex justify-between items-center bg-panel p-4 rounded-2xl shadow-lg border border-slate-700">
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
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-panel p-4 rounded-xl border border-slate-700 flex items-center gap-4">
          <div className="text-3xl font-bold text-white">{devices.length}</div>
          <div className="text-sm text-slate-400">Geräte gesamt</div>
        </div>
        <div className="bg-panel p-4 rounded-xl border border-green-500/30 flex items-center gap-4">
          <Wifi className="text-green-500" />
          <div>
            <div className="text-2xl font-bold text-green-500">{onlineCount}</div>
            <div className="text-sm text-slate-400">Online</div>
          </div>
        </div>
        <div className="bg-panel p-4 rounded-xl border border-slate-700 flex items-center gap-4">
          <WifiOff className="text-slate-500" />
          <div>
            <div className="text-2xl font-bold text-white">{devices.length - onlineCount}</div>
            <div className="text-sm text-slate-400">Offline/Unbekannt</div>
          </div>
        </div>
        <div className="bg-panel p-4 rounded-xl border border-red-500/30 flex items-center gap-4">
          <Trash2 className="text-red-500" />
          <div>
            <div className="text-2xl font-bold text-red-500">{deletableCount}</div>
            <div className="text-sm text-slate-400">Löschbar</div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-panel to-slate-800 p-4 rounded-xl border border-aura/30 flex flex-col justify-center">
           <div className="text-aura font-bold">Dein Zuhause. Deine Kontrolle.</div>
           <div className="text-xs text-slate-400">Schnell. Sicher. Übersichtlich.</div>
        </div>
      </div>

      {/* Main Grid: Table (75%) + Sidebar (25%) */}
      <div className="grid grid-cols-4 gap-6 flex-1 min-h-0">
        
        {/* Table Area (Now takes 3 out of 4 columns, making it wider and sidebar narrower) */}
        <div className="col-span-3 bg-panel rounded-2xl border border-slate-700 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
             <div className="font-bold text-white">Gefundene Geräte: {filteredDevices.length}</div>
             <div className="flex gap-2">
               <button className="bg-slate-700 hover:bg-slate-600 px-4 py-1.5 rounded-lg text-sm text-white border border-slate-600">Deaktivieren</button>
               <button className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 px-4 py-1.5 rounded-lg text-sm">Löschen</button>
             </div>
          </div>
          
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4">
                <div className="w-16 h-16 rounded-full border-4 border-t-aura animate-spin"></div>
                <p>Verbinde mit lokaler Alexa-Session...</p>
              </div>
            ) : error ? (
              <div className="h-full flex flex-col items-center justify-center text-red-400 gap-4 p-8 text-center">
                <p>Fehler beim Laden: {error}</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-bgDark sticky top-0 border-b border-slate-700">
                  <tr>
                    <th className="p-4 font-medium text-slate-400 w-10">
                      <input type="checkbox" className="accent-aura w-4 h-4" />
                    </th>
                    <th className="p-4 font-medium text-slate-400">Name</th>
                    <th className="p-4 font-medium text-slate-400">Beschreibung</th>
                    <th className="p-4 font-medium text-slate-400">Typ</th>
                    <th className="p-4 font-medium text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {filteredDevices.map(d => {
                    const isOnline = d._admReachability === 'OK' || d.availability === 'ONLINE';
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
                   <span className={`w-2 h-2 rounded-full ${(selectedDevice._admReachability === 'OK' || selectedDevice.availability === 'ONLINE') ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`}></span>
                   <span className={`text-sm font-bold ${(selectedDevice._admReachability === 'OK' || selectedDevice.availability === 'ONLINE') ? 'text-green-500' : 'text-red-500'}`}>
                     {(selectedDevice._admReachability === 'OK' || selectedDevice.availability === 'ONLINE') ? 'Online' : 'Offline'}
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
