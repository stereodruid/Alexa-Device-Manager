const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const gridRegex = /<div className="flex-1 grid grid-cols-9 gap-3">[\s\S]*?<\/div>\s*<div className="w-64 bg-\[#0A101A\]/;

const newGrid = `<div className="flex-1 grid grid-cols-9 gap-3">
          {kpiOrder.map(kpiId => {
            const k = kpiData[kpiId];
            if (!k) return null;
            const Icon = k.icon;
            return (
              <div key={kpiId} draggable onDragStart={(e) => handleKpiDragStart(e, kpiId)} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleKpiDrop(e, kpiId)} onClick={k.onClick} className="bg-[#131B2B] border border-[#1E293B] rounded-2xl p-3 flex items-center gap-3 cursor-pointer hover:bg-[#1E293B] hover:-translate-y-1 hover:shadow-lg transition-all active:scale-95 select-none" title="Zum Filtern klicken / Ziehen zum Sortieren">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: \`\${k.color}15\`, color: k.color }}>
                  {Icon ? <Icon className="w-4 h-4" /> : (
                    kpiId === 'online' ? <span className="w-2.5 h-2.5 rounded-full bg-[#00FF88] shadow-[0_0_8px_#00FF88]"></span> :
                    kpiId === 'offline' ? <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span> : null
                  )}
                </div>
                <div>
                  <div className="text-xl font-bold text-white leading-tight">{k.value}</div>
                  <div className="text-[10px] text-slate-400">{k.label}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="w-64 bg-[#0A101A]`;

code = code.replace(gridRegex, newGrid);
fs.writeFileSync('src/App.jsx', code);
