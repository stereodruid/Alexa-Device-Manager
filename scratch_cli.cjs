const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const regex1 = /<div className="flex-1 min-h-\[160px\] bg-\[#0A0F18\] border border-\[#1E293B\] rounded-xl p-3 font-mono text-\[11px\] text-\[#00FF00\] overflow-y-auto shadow-inner flex flex-col gap-1">[\s\S]*?<div ref={logEndRef} \/>\s*<\/div>/g;

const replacement1 = `<div className="flex-1 min-h-[160px] bg-[#0A0F18] border border-[#1E293B] rounded-xl font-mono text-[11px] text-[#00FF00] shadow-inner flex flex-col overflow-hidden">
                  <div className="flex items-center gap-2 text-slate-500 border-b border-slate-800 p-2 px-3 bg-[#0A1018] z-10 flex-none">
                    <Terminal className="w-4 h-4" /> CLI Terminal
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
                    {logs.map((l, i) => <div key={i}>{l}</div>)}
                    <div ref={logEndRef} />
                  </div>
                </div>`;

const regex2 = /<div className="w-full mt-8 bg-\[#0A0F18\] border border-\[#1E293B\] rounded-xl p-3 font-mono text-\[11px\] text-\[#00FF00\] overflow-y-auto shadow-inner flex flex-col gap-1 text-left h-48">[\s\S]*?<div ref={logEndRef} \/>\s*<\/div>/g;

const replacement2 = `<div className="w-full mt-8 bg-[#0A0F18] border border-[#1E293B] rounded-xl font-mono text-[11px] text-[#00FF00] shadow-inner flex flex-col text-left h-48 overflow-hidden">
                  <div className="flex items-center gap-2 text-slate-500 border-b border-slate-800 p-2 px-3 bg-[#0A1018] z-10 flex-none">
                    <Terminal className="w-4 h-4" /> CLI Terminal
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
                    {logs.map((l, i) => <div key={i}>{l}</div>)}
                    <div ref={logEndRef} />
                  </div>
                </div>`;

code = code.replace(regex1, replacement1);
code = code.replace(regex2, replacement2);
fs.writeFileSync('src/App.jsx', code);
