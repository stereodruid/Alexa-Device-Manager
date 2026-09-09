const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const regex = /<div className="speech-row">\s*<input/g;
const replacement = `<div className="speech-row" style={{ display: 'flex', gap: '8px' }}>
                      <select 
                        value={ttsLocale} 
                        onChange={(e) => setTtsLocale(e.target.value)}
                        className="dropdown"
                        style={{ padding: '0 8px', borderRadius: '6px', backgroundColor: '#0A0F18', color: 'white', border: '1px solid #1E293B', flex: '0 0 auto', outline: 'none' }}
                      >
                        <option value="de-DE">🇩🇪 DE</option>
                        <option value="en-US">🇺🇸 EN</option>
                        <option value="en-GB">🇬🇧 UK</option>
                        <option value="es-ES">🇪🇸 ES</option>
                        <option value="fr-FR">🇫🇷 FR</option>
                        <option value="it-IT">🇮🇹 IT</option>
                      </select>
                      <input`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/App.jsx', code);
console.log("Replaced speech-row UI!");
