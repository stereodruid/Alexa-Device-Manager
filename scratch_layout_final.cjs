const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Extract Action & Filter Bar
const actionFilterRegex = /\s*\{\/\* Action & Filter Bar \*\/\}[\s\S]*?(?=\{\/\* Table \*\/)/;
const match = code.match(actionFilterRegex);
if (!match) throw new Error("Could not find Action & Filter Bar");
const actionFilterCode = match[0];

// Remove it from above the table
code = code.replace(actionFilterRegex, '\n            ');

// 2. Extract and Replace Footer
const footerRegex = /\s*\{\/\* Footer Navigation \(Konfigurationen\) \*\/\}[\s\S]*?(?=<\/div>\s*<\/div>\s*\)\;\s*\})/i;
const footerMatch = code.match(footerRegex);
if (!footerMatch) {
    console.error("Could not find Footer regex exactly! Falling back to last div.");
}

const newFooter = `
      {/* Filter & Action Footer */}
      <div className="flex-none flex flex-col gap-2 pb-2">
${actionFilterCode.trim()}
        <div className="flex justify-between items-center px-4 text-sm text-slate-500">
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

if (footerMatch) {
    code = code.replace(footerRegex, newFooter + '\n');
} else {
    // manual fallback replacement
    code = code.replace(/\{\/\* Footer Navigation \(Konfigurationen\) \*\/\}[\s\S]*?<\/select>\s*<\/div>\s*<\/div>/, newFooter.trim());
}


// 3. Fix Right Sidebar scrollbar
code = code.replace(
  /<div className="w-\[400px\] flex-none bg-\[#131B2B\] rounded-2xl border border-\[#1E293B\] p-5 flex flex-col gap-3 overflow-y-auto">/g,
  `<div className="w-[400px] flex-none bg-[#131B2B] rounded-2xl border border-[#1E293B] p-5 flex flex-col gap-3 overflow-hidden">`
);

fs.writeFileSync('src/App.jsx', code);
