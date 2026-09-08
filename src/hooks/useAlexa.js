import { useState, useCallback } from 'react';

const API_LIST = '/api/behaviors/entities?skillId=amzn1.ask.1p.smarthome';
const API_ENDPOINTS = '/nexus/v1/graphql';
const API_DELETE_LEGACY = id => '/api/phoenix/appliance/' + encodeURIComponent(id);

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
      // 1. Fetch basic list
      const listRes = await fetch(API_LIST, { headers: { Accept: 'application/json' }});
      if (!listRes.ok) throw new Error('API_LIST failed: ' + listRes.status);
      const listData = await listRes.json();
      
      // 2. Fetch GraphQL endpoints for Delete IDs and Status
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
      if (!gqlRes.ok) throw new Error('GraphQL failed: ' + gqlRes.status);
      const gqlBody = await gqlRes.json();
      const endpoints = gqlBody?.data?.allDevices?.endpoints || [];

      // Create maps for quick lookup
      const endpointByEntityId = new Map();
      const allGraphQLById = new Map();
      
      for (const endpoint of endpoints) {
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

      // Merge data
      const merged = listData.map(d => {
        const endpoint = endpointByEntityId.get(d.id);
        if (endpoint) {
          return {
            ...d,
            _admApplianceId: endpoint.applianceId || null,
            _admEndpointId: endpoint.endpointId || null,
            _admEnablement: endpoint.enablement || null,
            _admReachability: endpoint.reachability || null,
            _gqlMatch: true
          };
        }
        return {
          ...d,
          _admApplianceId: null,
          _admEndpointId: null,
          _admEnablement: null,
          _admReachability: null,
          _gqlMatch: false
        };
      });

      // Add missing GraphQL-only devices
      const matchedEndpointIds = new Set(merged.map(d => d._admEndpointId).filter(Boolean));
      for (const [endpointId, data] of allGraphQLById.entries()) {
        if (!matchedEndpointIds.has(endpointId)) {
          const ep = data.raw;
          const cat = ep.displayCategories?.primary?.value || 'OTHER';
          const mfg = ep.manufacturer?.value?.text || '';
          merged.push({
            id: endpointId,
            displayName: ep.friendlyNameObject?.value?.text || 'Unbekannt',
            description: 'Nur via GraphQL gefunden',
            manufacturerName: mfg,
            providerData: { categoryType: cat, deviceType: cat },
            availability: 'UNKNOWN',
            _admApplianceId: ep.legacyAppliance?.applianceId || null,
            _admEndpointId: endpointId,
            _admEnablement: ep.enablement || null,
            _admReachability: data.reachability || null,
            _gqlMatch: true
          });
        }
      }

      setDevices(merged);
      logger(`${merged.length} Geräte geladen.`);
    } catch (err) {
      setError(err.message);
      logger(`Fehler beim Laden: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [logger]);

  const deleteDevices = async (devicesToDelete) => {
    if (!devicesToDelete || !devicesToDelete.length) return;
    logger(`Starte Löschung von ${devicesToDelete.length} Geräten...`);
    
    for (const d of devicesToDelete) {
      try {
        let status, statusText, body;
        if (d._admEndpointId) {
          const query = 'mutation forgetEndpoint($input: ForgetEndpointInput!) { forgetEndpoint(forgetEndpointInput: $input) { endpointId } }';
          const res = await fetch(API_ENDPOINTS, {
            method: 'POST',
            headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({ operationName: 'forgetEndpoint', query, variables: { input: { endpointId: d._admEndpointId } } }),
          });
          body = await res.json().catch(() => null);
          const forgottenId = body?.data?.forgetEndpoint?.endpointId;
          const errorMsg = body?.errors?.[0]?.message;
          if (!res.ok || errorMsg || forgottenId !== d._admEndpointId) throw new Error(errorMsg || 'Alexa hat die Löschung nicht bestätigt.');
          status = res.status;
          statusText = 'vergessen (GraphQL)';
        } else if (d._admApplianceId) {
          const res = await fetch(API_DELETE_LEGACY(d._admApplianceId), { method: 'DELETE', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }});
          body = await res.text().catch(() => '');
          status = res.status;
          statusText = res.statusText + ' (Legacy API)';
        } else {
          throw new Error('Kein Lösch-ID vorhanden.');
        }
        logger(`${status} ${statusText} - ${d.displayName || 'Unbekannt'}`);
      } catch (e) {
        logger(`FEHLER: ${d.displayName || 'Unbekannt'} - ${e.message}`);
      }
      await new Promise(resolve => setTimeout(resolve, 800)); // Delay
    }
    logger(`Löschlauf beendet. Lade Geräte neu...`);
    await fetchDevices();
  };

  const toggleDevices = async (devicesToToggle, enable) => {
    if (!devicesToToggle || !devicesToToggle.length) return;
    const target = enable ? 'ENABLED' : 'DISABLED_BY_CUSTOMER';
    logger(`Setze ${devicesToToggle.length} Geräte auf ${target}...`);
    
    for (const d of devicesToToggle) {
      if (!d._admEndpointId) {
        logger(`FEHLER: ${d.displayName} hat keine Endpoint-ID für Deaktivierung.`);
        continue;
      }
      try {
        const query = 'mutation setEndpointEnablement($input: SetEndpointEnablementInput!) { setEndpointEnablement(setEndpointEnablementInput: $input) { endpoint { enablement } error { __typename } } }';
        const res = await fetch(API_ENDPOINTS, {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName: 'setEndpointEnablement', query, variables: { input: { endpointId: d._admEndpointId, enablement: target } } }),
        });
        const body = await res.json().catch(() => null);
        const result = body?.data?.setEndpointEnablement;
        const errorMsg = body?.errors?.[0]?.message || result?.error?.__typename;
        const actual = result?.endpoint?.enablement;
        if (!res.ok || errorMsg || actual !== target) throw new Error(errorMsg || `Fehler. Status: ${actual}`);
        logger(`OK - ${d.displayName}: ${actual}`);
      } catch (e) {
        logger(`FEHLER: ${d.displayName} - ${e.message}`);
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    logger(`Umschalten beendet. Lade Geräte neu...`);
    await fetchDevices();
  };

  return { devices, loading, error, fetchDevices, logs, logger, deleteDevices, toggleDevices };
}
