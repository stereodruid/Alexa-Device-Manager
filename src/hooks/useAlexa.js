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
        const applianceId = endpoint?.legacyAppliance?.applianceId;
        const entityId = endpoint?.legacyIdentifiers?.chrsIdentifier?.entityId;
        
        let reachability = null;
        if (Array.isArray(endpoint?.features)) {
          const reachFeature = endpoint.features.find(f => f.name === 'alexa.reachability');
          if (reachFeature && Array.isArray(reachFeature.properties)) {
            const prop = reachFeature.properties.find(p => p.name === 'reachability');
            if (prop && prop.reachabilityStatusValue) {
              reachability = prop.reachabilityStatusValue;
            }
          }
        }
        
        endpoint._admReachability = reachability;
        if (entityId) endpointByEntityId.set(entityId, endpoint);
        if (applianceId) allGraphQLById.set(applianceId, endpoint);
      }

      // Merge data
      const merged = listData.map(d => {
        let match = null;
        if (d.id) {
           const extractedEntityId = d.id.includes('amzn1.ask.skill') ? d.id : d.id.split('-').pop();
           match = endpointByEntityId.get(extractedEntityId) || endpointByEntityId.get(d.id);
        }
        if (!match && d.id) match = allGraphQLById.get(d.id);
        if (!match && d.alexaId) match = allGraphQLById.get(d.alexaId);

        return {
          ...d,
          _admApplianceId: match?.legacyAppliance?.applianceId || d.alexaId,
          _admEndpointId: match?.endpointId,
          _admEnablement: match?.enablement,
          _admReachability: match?._admReachability,
          _gqlMatch: !!match
        };
      });

      setDevices(merged);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { devices, loading, error, fetchDevices };
}
