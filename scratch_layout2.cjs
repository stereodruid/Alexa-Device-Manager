const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Move the Action & Filter Bar to the footer, replacing Konfigurationen.
const actionFilterRegex = /\s*\{\/\* Action & Filter Bar \*\/\}[\s\S]*?(?=\{\/\* Table \*\/)/;
const actionFilterMatch = code.match(actionFilterRegex);
if (!actionFilterMatch) throw new Error("Could not find Action & Filter Bar");

let actionFilterContent = actionFilterMatch[0];

// Remove the filter bar from above the table
code = code.replace(actionFilterRegex, '\n            ');

// Find the footer
const footerRegex = /\s*\{\/\* Footer Navigation \(Konfigurationen\) \*\/\}[\s\S]*?(?=\s*<\/div>\s*\{\/\* Right Sidebar \*\/)/;
const footerMatch = code.match(footerRegex);
if (!footerMatch) throw new Error("Could not find Footer");

// Create new Footer Content
let newFooter = `
            {/* Filter & Action Footer */}
            <div className="flex-none flex flex-col gap-3 pb-2 pt-2 px-1">
${actionFilterContent.replace(/\n\s*$/, '')}
              <div className="flex justify-between items-center px-2 text-sm text-slate-500">
                <div>{checkedIds.size} von {filteredAndSortedDevices.length} Geräten ausgewählt</div>
                <div className="flex items-center gap-2">
                  Einträge pro Seite
                  <select className="bg-[#0A0F18] border border-[#1E293B] rounded px-2 py-1 outline-none text-white">
                    <option>10</option>
                    <option>50</option>
                    <option>100</option>
                  </select>
                </div>
              </div>
            </div>`;

code = code.replace(footerRegex, newFooter);

// 2. Fix Right Sidebar Scrollbar issue
// Change: overflow-y-auto -> overflow-hidden
const rightSidebarRegex = /<div className="w-\[400px\] flex-none bg-\[#131B2B\] rounded-2xl border border-\[#1E293B\] p-5 flex flex-col gap-3 overflow-y-auto">/;
const rightSidebarReplacement = `<div className="w-[400px] flex-none bg-[#131B2B] rounded-2xl border border-[#1E293B] p-5 flex flex-col gap-3 overflow-hidden">`;
code = code.replace(rightSidebarRegex, rightSidebarReplacement);

// 3. Ensure CLI Terminal can shrink inside the hidden overflow
const cliTerminalRegex1 = /<div className="flex-1 min-h-\[160px\] bg-\[#0A0F18\] border border-\[#1E293B\] rounded-xl font-mono text-\[11px\] text-\[#00FF00\] shadow-inner flex flex-col overflow-hidden">/g;
const cliTerminalReplacement1 = `<div className="flex-1 min-h-0 bg-[#0A0F18] border border-[#1E293B] rounded-xl font-mono text-[11px] text-[#00FF00] shadow-inner flex flex-col overflow-hidden">`;
code = code.replace(cliTerminalRegex1, cliTerminalReplacement1);

fs.writeFileSync('src/App.jsx', code);
