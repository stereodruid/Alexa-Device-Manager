const fs = require('fs');
let code = fs.readFileSync('src/hooks/useAlexa.js', 'utf8');

const regex = /  const sendTTS = async \(d, text\) => \{[\s\S]*?    \} catch \(err\) \{/g;

const replacement = `  const sendTTS = async (d, text) => {
    let dt = d.deviceType || d.deviceFamily || (d.providerData ? d.providerData.deviceType : '');
    let dsn = d.serialNumber || (d.deviceAccountId ? d.deviceAccountId : d.id);
    
    // Extract REAL customer ID from the page HTML instead of using a dummy fallback
    let cid = '';
    const cidMatch = document.documentElement.innerHTML.match(/"customerId"\\s*:\\s*"([^"]+)"/i);
    if (cidMatch) cid = cidMatch[1];
    if (!cid) cid = d.deviceOwnerCustomerId || 'A2Q2Q2Q2Q2Q2Q2';
    
    logger(\`Sende Sprachausgabe an \${d.displayName}: "\${text}"\`);
    try {
      const csrfMatch = document.cookie.match(/csrf=([^;]+)/i);
      const csrfToken = csrfMatch ? csrfMatch[1] : '';

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
              if (matchedDev.deviceOwnerCustomerId) cid = matchedDev.deviceOwnerCustomerId;
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

      const payloads = [
        // 1. Standard SynthesizeSpeech
        JSON.stringify({
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
        }),
        // 2. Alternative Speak Node
        JSON.stringify({
          "@type": "com.amazon.alexa.behavior.model.Sequence",
          "startNode": {
            "@type": "com.amazon.alexa.behavior.model.OpaquePayloadOperationNode",
            "type": "Alexa.Speak",
            "operationPayload": {
              "deviceType": dt,
              "deviceSerialNumber": dsn,
              "locale": "de-DE",
              "customerId": cid,
              "textToSpeak": text
            }
          }
        }),
        // 3. Announcement as absolute fallback
        JSON.stringify({
          "@type": "com.amazon.alexa.behavior.model.Sequence",
          "startNode": {
            "@type": "com.amazon.alexa.behavior.model.OpaquePayloadOperationNode",
            "type": "AlexaAnnouncement.Announcement",
            "operationPayload": {
              "expireAfter": "PT10M",
              "customerId": cid,
              "content": [{
                "locale": "de-DE",
                "display": { "title": "Aura", "body": text },
                "speak": { "type": "text", "value": text }
              }],
              "target": {
                "customerId": cid,
                "devices": [{ "deviceSerialNumber": dsn, "deviceTypeId": dt }]
              }
            }
          }
        })
      ];

      let success = false;
      let lastError = '';

      for (let i = 0; i < payloads.length; i++) {
        const res = await fetch(API_PREVIEW, {
          method: 'POST',
          headers: { 
            Accept: 'application/json', 
            'Content-Type': 'application/json',
            'csrf': csrfToken
          },
          body: JSON.stringify({
            behaviorId: "PREVIEW",
            sequenceJson: payloads[i],
            status: "ENABLED"
          })
        });

        if (res.ok) {
          logger(\`-> Sprachausgabe erfolgreich gesendet! (Methode \${i + 1})\`);
          success = true;
          break;
        } else {
          lastError = await res.text().catch(() => '');
        }
      }

      if (!success) {
        logger(\`-> Fehler beim Senden (TTS): HTTP 400 (Alle Methoden fehlgeschlagen)\`);
        logger(\`-> Amazon API sagt: \${lastError.substring(0, 100)}\`);
        logger(\`-> Verwendet: Typ=\${dt}, Serial=\${dsn}, CID=\${cid}\`);
      }
    } catch (err) {`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/hooks/useAlexa.js', code);
