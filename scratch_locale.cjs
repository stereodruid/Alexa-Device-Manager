const fs = require('fs');

let useAlexaCode = fs.readFileSync('src/hooks/useAlexa.js', 'utf8');

// Update function signature
useAlexaCode = useAlexaCode.replace(/const sendTTS = async \(d, text\) => \{/g, "const sendTTS = async (d, text, locale = 'de-DE') => {");

// Replace static locale with the variable
useAlexaCode = useAlexaCode.replace(/"locale":\s*"de-DE"/g, '"locale": locale');

fs.writeFileSync('src/hooks/useAlexa.js', useAlexaCode);

console.log("useAlexa.js updated.");

// Now read App.jsx
let appCode = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add Auto-Locale Function
const autoLocaleFn = `
function getAutoLocale() {
  if (typeof window === 'undefined') return 'de-DE';
  const host = window.location.hostname || '';
  if (host.includes('.de')) return 'de-DE';
  if (host.includes('.co.uk')) return 'en-GB';
  if (host.includes('.it')) return 'it-IT';
  if (host.includes('.es')) return 'es-ES';
  if (host.includes('.fr')) return 'fr-FR';
  if (host.includes('.co.jp')) return 'ja-JP';
  if (host.includes('.ca')) return 'en-CA';
  if (host.includes('.com.au')) return 'en-AU';
  if (host.includes('.com.mx')) return 'es-MX';
  if (host.includes('.com.br')) return 'pt-BR';
  if (host.includes('.in')) return 'en-IN';
  return 'en-US';
}
`;

// Insert it above the App component
if (!appCode.includes('getAutoLocale')) {
  appCode = appCode.replace('export default function App() {', autoLocaleFn + '\nexport default function App() {');
}

// 2. Add State for ttsLocale
if (!appCode.includes('const [ttsLocale, setTtsLocale]')) {
  appCode = appCode.replace('const [searchHeader, setSearchHeader] = useState(\'\');', 'const [searchHeader, setSearchHeader] = useState(\'\');\n    const [ttsLocale, setTtsLocale] = useState(getAutoLocale());');
}

// 3. Replace the static language dropdown with the dynamic one
const oldSelect = `<select className="bg-[#0A0F18] border border-[#1E293B] rounded-lg px-3 py-2 text-sm appearance-none outline-none">
              <option>Deutsch</option>
            </select>`;

const newSelect = `<select value={ttsLocale} onChange={(e) => setTtsLocale(e.target.value)} className="bg-[#0A0F18] border border-[#1E293B] rounded-lg px-3 py-2 text-sm outline-none text-white cursor-pointer hover:border-[#007AFF] transition">
              <option value="de-DE">🇩🇪 Deutsch</option>
              <option value="en-US">🇺🇸 English (US)</option>
              <option value="en-GB">🇬🇧 English (UK)</option>
              <option value="es-ES">🇪🇸 Español</option>
              <option value="fr-FR">🇫🇷 Français</option>
              <option value="it-IT">🇮🇹 Italiano</option>
              <option value="pt-BR">🇧🇷 Português</option>
              <option value="ja-JP">🇯🇵 日本語</option>
            </select>`;

appCode = appCode.replace(oldSelect, newSelect);

// Fallback if the old dropdown was already formatted differently
const fallbackOldSelect = /<select className="bg-\[#0A0F18\] border border-\[#1E293B\] rounded-lg px-3 py-2 text-sm appearance-none\s+outline-none">\s*<option>Deutsch<\/option>\s*<\/select>/m;
appCode = appCode.replace(fallbackOldSelect, newSelect);

// 4. Pass ttsLocale to sendTTS
// There are two sendTTS calls:
// sendTTS(selectedDevice, e.target.value)
// sendTTS(selectedDevice, i.value)
appCode = appCode.replace(/sendTTS\(selectedDevice,\s*e\.target\.value\)/g, 'sendTTS(selectedDevice, e.target.value, ttsLocale)');
appCode = appCode.replace(/sendTTS\(selectedDevice,\s*i\.value\)/g, 'sendTTS(selectedDevice, i.value, ttsLocale)');

fs.writeFileSync('src/App.jsx', appCode);

console.log("App.jsx updated.");
