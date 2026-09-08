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
            endpointId: id
            enablement
            legacyAppliance { applianceId }
            legacyIdentifiers { chrsIdentifier { entityId } }
            friendlyNameObject { value { text } }
            manufacturer { value { text } }
            displayCategories { primary { value } }
            features {
              name
              properties {
                name
                ... on Reachability { reachabilityStatusValue }
              }
            }
          }
        }
      }`;
      const gqlRes = await fetch(API_ENDPOINTS, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      
      let endpointByEntityId = new Map();
      let allGraphQLById = new Map();
      
      if (gqlRes.ok) {
        const gqlData = await gqlRes.json();
        if (gqlData.errors) {
          logger(`GraphQL Warnung/Fehler: ${JSON.stringify(gqlData.errors).substring(0, 100)}`);
        }
        const eps = gqlData.data?.allDevices?.endpoints;
        if (!eps) {
          logger(`Fehler: Keine Endpoints im GraphQL-Data Objekt gefunden! (Data keys: ${Object.keys(gqlData).join(',')})`);
        }
        
        for (const endpoint of (eps || [])) {
          const endpointId = endpoint?.endpointId;
          const applianceId = endpoint?.legacyAppliance?.applianceId;
          const entityId = endpoint?.legacyIdentifiers?.chrsIdentifier?.entityId;
          let reachability = null;
          if (Array.isArray(endpoint?.features)) {
            const conn = endpoint.features.find(f => f.name === 'connectivity');
            if (conn && Array.isArray(conn.properties)) {
              const prop = conn.properties.find(p => p.reachabilityStatusValue || p.name === 'reachability');
              if (prop) reachability = prop.reachabilityStatusValue;
            }
          }
          
          const data = { endpointId, applianceId, enablement: endpoint?.enablement, reachability, raw: endpoint };
          if (endpointId) allGraphQLById.set(endpointId, data);
          for (const key of [endpointId, entityId, String(endpointId || '').replace(/^amzn1\.alexa\.endpoint\./, '')]) {
            if (key) endpointByEntityId.set(key, data);
          }
        }
      }

      const matchedEndpointIds = new Set();
      const merged = listData.map(d => {
        const endpoint = endpointByEntityId.get(d.id);
        if (endpoint) {
          matchedEndpointIds.add(endpoint.endpointId);
          return {
            ...d,
            _admApplianceId: endpoint.applianceId || null,
            _admEndpointId: endpoint.endpointId || null,
            _admEnablement: endpoint.enablement || null,
            _admReachability: endpoint.reachability || null
          };
        }
        return d;
      });

      for (const [endpointId, data] of allGraphQLById.entries()) {
        if (!matchedEndpointIds.has(endpointId)) {
          const ep = data.raw;
          const cat = ep.displayCategories?.primary?.value || 'ENDPOINT';
          const mfg = ep.manufacturer?.value?.text || '';
          merged.push({
            id: endpointId,
            displayName: ep.friendlyNameObject?.value?.text || 'Unknown Endpoint',
            description: 'GraphQL Skill Endpoint' + (mfg ? ` (${mfg})` : ''),
            manufacturerName: mfg,
            providerData: { categoryType: cat, deviceType: cat },
            availability: 'UNKNOWN',
            _admApplianceId: ep.legacyAppliance?.applianceId || null,
            _admEndpointId: endpointId,
            _admEnablement: ep.enablement || null,
            _admReachability: data.reachability || null
          });
        }
      }

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
    // Amazon sometimes hides the actual serial number inside deviceAccountId for certain echo endpoints
    const dt = d.deviceType || d.deviceFamily || (d.providerData ? d.providerData.deviceType : '');
    const dsn = d.serialNumber || (d.deviceAccountId ? d.deviceAccountId : d.id);
    const cid = d.deviceOwnerCustomerId || 'A2Q2Q2Q2Q2Q2Q2';
    
    if (!dt || !dsn) {
      logger(`-> Fehler: Gerät unterstützt keine Sprachausgabe (Typ/Serial fehlt).`);
      logger(`-> Info: d.deviceType=${d.deviceType}, d.serialNumber=${d.serialNumber}, d.id=${d.id}`);
      return false;
    }
    
    logger(`Sende Sprachausgabe an ${d.displayName}: "${text}"`);
    try {
      const csrfMatch = document.cookie.match(/csrf=([^;]+)/i);
      const csrfToken = csrfMatch ? csrfMatch[1] : '';

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
        logger(`-> Sprachausgabe erfolgreich gesendet!`);
      } else {
        const errorText = await res.text().catch(() => '');
        logger(`-> Fehler beim Senden (TTS): HTTP ${res.status}`);
        logger(`-> Amazon API sagt: ${errorText.substring(0, 200)}`);
        logger(`-> Verwendete Parameter: Typ=${dt}, Serial=${dsn}, CID=${cid}`);
      }
    } catch (err) {
      logger(`-> Ausnahme beim Senden (TTS): ${err.message}`);
    }
  };

  return { devices, loading, error, fetchDevices, logs, logger, deleteDevices, toggleDevices, switchDeviceState, sendTTS };
}
