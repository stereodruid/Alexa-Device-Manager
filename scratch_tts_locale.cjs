const fs = require('fs');

// 1. Modify src/alexa.js
let alexaJs = fs.readFileSync('src/alexa.js', 'utf8');
alexaJs = alexaJs.replace(/async speak\(d, text\) \{/, 'async speak(d, text, locale = "de-DE") {');
alexaJs = alexaJs.replace(/locale:\s*"de-DE",/, 'locale: locale,');
fs.writeFileSync('src/alexa.js', alexaJs);

// 2. Modify src/hooks/useAlexa.js
let useAlexaJs = fs.readFileSync('src/hooks/useAlexa.js', 'utf8');
useAlexaJs = useAlexaJs.replace(/await client\.speak\(current\[0\],\s*approval\.text\s*\|\|\s*\"\"\);/, 'await client.speak(current[0], approval.text || "", approval.locale || "de-DE");');
fs.writeFileSync('src/hooks/useAlexa.js', useAlexaJs);

// 3. Modify src/App.jsx
let appJsx = fs.readFileSync('src/App.jsx', 'utf8');

// Add getAutoLocale helper
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

if (!appJsx.includes('function getAutoLocale()')) {
  appJsx = appJsx.replace('export default function App() {', autoLocaleFn + '\nexport default function App() {');
}

// Add state
if (!appJsx.includes('const [ttsLocale, setTtsLocale]')) {
  appJsx = appJsx.replace('const [speech, setSpeech] = useState("");', 'const [speech, setSpeech] = useState("");\n  const [ttsLocale, setTtsLocale] = useState(getAutoLocale());');
}

// Add locale to setPlan
appJsx = appJsx.replace(/setPlan\(\{ action, list: \[\.\.\.list\], text: speech \}\);/g, 'setPlan({ action, list: [...list], text: speech, locale: ttsLocale });');

// Pass locale from plan to execute
const executeBlock = `const ok = await execute(plan.list, plan.action, {
        backup: backedUp,
        preview: true,
        allowProtectedIds: [...protectedIds],
        text: plan.text,`;
const executeBlockNew = executeBlock + '\n        locale: plan.locale,';
appJsx = appJsx.replace(executeBlock, executeBlockNew);

// Add select dropdown in UI
const oldSpeechRow = `<div className="speech-row">
                      <input`;
const newSpeechRow = `<div className="speech-row" style={{ display: 'flex', gap: '8px' }}>
                      <select 
                        value={ttsLocale} 
                        onChange={(e) => setTtsLocale(e.target.value)}
                        style={{ padding: '0 8px', borderRadius: '4px', backgroundColor: '#0A0F18', color: 'white', border: '1px solid #1E293B', flex: '0 0 auto' }}
                      >
                        <option value="de-DE">🇩🇪 DE</option>
                        <option value="en-US">🇺🇸 EN</option>
                        <option value="en-GB">🇬🇧 UK</option>
                        <option value="es-ES">🇪🇸 ES</option>
                        <option value="fr-FR">🇫🇷 FR</option>
                        <option value="it-IT">🇮🇹 IT</option>
                      </select>
                      <input`;
appJsx = appJsx.replace(oldSpeechRow, newSpeechRow);

fs.writeFileSync('src/App.jsx', appJsx);

console.log('All files updated for TTS locale feature!');
