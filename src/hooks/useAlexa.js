import { useState, useCallback } from 'react';

const API_LIST = '/api/behaviors/entities?skillId=amzn1.ask.1p.smarthome';
const API_ENDPOINTS = '/nexus/v1/graphql';
const API_DELETE_LEGACY = id => '/api/phoenix/appliance/' + encodeURIComponent(id);
const API_STATE = '/api/phoenix/state';
const API_PREVIEW = '/api/behaviors/preview';

export function useAlexa() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [logs, setLogs] = useState(['[System] Aura Device Master V2 initialisiert.']);

  const logger = useCallback((msg) => {
    const time = new Date().toLocaleTimeString('de-DE');
    setLogs(prev => [...prev, `[${time}] ${msg}`]);
  }, []);

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    setError(null);
    logger('Lade Geräte von Alexa...');
    try {
      const listRes = await fetch(API_LIST, { headers: { Accept: 'application/json' }});
      if (!listRes.ok) throw new Error('API_LIST failed: ' + listRes.status);
      const listData = await listRes.json();
      
      const query = `query getDevicesBaseData {
        allDevices: listEndpoints(listEndpointsInput: { includeHouseholdDevices: true }) {
          endpoints {
            id
            enablement
            description
            friendlyNameObject { value { text } }
            legacyAppliance { applianceId }
            reachability { reachability status statusDetail }
          }
        }
      }`;
      const gqlRes = await fetch(API_ENDPOINTS, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      let endpointsMap = {};
      if (gqlRes.ok) {
        const gqlData = await gqlRes.json();
        const eps = gqlData.data?.allDevices?.endpoints || [];
        eps.forEach(ep => {
          endpointsMap[ep.id] = {
            _admEndpointId: ep.id,
            _admApplianceId: ep.legacyAppliance?.applianceId,
            _admEnablement: ep.enablement,
            _admReachability: ep.reachability?.status || ep.reachability?.reachability || 'UNKNOWN'
          };
        });
      }

      const merged = listData.map(d => {
        const epMatch = endpointsMap[d.id] || Object.values(endpointsMap).find(ep => ep._admApplianceId === d.id) || {};
        return { ...d, ...epMatch };
      });

      setDevices(merged);
      logger(`✓ ${merged.length} Geräte geladen.`);
    } catch (err) {
      console.error(err);
      setError(err.message);
      logger(`Fehler beim Laden: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [logger]);

  const deleteDevices = async (list) => {
    logger(`Starte Löschvorgang für ${list.length} Geräte...`);
    for (const d of list) {
      const name = d.displayName || d.friendlyNameObject?.value?.text || d.id;
      logger(`Lösche ${name}...`);
      try {
        let status, statusText, body;
        if (d._admEndpointId) {
          const query = 'mutation forgetEndpoint($input: ForgetEndpointInput!) { forgetEndpoint(forgetEndpointInput: $input) { endpointId } }';
          const res = await fetch(API_ENDPOINTS, {
            method: 'POST',
            headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({ operationName: 'forgetEndpoint', query, variables: { input: { endpointId: d._admEndpointId } } }),
          });
          body = await res.text().catch(() => '');
          status = res.status;
          statusText = 'vergessen (GraphQL)';
        } else if (d._admApplianceId) {
          const res = await fetch(API_DELETE_LEGACY(d._admApplianceId), { method: 'DELETE', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }});
          body = await res.text().catch(() => '');
          status = res.status;
          statusText = res.statusText + ' (Legacy API)';
        } else {
          logger(`-> Fehlschlag: Weder EndpointID noch ApplianceID gefunden.`);
          continue;
        }
        if (status === 200) logger(`-> OK (${statusText})`);
        else logger(`-> Fehler ${status}: ${body.substring(0,60)}`);
      } catch (err) {
        logger(`-> Ausnahme: ${err.message}`);
      }
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    logger(`Löschlauf beendet. Lade Geräte neu...`);
    await fetchDevices();
  };

  const toggleDevices = async (devicesToToggle, enable) => {
    const target = enable ? 'ENABLED' : 'DISABLED_BY_CUSTOMER';
    logger(`Schalte ${devicesToToggle.length} Geräte auf ${target}...`);
    for (const d of devicesToToggle) {
      const name = d.displayName || d.friendlyNameObject?.value?.text || d.id;
      if (!d._admEndpointId) {
        logger(`${name}: Ignoriert (keine Endpoint-ID).`);
        continue;
      }
      try {
        const query = 'mutation setEndpointEnablement($input: SetEndpointEnablementInput!) { setEndpointEnablement(setEndpointEnablementInput: $input) { endpoint { enablement } error { __typename } } }';
        const res = await fetch(API_ENDPOINTS, {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName: 'setEndpointEnablement', query, variables: { input: { endpointId: d._admEndpointId, enablement: target } } }),
        });
        if (res.ok) logger(`-> ${name} = ${target}`);
        else logger(`-> ${name} Fehler: ${res.status}`);
      } catch (err) {
        logger(`-> ${name} Ausnahme: ${err.message}`);
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    logger(`Umschalten beendet. Lade Geräte neu...`);
    await fetchDevices();
  };

  const switchDeviceState = async (d, turnOn) => {
    const entityId = d._admApplianceId || d._admEndpointId || d.id;
    if (!entityId) {
       logger(`Fehler: Keine ID für Schaltvorgang gefunden.`);
       return false;
    }
    const action = turnOn ? 'turnOn' : 'turnOff';
    logger(`Sende Kommando [${action}] an ${d.displayName || 'Gerät'}...`);
    try {
      const res = await fetch(API_STATE, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stateRequests: [{
            entityId,
            entityType: "APPLIANCE",
            parameters: { action }
          }]
        })
      });
      if(res.ok) {
         logger(`-> Schaltbefehl erfolgreich!`);
         return true;
      } else {
         logger(`-> Fehler beim Schalten: HTTP ${res.status}`);
         return false;
      }
    } catch(e) {
      logger(`-> Ausnahme: ${e.message}`);
      return false;
    }
  };

  const sendTTS = async (d, text) => {
    if (!d.deviceType || !d.serialNumber || !d.deviceOwnerCustomerId) {
      logger(`-> Fehler: Gerät unterstützt keine Sprachausgabe (Typ/Serial fehlt).`);
      return false;
    }
    logger(`Sende Sprachausgabe an ${d.displayName}: "${text}"`);
    try {
      const sequenceJson = JSON.stringify({
        "@type": "com.amazon.alexa.behavior.model.Sequence",
        "startNode": {
          "@type": "com.amazon.alexa.behavior.model.OpaquePayloadOperationNode",
          "type": "Alexa.SynthesizeSpeech",
          "operationPayload": {
            "deviceType": d.deviceType,
            "deviceSerialNumber": d.serialNumber,
            "locale": "de-DE",
            "customerId": d.deviceOwnerCustomerId,
            "textToSpeak": text
          }
        }
      });
      const res = await fetch(API_PREVIEW, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          behaviorId: "PREVIEW",
          sequenceJson,
          status: "READY"
        })
      });
      if(res.ok) {
         logger(`-> TTS erfolgreich gesendet.`);
         return true;
      } else {
         logger(`-> TTS Fehler: HTTP ${res.status}`);
         return false;
      }
    } catch (e) {
      logger(`-> Ausnahme beim TTS: ${e.message}`);
      return false;
    }
  };

  return { devices, loading, error, fetchDevices, logs, logger, deleteDevices, toggleDevices, switchDeviceState, sendTTS };
}
