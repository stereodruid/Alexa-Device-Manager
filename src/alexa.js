export const deviceName = (d) =>
  d.displayName || d.friendlyNameObject?.value?.text || d.id;
export const deviceType = (d) =>
  String(
    d.providerData?.deviceType ||
      d.deviceType ||
      d.icon?.value ||
      d.deviceFamily ||
      "UNKNOWN",
  ).toUpperCase();
export const isGroup = (d) => d.providerData?.categoryType === "GROUP";
export const isEcho = (d) =>
  [
    d.providerData?.deviceType,
    d.providerData?.categoryType,
    d.deviceType,
    d.deviceFamily,
  ].some((value) =>
    /^(ALEXA_VOICE_ENABLED|ECHO(?:_.*)?|KNIGHT|ROOK)$/i.test(
      String(value || ""),
    ),
  ) || /Amazon (intelligentes Ger|smart device)/i.test(d.description || "");
export const isProtected = (d) =>
  isGroup(d) || isEcho(d) || /amazon/i.test(d.manufacturerName || "");
export const source = (d) => {
  const text =
    `${d.description || ""} ${d.manufacturerName || ""} ${deviceName(d)}`.toLowerCase();
  if (text.includes("home assistant")) return "Home Assistant";
  if (/io\.?broker/.test(text)) return "ioBroker";
  if (text.includes("homey")) return "Homey";
  return isEcho(d) || text.includes("amazon") ? "Amazon" : "Andere";
};
export const reachability = (d) => {
  if (d._admReachability)
    return (
      { OK: "Online", UNAVAILABLE: "Offline" }[d._admReachability] ||
      "Unbekannt"
    );
  return (
    {
      ONLINE: "Online",
      AVAILABLE: "Online",
      OFFLINE: "Offline",
      UNAVAILABLE: "Offline",
      UNREACHABLE: "Offline",
    }[d.availability] || "Unbekannt"
  );
};
export const enablement = (d) =>
  ({ ENABLED: "Aktiviert", DISABLED_BY_CUSTOMER: "Deaktiviert" })[
    d._admEnablement
  ] || "Unbekannt";
export const canAct = (d, action) =>
  ["on", "off"].includes(action)
    ? Boolean(d._admApplianceId) && !isGroup(d) && !isEcho(d)
    : action === "delete"
      ? Boolean(d._admEndpointId || d._admApplianceId)
      : Boolean(d._admEndpointId);
export function toggleVisible(selected, visible) {
  const next = new Set(selected);
  const all = visible.length > 0 && visible.every((d) => next.has(d.id));
  for (const d of visible) all ? next.delete(d.id) : next.add(d.id);
  return next;
}
export function filterDevices(devices, filters) {
  const {
    search = "",
    type = "",
    status = "",
    origin = "",
    group = "",
    hideProtected = false,
    onlyDeletable = false,
  } = filters;
  const members = new Set(
    devices.find((d) => d.id === group)?.providerData?.groupMembers || [],
  );
  return devices.filter((d) => {
    if (hideProtected && (isProtected(d) || !canAct(d, "delete"))) return false;
    if (onlyDeletable && (!canAct(d, "delete") || isProtected(d))) return false;
    if (type && deviceType(d) !== type) return false;
    if (origin && source(d) !== origin) return false;
    if (group && d.id !== group && !members.has(d.id)) return false;
    if (status === "Geschützt" && !isProtected(d) && canAct(d, "delete"))
      return false;
    if (status === "Ohne Endpoint" && d._admEndpointId) return false;
    if (status === "Echos" && !isEcho(d)) return false;
    if (status === "Gruppen" && !isGroup(d)) return false;
    if (
      ["Online", "Offline", "Unbekannt"].includes(status) &&
      reachability(d) !== status
    )
      return false;
    if (
      ["Aktiviert", "Deaktiviert"].includes(status) &&
      enablement(d) !== status
    )
      return false;
    const haystack = [
      deviceName(d),
      d.description,
      deviceType(d),
      source(d),
      d.id,
      d._admEndpointId,
      d._admApplianceId,
    ]
      .join(" ")
      .toLowerCase();
    return search
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .every((word) => haystack.includes(word));
  });
}

export const LIST_QUERY = `query getDevicesBaseData {
  allDevices: listEndpoints(listEndpointsInput: { includeHouseholdDevices: true }) {
    endpoints {
      endpointId: id enablement
      legacyAppliance { applianceId }
      legacyIdentifiers { chrsIdentifier { entityId } }
      friendlyNameObject { value { text } }
      manufacturer { value { text } }
      displayCategories { primary { value } }
      features { name properties { name ... on Reachability { reachabilityStatusValue } } }
    }
  }
}`;
export const ENABLE_QUERY = `mutation setEndpointEnablement($input: SetEndpointEnablementInput!) {
  setEndpointEnablement(input: $input) { endpoint { endpointId: id enablement } error { __typename } }
}`;
const DELETE_QUERY =
  "mutation forgetEndpoint($input: ForgetEndpointInput!) { forgetEndpoint(forgetEndpointInput: $input) { endpointId } }";

export function mergeDevices(entities, endpoints) {
  if (!Array.isArray(entities) || !Array.isArray(endpoints))
    throw new Error("Unvollständige Gerätedaten.");
  const byKey = new Map();
  const all = new Map();
  for (const ep of endpoints) {
    if (!ep?.endpointId) throw new Error("Endpoint ohne eindeutige ID.");
    if (all.has(ep.endpointId)) throw new Error("Doppelte Endpoint-ID.");
    all.set(ep.endpointId, ep);
    for (const key of new Set(
      [
        ep.endpointId,
        ep.legacyIdentifiers?.chrsIdentifier?.entityId,
        ep.endpointId.replace(/^amzn1\.alexa\.endpoint\./, ""),
      ].filter(Boolean),
    )) {
      if (byKey.has(key) && byKey.get(key) !== ep)
        throw new Error("Mehrdeutige Gerätezuordnung. Laden abgebrochen.");
      byKey.set(key, ep);
    }
  }
  const matched = new Set(),
    seen = new Set();
  const attach = (d, ep) => ({
    ...d,
    _admEndpointId: ep?.endpointId || null,
    _admApplianceId: ep?.legacyAppliance?.applianceId || null,
    _admEnablement: ep?.enablement || null,
    _admReachability:
      ep?.features
        ?.find((f) => f?.name === "connectivity")
        ?.properties?.find(
          (p) => p?.reachabilityStatusValue || p?.name === "reachability",
        )?.reachabilityStatusValue || null,
  });
  const result = entities.map((d) => {
    if (!d?.id || seen.has(d.id))
      throw new Error("Fehlende oder doppelte Geräte-ID.");
    seen.add(d.id);
    const ep = byKey.get(d.id);
    if (ep) matched.add(ep.endpointId);
    return attach(d, ep);
  });
  for (const ep of all.values())
    if (!matched.has(ep.endpointId)) {
      result.push(
        attach(
          {
            id: ep.endpointId,
            displayName:
              ep.friendlyNameObject?.value?.text || "Unbekannter Endpoint",
            description: "GraphQL Skill Endpoint",
            manufacturerName: ep.manufacturer?.value?.text || "",
            providerData: {
              categoryType: ep.displayCategories?.primary?.value || "ENDPOINT",
              deviceType: ep.displayCategories?.primary?.value || "ENDPOINT",
            },
            availability: "UNKNOWN",
          },
          ep,
        ),
      );
    }
  return result;
}

export function resolveEcho(d, devices) {
  if (!Array.isArray(devices)) throw new Error("Echo-Geräteliste fehlt.");
  const exact = devices.filter(
    (x) =>
      (d.serialNumber && x.serialNumber === d.serialNumber) ||
      x.serialNumber === d.id ||
      (d.deviceAccountId && x.deviceAccountId === d.deviceAccountId),
  );
  // A display name alone cannot authorize a command to a physical device.
  if (exact.length !== 1)
    throw new Error(
      "Echo nicht eindeutig über eine Geräte-ID zugeordnet. Keine Sprachausgabe gesendet.",
    );
  const match = exact[0];
  if (!match.serialNumber || !match.deviceType || !match.deviceOwnerCustomerId)
    throw new Error("Vollständige Echo-Zieldaten fehlen.");
  return match;
}

export function createAlexaClient(fetchImpl = (...args) => fetch(...args)) {
  async function request(url, options = {}) {
    const res = await fetchImpl(url, {
      ...options,
      credentials: "same-origin",
      signal: AbortSignal.timeout(20000),
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
    if (!res.ok) {
      const error = new Error(
        res.status === 429
          ? "Amazon begrenzt die Anfragen. Bitte später neu laden."
          : `Amazon-Anfrage fehlgeschlagen (HTTP ${res.status}).`,
      );
      error.status = res.status;
      throw error;
    }
    const text = await res.text();
    if (!text.trim()) return null;
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      throw new Error("Amazon lieferte kein JSON. Anmeldung prüfen.");
    }
    if (body?.errors?.length || body?.error || body?.errorMessage)
      throw new Error("Amazon hat die Anfrage abgelehnt.");
    return body;
  }
  const gql = (query, operationName, input) =>
    request("/nexus/v1/graphql", {
      method: "POST",
      body: JSON.stringify({
        query,
        operationName,
        ...(input ? { variables: { input } } : {}),
      }),
    });
  return {
    async load() {
      const entities = await request(
        "/api/behaviors/entities?skillId=amzn1.ask.1p.smarthome",
      );
      const data = await gql(LIST_QUERY, "getDevicesBaseData");
      return mergeDevices(entities, data?.data?.allDevices?.endpoints);
    },
    async mutate(d, action) {
      if (!canAct(d, action))
        throw new Error("Keine geeignete Ziel-ID vorhanden.");
      if (action === "delete") {
        if (d._admEndpointId) {
          const body = await gql(DELETE_QUERY, "forgetEndpoint", {
            endpointId: d._admEndpointId,
          });
          if (body?.data?.forgetEndpoint?.endpointId !== d._admEndpointId)
            throw new Error("Löschung von Amazon nicht bestätigt.");
        } else
          await request(
            "/api/phoenix/appliance/" + encodeURIComponent(d._admApplianceId),
            { method: "DELETE" },
          );
      } else {
        const target = action === "enable" ? "ENABLED" : "DISABLED_BY_CUSTOMER";
        const body = await gql(ENABLE_QUERY, "setEndpointEnablement", {
          endpointId: d._admEndpointId,
          enablement: target,
        });
        const result = body?.data?.setEndpointEnablement;
        if (
          result?.error ||
          result?.endpoint?.endpointId !== d._admEndpointId ||
          result?.endpoint?.enablement !== target
        )
          throw new Error("Zielstatus von Amazon nicht bestätigt.");
      }
    },
    async power(d, on) {
      if (!canAct(d, "on"))
        throw new Error("Keine sichere Appliance-ID zum Schalten vorhanden.");
      const body = await request("/api/phoenix/state", {
        method: "POST",
        body: JSON.stringify({
          stateRequests: [
            {
              entityId: d._admApplianceId,
              entityType: "APPLIANCE",
              parameters: { action: on ? "turnOn" : "turnOff" },
            },
          ],
        }),
      });
      if (body?.controlResponses?.some((r) => r.code && r.code !== "SUCCESS"))
        throw new Error("Amazon hat den Schaltbefehl nicht bestätigt.");
    },
    async speak(d, text, locale = "de-DE") {
      if (!text.trim()) throw new Error("Bitte einen Text eingeben.");
      const csrf =
        typeof document === "undefined"
          ? ""
          : document.cookie.match(/(?:^|;\s*)csrf=([^;]+)/i)?.[1] || "";
      const data = await request("/api/devices-v2/device?cached=true", {
        headers: { csrf },
      });
      const target = resolveEcho(d, data?.devices);
      await request("/api/behaviors/preview", {
        method: "POST",
        headers: { csrf },
        body: JSON.stringify({
          behaviorId: "PREVIEW",
          status: "ENABLED",
          sequenceJson: JSON.stringify({
            "@type": "com.amazon.alexa.behavior.model.Sequence",
            startNode: {
              "@type":
                "com.amazon.alexa.behavior.model.OpaquePayloadOperationNode",
              type: "Alexa.SynthesizeSpeech",
              operationPayload: {
                deviceType: target.deviceType,
                deviceSerialNumber: target.serialNumber,
                customerId: target.deviceOwnerCustomerId,
                locale: locale,
                textToSpeak: text.trim(),
              },
            },
          }),
        }),
      });
    },
  };
}

export async function runBatch(
  client,
  list,
  action,
  {
    allowProtectedIds = [],
    logger = () => {},
    delay = (ms) => new Promise((r) => setTimeout(r, ms)),
  } = {},
) {
  if (!["delete", "enable", "disable"].includes(action))
    throw new Error("Unbekannte Aktion.");
  const allowed = new Set(allowProtectedIds);
  if (list.some((d) => isProtected(d) && !allowed.has(d.id)))
    throw new Error("Geschützte Ziele müssen einzeln freigegeben werden.");
  if (!list.length || list.some((d) => !canAct(d, action)))
    throw new Error("Auswahl enthält keine oder ungeeignete Ziele.");
  const unique = [
    ...new Map(
      list.map((d) => [d._admEndpointId || d._admApplianceId, d]),
    ).values(),
  ];
  const results = [];
  let stopped = false;
  for (const d of unique) {
    if (stopped) {
      results.push({
        device: d,
        error: "Nach Anfragelimit oder Anmeldefehler übersprungen.",
      });
      continue;
    }
    try {
      const target = action === "enable" ? "ENABLED" : "DISABLED_BY_CUSTOMER";
      if (action === "delete" || d._admEnablement !== target)
        await client.mutate(d, action);
      results.push({ device: d });
      logger(`${deviceName(d)}: Nachkontrolle ausstehend.`);
    } catch (error) {
      results.push({ device: d, error: error.message });
      logger(`${deviceName(d)}: ${error.message}`);
      stopped = [429, 401, 403].includes(error.status);
    }
    if (!stopped) await delay(800);
  }
  if (stopped) return { results, devices: null, verified: false };
  let devices;
  try {
    devices = await client.load();
  } catch {
    return { results, devices: null, verified: false };
  }
  for (const result of results) {
    const d = result.device;
    const matches = devices.filter((x) =>
      d._admEndpointId
        ? x._admEndpointId === d._admEndpointId
        : x._admApplianceId === d._admApplianceId,
    );
    // The behavior entity can outlive the modern endpoint; do not claim removal yet.
    const absent = !matches.length && !devices.some((x) => x.id === d.id);
    result.success =
      !result.error &&
      (action === "delete"
        ? absent
        : matches.length > 0 &&
          matches.every(
            (x) =>
              x._admEnablement ===
              (action === "enable" ? "ENABLED" : "DISABLED_BY_CUSTOMER"),
          ));
  }
  return { results, devices, verified: true };
}
