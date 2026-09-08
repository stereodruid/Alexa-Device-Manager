const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Extract Action & Filter Bar
// It starts with {/* Action & Filter Bar */} and ends before {/* Table */}
const actionFilterRegex = /\s*\{\/\* Action & Filter Bar \*\/\}[\s\S]*?(?=\{\/\* Table \*\/)/;
const match = code.match(actionFilterRegex);
if (!match) throw new Error("Could not find Action & Filter Bar");
const actionFilterCode = match[0];

// Remove it from the original location
code = code.replace(actionFilterRegex, '\n\n            ');

// 2. Replace the Footer Navigation
// Starts with {/* Footer Navigation (Konfigurationen) */} and ends before </div> } </div> {/* Right Sidebar */}
// Let's use a simpler match:
const footerRegex = /\s*\{\/\* Footer Navigation \(Konfigurationen\) \*\/\}[\s\S]*?(?=\s*<\/div>\s*\{\/\* Right Sidebar \*\/)/;
const footerMatch = code.match(footerRegex);
if (!footerMatch) throw new Error("Could not find Footer");

// The replacement footer includes the Action/Filter bar and the 'selected items / entries per page' bit.
const newFooter = `
            {/* Footer replacing Konfigurationen with Action & Filter Bar */}
            <div className="flex-none flex flex-col gap-3">
${actionFilterCode.trim()}
              <div className="flex justify-between items-center px-2 text-sm text-slate-500 pb-2">
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

// 3. Fix Right Sidebar scrollbar issue
// w-[400px] flex-none bg-[#131B2B] rounded-2xl border border-[#1E293B] p-5 flex flex-col gap-3 overflow-y-auto
const sidebarRegex = /<div className="w-\[400px\] flex-none bg-\[#131B2B\] rounded-2xl border border-\[#1E293B\] p-5 flex flex-col gap-3 overflow-y-auto">/g;
const sidebarReplacement = `<div className="w-[400px] flex-none bg-[#131B2B] rounded-2xl border border-[#1E293B] p-5 flex flex-col gap-3 overflow-hidden">`;
code = code.replace(sidebarRegex, sidebarReplacement);

// 4. Also fix the second Terminal container in the Empty State (if not already fixed)
// Actually we already fixed the terminal containers to have \`min-h-0\` and \`overflow-hidden\` wrapping an \`overflow-y-auto\` inner div in the previous step.

fs.writeFileSync('src/App.jsx', code);
