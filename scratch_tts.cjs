const fs = require('fs');
let code = fs.readFileSync('src/hooks/useAlexa.js', 'utf8');

const regex = /  const sendTTS = async \(d, text\) => \{[\s\S]*?    \} catch \(err\) \{/g;

const replacement = `  const sendTTS = async (d, text) => {
    let dt = d.deviceType || d.deviceFamily || (d.providerData ? d.providerData.deviceType : '');
    let dsn = d.serialNumber || (d.deviceAccountId ? d.deviceAccountId : d.id);
    let cid = d.deviceOwnerCustomerId || 'A2Q2Q2Q2Q2Q2Q2';
    
    logger(\`Sende Sprachausgabe an \${d.displayName}: "\${text}"\`);
    try {
      const csrfMatch = document.cookie.match(/csrf=([^;]+)/i);
      const csrfToken = csrfMatch ? csrfMatch[1] : '';

      // If the deviceType is the generic ALEXA_VOICE_ENABLED, it will fail (HTTP 400).
      // We must fetch the real hardware type and serial from devices-v2 API
      if (!dt || !dsn || dt === 'ALEXA_VOICE_ENABLED' || dsn.includes('-')) {
        try {
          const devRes = await fetch('/api/devices-v2/device?cached=true', {
            headers: { Accept: 'application/json', 'csrf': csrfToken }
          });
          if (devRes.ok) {
            const devData = await devRes.json();
            const matchedDev = devData?.devices?.find(x => 
              x.accountName === d.displayName || 
              (d.friendlyNameObject && x.accountName === d.friendlyNameObject.value.text) ||
              x.serialNumber === d.id
            );
            if (matchedDev) {
              dt = matchedDev.deviceType;
              dsn = matchedDev.serialNumber;
              cid = matchedDev.deviceOwnerCustomerId;
            }
          }
        } catch (fetchErr) {
          logger(\`-> Warnung: Konnte echte Gerätedaten nicht abrufen (\${fetchErr.message})\`);
        }
      }

      if (!dt || !dsn || dt === 'ALEXA_VOICE_ENABLED') {
        logger(\`-> Fehler: Echtes deviceType/serialNumber fehlt.\`);
        return false;
      }

      const sequenceJson = JSON.stringify({
        "@type": "com.amazon.alexa.behavior.model.Sequence",
        "startNode": {
          "@type": "com.amazon.alexa.behavior.model.OpaquePayloadOperationNode",
          "type": "Alexa.SynthesizeSpeech",
          "operationPayload": {
            "deviceType": dt,
            "deviceSerialNumber": dsn,
            "locale": "de-DE",
            "customerId": cid,
            "textToSpeak": text
          }
        }
      });
      const res = await fetch(API_PREVIEW, {
        method: 'POST',
        headers: { 
          Accept: 'application/json', 
          'Content-Type': 'application/json',
          'csrf': csrfToken
        },
        body: JSON.stringify({
          behaviorId: "PREVIEW",
          sequenceJson,
          status: "ENABLED"
        })
      });
      if (res.ok) {
        logger(\`-> Sprachausgabe erfolgreich gesendet!\`);
      } else {
        const errorText = await res.text().catch(() => '');
        logger(\`-> Fehler beim Senden (TTS): HTTP \${res.status}\`);
        logger(\`-> Amazon API sagt: \${errorText.substring(0, 100)}\`);
        logger(\`-> Verwendet: Typ=\${dt}, Serial=\${dsn}\`);
      }
    } catch (err) {`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/hooks/useAlexa.js', code);
