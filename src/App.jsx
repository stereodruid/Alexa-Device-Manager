import React, { useState } from 'react';
import { Search, Moon, Shield, Wifi, WifiOff, Trash2 } from 'lucide-react';

export default function App() {
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
            <input type="text" placeholder="Geräte suchen..." className="bg-bgDark border border-slate-600 rounded-lg pl-10 pr-4 py-2 focus:border-aura focus:outline-none" />
          </div>
          <button className="bg-aura hover:bg-cyan-400 text-bgDark font-bold py-2 px-6 rounded-lg shadow-[0_0_15px_rgba(0,210,255,0.4)] transition-all">Daten laden</button>
        </div>
      </header>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-panel p-4 rounded-xl border border-slate-700 flex items-center gap-4">
          <div className="text-3xl font-bold text-white">138</div>
          <div className="text-sm text-slate-400">Geräte gesamt</div>
        </div>
        <div className="bg-panel p-4 rounded-xl border border-green-500/30 flex items-center gap-4">
          <Wifi className="text-green-500" />
          <div>
            <div className="text-2xl font-bold text-green-500">114</div>
            <div className="text-sm text-slate-400">Online</div>
          </div>
        </div>
        <div className="bg-panel p-4 rounded-xl border border-slate-700 flex items-center gap-4">
          <WifiOff className="text-slate-500" />
          <div>
            <div className="text-2xl font-bold text-white">20</div>
            <div className="text-sm text-slate-400">Offline</div>
          </div>
        </div>
        <div className="bg-panel p-4 rounded-xl border border-red-500/30 flex items-center gap-4">
          <Trash2 className="text-red-500" />
          <div>
            <div className="text-2xl font-bold text-red-500">134</div>
            <div className="text-sm text-slate-400">Löschbar</div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-panel to-slate-800 p-4 rounded-xl border border-aura/30 flex flex-col justify-center">
           <div className="text-aura font-bold">Dein Zuhause. Deine Kontrolle.</div>
           <div className="text-xs text-slate-400">Schnell. Sicher. Übersichtlich.</div>
        </div>
      </div>

      {/* Main Grid: Table + Sidebar */}
      <div className="grid grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Table Area */}
        <div className="col-span-2 bg-panel rounded-2xl border border-slate-700 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
             <div className="font-bold text-white">Geräteliste wird neu programmiert...</div>
             <div className="flex gap-2">
               <button className="bg-slate-700 hover:bg-slate-600 px-4 py-1.5 rounded-lg text-sm text-white border border-slate-600">Deaktivieren</button>
               <button className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 px-4 py-1.5 rounded-lg text-sm">Löschen</button>
             </div>
          </div>
          <div className="p-8 text-center text-slate-500 flex-1 flex items-center justify-center flex-col gap-4">
             <div className="w-16 h-16 rounded-full border-4 border-t-aura animate-spin"></div>
             <p>Wir binden im nächsten Schritt die echte Alexa-Logik hier an.</p>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="col-span-1 bg-panel rounded-2xl border border-slate-700 p-6 flex flex-col gap-6">
           <div className="bg-bgDark rounded-xl p-8 flex items-center justify-center border border-slate-700/50 relative overflow-hidden">
             <div className="absolute inset-0 bg-aura/5"></div>
             <div className="text-6xl">🔊</div>
           </div>
           <div>
             <h2 className="text-2xl font-bold text-white mb-1">Wohnzimmer Echo</h2>
             <p className="text-slate-400">Echo (4. Generation)</p>
             <div className="flex items-center gap-2 mt-2">
               <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></span>
               <span className="text-green-500 text-sm font-bold">Online</span>
             </div>
           </div>
           
           <div className="flex flex-col gap-3 text-sm mt-4 border-t border-slate-700 pt-6">
             <div className="flex justify-between"><span className="text-slate-500">Typ</span><span className="text-white font-medium">AUDIO</span></div>
             <div className="flex justify-between"><span className="text-slate-500">Quelle</span><span className="text-white font-medium">Amazon</span></div>
             <div className="flex justify-between"><span className="text-slate-500">Löschbar</span><span className="text-red-400 font-medium">Ja</span></div>
           </div>

           <div className="mt-auto flex flex-col gap-3">
             <button className="bg-aura hover:bg-cyan-400 text-bgDark font-bold py-3 rounded-xl shadow-[0_0_15px_rgba(0,210,255,0.4)]">Sichern</button>
             <div className="flex gap-3">
               <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl">Pause</button>
               <button className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 font-bold py-3 rounded-xl">Löschen</button>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
