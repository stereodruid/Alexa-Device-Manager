import { useState, useCallback } from 'react';

const API_LIST = '/api/behaviors/entities?skillId=amzn1.ask.1p.smarthome';
const API_ENDPOINTS = '/nexus/v1/graphql';
const API_DELETE_LEGACY = id => '/api/phoenix/appliance/' + encodeURIComponent(id);

export function useAlexa() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    setError(null);
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

      // Add missing GraphQL-only devices (from allGraphQLById) just like the old script did
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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { devices, loading, error, fetchDevices };
}
